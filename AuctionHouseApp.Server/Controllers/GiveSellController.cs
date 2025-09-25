using AuctionHouseApp.Server.DTO;
using AuctionHouseApp.Server.Models;
using AuctionHouseApp.Server.Services;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Vista.DB;
using Vista.DB.Schema;
using Vista.DbPanda;

namespace AuctionHouseApp.Server.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class GiveSellController(
  SysParamsService _prmSvc
  ) : ControllerBase
{
  [HttpPost("[action]")]
  public ActionResult<GiveOrder> Create([FromForm] GiveOrderCreateDto dto)
  {
    try
    {
      //# 基本檢查…趕進度先跳過
      //return BadRequest("這是測試用錯誤訊息");

      if (dto.GiveOrderNo == "NEW")
      {
        // 新增訂單
        //# Access DB
        string sql = """
INSERT INTO [dbo].[GiveOrder]
([GiveOrderNo],
 [PaddleNum],[VipName],[GiftId],[PurchaseCount],[PurchaseAmount],[HasPaid],[SalesId],[Status])
 OUTPUT inserted.*
VALUES
(FORMAT(NEXT VALUE FOR GiveSaleSeq,'GS00000'), 
 @PaddleNum, @VipName, @GiftId, @PurchaseCount, @PurchaseAmount, @HasPaid, @SalesId, @Status)
""";

        var parameters = new
        {
          dto.PaddleNum,
          dto.VipName,
          dto.GiftId,
          dto.PurchaseCount,
          dto.PurchaseAmount,
          HasPaid = "N",
          SalesId = HttpContext.User.Identity?.Name,
          Status = "ForSale",
        };

        using var conn = DBHelper.AUCDB.Open();
        using var txn = conn.BeginTransaction();
        var newOrder = conn.QueryFirst<GiveOrder>(sql, parameters, txn);
        txn.Commit();

        return Ok(newOrder);
      }
      else
      {
        // 更新訂單
        //# Access DB
        string sql = """
UPDATE [dbo].[GiveOrder]
  SET [PaddleNum] = @PaddleNum
     ,[VipName] = @VipName
     ,[GiftId] = @GiftId
     ,[PurchaseCount] = @PurchaseCount
     ,[PurchaseAmount] = @PurchaseAmount
     ,[HasPaid] = @HasPaid
     ,[SalesId] = @SalesId
     ,[Status] = @SalesId
OUTPUT inserted.*
WHERE [GiveOrderNo] = @GiveOrderNo
""";

        var parameters = new
        {
          dto.GiveOrderNo,
          dto.PaddleNum,
          dto.VipName,
          dto.GiftId,
          dto.PurchaseCount,
          dto.PurchaseAmount,
          HasPaid = "N",
          SalesId = HttpContext.User.Identity?.Name,
          Status = "ForSale",
        };

        using var conn = DBHelper.AUCDB.Open();
        using var txn = conn.BeginTransaction();
        var newOrder = conn.QueryFirst<GiveOrder>(sql, parameters, txn);
        txn.Commit();

        return Ok(newOrder);
      }
    }
    catch (Exception ex)
    {
      return BadRequest("Exception！" + ex.Message);
    }
  }



  /// <summary>
  /// 系統參數：福袋抽獎券單價
  /// </summary>
  [HttpPost("[action]")]
  public ActionResult GetGiveUnitPrice()
  {
    return Ok(new
    {
      GiveUnitPrice = _prmSvc.GetGiveUnitPrice()
    });
  }

  [HttpPost("[action]")]
  public async Task<ActionResult<IEnumerable<VipProfile>>> ListVipProfile()
  {
    string sql = """
SELECT PaddleNum, VipName  
FROM VIP (NOLOCK)
""";

    using var conn = await DBHelper.AUCDB.OpenAsync();
    var infoList = await conn.QueryAsync<VipProfile>(sql);
    return Ok(infoList);
  }

  [HttpPost("[action]/{id}")]
  public async Task<ActionResult<Vip>> GetVip(string id)
  {
    string sql = """
SELECT * FROM VIP (NOLOCK) WHERE PaddleNum = @id
""";

    using var conn = await DBHelper.AUCDB.OpenAsync();
    var info = await conn.QueryFirstAsync<Vip>(sql, new { id });
    return Ok(info);
  }

  [HttpPost("[action]")]
  public async Task<ActionResult<IEnumerable<GivePrizeProfile>>> ListGivePrizeProfile()
  {
    string sql = """
SELECT GiftId, GiftName = [Name]
FROM GivePrize (NOLOCK)
""";

    using var conn = await DBHelper.AUCDB.OpenAsync();
    var infoList = await conn.QueryAsync<GivePrizeProfile>(sql);
    return Ok(infoList);
  }

  [HttpPost("[action]/{id}")]
  public async Task<ActionResult<GivePrize>> GetGivePrize(string id)
  {
    string sql = """
SELECT * FROM GivePrize (NOLOCK) WHERE GiftId = @id
""";

    using var conn = await DBHelper.AUCDB.OpenAsync();
    var info = await conn.QueryFirstAsync<GivePrize>(sql, new { id });
    return Ok(info);
  }

  /// <summary>
  /// 同意下單或放棄訂單
  /// </summary>
  [HttpPost("[action]/{id}/{hasPaid}")]
  public ActionResult<RaffleOrder> CommitGiveOrder(string id, string hasPaid)
  {
    //# Access DB
    if (hasPaid == "Y")
    {
      string updateHasSold = """
UPDATE [dbo].[GiveOrder]
SET [HasPaid] = 'Y', [Status] = 'HasSold', [SoldDtm] = GETDATE()
WHERE GiveOrderNo = @GiveOrderNo
""";
      using var conn = DBHelper.AUCDB.Open();
      using var txn = conn.BeginTransaction();

      int affected = conn.Execute(updateHasSold, new { GiveOrderNo = id }, txn);
      if (affected != 1)
      {
        txn.Rollback();
        return BadRequest(new MsgObj("更新訂單執行失敗！", id));
      }

      // 取回訂單
      var updated = conn.GetEx<GiveOrder>(new { GiveOrderNo = id }, txn);

      // 產生抽獎券子程序
      DoGenGiveTickets(updated, conn, txn);

      txn.Commit();
      return Ok(updated);
    }
    else
    {
      return BadRequest("應該進不到這條路徑！");
    }
  }

  /// <summary>
  /// 放棄訂單
  /// </summary>
  [HttpPost("[action]/{id}")]
  public ActionResult<RaffleOrder> RevokeGiveOrder(string id)
  {
    string updateInvalid = """
UPDATE [dbo].[GiveOrder]
SET [HasPaid] = 'N', [Status] = 'Invalid', [SoldDtm] = NULL
WHERE GiveOrderNo = @GiveOrderNo
""";

    using var conn = DBHelper.AUCDB.Open();
    using var txn = conn.BeginTransaction();

    int affected = conn.Execute(updateInvalid, new { GiveOrderNo = id }, txn);
    if (affected != 1)
    {
      txn.Rollback();
      return BadRequest(new MsgObj("更新訂單執行失敗！", id));
    }

    var updated = conn.GetEx<GiveOrder>(new { GiveOrderNo = id }, txn);
    txn.Commit();
    return Ok(updated);
  }

  [NonAction]
  private void DoGenGiveTickets(GiveOrder order, SqlConnection conn, SqlTransaction txn)
  {
    //# Access DB
    string sql = """
INSERT INTO [dbo].[GiveTicket]
([GiveTicketNo],
 [GiveOrderNo],[GiftId],[PaddleNum],[HolderName])
VALUES
(FORMAT(NEXT VALUE FOR GiveTicketSeq,'\B000000'), 
 @GiveOrderNo, @GiftId, @PaddleNum, @HolderName)
""";

    // 產生抽獎券：編號 Annnnnn (含前置字元 A + 6碼序號)
    for (int i = 0; i < order.PurchaseCount; i++)
    {
      conn.Execute(sql, new
      {
        order.GiveOrderNo,
        order.PaddleNum,
        order.GiftId,
        HolderName = order.VipName,
      }, txn);
    }
  }

  [HttpPost("[action]/{id}")]
  public async Task<ActionResult<IEnumerable<GiveTicket>>> ListGiveTicket(string id)
  {
    string sql = """
SELECT * 
FROM GiveTicket (NOLOCK)
WHERE GiveOrderNo = @GiveOrderNo
""";

    using var conn = await DBHelper.AUCDB.OpenAsync();
    var infoList = await conn.QueryAsync<GiveTicket>(sql, new { GiveOrderNo = id});
    return Ok(infoList);
  }
}

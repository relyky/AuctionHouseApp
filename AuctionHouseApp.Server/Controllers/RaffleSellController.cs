using AuctionHouseApp.Server.Models;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.JSInterop.Infrastructure;
using Vista.DB;
using Vista.DB.Schema;
using Vista.DbPanda;

namespace AuctionHouseApp.Server.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class RaffleSellController : ControllerBase
{
  [HttpPost("[action]")]
  public ActionResult<RaffleOrder> Create([FromForm] RaffleOrderCreateDto dto)
  {
    try
    {
      //# 基本檢查…趕進度先跳過
      //return BadRequest("這是測試用錯誤訊息");

      //# Access DB
      string sql = """
INSERT INTO [dbo].[RaffleOrder]
([RaffleOrderNo],
 [BuyerName],[BuyerEmail],[BuyerPhone],[PurchaseCount],[PurchaseAmount],[HasPaid],[SalesId],[Status])
 OUTPUT inserted.*
VALUES
(FORMAT(NEXT VALUE FOR RaffleSaleSeq,'RS00000'), 
 @BuyerName, @BuyerEmail, @BuyerPhone, @PurchaseCount, @PurchaseAmount, @HasPaid, @SalesId, @Status)
""";

      var parameters = new
      {
        dto.BuyerName,
        dto.BuyerEmail,
        dto.BuyerPhone,
        dto.PurchaseCount,
        dto.PurchaseAmount,
        HasPaid = "N",
        SalesId = HttpContext.User.Identity?.Name,
        Status = "ForSale",
      };

      using var conn = DBHelper.AUCDB.Open();
      using var txn = conn.BeginTransaction();
      var newOrder = conn.QueryFirst<RaffleOrder>(sql, parameters, txn);
      txn.Commit();

      return Ok(newOrder);
    }
    catch (Exception ex)
    {
      return BadRequest("執行失敗！" + ex.Message);
    }
  }

  ///// <summary>
  ///// 取得新下訂單
  ///// </summary>
  //[HttpPost("[action]/{id}")]
  //public ActionResult<RaffleOrder> GetNewRaffleOrder(string id)
  //{
  //  using var conn = DBHelper.AUCDB.Open();
  //
  //  // 取得未付款訂單。該訂單應該未付款且狀態是"ForSale"
  //  var info = conn.GetEx<RaffleOrder>(new { RaffleOrderNo = id, Status = "ForSale", HasPaid = "N" });
  //  return info;
  //}

  /// <summary>
  /// 同意下單或放棄訂單
  /// </summary>
  [HttpPost("[action]/{id}/{hasPaid}")]
  public ActionResult<RaffleOrder> CommitRaffleOrder(string id, string hasPaid)
  {
    //# Access DB
    if(hasPaid == "Y") {
      string updateHasSold = """
UPDATE [dbo].[RaffleOrder]
SET [HasPaid] = 'Y', [Status] = 'HasSold', [SoldDtm] = GETDATE()
WHERE RaffleOrderNo = @RaffleOrderNo
""";
      using var conn = DBHelper.AUCDB.Open();
      using var txn = conn.BeginTransaction();

      int affected = conn.Execute(updateHasSold, new { RaffleOrderNo = id }, txn);
      if(affected != 1) {
        txn.Rollback();
        return BadRequest(new MsgObj("更新訂單執行失敗！", id));
      }

      // 取回訂單
      var updated = conn.GetEx<RaffleOrder>(new { RaffleOrderNo = id }, txn);

      // 產生抽獎券子程序
      DoGenRaffleTickets(updated, conn, txn);

      txn.Commit();      
      return Ok(updated);
    } 
    else
    {
      string updateInvalid = """
UPDATE [dbo].[RaffleOrder]
SET [HasPaid] = 'N', [Status] = 'Invalid', [SoldDtm] = NULL
WHERE RaffleOrderNo = @RaffleOrderNo
""";

      using var conn = DBHelper.AUCDB.Open();
      using var txn = conn.BeginTransaction();

      int affected = conn.Execute(updateInvalid, new { RaffleOrderNo = id }, txn);
      if (affected != 1)
      {
        txn.Rollback();
        return BadRequest(new MsgObj("更新訂單執行失敗！", id));
      }

      var updated = conn.GetEx<RaffleOrder>(new { RaffleOrderNo = id }, txn);
      txn.Commit();
      return Ok(updated);
    }
  }

  [NonAction]
  private void DoGenRaffleTickets(RaffleOrder order, SqlConnection conn, SqlTransaction txn)
  {
    //# Access DB
    string sql = """
INSERT INTO [dbo].[RaffleTicket]
([RaffleTicketNo],
 [RaffleSoldNo],[BuyerName],[BuyerEmail],[BuyerPhone],[EmailTimes],[LastEmailDtm])
VALUES
(FORMAT(NEXT VALUE FOR RaffleTicketSeq,'RT00000'), 
 @RaffleSoldNo, @BuyerName, @BuyerEmail, @BuyerPhone, 0, NULL)
""";

    for(int i = 0; i < order.PurchaseCount; i++)
    {
      conn.Execute(sql, new
      {
        RaffleSoldNo = order.RaffleOrderNo,
        order.BuyerName,
        order.BuyerEmail,
        order.BuyerPhone,
      }, txn);
    }
  }

  /// <summary>
  /// 取得某訂單的抽獎券
  [HttpPost("[action]/{id}")]
  public ActionResult<IEnumerable<RaffleTicket>> LoadRaffleTicket(string id)
  {
    string sql = "SELECT * FROM RaffleTicket WHERE RaffleSoldNo = @RaffleSoldNo ";

    using var conn = DBHelper.AUCDB.Open();
    var tickets = conn.Query<RaffleTicket>(sql, new { RaffleSoldNo = id });
    return Ok(tickets);
  }
}

using AuctionHouseApp.Server.Models;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Vista.DB;
using Vista.DB.Schema;

namespace AuctionHouseApp.Server.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class BackendRaffleCheckController : ControllerBase
{
  /// <summary>
  /// 取得業務人員清單
  /// </summary>
  [HttpPost("[action]")]
  public async Task<ActionResult<IEnumerable<SalesCodeName>>> GetSalesList()
  {
    const string sql = """
SELECT [SalesId] = [UserId], [SalesName] = [Nickname]
FROM dbo.Staff S
CROSS APPLY OPENJSON(S.RoleList) WITH ([Role] NVARCHAR(50) '$') AS Roles
WHERE Roles.[Role] = 'Sales'
AND [Enable] = 'Y';
""";

    using var conn = await DBHelper.AUCDB.OpenAsync();
    var salesList = await conn.QueryAsync<SalesCodeName>(sql);
    return Ok(salesList);
  }

  /// <summary>
  /// 取得業務賣出抽獎券訂單(未查驗)
  /// </summary>
  [HttpPost("[action]/{id}")]
  public async Task<ActionResult<IEnumerable<RaffleOrder>>> LoadSalesSoldRaffleOrder(string id)
  {
    const string sql = """
SELECT * 
 FROM [dbo].[RaffleOrder] (NOLOCK)
 WHERE SalesId = @SalesId
  AND HasPaid = 'Y'
  AND [Status] = 'HasSold'
  AND IsChecked IS NULL;
""";

    using var conn = await DBHelper.AUCDB.OpenAsync();
    var orderList = await conn.QueryAsync<RaffleOrder>(sql, new { SalesId = id });
    return Ok(orderList);
  }

  /// <summary>
  /// 取得業務賣出抽獎券訂單(未查驗)
  /// </summary>
  [HttpPost("[action]")]
  public ActionResult<MsgObj> CheckRaffleOrders([FromBody] CheckRaffleOrdersArgs args)
  {
    try
    {
      string sql = """
UPDATE [dbo].[RaffleOrder]
SET IsChecked = 'Y'
 , Checker = @Checker
 , CheckedDtm = GetDate()
WHERE [RaffleOrderNo] = @RaffleOrderNo
 AND [HasPaid] = 'Y'
 AND [Status] = 'HasSold'
 AND IsChecked IS NULL
 AND Checker IS NULL
 AND CheckedDtm IS NULL;
""";

      // Validate
      //...

      var userId = User.Identity?.Name;

      // GO
      using var conn = DBHelper.AUCDB.Open();
      using var txn = conn.BeginTransaction();

      foreach (var orderNo in args.OrderNoList)
      {
        var affectedRows = conn.Execute(sql, new { RaffleOrderNo = orderNo, Checker = userId }, txn);
        if (affectedRows != 1)
        {
          txn.Rollback();
          // 訂單 {orderNo} 查驗失敗，請重新整理後再試！ 
          return Ok(new MsgObj($"Order {orderNo} verification failed. Please refresh and try again.", Severity: "error"));
        }
      }

      txn.Commit();
      // 成功完成查驗。
      return Ok(new MsgObj("Verification completed successfully.", Severity: "success"));
    }
    catch (Exception ex)
    {
      return BadRequest("Exception！" + ex.Message);
    }
  }
}

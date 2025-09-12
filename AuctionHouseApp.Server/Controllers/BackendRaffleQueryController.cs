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
public class BackendRaffleQueryController : ControllerBase
{
  /// <summary>
  /// 計算抽獎券訂單銷售統計
  /// </summary>
  [HttpPost("[action]")]
  public async Task<ActionResult<CalcRaffleOrderStatisticsResult>> CalcRaffleOrderStatistics()
  {
    const string sql = """
SELECT 
 [SoldOrderCount] = COUNT(*)
,[SoldTicketCount] = SUM(O.PurchaseCount)
,[TotalSoldAmount] = SUM(O.PurchaseAmount)
,[CheckedOrderCount] = SUM(CASE WHEN O.IsChecked = 'Y' THEN 1 ELSE 0 END)
,[CheckedSoldAmount] = SUM(CASE WHEN O.IsChecked = 'Y' THEN O.PurchaseAmount ELSE 0 END)
,[BuyerCount] = COUNT(DISTINCT O.BuyerEmail)
FROM RaffleOrder O (NOLOCK)
WHERE HasPaid = 'Y'
AND [Status] = 'HasSold'
""";

    using var conn = await DBHelper.AUCDB.OpenAsync();
    var result = await conn.QueryFirstAsync<CalcRaffleOrderStatisticsResult>(sql);
    return Ok(result);
  }
}

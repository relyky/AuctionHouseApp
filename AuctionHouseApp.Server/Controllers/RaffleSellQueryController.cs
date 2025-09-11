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
public class RaffleSellQueryController : ControllerBase
{

  /// <summary>
  /// 業務：協助買家查詢訂單
  /// </summary>
  [HttpPost("[action]")]
  public async Task<ActionResult<RaffleOrder>> QryRaffleOrder([FromBody] QryRaffleOrderArgs args)
  {
    try
    {
      string sql = """
SELECT *
FROM [dbo].[RaffleOrder] (NOLOCK)
WHERE BuyerEmail = @BuyerEmail 
 AND HasPaid = 'Y'
AND Status = 'HasSold'
ORDER BY RaffleOrderNo ASC
""";
      // Validate
      if (String.IsNullOrWhiteSpace(args.BuyerEmail))
        return BadRequest("必須提供買家電郵地址！");

      // GO
      using var conn = await DBHelper.AUCDB.OpenAsync();
      var orderList = await conn.QueryAsync<RaffleOrder>(sql, args);
      return Ok(orderList);
    }
    catch (Exception ex)
    {
      return BadRequest("出現例外！" + ex.Message);
    }
  }

  /// <summary>
  /// 業務：協助買家查詢抽獎券
  /// </summary>
  [HttpPost("[action]")]
  public async Task<ActionResult<RaffleTicket>> QryRaffleTicket([FromBody] QryRaffleOrderArgs args)
  {
    try
    {
      string sql = """
SELECT *
FROM [dbo].[RaffleTicket] (NOLOCK)
WHERE BuyerEmail = @BuyerEmail 
ORDER BY RaffleTicketNo ASC
""";
      // Validate
      if (String.IsNullOrWhiteSpace(args.BuyerEmail))
        return BadRequest("必須提供買家電郵地址！");

      // GO
      using var conn = await DBHelper.AUCDB.OpenAsync();
      var orderList = await conn.QueryAsync<RaffleTicket>(sql, args);
      return Ok(orderList);
    }
    catch (Exception ex)
    {
      return BadRequest("出現例外！" + ex.Message);
    }
  }

}

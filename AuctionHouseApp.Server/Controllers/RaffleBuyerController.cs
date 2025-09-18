using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Data.SqlTypes;
using Vista.DB;
using Vista.DB.Schema;
using Dapper;

namespace AuctionHouseApp.Server.Controllers;

/// <summary>
/// 買家無需登入即可使用的 API
/// </summary>
[AllowAnonymous]
[Route("api/[controller]")]
[ApiController]
public class RaffleBuyerController : ControllerBase
{
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
      // Validate - 必須提供買家電郵地址！
      if (String.IsNullOrWhiteSpace(args.BuyerEmail))
        return BadRequest("Please enter your email address.");

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
        return BadRequest("Please enter your email address.");
        //return BadRequest("必須提供買家電郵地址！");

      // GO
      using var conn = await DBHelper.AUCDB.OpenAsync();
      var orderList = await conn.QueryAsync<RaffleTicket>(sql, args);
      return Ok(orderList);
    }
    catch (Exception ex)
    {
      return BadRequest("Exception! " + ex.Message);
    }
  }
}

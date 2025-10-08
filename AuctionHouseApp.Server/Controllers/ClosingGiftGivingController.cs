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
public class ClosingGiftGivingController : ControllerBase
{
  [HttpPost("[action]")]
  public async Task<ActionResult<vfnGiftInventoryResult>> GiftInventory([FromBody] vfnGiftInventoryArgs args)
  {
    string sql = """
select * from dbo.vfnGiftInventory(@PaddleNum) 
""";

    using var conn = await DBHelper.AUCDB.OpenAsync();
    var infoList = await conn.QueryAsync<vfnGiftInventoryResult>(sql, args);
    return Ok(infoList);
  }
}

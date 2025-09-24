using AuctionHouseApp.Server.DTO;
using AuctionHouseApp.Server.Services;
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
public class GiveSellController(
  SysParamsService _prmSvc
  ) : ControllerBase
{
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
}

using AuctionHouseApp.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

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

}

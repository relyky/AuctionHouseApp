using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.JSInterop.Infrastructure;

namespace AuctionHouseApp.Server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class RaffleSellController : ControllerBase
{
  [HttpPost("[action]")]
  public async Task<ActionResult<RaffleOrderCreateDto>> Create([FromForm] RaffleOrderCreateDto dto)
  {
    // 
    await Task.Delay(1000);

    // 基本輸入檢查
    //return BadRequest("這是錯誤訊息");
    return BadRequest("這是測試用錯誤訊息");

    return Ok(new { errMsg = "SUCCESS", formNo = "NEXTFORMNO", nextStep = 0 });
  }
}

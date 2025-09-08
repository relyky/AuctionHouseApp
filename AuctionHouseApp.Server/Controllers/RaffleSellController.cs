using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AuctionHouseApp.Server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class RaffleSellController : ControllerBase
{
  [HttpPost("[action]")]
  public ActionResult Create([FromForm] RaffleOrderCreateDto dto)
  {
    // TODO: 在此處實作資料庫存取邏輯

    return Ok(new { message = "資料已成功接收", data = dto });
  }
}

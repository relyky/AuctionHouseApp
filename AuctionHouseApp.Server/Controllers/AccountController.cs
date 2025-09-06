using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AuctionHouseApp.Server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AccountController : ControllerBase
{
  //[ServiceFilter<ValidateXsrfTokenFilter>]
  [HttpPost("[action]")]
  public async Task<ActionResult> StaffLogin([FromQuery] string credential)
  {
    try
    {
      string[] decoded = credential.Split(":");
      string userId = decoded[0];
      string mima = decoded[1];

      return Ok(new { message = "Login success." });
    }
    catch
    {
      return Unauthorized();
    }
  }
}

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AuctionHouseApp.Server.Controllers;

[Route("api/auth/vip")]
[ApiController]
public class AuthVipController(
    ILogger<AuthVipController> _logger
  ) : ControllerBase
{
  [HttpPost("[action]")]
  public ActionResult<AuthVipLoginResult> Login([FromBody] AuthVipLoginArgs args)
  {
    try
    {
      bool isValid = (args.Name == "smart" && args.Email == "smart@mail.server");
      if (!isValid) return Ok(new AuthVipLoginResult(false, null));

      // 模擬已存在的貴賓
      string token = "sims-token";
      var guest = new AuthVipLoginResult_Guest("001", args.Name, args.Email, "A1");

      // SUCCESS
      var result = new AuthVipLoginResult(true,
        new AuthVipLoginResult_Data(token, guest));

      _logger.LogInformation("AuthVip/Login SUCCESS. {guestName} {guestName}", guest.Id, guest.Name);
      return Ok(result);
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, "出現例外！{message}", ex.Message);
      return Ok(new AuthVipLoginResult(false, null));
    }


  }
}

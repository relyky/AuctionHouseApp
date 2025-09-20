using AuctionHouseApp.Server.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AuctionHouseApp.Server.Controllers;

[Route("api/auth/vip")]
[ApiController]
public class AuthVipController(
    ILogger<AuthVipController> _logger,
    IConfiguration _config
  ) : ControllerBase
{
  [HttpPost("[action]")]
  public ActionResult<AuthVipLoginResult> Login([FromBody] AuthVipLoginArgs args)
  {
    try
    {
      bool isValid = (args.Name == "smart" && args.Email == "smart@mail.server");
      if (!isValid) return Ok(new AuthVipLoginResult(false, null));

      // 取得貴賓資料
      var guest = new AuthVipLoginResult_Guest("001", args.Name, args.Email, "A1");

      // 模擬已存在的貴賓
      var auth = new AuthUser
      {
        UserId = $"vip:{guest.Id}",
        UserName = args.Name,
        AuthGuid = Guid.NewGuid(),
        IssuedUtc = DateTimeOffset.UtcNow,
        ExpiresUtc = DateTimeOffset.UtcNow.AddMinutes(600d), // 18小時
        Roles = new string[] { "VIP" }
      };

      (string token, DateTimeOffset expiresUtc) = this.GenerateJwtToken(auth, 600d);// 18小時
      //string token = "sims-token";

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

  /// <summary>
  /// 依授權資料生成權杖
  /// </summary>
  [NonAction]
  private (string JwtToken, DateTimeOffset expiresUtc) GenerateJwtToken(AuthUser auth, double expiresMinutes = 20d)
  {
    var jwtTool = new JwtAuthenticationTool(_config);

    // PackUserClaimsData
    ClaimsIdentity userIdentity = new();
    userIdentity.AddClaim(new Claim(ClaimTypes.Name, auth.UserId));
    userIdentity.AddClaim(new Claim(ClaimTypes.GivenName, auth.UserName));
    userIdentity.AddClaim(new Claim(ClaimTypes.Sid, auth.AuthGuid.ToString()));
    userIdentity.AddClaims(auth.Roles.Select(role => new Claim(ClaimTypes.Role, role)));

    DateTimeOffset expiresUtc = DateTimeOffset.UtcNow.AddMinutes(20d);
    string jwtToken = jwtTool.MakeToken(userIdentity, expiresUtc);

    return (jwtToken, expiresUtc);
  }

}

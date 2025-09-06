using AuctionHouseApp.Server.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace AuctionHouseApp.Server.Controllers;

[AllowAnonymous]
[ApiController]
[Route("api/[controller]")]
public class AccountController(
  ILogger<AccountController> _logger,
  IMemoryCache _cache,
  AccountService _account
  ) : ControllerBase
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

      throw new ApplicationException("不准登入");

      return Ok(new { message = "Login success." });
    }
    catch
    {
      return Unauthorized();
    }
  }

  /// <summary>
  /// 登出
  /// </summary>
  [Authorize]
  [HttpPost("[action]")]
  public async Task<ActionResult> Logout()
  {
    // 登出
    _account.SignOut(HttpContext.User.Identity);

    // Clear the existing external cookie to ensure a clean login process
    await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

    return Ok(new { message = "Logout done." });
  }
}

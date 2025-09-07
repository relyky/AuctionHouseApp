using AuctionHouseApp.Server.Models;
using AuctionHouseApp.Server.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Serilog;
using System.Security.Claims;

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
  /// <summary>
  /// for Anti-Forgery
  /// </summary>
  [HttpPost("[action]")]
  public ActionResult<string> GetXsrfToken()
  {
    ValidateXsrfTokenFilter.ResponseAndStoreXsrfToken(this.HttpContext, _cache);
    return NoContent();
  }

  [ServiceFilter<ValidateXsrfTokenFilter>]
  [HttpPost("[action]")]
  public async Task<ActionResult> Login([FromQuery] string credential)
  {
    try
    {
      string[] decoded = credential.Split(":");
      LoginArgs login = new()
      {
        UserId = decoded[1],
        Mima = decoded[2],
        Vcode = decoded[0]
      };

      //# Clear the existing external cookie to ensure a clean login process
      await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);

      if (!_account.Authenticate(login))
        return Unauthorized();

      var auth = _account.Authorize(login.UserId);
      if (auth == null)
        return Unauthorized();

      //# PackUserClaimsData
      ClaimsIdentity userIdentity = new(CookieAuthenticationDefaults.AuthenticationScheme);
      userIdentity.AddClaim(new Claim(ClaimTypes.Name, auth.UserId));
      userIdentity.AddClaim(new Claim(ClaimTypes.GivenName, auth.UserName));
      userIdentity.AddClaim(new Claim(ClaimTypes.Sid, auth.AuthGuid.ToString()));
      userIdentity.AddClaims(auth.Roles.Select(role => new Claim(ClaimTypes.Role, role)));

      //# 執行 Cookie-Base Auth 註冊
      await HttpContext.SignInAsync(
          CookieAuthenticationDefaults.AuthenticationScheme,
          new ClaimsPrincipal(userIdentity),
          new AuthenticationProperties
          {
            IsPersistent = true, // auth.RememberMe,
            IssuedUtc = auth.IssuedUtc,
            ExpiresUtc = auth.ExpiresUtc,
            RedirectUri = this.Request.Host.Value,
            AllowRefresh = false, // Refreshing the authentication session should be allowed.
          });

      return Ok(new { message = "Login success." });
    }
    catch
    {
      return Unauthorized();
    }
  }

  /// <summary>
  /// 取得現在線上登入的使用者資訊
  /// </summary>
  [Authorize]
  [HttpPost("[action]")]
  public ActionResult<LoginUserInfo> GetLoginUser()
  {
    // 模擬長時間運算。正式版移除。
    SpinWait.SpinUntil(() => false, 2000);

    // 取現在登入授權資料
    AuthUser? auth = _account.GetSessionUser(HttpContext.User.Identity);
    if (auth == null)
      return Unauthorized();

    var result = new LoginUserInfo
    {
      LoginUserId = auth.UserId,
      LoginUserName = auth.UserName,
      UserType = "Staff", // VIP.貴賓, Staff.工作人員
      RoleList = auth.Roles,
      Status = "Authed", // Guest | Authed | Authing
      ExpiresTime = auth.ExpiresUtc,
      EmailAddr = null,
      Phone = null,
    };

    _logger.LogInformation($"取得登入者[{auth.UserId}]資訊。");
    return Ok(result);
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

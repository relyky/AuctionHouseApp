using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Caching.Memory;
using Vista.Models;

namespace AuctionHouseApp.Server.Models;

/// <summary>
/// for Anit-Forgery
/// </summary>
public class ValidateXsrfTokenFilter(ILogger<ValidateXsrfTokenFilter> _logger, IMemoryCache _cache) : Attribute, IAuthorizationFilter
{
  const string XSRF_TOKEN_NAME = ".AuctionHouseApp.Server.XSRF-TOKEN-of82";

  public void OnAuthorization(AuthorizationFilterContext context)
  {
    try
    {
      if (!context.HttpContext.Request.Cookies.TryGetValue(XSRF_TOKEN_NAME, out string? extractedToken))
      {
        _logger.LogError("XSRF-TOKEN is missing.");
        context.Result = new UnauthorizedResult();
        return;
      }

      Guid loginSid = Utils.AesSimpleDecrypt<Guid>(extractedToken);
      if (!_cache.TryGetValue<string>($"XSRF-TOKEN:{loginSid}", out string? _token))
      {
        _logger.LogError("XSRF-TOKEN is not exists.");
        context.Result = new UnauthorizedResult();
        return;
      }

      // 取出 token 後就可移除
      _cache.Remove($"XSRF-TOKEN:{loginSid}");

      if (_token != extractedToken)
      {
        _logger.LogError("XSRF-TOKEN is invalid.");
        context.Result = new UnauthorizedResult();
        return;
      }

      // 送回新的 XSRF-TOKEN
      ResponseAndStoreXsrfToken(context.HttpContext, _cache);
    }
    catch(Exception ex)
    {
      _logger.LogError(ex, "XSRF-TOKEN exception.");
      context.Result = new UnauthorizedResult();
    }
  }

  /// <summary>
  /// Procedure
  /// </summary>
  public static void ResponseAndStoreXsrfToken(HttpContext context, IMemoryCache cache)
  {
    Guid loginSid = Guid.NewGuid();
    string token = Utils.AesSimpleEncrypt(loginSid);
    /// 此 anit-forgery-token 只能做到不能重複 post 同一個封包。 
    /// 正式版的 anit-forgery-token 檢驗依據項目應加入 client side 一些識別資訊！
    cache.Set($"XSRF-TOKEN:{loginSid}", token, TimeSpan.FromMinutes(3)); // ３分鐘內需完成登入

    // 送回 cookie
    context.Response.Cookies.Append(XSRF_TOKEN_NAME, token, new CookieOptions()
    {
      Expires = DateTimeOffset.Now.AddMinutes(3), 
      SameSite = SameSiteMode.Lax, // SameSiteMode.Strict,
      Secure = true,
      HttpOnly = true,
      IsEssential = true, // for GDPR Consent. 若該 cookie 為 essential 就不需使用者同意就可寫入。.
    });
  }
}

using Microsoft.Extensions.Caching.Memory;
using System.Security.Claims;
using System.Security.Principal;
using System.IdentityModel.Tokens.Jwt;

namespace AuctionHouseApp.Server.Services;

/// <summary>
/// 登入授權服務
/// ※ 需搭配 Singleton Injection。
/// </summary>
public class AccountService(
  ILogger<AccountService> _logger,
  IConfiguration _config,
  IHttpContextAccessor _http,
  IMemoryCache _cache)
{
  readonly object _lockObj = new object();

  internal void SignOut(IIdentity? id)
  {
    var identity = id as ClaimsIdentity;
    if (identity == null) return;

    var jtiClaim = identity.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Jti);
    if (jtiClaim == null) return;

    if (!Guid.TryParse(jtiClaim.Value, out Guid authGuid))
      return;

    // 移除登入註記
    lock (_lockObj)
    {
      _cache.Remove($"AuthPool:{identity.Name}");
    }
  }
}

using AuctionHouseApp.Server.Controllers;
using AuctionHouseApp.Server.Models;
using Microsoft.Extensions.Caching.Memory;
using System.Net;
using System.Security.Claims;
using System.Security.Principal;
using System.Text.Json;
using Vista.DB;
using Vista.DB.Schema;
using Vista.DbPanda;
using Vista.Models;

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

  /// <summary>
  /// 認證檢查
  /// </summary>
  internal bool Authenticate(LoginArgs ln)
  {
    try
    {
      if (String.IsNullOrWhiteSpace(ln.UserId))
        throw new ApplicationException("登入認證失敗！");

      if (String.IsNullOrWhiteSpace(ln.Mima))
        throw new ApplicationException("登入認證失敗！");

      //## verify vcode;
      if (!"123456".Equals(ln.Vcode))
        throw new ApplicationException("登入認證失敗！");

      //## 驗證帳號與密碼
      using var conn = DBHelper.AUCDB.Open();
      var user = conn.GetEx<Staff>(new { UserId = ln.UserId });
      if (user is null) return false;

      bool isValid = (user.Enable == "Y" && user.UserId == ln.UserId && user.Mima == ln.Mima);
      return isValid;

      //## 帳號特例:測試
      //if (ln.UserId == "smart" || ln.UserId == "beauty")
      //  return true;

      // 預設失敗
      throw new ApplicationException("登入認證失敗！");
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, $"Authenticate FAIL, userId:{ln.UserId}.");
      return false;
    }
  }

  /// <summary>
  /// 取得授權資料，並存入授權資料緩存區。
  /// </summary>
  internal AuthUser? Authorize(string userId)
  {
    try
    {
      if (string.IsNullOrWhiteSpace(userId))
        throw new ArgumentNullException(nameof(userId));

      double expiresMinutes = _config.GetValue<double>("JwtSettings:ExpireMinutes");

      #region # 取登入者來源IP
      string clientIp = "無法取得來源IP";
      string hostName = "無法識別或失敗";
      try
      {
        IPAddress? remoteIp = _http.HttpContext?.Connection.RemoteIpAddress;
        if (remoteIp != null)
        {
          clientIp = remoteIp.ToString();
          hostName = Dns.GetHostEntry(remoteIp).HostName;
        }
      }
      catch
      {
        // 預防取不到IP/HostName當掉。
      }
      #endregion

      ///
      ///※ 可以進來執行表示身份驗證已成功。這裡只處理取得授權能力。
      ///

      AuthUser? authUser = null;

      #region ## 帳號特例：內定系統管理員
      //if (userId == "smart")
      //{
      //  authUser = new AuthUser
      //  {
      //    UserId = "smart",
      //    UserName = "郝聰明",
      //    Roles = new string[] { "user" },
      //    AuthGuid = Guid.NewGuid(),
      //    IssuedUtc = DateTimeOffset.UtcNow,
      //    ExpiresUtc = DateTimeOffset.UtcNow.AddMinutes(expiresMinutes),
      //    ClientIp = clientIp,
      //    //AuthMenu = new MenuInfo()
      //  };
      //}
      #endregion

      //## 取得授權
      //AuthUser? authUser = AuthModule.GetUserAuthz(userId, "SSO"); // config["SystemID"]
      using var conn = DBHelper.AUCDB.Open();
      var user = conn.GetEx<Staff>(new { UserId = userId, Enable = "Y" });
      if (user is null) return null;

      var utcNow = DateTimeOffset.Now;
      authUser = new AuthUser
      {
        UserId = user.UserId,
        UserName = user.Nickname,
        Roles = JsonSerializer.Deserialize<string[]>(user.RoleList) ?? [],
        AuthGuid = Guid.NewGuid(),
        IssuedUtc = utcNow,
        ExpiresUtc = utcNow.AddMinutes(expiresMinutes),
        ClientIp = clientIp,
        //AuthMenu = new MenuInfo()
      };

      if (authUser == null)
        throw new ArgumentNullException(nameof(authUser));

      lock (_lockObj)
      {
        ///※ 授權資料建議存入Database，可用 MemoryCache 加速。
        //## 一個人只能在一個位置登入
        _cache.Set<AuthUser>($"AuthPool:{authUser.UserId}", authUser, TimeSpan.FromMinutes(expiresMinutes));
        DoStoreAuthSession(authUser); // 存入 DB 為準
      }

      // success
      //※ 正常來說授權不會失敗！
      _logger.LogInformation($"Authorize SUCCESS, userId:{authUser.UserId}.");
      return authUser;
    }
    catch (Exception ex)
    {
      _logger.LogError($"Authorize FAIL, userId:{userId}.", ex);
      return null;
    }
  }

  internal AuthUser? GetSessionUser(IIdentity? id)
  {
    var identity = id as ClaimsIdentity;
    if (identity == null) return null;

    var sidClaim = identity.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Sid);
    if (sidClaim == null) return null;

    if (!Guid.TryParse(sidClaim.Value, out Guid authGuid))
      return null;

    lock (_lockObj)
    {
      var auth = _cache.Get<AuthUser>($"AuthPool:{identity.Name}");
      if (auth == null)
      {
        auth = DoLoadAuthSession(identity.Name ?? "");
        if (auth != null) // 重新放回快取區
          _cache.Set<AuthUser>($"AuthPool:{identity.Name}", auth, auth.ExpiresUtc);
      }

      if (auth == null) return null;

      // 再確認一次授權ID有無相同
      if (auth.AuthGuid != authGuid)
        return null;

      // 確認未過期
      if (auth.ExpiresUtc <= DateTimeOffset.UtcNow)
      {
        // 若已過期則移除
        _cache.Remove($"AuthPool:{identity.Name}");
        return null;
      }

      // success
      return auth;
    }
  }

  internal void SignOut(IIdentity? id)
  {
    var identity = id as ClaimsIdentity;
    if (identity == null) return;

    //var jtiClaim = identity.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Jti);
    //if (jtiClaim == null) return;

    //if (!Guid.TryParse(jtiClaim.Value, out Guid authGuid))
    //  return;

    // 移除登入註記
    lock (_lockObj)
    {
      _cache.Remove($"AuthPool:{identity.Name}");
    }
  }

  /// <summary>
  /// Store AuthData to DB
  /// </summary>
  private void DoStoreAuthSession(AuthUser auth)
  {
    _logger.LogInformation($"DoStoreAuthSession:{auth.UserId}, Expires:{auth.ExpiresUtc}.");

    using var conn = DBHelper.AUCDB.Open();
    using var txn = conn.BeginTransaction();
    conn.DeleteEx<AuthSession>(new { auth.UserId }, txn);
    conn.InsertEx<AuthSession>(new AuthSession
    {
      UserId = auth.UserId,
      ExpiresDtm = auth.ExpiresUtc,
      Session = Utils.JsonSerialize(auth, false, false)
    }, txn);
    txn.Commit();
  }

  /// <summary>
  /// Load AuthData from DB
  /// </summary>
  private AuthUser? DoLoadAuthSession(string UserId)
  {
    _logger.LogInformation($"DoLoadAuthSession:{UserId}.");

    using var conn = DBHelper.AUCDB.Open();
    var session = conn.GetEx<AuthSession>(new { UserId });
    if (session is null) return null;

    var auth = JsonSerializer.Deserialize<AuthUser>(session.Session);
    return auth;
  }
}

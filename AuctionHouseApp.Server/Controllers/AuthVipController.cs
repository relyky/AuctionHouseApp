using AuctionHouseApp.Server.Models;
using Azure.Core;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Vista.DB;
using Vista.DB.Schema;
using Vista.DbPanda;

namespace AuctionHouseApp.Server.Controllers;

[Route("api/auth/vip")]
[ApiController]
public class AuthVipController(
    ILogger<AuthVipController> _logger,
    IConfiguration _config
  ) : ControllerBase
{
  /// <summary>
  /// 貴賓名冊。
  /// 讓貴賓可以 autocomplete 登入。
  /// </summary>
  /// <returns>
  /// -----------------------------
  /// ### 2.x 貴賓名冊
  /// **POST** `api/auth/vip/guestlist`
  /// 
  /// **Request Body:**
  /// ```json
  /// {
  ///   "credential": "string", // 想不到先亂填或進行編碼。
  /// }
  /// ```
  /// 
  /// ** Response:**
  /// ```json
  /// {
  ///   "success": true,
  ///   "data": {
  ///     "guests": [{
  ///       "name": "string",  //賓客姓名
  ///       "email": "string",  //賓客email
  ///     }]
  ///   }
  /// }
  /// ```
  /// </returns>
  [AllowAnonymous]
  [HttpPost("[action]")]
  public async Task<ActionResult<CommonResult<dynamic>>> GuestList([FromBody] AuthVipGuestListArgs args)
  {
    try
    {
      bool isValid = "AIzaSyDaGmWKa4JsXZ-HjGw7ISLn_3namBGewQe".Equals(args.Credential);
      if (!isValid)
        return Ok(new CommonResult<dynamic>(false, null, "The credential is invalid!"));

      // 查詢所有商品預覽 (整合 VIP 和員工資訊)
      string sql = """
SELECT [VipName], [VipEmail]
  FROM [Vip] (NOLOCK)
  ORDER BY VipName ASC;
""";

      using var conn = await DBHelper.AUCDB.OpenAsync();
      var infoList = await conn.QueryAsync(sql);
    
      var guestList = infoList.Select(c => new
      {
        Name = c.VipName,
        Email = c.VipEmail
      });

      var result = new CommonResult<dynamic>(
          true,
          new { Guests = guestList },
          null);

      return Ok(result);
    }
    catch (Exception ex)
    {
      string errMsg = string.Format("Exception！{0}", ex.Message);
      _logger.LogError(ex, errMsg);
      return Ok(new CommonResult<dynamic>(false, null, errMsg));
    }
  }

  [AllowAnonymous]
  [HttpPost("[action]")]
  public ActionResult<AuthVipLoginResult> Login([FromBody] AuthVipLoginArgs args)
  {
    try
    {
      // 取 VIP 資料
      using var conn = DBHelper.AUCDB.Open();
      var vip = conn.GetEx<Vip>(new { VipName = args.Name, VipEmail = args.Email });
      if(vip is null)
        return Ok(new AuthVipLoginResult(false, null, "Login validation fail!"));

      // 取得貴賓資料
      var guest = new AuthVipLoginResult_Guest(vip.PaddleNum, vip.VipName, vip.VipEmail, vip.TableNumber);

      // 模擬已存在的貴賓
      var auth = new AuthUser
      {
        UserId = $"paddle#{guest.PaddleNum}",
        UserName = args.Name,
        AuthGuid = Guid.NewGuid(),
        IssuedUtc = DateTimeOffset.UtcNow,
        ExpiresUtc = DateTimeOffset.UtcNow.AddMinutes(600d), // 10小時,活動時長不會超過10小時
        Roles = new string[] { "VIP" }
      };

      (string token, DateTimeOffset expiresUtc) = this.GenerateJwtToken(auth, 600d);// 10小時,活動時長不會超過10小時
      //string token = "sims-token";

      // SUCCESS
      var result = new AuthVipLoginResult(true,
        new AuthVipLoginResult_Data(token, guest),
        null);

      _logger.LogInformation("AuthVip/Login SUCCESS. {guestName} {guestName}", guest.PaddleNum, guest.Name);
      return Ok(result);
    }
    catch (Exception ex)
    {
      string errMsg = string.Format("Exception！{message}", ex.Message);
      _logger.LogError(ex, errMsg);
      return Ok(new AuthVipLoginResult(false, null, errMsg));
    }
  }

  /// <summary>
  /// 授權狀態
  /// </summary>
  [Authorize(AuthenticationSchemes = "Bearer")]
  [HttpPost("[action]")]
  public ActionResult<AuthVipStatusResult> AuthStatus()
  {
    try
    {
      ClaimsIdentity userIdentity = (ClaimsIdentity)HttpContext.User.Identity!;

      var userId = userIdentity.FindFirst(ClaimTypes.Name)?.Value;
      var userName = userIdentity.FindFirst(ClaimTypes.GivenName)?.Value;
      var authGuid = userIdentity.FindFirst(ClaimTypes.Sid)?.Value;
      var roles = userIdentity.FindAll(ClaimTypes.Role).Select(c => c.Value).ToArray();

      var result = new AuthVipStatusResult(userId!, userName!, Guid.Parse(authGuid!), roles);

      return Ok(result);
    }
    catch (Exception ex)
    {
      string errMsg = string.Format("Exception！{message}", ex.Message);
      _logger.LogError(ex, errMsg);
      return Ok(new AuthVipLoginResult(false, null, errMsg));
    }
  }

  /// <summary>
  /// 依授權資料生成權杖
  /// </summary>
  [NonAction]
  private (string JwtToken, DateTimeOffset expiresUtc) GenerateJwtToken(AuthUser auth, double expiresMinutes)
  {
    var jwtTool = new JwtAuthenticationTool(_config);

    // PackUserClaimsData
    ClaimsIdentity userIdentity = new();
    userIdentity.AddClaim(new Claim(ClaimTypes.Name, auth.UserId));
    userIdentity.AddClaim(new Claim(ClaimTypes.GivenName, auth.UserName));
    userIdentity.AddClaim(new Claim(ClaimTypes.Sid, auth.AuthGuid.ToString()));
    userIdentity.AddClaims(auth.Roles.Select(role => new Claim(ClaimTypes.Role, role)));

    DateTimeOffset expiresUtc = DateTimeOffset.UtcNow.AddMinutes(expiresMinutes);
    string jwtToken = jwtTool.MakeToken(userIdentity, expiresUtc);

    return (jwtToken, expiresUtc);
  }


}

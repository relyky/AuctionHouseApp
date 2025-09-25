namespace AuctionHouseApp.Server.Services;

/// <summary>
/// 與 VIP 相關的共用操作。
/// (VIP 授權不在此處理)
/// </summary>
public class AuthVipService(
  IHttpContextAccessor _http
  )
{
  /// <summary>
  /// 自 HttpContext 授權資訊取出。需確定有登入認證。
  /// "paddleNum": "paddle#701"
  /// </summary>
  public string PaddleNum => (_http.HttpContext?.User.Identity?.Name ?? "paddle#").Substring(7);
}

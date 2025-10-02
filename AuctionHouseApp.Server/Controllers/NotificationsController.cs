using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Dapper;
using AuctionHouseApp.Server.Services;
using Vista.DB;

namespace AuctionHouseApp.Server.Controllers;

[Route("api/notifications")]
[ApiController]
public class NotificationsController(
    ILogger<NotificationsController> _logger,
    AuthVipService _vipSvc
  ) : ControllerBase
{
  /// <summary>
  /// 12.1 取得通知列表
  /// GET api/notifications
  /// </summary>
  [Authorize(AuthenticationSchemes = "Bearer")]
  [HttpGet]
  public async Task<ActionResult<CommonResult<GetNotificationsResult_Data>>> GetNotifications(
    [FromQuery] string? type = null,
    [FromQuery] bool? isRead = null,
    [FromQuery] int limit = 50)
  {
    string paddleNum = _vipSvc.PaddleNum;

    try
    {
      using var conn = await DBHelper.AUCDB.OpenAsync();

      // 查詢通知列表
      string notificationsSql = """
SELECT
    n.[NotificationId] as notificationId,
    n.[NotificationType] as type,
    n.[Title] as title,
    n.[Message] as message,
    n.[ActionUrl] as actionUrl,
    CASE WHEN n.[IsRead] = 'Y' THEN CAST(1 AS BIT) ELSE CAST(0 AS BIT) END as isRead,
    n.[CreatedDtm] as timestamp
FROM [dbo].[Notification] n (NOLOCK)
WHERE n.[PaddleNum] = @PaddleNum
  AND (n.[ExpiryDtm] IS NULL OR n.[ExpiryDtm] > GETDATE())
  AND (@IsRead IS NULL OR n.[IsRead] = CASE WHEN @IsRead = 1 THEN 'Y' ELSE 'N' END)
ORDER BY n.[Priority] DESC, n.[CreatedDtm] DESC
OFFSET 0 ROWS FETCH NEXT @Limit ROWS ONLY;
""";

      var notifications = await conn.QueryAsync<NotificationItem>(notificationsSql, new
      {
        PaddleNum = paddleNum,
        IsRead = isRead.HasValue ? (isRead.Value ? 1 : 0) : (int?)null,
        Limit = limit
      });

      // 查詢未讀通知數量
      string unreadCountSql = """
SELECT COUNT(*) as UnreadCount
FROM [dbo].[Notification] (NOLOCK)
WHERE [PaddleNum] = @PaddleNum
  AND [IsRead] = 'N'
  AND ([ExpiryDtm] IS NULL OR [ExpiryDtm] > GETDATE());
""";

      var unreadCount = await conn.ExecuteScalarAsync<int>(unreadCountSql, new { PaddleNum = paddleNum });

      var data = new GetNotificationsResult_Data(
        notifications.ToList(),
        unreadCount
      );

      return Ok(new CommonResult<GetNotificationsResult_Data>(true, data, null));
    }
    catch (Exception ex)
    {
      string errMsg = string.Format("Exception！{0}", ex.Message);
      _logger.LogError(ex, errMsg);
      return Ok(new CommonResult<GetNotificationsResult_Data>(false, null, errMsg));
    }
  }

  /// <summary>
  /// 12.2 標記通知已讀
  /// PUT api/notifications/{notificationId}/read
  /// </summary>
  [Authorize(AuthenticationSchemes = "Bearer")]
  [HttpPut("{notificationId}/read")]
  public async Task<ActionResult<CommonResult<MarkReadResult_Data>>> MarkAsRead(string notificationId)
  {
    string paddleNum = _vipSvc.PaddleNum;

    try
    {
      using var conn = await DBHelper.AUCDB.OpenAsync();

      // 標記通知已讀
      string updateSql = """
UPDATE [dbo].[Notification]
SET [IsRead] = 'Y',
    [ReadTime] = GETDATE()
WHERE [NotificationId] = @NotificationId
  AND [PaddleNum] = @PaddleNum
  AND [IsRead] = 'N';
""";

      var affectedRows = await conn.ExecuteAsync(updateSql, new
      {
        NotificationId = notificationId,
        PaddleNum = paddleNum
      });

      if (affectedRows == 0)
      {
        return Ok(new CommonResult<MarkReadResult_Data>(false, null, "通知不存在或已讀取"));
      }

      var data = new MarkReadResult_Data("通知已標記為已讀");

      return Ok(new CommonResult<MarkReadResult_Data>(true, data, null));
    }
    catch (Exception ex)
    {
      string errMsg = string.Format("Exception！{0}", ex.Message);
      _logger.LogError(ex, errMsg);
      return Ok(new CommonResult<MarkReadResult_Data>(false, null, errMsg));
    }
  }
}

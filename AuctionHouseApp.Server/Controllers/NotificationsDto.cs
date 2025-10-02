using Reinforced.Typings.Attributes;

namespace AuctionHouseApp.Server.Controllers;

// ========== 12.1 取得通知列表 ==========

[TsInterface(Namespace = "dto.notifications")]
public record GetNotificationsResult_Data(
  List<NotificationItem> Notifications,
  int UnreadCount
);

[TsInterface(Namespace = "dto.notifications")]
public record NotificationItem(
  string NotificationId,
  string Type,
  string Title,
  string Message,
  string Timestamp,
  bool IsRead,
  string? ActionUrl
);

// ========== 12.2 標記通知已讀 ==========

[TsInterface(Namespace = "dto.notifications")]
public record MarkReadResult_Data(
  string Message
);

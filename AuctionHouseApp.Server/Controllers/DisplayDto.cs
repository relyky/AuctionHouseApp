namespace AuctionHouseApp.Server.Controllers;

public record DisplayStatusResult_Data(
  string CurrentMode, //當前顯示模式
  bool IsActive, //大螢幕是否啟動
  string? CurrentItemId //當前顯示項目的唯一識別碼
);

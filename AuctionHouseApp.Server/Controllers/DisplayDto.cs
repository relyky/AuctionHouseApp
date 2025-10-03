using Reinforced.Typings.Attributes;

namespace AuctionHouseApp.Server.Controllers;

public record DisplayStatusResult_Data(
  string CurrentMode, //當前顯示模式
  bool IsActive, //大螢幕是否啟動
  string? CurrentItemId //當前顯示項目的唯一識別碼
);

[TsInterface(Namespace = "dto.display")]
public record RafflePrizeProfile(
    string PrizeId,
    string Name,
    string Category
);

[TsInterface(Namespace = "dto.display")]
public record GivePrizeProfile(
    string GiftId,
    string Name
);

[TsInterface(Namespace = "dto.display")]
public record AuctionPrizeProfile(
   string ItemId, 
   string Name
);

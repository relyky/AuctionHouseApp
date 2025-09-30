using Reinforced.Typings.Attributes;

namespace AuctionHouseApp.Server.Controllers;

/// <summary>
/// Silent Auction 商品資訊
/// </summary>
[TsInterface(Namespace = "dto.silentAuction")]
public record SilentAuctionItem(
    string ItemId,
    string Name,
    string Description,
    string Image,
    decimal StartPrice,
    decimal CurrentPrice,
    decimal MinIncrement,
    string CurrentBidderPaddleNum,
    string CurrentBidderPaddleName,
    string EndTime
);

/// <summary>
/// Silent Auction 商品清單回應
/// </summary>
[TsInterface(Namespace = "dto.silentAuction")]
public record SilentAuctionItemsResponse(
    SilentAuctionItem[] Items
);

/// <summary>
/// Silent Auction 商品詳情
/// </summary>
[TsInterface(Namespace = "dto.silentAuction")]
public record SilentAuctionItemDetail(
    string ItemId,
    string Name,
    string Description,
    string Image,
    decimal StartPrice,
    decimal CurrentPrice,
    decimal MinIncrement,
    string CurrentBidderPaddleNum,
    string CurrentBidderPaddleName,
    string EndTime,
    int TimeRemaining,
    string Status,
    SilentAuctionBidHistoryItem[] BidHistory
);

/// <summary>
/// Silent Auction 商品詳情回應
/// </summary>
[TsInterface(Namespace = "dto.silentAuction")]
public record SilentAuctionItemDetailResponse(
    SilentAuctionItemDetail Item
);

/// <summary>
/// Silent Auction 競標歷程項目
/// </summary>
[TsInterface(Namespace = "dto.silentAuction")]
public record SilentAuctionBidHistoryItem(
    string BidderPaddleNum,
    string BidderPaddleName,
    decimal Amount,
    string Timestamp
);

/// <summary>
/// Silent Auction 競標歷程回應
/// </summary>
[TsInterface(Namespace = "dto.silentAuction")]
public record SilentAuctionBidHistoryResponse(
    SilentAuctionBidHistoryDetail Item
);

/// <summary>
/// Silent Auction 競標歷程詳情（隱私版本）
/// </summary>
[TsInterface(Namespace = "dto.silentAuction")]
public record SilentAuctionBidHistoryDetail(
    string ItemId,
    decimal CurrentPrice,
    bool IsCurrentBidder,
    SilentAuctionPrivateBidHistoryItem[] BidHistory,
    decimal? UserCurrentBid
);

/// <summary>
/// Silent Auction 隱私競標歷程項目
/// </summary>
[TsInterface(Namespace = "dto.silentAuction")]
public record SilentAuctionPrivateBidHistoryItem(
    decimal Amount,
    string Timestamp
);

/// <summary>
/// Silent Auction 出價請求
/// </summary>
[TsInterface(Namespace = "dto.silentAuction")]
public record SilentAuctionBidRequest(
    decimal Amount
);

/// <summary>
/// Silent Auction 出價回應
/// </summary>
[TsInterface(Namespace = "dto.silentAuction")]
public record SilentAuctionBidResponse(
    string ItemId,
    decimal Amount,
    bool IsHighestBid,
    decimal CurrentHighestBid,
    string Timestamp
);

/// <summary>
/// Silent Auction 輪播設定
/// </summary>
[TsInterface(Namespace = "dto.silentAuction")]
public record SilentAuctionCarouselSettings(
    int Interval,
    bool AutoPlay,
    string[] ItemOrder
);

/// <summary>
/// Silent Auction 輪播設定回應
/// </summary>
[TsInterface(Namespace = "dto.silentAuction")]
public record SilentAuctionCarouselSettingsResponse(
    SilentAuctionCarouselSettings Data
);

/// <summary>
/// Silent Auction 出價通知檢查回應
/// </summary>
[TsInterface(Namespace = "dto.silentAuction")]
public record SilentAuctionNotificationsResponse(
    bool HasNewOvertaken,
    SilentAuctionOvertakenBid[] OvertakenBids
);

/// <summary>
/// Silent Auction 被超越出價項目
/// </summary>
[TsInterface(Namespace = "dto.silentAuction")]
public record SilentAuctionOvertakenBid(
    string ItemId,
    string ItemName,
    decimal YourBid,
    decimal NewHighestBid,
    string Timestamp
);

/// <summary>
/// 資料庫查詢用 - Silent Auction 商品清單結果
/// </summary>
internal record SilentAuctionItemQueryResult
{
    public string ItemId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public decimal? StartPrice { get; set; }
    public decimal MinIncrement { get; set; }
    public string EndTime { get; set; } = string.Empty;
    public decimal? CurrentPrice { get; set; }
    public string? CurrentBidderPaddleNum { get; set; }
    public string? CurrentBidderPaddleName { get; set; }
    public string Status { get; set; } = string.Empty;
    public int? TimeRemaining { get; set; }
}

/// <summary>
/// 資料庫查詢用 - Silent Auction 商品詳情結果
/// </summary>
internal record SilentAuctionItemDetailQueryResult
{
    public string ItemId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public decimal? StartPrice { get; set; }
    public decimal MinIncrement { get; set; }
    public string EndTime { get; set; } = string.Empty;
    public decimal? CurrentPrice { get; set; }
    public string? CurrentBidderPaddleNum { get; set; }
    public string? CurrentBidderPaddleName { get; set; }
    public string Status { get; set; } = string.Empty;
    public int? TimeRemaining { get; set; }
    public int TotalBids { get; set; }
    public int UniqueBidders { get; set; }
    public string? WinnerPaddleNum { get; set; }
    public string? WinnerName { get; set; }
    public decimal? HammerPrice { get; set; }
    public string? PaymentStatus { get; set; }
}

/// <summary>
/// 資料庫查詢用 - Silent Auction 競標歷程結果
/// </summary>
internal record SilentAuctionBidHistoryQueryResult
{
    public string BidderPaddleNum { get; set; } = string.Empty;
    public string BidderPaddleName { get; set; } = string.Empty;
    public decimal BidAmount { get; set; }
    public DateTime Timestamp { get; set; }
}

/// <summary>
/// 資料庫查詢用 - Silent Auction 隱私競標歷程結果
/// </summary>
internal record SilentAuctionPrivateBidHistoryQueryResult
{
    public decimal BidAmount { get; set; }
    public DateTime Timestamp { get; set; }
    public bool IsMyBid { get; set; }
    public bool IsCurrentBidder { get; set; }
}

/// <summary>
/// 資料庫查詢用 - Silent Auction 通知結果
/// </summary>
internal record SilentAuctionNotificationQueryResult
{
    public string ItemId { get; set; } = string.Empty;
    public string ItemName { get; set; } = string.Empty;
    public decimal YourBid { get; set; }
    public decimal NewHighestBid { get; set; }
    public DateTime Timestamp { get; set; }
}
using Reinforced.Typings.Attributes;

namespace AuctionHouseApp.Server.Controllers;

/// <summary>
/// Live Auction 拍賣商品預覽資訊
/// </summary>
[TsInterface(Namespace = "dto.liveAuction")]
public record LiveAuctionItem(
    string ItemId,
    string Name,
    string Description,
    string Image,
    decimal StartingPrice,
    decimal ReservePrice,
    string Status
);

/// <summary>
/// Live Auction 拍賣商品預覽清單回應
/// </summary>
[TsInterface(Namespace = "dto.liveAuction")]
public record LiveAuctionPreviewResponse(
    LiveAuctionItem[] Items
);

/// <summary>
/// Live Auction 拍賣商品詳情
/// </summary>
[TsInterface(Namespace = "dto.liveAuction")]
public record LiveAuctionItemDetail(
    string ItemId,
    string Name,
    string Description,
    string Image,
    decimal StartingPrice,
    decimal ReservePrice,
    string Status
);

/// <summary>
/// Live Auction 拍賣商品詳情回應
/// </summary>
[TsInterface(Namespace = "dto.liveAuction")]
public record LiveAuctionItemDetailResponse(
    LiveAuctionItemDetail Item
);

/// <summary>
/// Live Auction 即時競標狀態
/// </summary>
[TsInterface(Namespace = "dto.liveAuction")]
public record LiveAuctionStatus(
    decimal CurrentPrice,
    string BidderID,
    string BidderName,
    string Timestamp,
    bool IsEnded,
    string? FinalWinnerID,
    string? FinalWinnerName
);

/// <summary>
/// Live Auction 即時競標狀態回應
/// </summary>
[TsInterface(Namespace = "dto.liveAuction")]
public record LiveAuctionStatusResponse(
    LiveAuctionStatus Data
);

/// <summary>
/// 資料庫查詢用 - 拍賣商品預覽結果
/// </summary>
internal record AuctionPreviewQueryResult
{
    public string ItemId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public decimal StartingPrice { get; set; }
    public decimal ReservePrice { get; set; }
    public string? Status { get; set; }
}

/// <summary>
/// 資料庫查詢用 - 拍賣商品詳情結果
/// </summary>
internal record AuctionItemDetailQueryResult
{
    public string ItemId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public decimal StartPrice { get; set; }
    public decimal ReservePrice { get; set; }
    public string? AuctionResult { get; set; }
}

/// <summary>
/// 資料庫查詢用 - 即時競標狀態結果
/// </summary>
internal record AuctionStatusQueryResult
{
    public string ItemId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal StartingPrice { get; set; }
    public decimal? CurrentPrice { get; set; }
    public string? CurrentBidderPaddle { get; set; }
    public string? CurrentBidderName { get; set; }
    public DateTime? LastBidTime { get; set; }
    public int IsEnded { get; set; }
    public string? AuctionResult { get; set; }
    public string? WinnerPaddleNum { get; set; }
    public string? WinnerName { get; set; }
    public decimal? HammerPrice { get; set; }
    public string? PassedReason { get; set; }
    public string ItemStatus { get; set; } = string.Empty;
}

/// <summary>
/// 記錄競標請求
/// </summary>
[TsInterface(Namespace = "dto.liveAuction")]
public record RecordBidRequest(
    string ItemId,
    string PaddleNum,
    decimal BidAmount,
    string? Notes
);

/// <summary>
/// 記錄競標回應
/// </summary>
[TsInterface(Namespace = "dto.liveAuction")]
public record RecordBidResponse(
    long BidId,
    string ItemId,
    string PaddleNum,
    string PaddleName,
    decimal BidAmount,
    string Timestamp
);

/// <summary>
/// 結標請求
/// </summary>
[TsInterface(Namespace = "dto.liveAuction")]
public record HammerRequest(
    string ItemId
);

/// <summary>
/// 結標回應
/// </summary>
[TsInterface(Namespace = "dto.liveAuction")]
public record HammerResponse(
    string ItemId,
    string AuctionResult,
    string WinnerPaddleNum,
    string WinnerName,
    decimal HammerPrice
);

/// <summary>
/// 流標請求
/// </summary>
[TsInterface(Namespace = "dto.liveAuction")]
public record PassRequest(
    string ItemId,
    string? PassedReason,
    string? Notes
);

/// <summary>
/// 流標回應
/// </summary>
[TsInterface(Namespace = "dto.liveAuction")]
public record PassResponse(
    string ItemId,
    string AuctionResult,
    string PassedReason,
    decimal HighestBidAmount
);
using System.Runtime.Serialization;

namespace AuctionHouseApp.Server.DTO;

//type StepEnum =
//  'Step1_PickLot' |
//  'Step2_StartPrice' |
//  'Step2A_IncPrice' |
//  'Step3_Bidding' |
//  'Step4_CheckBid' |
//  'Step5_Hammer';

public enum StepEnum
{
  Step1_PickLot = 1,
  Step2_StartPrice,
  Step2A_IncPrice,
  Step3_Bidding,
  Step4_CheckBid,
  Step5_Hammer
}

/// <summary>
/// 現場拍賣狀態資訊。
/// </summary>
public record LiveAuctionStatus
{
  /// <summary>
  /// 內部控版次。用來判斷資料是否已更新。
  /// ※因為本身不不支援 rowversion，故需手動更新版次。
  /// </summary>
  public uint Rowversion { get; init; } = 0;

  public StepEnum Step { get; init; } = StepEnum.Step1_PickLot;

  /// <summary>
  /// 現在拍賣中的拍品編號
  /// </summary>
  public string CurLotNo { get; init; } = string.Empty;

  /// <summary>
  /// 現在拍賣金額
  /// </summary>
  public decimal CurBidPrice { get; init; } = 0;

  /// <summary>
  /// 出價增額/一刀金額
  /// </summary>
  public decimal BidIncrement { get; init; } = 0;

  /// <summary>
  /// 已鎖住
  /// </summary>
  public Boolean IsLocked { get; init; } = false;

  /// <summary>
  /// 已開啟競標
  /// </summary>
  public Boolean IsBidOpen { get; init; } = false;

  /// <summary>
  /// 已落槌成交(或流標)
  /// </summary>
  public Boolean IsHammered { get; init; } = false;

  /// <summary>
  /// 競標開啟
  /// </summary>
  public int BidOpenSn { get; init; } = 0;

  /// <summary>
  /// 這輪出價開始時間:自動
  /// </summary>
  public DateTime? ThisBidOpenTime { get; init; } = null;

  /// <summary>
  /// 這輪出價關閉時間:自動
  /// </summary>
  public DateTime? ThisBidCloseTime { get; init; } = null;

  /// <summary>
  /// 謹用於拍賣現場【拍賣官檢選(變更)有效出價】時通知前端 UI 進行有關聯的刷新。
  /// 比如：廣播台的拍品有效出價清單。
  /// </summary>
  public DateTime? LastBiddingEventUpdDtm { get; init; }
}

public record BidMsg
{
  public required string LotNo { get; init; }
  public required string BidderNo { get; init; }
  public decimal BidPrice { get; init; }
  public int BidOpenSn { get; init; }
}

public record LotProfile
{
  public required string LotNo { get; set; }
  public required string LotTitle { get; set; }
}
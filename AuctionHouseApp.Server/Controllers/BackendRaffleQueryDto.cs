using Reinforced.Typings.Attributes;

namespace AuctionHouseApp.Server.Controllers;


[TsInterface(Namespace = "pages.BackendRaffleQuery.dto")]
public record CalcRaffleOrderStatisticsResult
{
  /// <summary>
  /// 售出訂單數
  /// </summary>
  public required decimal SoldOrderCount { get; init; }

  /// <summary>
  /// 售出總張數
  /// </summary>
  public required decimal SoldTicketCount { get; init; }

  /// <summary>
  /// 售出總金額
  /// </summary>
  public required decimal TotalSoldAmount { get; init; }

  /// <summary>
  /// 已查驗訂單
  /// </summary>
  public required decimal CheckedOrderCount { get; init; }

  /// <summary>
  /// 已查驗金額
  /// </summary>
  public required decimal CheckedSoldAmount { get; init; }

  /// <summary>
  /// 購買人數
  /// </summary>
  public required decimal BuyerCount { get; init; }
}

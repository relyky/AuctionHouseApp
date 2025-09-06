using Reinforced.Typings.Attributes;

namespace AuctionHouseApp.Server.DTO;

/// <summary>
/// 抽獎券銷售新增
/// </summary>
[TsInterface(Namespace = "dto")]
public class RaffleSellApply
{
  /// <summary>
  /// 買家名稱
  /// </summary>
  public string BuyerName { get; set; } = default!;
  /// <summary>
  /// 買家電郵地址
  /// </summary>
  public string BuyerEmail { get; set; } = default!;
  /// <summary>
  /// 買家聯絡電話
  /// </summary>
  public string BuyerPhone { get; set; } = default!;
  /// <summary>
  /// 購買張數
  /// </summary>
  public int PurchaseCount { get; set; }
  /// <summary>
  /// 購買金額
  /// </summary>
  public Decimal PurchaseAmount { get; set; }
  /// <summary>
  /// 已付款:Y/N
  /// </summary>
  public string HasPaid { get; set; } = default!;
  /// <summary>
  /// 銷售業務ID
  /// </summary>
  public string SalesId { get; set; } = default!;
  /// <summary>
  /// 銷售狀態: ForSale | HasSold
  /// </summary>
  public string Status { get; set; } = default!;
  public string Remark { get; set; } = default!;
}
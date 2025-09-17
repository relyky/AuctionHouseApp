using Reinforced.Typings.Attributes;
using System.ComponentModel.DataAnnotations;

namespace AuctionHouseApp.Server.Controllers;

[TsInterface(Namespace = "pages.RaffleSell.dto")]
public record RaffleOrderCreateDto
{
  public required string RaffleOrderNo { get; init; }
  public required string BuyerName { get; init; }
  public required string BuyerEmail { get; init; }
  public required string BuyerPhone { get; init; }
  public required decimal PurchaseCount { get; init; }
  public required decimal PurchaseAmount { get; init; }
}


[TsInterface(Namespace = "pages.RaffleSell.dto")]
public record SendNoteEmailResult
{
  public required string RaffleOrderNo { get; init; }
  public required int EmailTimes { get; init; }
}

[TsInterface(Namespace = "pages.RaffleSell.dto")]
public record TestSendEmailArgs
{
  public required string BuyerEmail { get; init; }
}

[TsInterface(Namespace = "pages.RaffleSell.dto")]
public record BuyerProfile
{
  public required string BuyerName { get; init; }
  public required string BuyerEmail { get; init; }
  public required string BuyerPhone { get; init; }
}

[TsInterface(Namespace = "pages.RaffleSell.dto")]
public record StaffProfile
{
  /// <summary>
  /// 識別帳號
  /// </summary>
  public string UserId { get; set; } = default!;
  /// <summary>
  /// 顯示名稱
  /// </summary>
  public string Nickname { get; set; } = default!;
  /// <summary>
  /// 通訊電話
  /// </summary>
  public string Phone { get; set; } = default!;
}
using Reinforced.Typings.Attributes;

namespace AuctionHouseApp.Server.Controllers;

[TsInterface(Namespace = "pages.RaffleSell.dto")]
public record RaffleOrderCreateDto
{
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
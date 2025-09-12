using Reinforced.Typings.Attributes;

namespace AuctionHouseApp.Server.Controllers;

[TsInterface(Namespace = "pages.BackendRaffleCheck.dto")]
public record SalesCodeName
{
  public required string SalesId { get; init; }
  public required string SalesName { get; init; }
}

[TsInterface(Namespace = "pages.BackendRaffleCheck.dto")]
public record CheckRaffleOrdersArgs
{
  public required string[] OrderNoList { get; init; }
}

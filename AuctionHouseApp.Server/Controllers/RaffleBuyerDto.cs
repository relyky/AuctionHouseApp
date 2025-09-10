using Reinforced.Typings.Attributes;

namespace AuctionHouseApp.Server.Controllers;

[TsInterface(Namespace = "pages.RaffleBuyer.dto")]
public record QryRaffleOrderArgs
{
  public required string BuyerEmail { get; init; }
}

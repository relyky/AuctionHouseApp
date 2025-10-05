using Reinforced.Typings.Attributes;

namespace AuctionHouseApp.Server.Controllers;

[TsInterface(Namespace = "dto")]

public record AskInputDto
{
  public required int Round { get; init; }
  public required decimal Amount { get; init; }
  public required string PaddleNum { get; init; }
}

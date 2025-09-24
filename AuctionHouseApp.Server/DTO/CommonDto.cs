using Reinforced.Typings.Attributes;

namespace AuctionHouseApp.Server.DTO;

[TsInterface(Namespace = "dto")]
public record VipProfile
{
  public required string PaddleNum { get; init; }

  public required string VipName { get; init; }
}
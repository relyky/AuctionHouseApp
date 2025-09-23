using Reinforced.Typings.Attributes;

namespace AuctionHouseApp.Server.Controllers;


[TsInterface(Namespace = "dto.activities")]
public record CommonResult<TData>(
  Boolean Success,
  TData? Data,
  string? Message
);

[TsInterface(Namespace = "dto.activities")]
public record ActivityStatus(
  string Type,
  string Name,
  string Status
);

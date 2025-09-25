using Reinforced.Typings.Attributes;
//using System.ComponentModel.DataAnnotations;

namespace AuctionHouseApp.Server.Controllers;

[TsInterface(Namespace = "pages.GiveSell.dto")]
public record GiveOrderCreateDto
{
  public required string GiveOrderNo { get; init; }
  public required string PaddleNum { get; init; }
  public required string VipName { get; init; }
  public required string GiftId { get; init; }
  public required decimal PurchaseCount { get; init; }
  public required decimal PurchaseAmount { get; init; }
}


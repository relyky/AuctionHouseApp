using Reinforced.Typings.Attributes;

namespace AuctionHouseApp.Server.DTO;

[TsInterface(Namespace = "dto")]
public class SilentPrize 
{
public string ItemId { get; set; } = default!;
public string Name { get; set; } = default!;
public string Description { get; set; } = default!;
public string Image { get; set; } = default!;
public Decimal? StartPrice { get; set; }
public Decimal? MinIncrement { get; set; }
public string StartTime { get; set; } = default!;
public string EndTime { get; set; } = default!;
public string Status { get; set; } = default!;
public int? DisplayOrder { get; set; }
public DateTime? CreatedAt { get; set; }
public DateTime? UpdatedAt { get; set; }
public string CreatedBy { get; set; } = default!;
}


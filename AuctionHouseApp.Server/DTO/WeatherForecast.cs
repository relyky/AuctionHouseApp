using Reinforced.Typings.Attributes;

namespace AuctionHouseApp.Server.DTO;

[TsInterface(Namespace = "dto")]
public record WeatherForecast
{
  [TsProperty(Type = "string")]
  public DateOnly Date { get; set; }

  public int TemperatureC { get; set; }

  public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);

  public string? Summary { get; set; }
}

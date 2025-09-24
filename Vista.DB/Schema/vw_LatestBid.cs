namespace Vista.DB.Schema
{
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("vw_LatestBid")]
public class vw_LatestBid 
{
  public string ItemId { get; set; } = default!;
  public string PaddleNum { get; set; } = default!;
  public string PaddleName { get; set; } = default!;
  public Decimal? BidAmount { get; set; }
  public DateTime? Timestamp { get; set; }
  public Int64? rn { get; set; }

  public void Copy(vw_LatestBid src)
  {
    this.ItemId = src.ItemId;
    this.PaddleNum = src.PaddleNum;
    this.PaddleName = src.PaddleName;
    this.BidAmount = src.BidAmount;
    this.Timestamp = src.Timestamp;
    this.rn = src.rn;
  }

  public vw_LatestBid Clone()
  {
    return new vw_LatestBid {
      ItemId = this.ItemId,
      PaddleNum = this.PaddleNum,
      PaddleName = this.PaddleName,
      BidAmount = this.BidAmount,
      Timestamp = this.Timestamp,
      rn = this.rn,
    };
  }
}
}


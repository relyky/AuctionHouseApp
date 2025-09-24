namespace Vista.DB.Schema
{
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("SilentBidEvent")]
public class SilentBidEvent 
{
  [Key]
  [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
  public Int64 BidId { get; set; }
  public string ItemId { get; set; } = default!;
  public string PaddleNum { get; set; } = default!;
  public string PaddleName { get; set; } = default!;
  public Decimal? BidAmount { get; set; }
  public Decimal? PreviousHighestBid { get; set; }
  public string BidType { get; set; } = default!;
  public DateTime? Timestamp { get; set; }
  public string IsValid { get; set; } = default!;
  public string IsOutbid { get; set; } = default!;
  public DateTime? OutbidTime { get; set; }
  public string Notes { get; set; } = default!;
  public string SessionId { get; set; } = default!;
  public string IPAddress { get; set; } = default!;

  public void Copy(SilentBidEvent src)
  {
    this.BidId = src.BidId;
    this.ItemId = src.ItemId;
    this.PaddleNum = src.PaddleNum;
    this.PaddleName = src.PaddleName;
    this.BidAmount = src.BidAmount;
    this.PreviousHighestBid = src.PreviousHighestBid;
    this.BidType = src.BidType;
    this.Timestamp = src.Timestamp;
    this.IsValid = src.IsValid;
    this.IsOutbid = src.IsOutbid;
    this.OutbidTime = src.OutbidTime;
    this.Notes = src.Notes;
    this.SessionId = src.SessionId;
    this.IPAddress = src.IPAddress;
  }

  public SilentBidEvent Clone()
  {
    return new SilentBidEvent {
      BidId = this.BidId,
      ItemId = this.ItemId,
      PaddleNum = this.PaddleNum,
      PaddleName = this.PaddleName,
      BidAmount = this.BidAmount,
      PreviousHighestBid = this.PreviousHighestBid,
      BidType = this.BidType,
      Timestamp = this.Timestamp,
      IsValid = this.IsValid,
      IsOutbid = this.IsOutbid,
      OutbidTime = this.OutbidTime,
      Notes = this.Notes,
      SessionId = this.SessionId,
      IPAddress = this.IPAddress,
    };
  }
}
}


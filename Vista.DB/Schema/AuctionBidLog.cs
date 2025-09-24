namespace Vista.DB.Schema
{
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("AuctionBidLog")]
public class AuctionBidLog 
{
  [Key]
  [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
  public Int64 BidId { get; set; }
  public string ItemId { get; set; } = default!;
  public string PaddleNum { get; set; } = default!;
  public string PaddleName { get; set; } = default!;
  public Decimal? BidAmount { get; set; }
  public string BidType { get; set; } = default!;
  public DateTime? Timestamp { get; set; }
  public string IsValid { get; set; } = default!;
  public string Notes { get; set; } = default!;
  public string RecordStaff { get; set; } = default!;
  public string ConfirmStaff { get; set; } = default!;
  public string Status { get; set; } = default!;

  public void Copy(AuctionBidLog src)
  {
    this.BidId = src.BidId;
    this.ItemId = src.ItemId;
    this.PaddleNum = src.PaddleNum;
    this.PaddleName = src.PaddleName;
    this.BidAmount = src.BidAmount;
    this.BidType = src.BidType;
    this.Timestamp = src.Timestamp;
    this.IsValid = src.IsValid;
    this.Notes = src.Notes;
    this.RecordStaff = src.RecordStaff;
    this.ConfirmStaff = src.ConfirmStaff;
    this.Status = src.Status;
  }

  public AuctionBidLog Clone()
  {
    return new AuctionBidLog {
      BidId = this.BidId,
      ItemId = this.ItemId,
      PaddleNum = this.PaddleNum,
      PaddleName = this.PaddleName,
      BidAmount = this.BidAmount,
      BidType = this.BidType,
      Timestamp = this.Timestamp,
      IsValid = this.IsValid,
      Notes = this.Notes,
      RecordStaff = this.RecordStaff,
      ConfirmStaff = this.ConfirmStaff,
      Status = this.Status,
    };
  }
}
}


namespace Vista.DB.Schema
{
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("AuctionHammered")]
public class AuctionHammered 
{
  [Key]
  [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
  public Int64 HammerId { get; set; }
  public string ItemId { get; set; } = default!;
  public string AuctionResult { get; set; } = default!;
  public string WinnerPaddleNum { get; set; } = default!;
  public string WinnerName { get; set; } = default!;
  public Decimal? HammerPrice { get; set; }
  public Decimal? HighestBidAmount { get; set; }
  public string PassedReason { get; set; } = default!;
  public DateTime? HammerDtm { get; set; }
  public string AuctioneerStaff { get; set; } = default!;
  public string PaymentStatus { get; set; } = default!;
  public Decimal? PaidAmount { get; set; }
  public DateTime? PaymentDtm { get; set; }
  public string PaymentStaff { get; set; } = default!;
  public string PaymentNotes { get; set; } = default!;
  public string IsDelivered { get; set; } = default!;
  public DateTime? DeliveryDtm { get; set; }
  public string DeliveryStaff { get; set; } = default!;
  public string Notes { get; set; } = default!;
  public DateTime? CreatedDtm { get; set; }

  public void Copy(AuctionHammered src)
  {
    this.HammerId = src.HammerId;
    this.ItemId = src.ItemId;
    this.AuctionResult = src.AuctionResult;
    this.WinnerPaddleNum = src.WinnerPaddleNum;
    this.WinnerName = src.WinnerName;
    this.HammerPrice = src.HammerPrice;
    this.HighestBidAmount = src.HighestBidAmount;
    this.PassedReason = src.PassedReason;
    this.HammerDtm = src.HammerDtm;
    this.AuctioneerStaff = src.AuctioneerStaff;
    this.PaymentStatus = src.PaymentStatus;
    this.PaidAmount = src.PaidAmount;
    this.PaymentDtm = src.PaymentDtm;
    this.PaymentStaff = src.PaymentStaff;
    this.PaymentNotes = src.PaymentNotes;
    this.IsDelivered = src.IsDelivered;
    this.DeliveryDtm = src.DeliveryDtm;
    this.DeliveryStaff = src.DeliveryStaff;
    this.Notes = src.Notes;
    this.CreatedDtm = src.CreatedDtm;
  }

  public AuctionHammered Clone()
  {
    return new AuctionHammered {
      HammerId = this.HammerId,
      ItemId = this.ItemId,
      AuctionResult = this.AuctionResult,
      WinnerPaddleNum = this.WinnerPaddleNum,
      WinnerName = this.WinnerName,
      HammerPrice = this.HammerPrice,
      HighestBidAmount = this.HighestBidAmount,
      PassedReason = this.PassedReason,
      HammerDtm = this.HammerDtm,
      AuctioneerStaff = this.AuctioneerStaff,
      PaymentStatus = this.PaymentStatus,
      PaidAmount = this.PaidAmount,
      PaymentDtm = this.PaymentDtm,
      PaymentStaff = this.PaymentStaff,
      PaymentNotes = this.PaymentNotes,
      IsDelivered = this.IsDelivered,
      DeliveryDtm = this.DeliveryDtm,
      DeliveryStaff = this.DeliveryStaff,
      Notes = this.Notes,
      CreatedDtm = this.CreatedDtm,
    };
  }
}
}


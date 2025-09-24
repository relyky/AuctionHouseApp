namespace Vista.DB.Schema
{
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("SilentHammered")]
public class SilentHammered 
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
  public int? TotalBidCount { get; set; }
  public int? UniqueBidderCount { get; set; }
  public string PassedReason { get; set; } = default!;
  public DateTime? HammerDtm { get; set; }
  public string AutoHammered { get; set; } = default!;
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

  public void Copy(SilentHammered src)
  {
    this.HammerId = src.HammerId;
    this.ItemId = src.ItemId;
    this.AuctionResult = src.AuctionResult;
    this.WinnerPaddleNum = src.WinnerPaddleNum;
    this.WinnerName = src.WinnerName;
    this.HammerPrice = src.HammerPrice;
    this.HighestBidAmount = src.HighestBidAmount;
    this.TotalBidCount = src.TotalBidCount;
    this.UniqueBidderCount = src.UniqueBidderCount;
    this.PassedReason = src.PassedReason;
    this.HammerDtm = src.HammerDtm;
    this.AutoHammered = src.AutoHammered;
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

  public SilentHammered Clone()
  {
    return new SilentHammered {
      HammerId = this.HammerId,
      ItemId = this.ItemId,
      AuctionResult = this.AuctionResult,
      WinnerPaddleNum = this.WinnerPaddleNum,
      WinnerName = this.WinnerName,
      HammerPrice = this.HammerPrice,
      HighestBidAmount = this.HighestBidAmount,
      TotalBidCount = this.TotalBidCount,
      UniqueBidderCount = this.UniqueBidderCount,
      PassedReason = this.PassedReason,
      HammerDtm = this.HammerDtm,
      AutoHammered = this.AutoHammered,
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


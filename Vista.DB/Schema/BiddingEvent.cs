namespace Vista.DB.Schema
{
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// 競價訊息
/// </summary>
[Table("BiddingEvent")]
public class BiddingEvent 
{
  [Key]
  [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
  public int BiddingSn { get; set; }
  public string LotNo { get; set; } = default!;
  public string BidderNo { get; set; } = default!;
  /// <summary>
  /// 出價金額
  /// </summary>
  [Display(Name = "出價金額")]
  public Decimal? BidPrice { get; set; }
  /// <summary>
  /// 有效否:Y/N
  /// </summary>
  [Display(Name = "有效否")]
  public string IsValid { get; set; } = default!;
  /// <summary>
  /// 開放出價次號: 拍賣官開放出價次號,自動產生
  /// </summary>
  [Display(Name = "開放出價次號")]
  public int? BidOpenSn { get; set; }
  /// <summary>
  /// 出價時間
  /// </summary>
  [Display(Name = "出價時間")]
  public DateTime? BidTimestamp { get; set; }

  public void Copy(BiddingEvent src)
  {
    this.BiddingSn = src.BiddingSn;
    this.LotNo = src.LotNo;
    this.BidderNo = src.BidderNo;
    this.BidPrice = src.BidPrice;
    this.IsValid = src.IsValid;
    this.BidOpenSn = src.BidOpenSn;
    this.BidTimestamp = src.BidTimestamp;
  }

  public BiddingEvent Clone()
  {
    return new BiddingEvent {
      BiddingSn = this.BiddingSn,
      LotNo = this.LotNo,
      BidderNo = this.BidderNo,
      BidPrice = this.BidPrice,
      IsValid = this.IsValid,
      BidOpenSn = this.BidOpenSn,
      BidTimestamp = this.BidTimestamp,
    };
  }
}
}


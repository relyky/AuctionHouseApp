namespace Vista.DB.Schema
{
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("HammeredRecord")]
public class HammeredRecord 
{
  /// <summary>
  /// 拍品編號
  /// </summary>
  [Display(Name = "拍品編號")]
  [Key]
  public string LotNo { get; set; } = default!;
  /// <summary>
  /// 拍賣結果: Hammered.落槌; Passed.流標;
  /// </summary>
  [Display(Name = "拍賣結果")]
  public string BidResult { get; set; } = default!;
  /// <summary>
  /// 得標人編號
  /// </summary>
  [Display(Name = "得標人編號")]
  public string WinnerNo { get; set; } = default!;
  /// <summary>
  /// 落槌成交價
  /// </summary>
  [Display(Name = "落槌成交價")]
  public Decimal? HammerPrice { get; set; }
  /// <summary>
  /// 競價序號: 反查用。
  /// </summary>
  [Display(Name = "競價序號")]
  public int? BiddingSn { get; set; }
  public DateTime? HammerTime { get; set; }

  public void Copy(HammeredRecord src)
  {
    this.LotNo = src.LotNo;
    this.BidResult = src.BidResult;
    this.WinnerNo = src.WinnerNo;
    this.HammerPrice = src.HammerPrice;
    this.BiddingSn = src.BiddingSn;
    this.HammerTime = src.HammerTime;
  }

  public HammeredRecord Clone()
  {
    return new HammeredRecord {
      LotNo = this.LotNo,
      BidResult = this.BidResult,
      WinnerNo = this.WinnerNo,
      HammerPrice = this.HammerPrice,
      BiddingSn = this.BiddingSn,
      HammerTime = this.HammerTime,
    };
  }
}
}


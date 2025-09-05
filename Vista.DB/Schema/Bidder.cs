namespace Vista.DB.Schema
{
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// 競標人註冊時聯絡資料
/// </summary>
[Table("Bidder")]
public class Bidder 
{
  /// <summary>
  /// 競標人編號: 臨時編號
  /// </summary>
  [Display(Name = "競標人編號")]
  [Key]
  public string BidderNo { get; set; } = default!;
  /// <summary>
  /// 競標人名稱
  /// </summary>
  [Display(Name = "競標人名稱")]
  public string BidderName { get; set; } = default!;
  /// <summary>
  /// 手機號碼: 可用於簡易識別。
  /// </summary>
  [Display(Name = "手機號碼")]
  public string PhoneNum { get; set; } = default!;
  /// <summary>
  /// 電子信箱: 可用於註冊時驗證與寄送競拍資訊。
  /// </summary>
  [Display(Name = "電子信箱")]
  public string EmailAddr { get; set; } = default!;
  /// <summary>
  /// 啟用:Y/N
  /// </summary>
  [Display(Name = "啟用")]
  public string Enable { get; set; } = default!;

  public void Copy(Bidder src)
  {
    this.BidderNo = src.BidderNo;
    this.BidderName = src.BidderName;
    this.PhoneNum = src.PhoneNum;
    this.EmailAddr = src.EmailAddr;
    this.Enable = src.Enable;
  }

  public Bidder Clone()
  {
    return new Bidder {
      BidderNo = this.BidderNo,
      BidderName = this.BidderName,
      PhoneNum = this.PhoneNum,
      EmailAddr = this.EmailAddr,
      Enable = this.Enable,
    };
  }
}
}


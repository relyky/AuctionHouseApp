namespace Vista.DB.Schema
{
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// 賓客聯絡資訊
/// </summary>
[Table("Vip")]
public class Vip 
{
  /// <summary>
  /// 拍牌編號
  /// </summary>
  [Display(Name = "拍牌編號")]
  [Key]
  public string PaddleNum { get; set; } = default!;
  /// <summary>
  /// 賓客全名
  /// </summary>
  [Display(Name = "賓客全名")]
  public string VipName { get; set; } = default!;
  /// <summary>
  /// 賓客電郵地址
  /// </summary>
  [Display(Name = "賓客電郵地址")]
  public string VipEmail { get; set; } = default!;
  /// <summary>
  /// 賓客聯絡電話
  /// </summary>
  [Display(Name = "賓客聯絡電話")]
  public string VipPhone { get; set; } = default!;
  /// <summary>
  /// 桌號
  /// </summary>
  [Display(Name = "桌號")]
  public string TableNumber { get; set; } = default!;
  /// <summary>
  /// 座位號碼
  /// </summary>
  [Display(Name = "座位號碼")]
  public string SeatNumber { get; set; } = default!;
  /// <summary>
  /// 是否企業
  /// </summary>
  [Display(Name = "是否企業")]
  public string IsEnterprise { get; set; } = default!;
  /// <summary>
  /// 收據抬頭(個人姓名)
  /// </summary>
  [Display(Name = "收據抬頭(個人姓名)")]
  public string ReceiptHeader { get; set; } = default!;
  /// <summary>
  /// 統編(身分證號)
  /// </summary>
  [Display(Name = "統編(身分證號)")]
  public string TaxNum { get; set; } = default!;

  public void Copy(Vip src)
  {
    this.PaddleNum = src.PaddleNum;
    this.VipName = src.VipName;
    this.VipEmail = src.VipEmail;
    this.VipPhone = src.VipPhone;
    this.TableNumber = src.TableNumber;
    this.SeatNumber = src.SeatNumber;
    this.IsEnterprise = src.IsEnterprise;
    this.ReceiptHeader = src.ReceiptHeader;
    this.TaxNum = src.TaxNum;
  }

  public Vip Clone()
  {
    return new Vip {
      PaddleNum = this.PaddleNum,
      VipName = this.VipName,
      VipEmail = this.VipEmail,
      VipPhone = this.VipPhone,
      TableNumber = this.TableNumber,
      SeatNumber = this.SeatNumber,
      IsEnterprise = this.IsEnterprise,
      ReceiptHeader = this.ReceiptHeader,
      TaxNum = this.TaxNum,
    };
  }
}
}


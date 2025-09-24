namespace Vista.DB.Schema
{
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// 福袋訂單
/// </summary>
[Table("GiveOrder")]
public class GiveOrder 
{
  /// <summary>
  /// 銷售編號:格式 GSnnnnn
  /// </summary>
  [Display(Name = "銷售編號")]
  [Key]
  public string GiveOrderNo { get; set; } = default!;
  /// <summary>
  /// 貴賓代碼
  /// </summary>
  [Display(Name = "貴賓代碼")]
  public string PaddleNum { get; set; } = default!;
  /// <summary>
  /// 福袋獎品ID
  /// </summary>
  [Display(Name = "福袋獎品ID")]
  public string GiftId { get; set; } = default!;
  /// <summary>
  /// 購買張數
  /// </summary>
  [Display(Name = "購買張數")]
  public int? PurchaseCount { get; set; }
  /// <summary>
  /// 購買金額
  /// </summary>
  [Display(Name = "購買金額")]
  public Decimal? PurchaseAmount { get; set; }
  /// <summary>
  /// 已付款:Y/N
  /// </summary>
  [Display(Name = "已付款")]
  public string HasPaid { get; set; } = default!;
  /// <summary>
  /// 銷售業務ID
  /// </summary>
  [Display(Name = "銷售業務ID")]
  public string SalesId { get; set; } = default!;
  /// <summary>
  /// 賣出時間:系統產生
  /// </summary>
  [Display(Name = "賣出時間")]
  public DateTime? SoldDtm { get; set; }
  /// <summary>
  /// 銷售狀態: ForSale | HasSold | Invalid
  /// </summary>
  [Display(Name = "銷售狀態")]
  public string Status { get; set; } = default!;
  public string Remark { get; set; } = default!;
  /// <summary>
  /// 已查驗: Y/N
  /// </summary>
  [Display(Name = "已查驗")]
  public string IsChecked { get; set; } = default!;
  /// <summary>
  /// 查驗人員: 可能是經理或敗務
  /// </summary>
  [Display(Name = "查驗人員")]
  public string Checker { get; set; } = default!;
  /// <summary>
  /// 查驗時間: 系統時間
  /// </summary>
  [Display(Name = "查驗時間")]
  public DateTime? CheckedDtm { get; set; }

  public void Copy(GiveOrder src)
  {
    this.GiveOrderNo = src.GiveOrderNo;
    this.PaddleNum = src.PaddleNum;
    this.GiftId = src.GiftId;
    this.PurchaseCount = src.PurchaseCount;
    this.PurchaseAmount = src.PurchaseAmount;
    this.HasPaid = src.HasPaid;
    this.SalesId = src.SalesId;
    this.SoldDtm = src.SoldDtm;
    this.Status = src.Status;
    this.Remark = src.Remark;
    this.IsChecked = src.IsChecked;
    this.Checker = src.Checker;
    this.CheckedDtm = src.CheckedDtm;
  }

  public GiveOrder Clone()
  {
    return new GiveOrder {
      GiveOrderNo = this.GiveOrderNo,
      PaddleNum = this.PaddleNum,
      GiftId = this.GiftId,
      PurchaseCount = this.PurchaseCount,
      PurchaseAmount = this.PurchaseAmount,
      HasPaid = this.HasPaid,
      SalesId = this.SalesId,
      SoldDtm = this.SoldDtm,
      Status = this.Status,
      Remark = this.Remark,
      IsChecked = this.IsChecked,
      Checker = this.Checker,
      CheckedDtm = this.CheckedDtm,
    };
  }
}
}


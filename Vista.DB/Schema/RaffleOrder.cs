namespace Vista.DB.Schema
{
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// 抽獎券銷售交易檔
/// </summary>
[Table("RaffleOrder")]
public class RaffleOrder 
{
  /// <summary>
  /// 銷售編號:格式 RSnnnnn
  /// </summary>
  [Display(Name = "銷售編號")]
  [Key]
  public string RaffleOrderNo { get; set; } = default!;
  /// <summary>
  /// 買家名稱
  /// </summary>
  [Display(Name = "買家名稱")]
  public string BuyerName { get; set; } = default!;
  /// <summary>
  /// 買家電郵地址
  /// </summary>
  [Display(Name = "買家電郵地址")]
  public string BuyerEmail { get; set; } = default!;
  /// <summary>
  /// 買家聯絡電話
  /// </summary>
  [Display(Name = "買家聯絡電話")]
  public string BuyerPhone { get; set; } = default!;
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

  public void Copy(RaffleOrder src)
  {
    this.RaffleOrderNo = src.RaffleOrderNo;
    this.BuyerName = src.BuyerName;
    this.BuyerEmail = src.BuyerEmail;
    this.BuyerPhone = src.BuyerPhone;
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

  public RaffleOrder Clone()
  {
    return new RaffleOrder {
      RaffleOrderNo = this.RaffleOrderNo,
      BuyerName = this.BuyerName,
      BuyerEmail = this.BuyerEmail,
      BuyerPhone = this.BuyerPhone,
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


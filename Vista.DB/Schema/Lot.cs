namespace Vista.DB.Schema
{
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// 拍賣品註冊
/// </summary>
[Table("Lot")]
public class Lot 
{
  /// <summary>
  /// 拍品編號:L000
  /// </summary>
  [Display(Name = "拍品編號")]
  [Key]
  public string LotNo { get; set; } = default!;
  public string LotTitle { get; set; } = default!;
  /// <summary>
  /// 拍品描述
  /// </summary>
  [Display(Name = "拍品描述")]
  public string LotDesc { get; set; } = default!;
  /// <summary>
  /// 圖錄: url
  /// </summary>
  [Display(Name = "圖錄")]
  public string Catalog { get; set; } = default!;
  /// <summary>
  /// 估價高值:(專家預估的拍品價格區間)
  /// </summary>
  [Display(Name = "估價高值")]
  public Decimal? HighEstimate { get; set; }
  /// <summary>
  /// 估價低值:(專家預估的拍品價格區間)
  /// </summary>
  [Display(Name = "估價低值")]
  public Decimal? LowEstimate { get; set; }
  /// <summary>
  /// 保留價
  /// </summary>
  [Display(Name = "保留價")]
  public Decimal? ReservePrice { get; set; }
  /// <summary>
  /// 起拍價
  /// </summary>
  [Display(Name = "起拍價")]
  public Decimal? StartPrice { get; set; }
  /// <summary>
  /// 拍品狀態: Disable.停用; Drafting.編輯; Checked.確定;
  /// </summary>
  [Display(Name = "拍品狀態")]
  public string Status { get; set; } = default!;

  public void Copy(Lot src)
  {
    this.LotNo = src.LotNo;
    this.LotTitle = src.LotTitle;
    this.LotDesc = src.LotDesc;
    this.Catalog = src.Catalog;
    this.HighEstimate = src.HighEstimate;
    this.LowEstimate = src.LowEstimate;
    this.ReservePrice = src.ReservePrice;
    this.StartPrice = src.StartPrice;
    this.Status = src.Status;
  }

  public Lot Clone()
  {
    return new Lot {
      LotNo = this.LotNo,
      LotTitle = this.LotTitle,
      LotDesc = this.LotDesc,
      Catalog = this.Catalog,
      HighEstimate = this.HighEstimate,
      LowEstimate = this.LowEstimate,
      ReservePrice = this.ReservePrice,
      StartPrice = this.StartPrice,
      Status = this.Status,
    };
  }
}
}


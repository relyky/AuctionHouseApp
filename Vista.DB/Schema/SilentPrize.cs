namespace Vista.DB.Schema
{
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// 無聲拍賣品
/// </summary>
[Table("SilentPrize")]
public class SilentPrize 
{
  /// <summary>
  /// 商品ID
  /// </summary>
  [Display(Name = "商品ID")]
  [Key]
  public string ItemId { get; set; } = default!;
  /// <summary>
  /// 商品名稱
  /// </summary>
  [Display(Name = "商品名稱")]
  public string Name { get; set; } = default!;
  /// <summary>
  /// 商品描述
  /// </summary>
  [Display(Name = "商品描述")]
  public string Description { get; set; } = default!;
  /// <summary>
  /// 商品圖片URL
  /// </summary>
  [Display(Name = "商品圖片URL")]
  public string Image { get; set; } = default!;
  /// <summary>
  /// 起標價
  /// </summary>
  [Display(Name = "起標價")]
  public Decimal? StartPrice { get; set; }
  /// <summary>
  /// 最低加價
  /// </summary>
  [Display(Name = "最低加價")]
  public Decimal? MinIncrement { get; set; }
  /// <summary>
  /// 結標時間: HH:MM
  /// </summary>
  [Display(Name = "結標時間")]
  public string StartTime { get; set; } = default!;
  /// <summary>
  /// 結標時間: HH:MM
  /// </summary>
  [Display(Name = "結標時間")]
  public string EndTime { get; set; } = default!;
  public string Status { get; set; } = default!;
  public int? DisplayOrder { get; set; }
  public DateTime? CreatedAt { get; set; }
  public DateTime? UpdatedAt { get; set; }
  public string CreatedBy { get; set; } = default!;

  public void Copy(SilentPrize src)
  {
    this.ItemId = src.ItemId;
    this.Name = src.Name;
    this.Description = src.Description;
    this.Image = src.Image;
    this.StartPrice = src.StartPrice;
    this.MinIncrement = src.MinIncrement;
    this.StartTime = src.StartTime;
    this.EndTime = src.EndTime;
    this.Status = src.Status;
    this.DisplayOrder = src.DisplayOrder;
    this.CreatedAt = src.CreatedAt;
    this.UpdatedAt = src.UpdatedAt;
    this.CreatedBy = src.CreatedBy;
  }

  public SilentPrize Clone()
  {
    return new SilentPrize {
      ItemId = this.ItemId,
      Name = this.Name,
      Description = this.Description,
      Image = this.Image,
      StartPrice = this.StartPrice,
      MinIncrement = this.MinIncrement,
      StartTime = this.StartTime,
      EndTime = this.EndTime,
      Status = this.Status,
      DisplayOrder = this.DisplayOrder,
      CreatedAt = this.CreatedAt,
      UpdatedAt = this.UpdatedAt,
      CreatedBy = this.CreatedBy,
    };
  }
}
}


namespace Vista.DB.Schema
{
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// 福袋獎品
/// </summary>
[Table("GivePrize")]
public class GivePrize 
{
  /// <summary>
  /// 福袋類型唯一識別碼
  /// </summary>
  [Display(Name = "福袋類型唯一識別碼")]
  [Key]
  public string GiftId { get; set; } = default!;
  /// <summary>
  /// 福袋名稱
  /// </summary>
  [Display(Name = "福袋名稱")]
  public string Name { get; set; } = default!;
  /// <summary>
  /// 福袋描述
  /// </summary>
  [Display(Name = "福袋描述")]
  public string Description { get; set; } = default!;
  /// <summary>
  /// 福袋圖片URL
  /// </summary>
  [Display(Name = "福袋圖片URL")]
  public string Image { get; set; } = default!;
  /// <summary>
  /// 福袋價值
  /// </summary>
  [Display(Name = "福袋價值")]
  public Decimal? Value { get; set; }

  public void Copy(GivePrize src)
  {
    this.GiftId = src.GiftId;
    this.Name = src.Name;
    this.Description = src.Description;
    this.Image = src.Image;
    this.Value = src.Value;
  }

  public GivePrize Clone()
  {
    return new GivePrize {
      GiftId = this.GiftId,
      Name = this.Name,
      Description = this.Description,
      Image = this.Image,
      Value = this.Value,
    };
  }
}
}


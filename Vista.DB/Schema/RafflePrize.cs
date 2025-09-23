namespace Vista.DB.Schema
{
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// 抽獎券獎品
/// </summary>
[Table("RafflePrize")]
public class RafflePrize 
{
  /// <summary>
  /// 獎品ID
  /// </summary>
  [Display(Name = "獎品ID")]
  [Key]
  public string PrizeId { get; set; } = default!;
  /// <summary>
  /// 獎品名稱
  /// </summary>
  [Display(Name = "獎品名稱")]
  public string Name { get; set; } = default!;
  /// <summary>
  /// 獎品描述
  /// </summary>
  [Display(Name = "獎品描述")]
  public string Description { get; set; } = default!;
  /// <summary>
  /// 獎品圖片URL
  /// </summary>
  [Display(Name = "獎品圖片URL")]
  public string Image { get; set; } = default!;
  /// <summary>
  /// 獎品價值
  /// </summary>
  [Display(Name = "獎品價值")]
  public Decimal? Value { get; set; }
  /// <summary>
  /// 分類: major.大獎 | minor.小獎;
  /// </summary>
  [Display(Name = "分類")]
  public string Category { get; set; } = default!;

  public void Copy(RafflePrize src)
  {
    this.PrizeId = src.PrizeId;
    this.Name = src.Name;
    this.Description = src.Description;
    this.Image = src.Image;
    this.Value = src.Value;
    this.Category = src.Category;
  }

  public RafflePrize Clone()
  {
    return new RafflePrize {
      PrizeId = this.PrizeId,
      Name = this.Name,
      Description = this.Description,
      Image = this.Image,
      Value = this.Value,
      Category = this.Category,
    };
  }
}
}


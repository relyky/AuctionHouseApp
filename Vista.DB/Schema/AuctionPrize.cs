namespace Vista.DB.Schema
{
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// 現場拍賣品
/// </summary>
[Table("AuctionPrize")]
public class AuctionPrize 
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
  /// 底價
  /// </summary>
  [Display(Name = "底價")]
  public Decimal? ReservePrice { get; set; }
  public string Status { get; set; } = default!;
  public DateTime? CreatedAt { get; set; }
  public DateTime? UpdatedAt { get; set; }
  public string CreatedBy { get; set; } = default!;

  public void Copy(AuctionPrize src)
  {
    this.ItemId = src.ItemId;
    this.Name = src.Name;
    this.Description = src.Description;
    this.Image = src.Image;
    this.StartPrice = src.StartPrice;
    this.ReservePrice = src.ReservePrice;
    this.Status = src.Status;
    this.CreatedAt = src.CreatedAt;
    this.UpdatedAt = src.UpdatedAt;
    this.CreatedBy = src.CreatedBy;
  }

  public AuctionPrize Clone()
  {
    return new AuctionPrize {
      ItemId = this.ItemId,
      Name = this.Name,
      Description = this.Description,
      Image = this.Image,
      StartPrice = this.StartPrice,
      ReservePrice = this.ReservePrice,
      Status = this.Status,
      CreatedAt = this.CreatedAt,
      UpdatedAt = this.UpdatedAt,
      CreatedBy = this.CreatedBy,
    };
  }
}
}


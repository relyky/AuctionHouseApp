namespace Vista.DB.Schema
{
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// 福袋抽獎券
/// </summary>
[Table("GiveTicket")]
public class GiveTicket 
{
  /// <summary>
  /// 福袋抽獎券號碼
  /// </summary>
  [Display(Name = "福袋抽獎券號碼")]
  [Key]
  public string GiveTicketNo { get; set; } = default!;
  /// <summary>
  /// 訂單號碼
  /// </summary>
  [Display(Name = "訂單號碼")]
  public string GiveOrderNo { get; set; } = default!;
  /// <summary>
  /// 福袋獎品標的
  /// </summary>
  [Display(Name = "福袋獎品標的")]
  public string GiftId { get; set; } = default!;
  /// <summary>
  /// 貴賓編號
  /// </summary>
  [Display(Name = "貴賓編號")]
  public string PaddleNum { get; set; } = default!;
  /// <summary>
  /// 票券所有人名稱: 驗證效果比較大
  /// </summary>
  [Display(Name = "票券所有人名稱")]
  public string HolderName { get; set; } = default!;

  public void Copy(GiveTicket src)
  {
    this.GiveTicketNo = src.GiveTicketNo;
    this.GiveOrderNo = src.GiveOrderNo;
    this.GiftId = src.GiftId;
    this.PaddleNum = src.PaddleNum;
    this.HolderName = src.HolderName;
  }

  public GiveTicket Clone()
  {
    return new GiveTicket {
      GiveTicketNo = this.GiveTicketNo,
      GiveOrderNo = this.GiveOrderNo,
      GiftId = this.GiftId,
      PaddleNum = this.PaddleNum,
      HolderName = this.HolderName,
    };
  }
}
}


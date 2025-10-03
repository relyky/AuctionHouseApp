namespace Vista.DB.Schema
{
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// 抽獎中獎
/// </summary>
[Table("RaffleWinner")]
public class RaffleWinner 
{
  /// <summary>
  /// 獎品ID
  /// </summary>
  [Display(Name = "獎品ID")]
  [Key]
  public string PrizeId { get; set; } = default!;
  /// <summary>
  /// 中獎抽獎券編號
  /// </summary>
  [Display(Name = "中獎抽獎券編號")]
  public string RaffleTickerNo { get; set; } = default!;
  /// <summary>
  /// 抽獎時間
  /// </summary>
  [Display(Name = "抽獎時間")]
  public DateTime? DrawDtm { get; set; }

  public void Copy(RaffleWinner src)
  {
    this.PrizeId = src.PrizeId;
    this.RaffleTickerNo = src.RaffleTickerNo;
    this.DrawDtm = src.DrawDtm;
  }

  public RaffleWinner Clone()
  {
    return new RaffleWinner {
      PrizeId = this.PrizeId,
      RaffleTickerNo = this.RaffleTickerNo,
      DrawDtm = this.DrawDtm,
    };
  }
}
}


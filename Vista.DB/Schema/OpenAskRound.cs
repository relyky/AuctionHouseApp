namespace Vista.DB.Schema
{
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// 公開叫價回合
/// </summary>
[Table("OpenAskRound")]
public class OpenAskRound 
{
  /// <summary>
  /// 叫價回合: 自然數
  /// </summary>
  [Display(Name = "叫價回合")]
  [Key]
  public int Round { get; set; }
  /// <summary>
  /// 叫價金額
  /// </summary>
  [Display(Name = "叫價金額")]
  public Decimal? Amount { get; set; }
  /// <summary>
  /// 啟動:Y/N
  /// </summary>
  [Display(Name = "啟動")]
  public string IsActive { get; set; } = default!;

  public void Copy(OpenAskRound src)
  {
    this.Round = src.Round;
    this.Amount = src.Amount;
    this.IsActive = src.IsActive;
  }

  public OpenAskRound Clone()
  {
    return new OpenAskRound {
      Round = this.Round,
      Amount = this.Amount,
      IsActive = this.IsActive,
    };
  }
}
}


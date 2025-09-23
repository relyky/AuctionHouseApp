namespace Vista.DB.Schema
{
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// 捐款紀錄
/// </summary>
[Table("DonationRecord")]
public class DonationRecord 
{
  [Key]
  [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
  public int Ssn { get; set; }
  /// <summary>
  /// 捐款者ID
  /// </summary>
  [Display(Name = "捐款者ID")]
  public string PaddleNum { get; set; } = default!;
  /// <summary>
  /// 捐款者姓名
  /// </summary>
  [Display(Name = "捐款者姓名")]
  public string PaddleName { get; set; } = default!;
  /// <summary>
  /// 捐款金額
  /// </summary>
  [Display(Name = "捐款金額")]
  public Decimal? Amount { get; set; }
  /// <summary>
  /// 捐款時間
  /// </summary>
  [Display(Name = "捐款時間")]
  public DateTime? Timestamp { get; set; }

  public void Copy(DonationRecord src)
  {
    this.Ssn = src.Ssn;
    this.PaddleNum = src.PaddleNum;
    this.PaddleName = src.PaddleName;
    this.Amount = src.Amount;
    this.Timestamp = src.Timestamp;
  }

  public DonationRecord Clone()
  {
    return new DonationRecord {
      Ssn = this.Ssn,
      PaddleNum = this.PaddleNum,
      PaddleName = this.PaddleName,
      Amount = this.Amount,
      Timestamp = this.Timestamp,
    };
  }
}
}


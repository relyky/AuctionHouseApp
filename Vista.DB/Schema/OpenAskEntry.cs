namespace Vista.DB.Schema
{
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("OpenAskEntry")]
public class OpenAskEntry 
{
  /// <summary>
  /// 系統序號
  /// </summary>
  [Display(Name = "系統序號")]
  [Key]
  [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
  public int Ssn { get; set; }
  /// <summary>
  /// 叫價回合: 自然數
  /// </summary>
  [Display(Name = "叫價回合")]
  public int? Round { get; set; }
  /// <summary>
  /// 叫價認捐金額
  /// </summary>
  [Display(Name = "叫價認捐金額")]
  public Decimal? Amount { get; set; }
  /// <summary>
  /// 貴賓編號
  /// </summary>
  [Display(Name = "貴賓編號")]
  public string PaddleNum { get; set; } = default!;
  /// <summary>
  /// 紀錄工作人員
  /// </summary>
  [Display(Name = "紀錄工作人員")]
  public string RecordStaff { get; set; } = default!;
  /// <summary>
  /// 紀錄時間
  /// </summary>
  [Display(Name = "紀錄時間")]
  public DateTime? RecordDtm { get; set; }

  public void Copy(OpenAskEntry src)
  {
    this.Ssn = src.Ssn;
    this.Round = src.Round;
    this.Amount = src.Amount;
    this.PaddleNum = src.PaddleNum;
    this.RecordStaff = src.RecordStaff;
    this.RecordDtm = src.RecordDtm;
  }

  public OpenAskEntry Clone()
  {
    return new OpenAskEntry {
      Ssn = this.Ssn,
      Round = this.Round,
      Amount = this.Amount,
      PaddleNum = this.PaddleNum,
      RecordStaff = this.RecordStaff,
      RecordDtm = this.RecordDtm,
    };
  }
}
}


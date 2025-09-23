namespace Vista.DB.Schema
{
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// 叫價捐款紀錄
/// </summary>
[Table("OpenAskRecord")]
public class OpenAskRecord 
{
  /// <summary>
  /// 公開叫價回合
  /// </summary>
  [Display(Name = "公開叫價回合")]
  [Key]
  public int Round { get; set; }
  /// <summary>
  /// 拍牌編號
  /// </summary>
  [Display(Name = "拍牌編號")]
  [Key]
  public string PaddleNum { get; set; } = default!;
  /// <summary>
  /// 賓客名稱
  /// </summary>
  [Display(Name = "賓客名稱")]
  public string PaddleName { get; set; } = default!;
  /// <summary>
  /// 捐款金額
  /// </summary>
  [Display(Name = "捐款金額")]
  public Decimal? Amount { get; set; }
  /// <summary>
  /// 確認時間
  /// </summary>
  [Display(Name = "確認時間")]
  public DateTime? Timestamp { get; set; }
  /// <summary>
  /// 紀錄人員１
  /// </summary>
  [Display(Name = "紀錄人員１")]
  public string RecordStaff1 { get; set; } = default!;
  /// <summary>
  /// 紀錄人員２
  /// </summary>
  [Display(Name = "紀錄人員２")]
  public string RecordStaff2 { get; set; } = default!;
  /// <summary>
  /// 狀態: Pending / Confirmed;
  /// </summary>
  [Display(Name = "狀態")]
  public string Status { get; set; } = default!;

  public void Copy(OpenAskRecord src)
  {
    this.Round = src.Round;
    this.PaddleNum = src.PaddleNum;
    this.PaddleName = src.PaddleName;
    this.Amount = src.Amount;
    this.Timestamp = src.Timestamp;
    this.RecordStaff1 = src.RecordStaff1;
    this.RecordStaff2 = src.RecordStaff2;
    this.Status = src.Status;
  }

  public OpenAskRecord Clone()
  {
    return new OpenAskRecord {
      Round = this.Round,
      PaddleNum = this.PaddleNum,
      PaddleName = this.PaddleName,
      Amount = this.Amount,
      Timestamp = this.Timestamp,
      RecordStaff1 = this.RecordStaff1,
      RecordStaff2 = this.RecordStaff2,
      Status = this.Status,
    };
  }
}
}


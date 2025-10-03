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
  /// 系統序號: identity, 以滿足一輪多次叫價認捐。
  /// </summary>
  [Display(Name = "系統序號")]
  [Key]
  public int Ssn { get; set; }
  /// <summary>
  /// 公開叫價回合
  /// </summary>
  [Display(Name = "公開叫價回合")]
  public int? Round { get; set; }
  /// <summary>
  /// 拍牌編號
  /// </summary>
  [Display(Name = "拍牌編號")]
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
  /// 紀錄人員１
  /// </summary>
  [Display(Name = "紀錄人員１")]
  public string RecordStaff1 { get; set; } = default!;
  /// <summary>
  /// 紀錄時間１
  /// </summary>
  [Display(Name = "紀錄時間１")]
  public DateTime? RecordDtm1 { get; set; }
  /// <summary>
  /// 紀錄人員２
  /// </summary>
  [Display(Name = "紀錄人員２")]
  public string RecordStaff2 { get; set; } = default!;
  /// <summary>
  /// 紀錄時間２
  /// </summary>
  [Display(Name = "紀錄時間２")]
  public DateTime? RecordDtm2 { get; set; }
  /// <summary>
  /// 狀態: Pending / Confirmed / Invalid;
  /// </summary>
  [Display(Name = "狀態")]
  public string Status { get; set; } = default!;
  /// <summary>
  /// 已收費:Y/N, for 收費註記
  /// </summary>
  [Display(Name = "已收費")]
  public string HasPaid { get; set; } = default!;
  /// <summary>
  /// 收費時間: for 收費註記
  /// </summary>
  [Display(Name = "收費時間")]
  public DateTime? PaidDtm { get; set; }
  /// <summary>
  /// 收費人員: for 收費註記
  /// </summary>
  [Display(Name = "收費人員")]
  public string PaidStaff { get; set; } = default!;
  /// <summary>
  /// 是否修正: Y/nil, 先開欄位暫不使用。
  /// </summary>
  [Display(Name = "是否修正")]
  public string HasFix { get; set; } = default!;
  /// <summary>
  /// 修正人員: 先開欄位暫不使用。
  /// </summary>
  [Display(Name = "修正人員")]
  public string FixStaff { get; set; } = default!;
  /// <summary>
  /// 修正時間: 先開欄位暫不使用。
  /// </summary>
  [Display(Name = "修正時間")]
  public DateTime? FixDtm { get; set; }
  /// <summary>
  /// 修正備註: 自動填入修正內容。先開欄位暫不使用。
  /// </summary>
  [Display(Name = "修正備註")]
  public string FixRemark { get; set; } = default!;

  public void Copy(OpenAskRecord src)
  {
    this.Ssn = src.Ssn;
    this.Round = src.Round;
    this.PaddleNum = src.PaddleNum;
    this.PaddleName = src.PaddleName;
    this.Amount = src.Amount;
    this.RecordStaff1 = src.RecordStaff1;
    this.RecordDtm1 = src.RecordDtm1;
    this.RecordStaff2 = src.RecordStaff2;
    this.RecordDtm2 = src.RecordDtm2;
    this.Status = src.Status;
    this.HasPaid = src.HasPaid;
    this.PaidDtm = src.PaidDtm;
    this.PaidStaff = src.PaidStaff;
    this.HasFix = src.HasFix;
    this.FixStaff = src.FixStaff;
    this.FixDtm = src.FixDtm;
    this.FixRemark = src.FixRemark;
  }

  public OpenAskRecord Clone()
  {
    return new OpenAskRecord {
      Ssn = this.Ssn,
      Round = this.Round,
      PaddleNum = this.PaddleNum,
      PaddleName = this.PaddleName,
      Amount = this.Amount,
      RecordStaff1 = this.RecordStaff1,
      RecordDtm1 = this.RecordDtm1,
      RecordStaff2 = this.RecordStaff2,
      RecordDtm2 = this.RecordDtm2,
      Status = this.Status,
      HasPaid = this.HasPaid,
      PaidDtm = this.PaidDtm,
      PaidStaff = this.PaidStaff,
      HasFix = this.HasFix,
      FixStaff = this.FixStaff,
      FixDtm = this.FixDtm,
      FixRemark = this.FixRemark,
    };
  }
}
}


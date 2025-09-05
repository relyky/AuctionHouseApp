namespace Vista.DB.Schema
{
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// 拍賣官競價開啟過程紀錄
/// </summary>
[Table("BidOpenLog")]
public class BidOpenLog 
{
  [Key]
  public int BidOpenSn { get; set; }
  /// <summary>
  /// 拍品編號
  /// </summary>
  [Display(Name = "拍品編號")]
  public string LotNo { get; set; } = default!;
  /// <summary>
  /// 操作分類
  /// </summary>
  [Display(Name = "操作分類")]
  public string Action { get; set; } = default!;
  /// <summary>
  /// 操作簡述
  /// </summary>
  [Display(Name = "操作簡述")]
  public string ActionDesc { get; set; } = default!;
  /// <summary>
  /// 參教:JSON
  /// </summary>
  [Display(Name = "參教")]
  public string Args { get; set; } = default!;
  /// <summary>
  /// 紀錄系統時間
  /// </summary>
  [Display(Name = "紀錄系統時間")]
  public DateTime? LogDtm { get; set; }

  public void Copy(BidOpenLog src)
  {
    this.BidOpenSn = src.BidOpenSn;
    this.LotNo = src.LotNo;
    this.Action = src.Action;
    this.ActionDesc = src.ActionDesc;
    this.Args = src.Args;
    this.LogDtm = src.LogDtm;
  }

  public BidOpenLog Clone()
  {
    return new BidOpenLog {
      BidOpenSn = this.BidOpenSn,
      LotNo = this.LotNo,
      Action = this.Action,
      ActionDesc = this.ActionDesc,
      Args = this.Args,
      LogDtm = this.LogDtm,
    };
  }
}
}


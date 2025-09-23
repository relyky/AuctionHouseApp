namespace Vista.DB.Schema
{
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// 活狀現場狀態
/// </summary>
[Table("LiveSession")]
public class LiveSession 
{
  /// <summary>
  /// 狀態名稱
  /// </summary>
  [Display(Name = "狀態名稱")]
  [Key]
  public string StateName { get; set; } = default!;
  /// <summary>
  /// 說明
  /// </summary>
  [Display(Name = "說明")]
  public string Descripiton { get; set; } = default!;
  /// <summary>
  /// 文字狀態值
  /// </summary>
  [Display(Name = "文字狀態值")]
  public string StringValue { get; set; } = default!;
  /// <summary>
  /// 數值狀態值
  /// </summary>
  [Display(Name = "數值狀態值")]
  public Decimal? NumValue { get; set; }

  public void Copy(LiveSession src)
  {
    this.StateName = src.StateName;
    this.Descripiton = src.Descripiton;
    this.StringValue = src.StringValue;
    this.NumValue = src.NumValue;
  }

  public LiveSession Clone()
  {
    return new LiveSession {
      StateName = this.StateName,
      Descripiton = this.Descripiton,
      StringValue = this.StringValue,
      NumValue = this.NumValue,
    };
  }
}
}


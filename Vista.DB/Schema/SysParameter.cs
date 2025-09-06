namespace Vista.DB.Schema
{
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// 系統參數
/// </summary>
[Table("SysParameter")]
public class SysParameter 
{
  /// <summary>
  /// 參數識別名稱
  /// Computed Definition: (concat([Category],case when [Category]='' then '' else '_' end,[Name]))
  /// </summary>
  [Display(Name = "參數識別名稱")]
  [Key]
  [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
  public string IdName { get; set; } = default!;
  /// <summary>
  /// 參數名稱
  /// </summary>
  [Display(Name = "參數名稱")]
  public string Name { get; set; } = default!;
  /// <summary>
  /// 參數值
  /// </summary>
  [Display(Name = "參數值")]
  public string Value { get; set; } = default!;
  /// <summary>
  /// 參數類別:系統參數分群/分類別。未分群填空白
  /// </summary>
  [Display(Name = "參數類別")]
  public string Category { get; set; } = default!;
  /// <summary>
  /// 備註
  /// </summary>
  [Display(Name = "備註")]
  public string Remark { get; set; } = default!;

  public void Copy(SysParameter src)
  {
    this.IdName = src.IdName;
    this.Name = src.Name;
    this.Value = src.Value;
    this.Category = src.Category;
    this.Remark = src.Remark;
  }

  public SysParameter Clone()
  {
    return new SysParameter {
      IdName = this.IdName,
      Name = this.Name,
      Value = this.Value,
      Category = this.Category,
      Remark = this.Remark,
    };
  }
}
}


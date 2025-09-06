namespace Vista.DB.Schema
{
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// 工作人員檔
/// </summary>
[Table("Staff")]
public class Staff 
{
  /// <summary>
  /// 識別帳號
  /// </summary>
  [Display(Name = "識別帳號")]
  [Key]
  public string UserId { get; set; } = default!;
  /// <summary>
  /// 密碼
  /// </summary>
  [Display(Name = "密碼")]
  public string Mima { get; set; } = default!;
  /// <summary>
  /// 顯示名稱
  /// </summary>
  [Display(Name = "顯示名稱")]
  public string Nickname { get; set; } = default!;
  /// <summary>
  /// 通訊電話
  /// </summary>
  [Display(Name = "通訊電話")]
  public string Phone { get; set; } = default!;
  /// <summary>
  /// 角色: JSON String Array
  /// </summary>
  [Display(Name = "角色")]
  public string RoleList { get; set; } = default!;
  /// <summary>
  /// 備註
  /// </summary>
  [Display(Name = "備註")]
  public string Remark { get; set; } = default!;
  /// <summary>
  /// 啟用: Y/N
  /// </summary>
  [Display(Name = "啟用")]
  public string Enable { get; set; } = default!;

  public void Copy(Staff src)
  {
    this.UserId = src.UserId;
    this.Mima = src.Mima;
    this.Nickname = src.Nickname;
    this.Phone = src.Phone;
    this.RoleList = src.RoleList;
    this.Remark = src.Remark;
    this.Enable = src.Enable;
  }

  public Staff Clone()
  {
    return new Staff {
      UserId = this.UserId,
      Mima = this.Mima,
      Nickname = this.Nickname,
      Phone = this.Phone,
      RoleList = this.RoleList,
      Remark = this.Remark,
      Enable = this.Enable,
    };
  }
}
}


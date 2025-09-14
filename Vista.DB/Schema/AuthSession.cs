namespace Vista.DB.Schema
{
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// 使用者登入授權 session
/// </summary>
[Table("AuthSession")]
public class AuthSession 
{
  /// <summary>
  /// 使用者識別名稱
  /// </summary>
  [Display(Name = "使用者識別名稱")]
  [Key]
  public string UserId { get; set; } = default!;
  /// <summary>
  /// 授權有效時限
  /// </summary>
  [Display(Name = "授權有效時限")]
  public DateTimeOffset? ExpiresDtm { get; set; }
  /// <summary>
  /// 授權內容
  /// </summary>
  [Display(Name = "授權內容")]
  public string Session { get; set; } = default!;

  public void Copy(AuthSession src)
  {
    this.UserId = src.UserId;
    this.ExpiresDtm = src.ExpiresDtm;
    this.Session = src.Session;
  }

  public AuthSession Clone()
  {
    return new AuthSession {
      UserId = this.UserId,
      ExpiresDtm = this.ExpiresDtm,
      Session = this.Session,
    };
  }
}
}


using Reinforced.Typings.Attributes;
using System.ComponentModel.DataAnnotations;

namespace AuctionHouseApp.Server.Controllers;

//[TsInterface(Namespace = "pages.Account.DTO")]
[TsInterface(Namespace = "dto")]
public record LoginArgs
{
  [Required]
  [Display(Name = "帳號")]
  public string UserId { get; set; } = string.Empty;

  [Required]
  [Display(Name = "通關密語")]
  public string Mima { get; set; } = string.Empty;

  [Required]
  [Display(Name = "驗證碼")]
  public string Vcode { get; set; } = string.Empty;
}

[TsInterface(Namespace = "dto")]
public record LoginUserInfo
{
  /// <summary>
  /// 識別帳號
  /// </summary>
  public required string LoginUserId { get; init; }

  /// <summary>
  /// 顯示名稱
  /// </summary>
  public required string LoginUserName { get; init; }

  /// <summary>
  /// 人員類別: VIP.貴賓, Staff.工作人員
  /// </summary>
  public required string UserType { get; init; }

  /// <summary>
  /// 工作人員:角色清單: Sales, Manager
  /// 格式: JSON string array
  /// </summary>
  public required string[] RoleList { get; init; }

  /// <summary>
  /// 授權狀態: Guest | Authed | Authing
  /// </summary>
  public required  string Status { get; init; }

  /// <summary>
  /// 授權到期時間
  /// </summary>
  [TsProperty(Type = "string")]
  public DateTimeOffset ExpiresTime { get; init; }

  /// <summary>
  /// 貴賓:電郵地址。
  /// </summary>
  public string? EmailAddr { get; init; }

  /// <summary>
  ///  貴賓:聯絡電話。
  /// </summary>
  public string? Phone { get; init; }
}

[TsInterface(Namespace = "pages.Account.DTO")]
public record StaffAccount
{
  /// <summary>
  /// 識別帳號
  /// </summary>
  public required string UserId { get; init; }

  /// <summary>
  /// 顯示名稱
  /// </summary>
  public required string Nickname { get; init; }

  /// <summary>
  /// 通訊電話
  /// </summary>
  public required string Phone { get; init; }

  /// <summary>
  /// 角色: JSON String Array
  /// </summary>
  public string[] RoleList { get; init; } = [];

  /// <summary>
  /// 到期時間
  /// </summary>
  [TsProperty(Type = "string")]
  public DateTime ExpiresTime { get; init; }

  /// <summary>
  /// 授權狀態: type AuthStatus = 'Guest' | 'Authing' | 'Authed'
  /// </summary>
  public required string Status { get; init; } = "Guest";
}

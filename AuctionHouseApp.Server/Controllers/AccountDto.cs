using Reinforced.Typings.Attributes;

namespace AuctionHouseApp.Server.Controllers;

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

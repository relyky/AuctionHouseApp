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
}

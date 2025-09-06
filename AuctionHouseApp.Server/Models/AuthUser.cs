using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace AuctionHouseApp.Server.Models;

/// <summary>
/// 使用者授權明細(no public)
/// </summary>
public record AuthUser
{
  public string UserId { get; init; } = String.Empty;
  public string UserName { get; init; } = String.Empty;
  public string[] Roles { get; init; } = new string[0];
  public Guid AuthGuid { get; init; }
  public DateTimeOffset IssuedUtc { get; init; }
  public DateTimeOffset ExpiresUtc { get; init; }
  public string ClientIp { get; init; } = String.Empty;

  //## 延伸欄位 ------


  ///// <summary>
  ///// 授權功能選單（此專案未使用）
  ///// </summary>
  //public MenuInfo AuthMenu { get; init; } = new();

  ///// <summary>
  ///// 授權功能清單（此專案未使用）
  ///// </summary>
  //public string[] AuthFuncList() => AuthMenu.groupList.SelectMany(g => g.funcList, (g, f) => f.funcId).ToArray();
}

public class MenuInfo
{
  public List<MenuGroup> groupList { get; set; } = new List<MenuGroup>();

  public MenuGroup AddMenuGroup(MenuGroup menuGroup)
  {
    groupList.Add(menuGroup);
    return menuGroup;
  }
}

public record MenuGroup
{
  public string groupName { get; set; } = String.Empty;
  public string groupId { get; set; } = String.Empty;
  public List<MenuItem> funcList { get; set; } = new List<MenuItem>();

  public MenuGroup AddMenuItem(MenuItem item)
  {
    funcList.Add(item);
    return this;
  }
}

public record MenuItem
{
  public string funcId { get; set; } = String.Empty;
  public string funcName { get; set; } = String.Empty;
  public string url { get; set; } = String.Empty;
  public string tip { get; set; } = String.Empty;
}

using Dapper;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Vista.DbPanda;

namespace Vista.DB;

/// <summary>
/// 資料庫連線標的
/// 一個資料庫一個 ConnProxy 依需求加入。
/// </summary>
class DBHelper
{
  /// <summary>
  /// AuctionDB
  /// </summary>
  public static ConnProxy AUCDB = default!;

  /// 其他需要的資料庫...

  /// <summary>
  /// 登記所有 DB 連線組態。
  /// </summary>
  public static void Register(IConfiguration config)
  {
    // 自 appsettings.json 取得連線字串。
    DBHelper.AUCDB = new ConnProxy("AUCDB", config);

    ////※ 假設 CONNSEC/CONNSSO 已經取得。
    //DBHelper.CONNSEC = new ConnProxy("CONNSSO", config);

    ////## ※ 再依此取得並註冊其他連線組態。
    //using var conn = DBHelper.CONNSEC.Open();
    //var conns = conn.Query(@"SELECT ConnID, ConnStr FROM SecConnectionPool (NOLOCK)")
    //                .ToImmutableDictionary(c => (string)c.ConnID, c => (string)c.ConnStr);

    //# 註冊其他連線組態。
    //DBHelper.MyLabDB = new ConnProxy(conns["MyLabDB"]);
  }
}

using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using System.Globalization;
using System.Security;
using System.Security.Cryptography;
using System.Text;

/***************************************************************************
第三版 DBHelper.v３.0 on 2025-9-30
Linux 不支援 SecureString, ProtectData
***************************************************************************/

namespace Vista.DbPanda;

public class ConnProxy
{
  /// <summary>
  /// 連線字串，平常保持在加密狀態。
  /// </summary>
  private string _connStr;

  /// <summary>
  /// for DEBUG: 檢查連線字串內容
  /// </summary>
  public String ConnString => _connStr;

  public ConnProxy(string connString)
  {
    /// 連線字串只有建構時可設定。
    _connStr = connString;
  }

  /// <summary>
  /// 依 IConfiguration 取得連線字串。
  /// </summary>
  public ConnProxy(string connName, IConfiguration config)
  {
    try
    {
      /// 連線字串只有建構時可設定。
      _connStr = config.GetConnectionString(connName)!;
    }
    catch (Exception ex)
    {
      throw new ApplicationException($"取得連線字串[{connName}]失敗！", ex);
    }
  }

  public virtual SqlConnection Open()
  {
    var conn = new SqlConnection(_connStr);
    conn.Open();
    return conn;
  }

  public async Task<SqlConnection> OpenAsync()
  {
    var conn = new SqlConnection(_connStr);
    await conn.OpenAsync();
    return conn;
  }
}

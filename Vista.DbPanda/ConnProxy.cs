using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using System.Globalization;
using System.Security;
using System.Security.Cryptography;
using System.Text;
using System.Web;

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
      if ("EnablePlainText".Equals(config["ConnStringParser"]))
        _connStr = config.GetConnectionString(connName)!;
      else
        _connStr = DecodeSAML(config.GetConnectionString(connName)!);
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


  /// <summary>
  /// ref→[SAMLRequest, SAMLResponse快速加解密（或叫編碼解碼）範例](https://dotblogs.com.tw/kevinya/2019/09/20/152655)
  /// </summary>
  private static string EncodeSAML(string src)
  {
    byte[] bytes = System.Text.Encoding.ASCII.GetBytes(src);
    string base64String = Convert.ToBase64String(bytes);
    base64String = HttpUtility.UrlEncode(base64String);
    return base64String;
  }

  /// <summary>
  /// ref→[SAMLRequest, SAMLResponse快速加解密（或叫編碼解碼）範例](https://dotblogs.com.tw/kevinya/2019/09/20/152655)
  /// </summary>
  private static string DecodeSAML(string rawSamlData)
  {
    string samlAssertion = "";
    if (rawSamlData.Contains('%'))
    {
      rawSamlData = HttpUtility.UrlDecode(rawSamlData);
    }

    byte[] samlData = Convert.FromBase64String(rawSamlData);
    samlAssertion = System.Text.Encoding.ASCII.GetString(samlData);
    return samlAssertion;
  }
}

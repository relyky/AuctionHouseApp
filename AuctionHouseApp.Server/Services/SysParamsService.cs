using Dapper;
using Microsoft.Extensions.Caching.Memory;
using System.Collections.Immutable;
using Vista.DB;
using Vista.DB.Schema;

namespace AuctionHouseApp.Server.Services;

/// <summary>
/// 取得系統參數。並放入 cache 以免一直重複抓 DB。
/// 資料相依於 DB，故註冊成 Singleton。
/// </summary>
public class SysParamsService(
  IMemoryCache _cache,
  ILogger<SysParamsService> _logger)
{
  /// <summary>
  /// 系統參數：抽獎券單價
  /// </summary>
  public decimal GetRaffleUnitPrice()
  {
    const string sql = @"SELECT * FROM [dbo].[SysParameter] (NOLOCK) WHERE IdName = 'RaffleUnitPrice' ";
    const string cacheIdName = @"SysParameter_RaffleUnitPrice";

    decimal raffleUnitPrice = 0m;

    //# 若 cache 有值就送回 cache 的值。
    if (_cache.TryGetValue<decimal>(cacheIdName, out raffleUnitPrice))
    {
      _logger.LogDebug("系統參數：抽獎券單價 => 取自 cache => {raffleUnitPrice}", raffleUnitPrice);
      return raffleUnitPrice;
    }

    //# 否則自 DB 取系統參數。
    //※ 失敗或未設定時傳回 0 不讓系統當掉。
    using var conn = DBHelper.AUCDB.Open();
    var info = conn.QueryFirstOrDefault<SysParameter>(sql);
    if (decimal.TryParse(info?.Value, out raffleUnitPrice))
    {
      _logger.LogDebug("系統參數：抽獎券單價 => 取自 DB 成功 => {raffleUnitPrice}。", raffleUnitPrice);
    }
    else
    {
      raffleUnitPrice = 0m;
      _logger.LogDebug("系統參數：抽獎券單價 => 取自 DB 失敗傳回預設值 => {raffleUnitPrice}。", raffleUnitPrice);
    }

    // 存入 cache 5分鐘並 sliding 3分鐘
    _cache.Set<decimal>(cacheIdName, raffleUnitPrice, new MemoryCacheEntryOptions
    {
      SlidingExpiration = TimeSpan.FromMinutes(5), // 若有存取則延長 5 分鐘
      AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30) // 最長存活時間
    });

    return raffleUnitPrice;
  }

  /// <summary>
  /// 系統參數：寄 Email 參數
  /// </summary>
  public EmailProps GetEmailProps()
  {
    const string sql = @"SELECT * FROM [dbo].[SysParameter] (NOLOCK) WHERE Category = 'EmailProps' ";
    const string cacheIdName = @"SysParameter_EmailProps";

    EmailProps? emlProps = null;

    //# 若 cache 有值就送回 cache 的值。
    if (_cache.TryGetValue<EmailProps>(cacheIdName, out emlProps))
    {
      _logger.LogDebug("系統參數：寄 Email 參數 => 取自 cache。");
      return emlProps!;
    }

    //# 否則自 DB 取系統參數。
    //※ 失敗或未設定時傳回 0 不讓系統當掉。
    using var conn = DBHelper.AUCDB.Open();
    var emailParams = conn.Query<SysParameter>(sql).ToImmutableDictionary(x => x.Name, x => x.Value);
    _logger.LogDebug("系統參數：寄 Email 參數 => 取自 DB。");

    emlProps = new EmailProps
    {
      FromAddress = emailParams["FromAddress"],
      FromName = emailParams["FromName"],
      Host = emailParams["Host"],
      Port = int.Parse(emailParams["Port"]),
      UseSSL = "Y".Equals(emailParams["UseSSL"]),
      UserName = emailParams["UserName"],
      Mima = emailParams["Mima"],
      BCCList = emailParams["BCCList"],
      CCList = emailParams["CCList"],
      SubjectPrefix = emailParams["SubjectPrefix"]
    };

    // 存入 cache 5分鐘並 sliding 3分鐘
    _cache.Set<EmailProps>(cacheIdName, emlProps, new MemoryCacheEntryOptions
    {
      SlidingExpiration = TimeSpan.FromMinutes(5), // 若有存取則延長 5 分鐘
      AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30) // 最長存活時間
    });

    return emlProps;
  }
}

public record EmailProps
{
  public required string FromAddress { get; set; }
  public required string FromName { get; set; }
  public required string Host { get; set; }
  public int Port { get; set; }
  public bool UseSSL { get; set; }
  public required string UserName { get; set; }
  public required string Mima { get; set; }

  /// <summary>
  /// 副本
  /// </summary>
  public required string CCList { get; set; }

  /// <summary>
  /// 秘密副本
  /// </summary>
  public required string BCCList { get; set; }

  /// <summary>
  /// 郵件主旨前綴
  /// </summary>
  public required string SubjectPrefix { get; set; }
}

using Dapper;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Immutable;
using System.Net;
using System.Net.Mail;
using Vista.DB;
using Vista.DB.Schema;

namespace AuctionHouseApp.Server.Services;

/// <summary>
/// Email(SmtpClient) helper.
/// 以 System.Net.Mail 實作。
/// </summary>
public class EmailProxyService(
  IMemoryCache _cache,
  ILogger<SysParamsService> _logger)
  : IDisposable
{
  private EmailProps? _emlProps2 = null;
  private SmtpClient? _smtp2 = null;

  void IDisposable.Dispose()
  {
    _smtp2?.Dispose();
  }

  public EmailProps EmailProps
  {
    get
    {
      // 手動延遲初始化，避免在建構函式中就執行資料庫存取。
      LazyInitializer.EnsureInitialized(ref _emlProps2, () => GetEmailProps());
      return _emlProps2;
    }
  }

  /// <summary>
  /// 系統參數：寄 Email 參數
  /// helper
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

  /// <summary>
  /// 構建 SmtpClient 並設定相關屬性。
  /// ※注意：別忘了執行 Dispose。
  /// </summary>
  private static SmtpClient ConcreteSmtpClient(EmailProps emlProps)
  {
    // send mail
    SmtpClient client = new SmtpClient(emlProps.Host, emlProps.Port);
    client.EnableSsl = emlProps.UseSSL;

    if (!string.IsNullOrWhiteSpace(emlProps.UserName) && !string.IsNullOrEmpty(emlProps.Mima))
    {
      // 用帳密認證
      client.Credentials = new NetworkCredential(emlProps.UserName, emlProps.Mima);
    }
    else
    {
      // 無帳密，嘗試以 Relay 模式寄信。(未通過測試)
      client.UseDefaultCredentials = true; // 允許 Relay 無需帳密；可能有 IP 等限制。
    }

    return client;
  }

  /// <summary>
  /// 寄送 Email。將依設定自動填入 Mail From。
  /// </summary>
  public void SendTextEmail(IEnumerable<string> toList, string subject, string mailBody, IEnumerable<string>? ccList = null, IEnumerable<string>? bccList = null)
  {
    try
    {
      // 手動延遲初始化，避免在建構函式中就執行資料庫存取。
      LazyInitializer.EnsureInitialized(ref _emlProps2, () => GetEmailProps());
      LazyInitializer.EnsureInitialized(ref _smtp2, () => ConcreteSmtpClient(_emlProps2));

      // 檢查是否已初始化
      if (_emlProps2 == null || _smtp2 == null)
        throw new ApplicationException("emailProps 參數值或 smtpClient 物件未初始化！");

      //建立MailMessage物件
      MailMessage mail = new MailMessage();

      //指定一位寄信人MailAddress
      mail.From = new MailAddress(_emlProps2.FromAddress, _emlProps2.FromName);
      //信件主旨
      mail.Subject = subject;
      //信件內容
      mail.Body = mailBody;

      // 收件人
      foreach (var to in toList)
        mail.To.Add(new MailAddress(to));

      // 副本
      if (ccList != null)
      {
        foreach (var cc in ccList)
          mail.CC.Add(new MailAddress(cc));
      }

      if (bccList != null)
      {
        foreach (var cc in bccList)
          mail.Bcc.Add(new MailAddress(cc));
      }

      _smtp2.Send(mail);//寄出一封信
    }
    catch (Exception ex)
    {
      throw new ApplicationException($"{nameof(SendTextEmail)}出現例外！{ex.Message}", ex);
    }
  }

  /// <summary>
  /// 寄送進階 Email。將依設定自動填入 Mail From。
  /// </summary>
  public void SendEmail(MailMessage mail)
  {
    try
    {
      // 手動延遲初始化，避免在建構函式中就執行資料庫存取。
      LazyInitializer.EnsureInitialized(ref _emlProps2, () => GetEmailProps());
      LazyInitializer.EnsureInitialized(ref _smtp2, () => ConcreteSmtpClient(_emlProps2));

      // 檢查是否已初始化
      if (_emlProps2 == null || _smtp2 == null)
        throw new ApplicationException("emailProps 參數值或 smtpClient 物件未初始化！");

      // 自動填入 Mail From
      mail.From = new MailAddress(_emlProps2.FromAddress, _emlProps2.FromName);

      //建立MailMessage物件
      _smtp2.Send(mail);//寄出一封信
    }
    catch (Exception ex)
    {
      throw new ApplicationException($"{nameof(SendEmail)}出現例外！{ex.Message}", ex);
    }
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

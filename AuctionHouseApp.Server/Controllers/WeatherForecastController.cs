using AuctionHouseApp.Server.Controllers;
using AuctionHouseApp.Server.DTO;
using AuctionHouseApp.Server.Models;
using AuctionHouseApp.Server.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.SqlServer.Server;
using System.Net.Mail;
using System.Text;
using System.Text.Json;
using Vista.DB;
using Vista.DB.Schema;
using Vista.DbPanda;
using Vista.Models;

namespace AuctionHouseApp.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WeatherForecastController(
  EmailProxyService _emlSvc,
  ILogger<WeatherForecastController> _logger)
  : ControllerBase
{
  private static readonly string[] Summaries = [
      "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
  ];

  [HttpPost("[action]")]
  public ActionResult<IEnumerable<WeatherForecast>> QryDataList()
  {
    _logger.LogInformation("QryDataList called at {Time}", DateTime.Now);

    ////模擬測試失敗！
    //if (DateTime.Now.Second % 2 == 0)
    //  return BadRequest("模擬測試失敗！");

    var dataList = Enumerable.Range(1, 5).Select(index => new WeatherForecast
    {
      Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
      TemperatureC = Random.Shared.Next(-20, 55),
      Summary = Summaries[Random.Shared.Next(Summaries.Length)]
    })
    .ToArray();

    return Ok(dataList);
  }

  /// <summary>
  /// 注意１：串流回應不要包裝成 Task。也不要用 ActionResult<T> 回應。
  /// 注意２：也需搭配 yield return 語法。
  /// 設定 ResponseCache 禁用快取（避免前端快取干擾串流）。
  /// </summary>
  [HttpPost("[action]")]
  [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
  public async IAsyncEnumerable<WeatherForecast> QryDataStream()
  {
    _logger.LogInformation("QryDataStream BEGIN at {Time:HH:mm:ss.fff}", DateTime.Now);
    DateTime startTime = DateTime.Now;

    while (!ControllerContext.HttpContext.RequestAborted.IsCancellationRequested)
    {
      //# 超過一分鐘就結束串流。
      if (DateTime.Now - startTime > TimeSpan.FromMinutes(1))
        break; // 正常結束

      //# 模擬隨機狀況。如：後端資料還未進新的訊息不用回應。
      int nonce = Random.Shared.Next(6);
      if (nonce < 2)
      {
        //# 間隔些許時差以免系統過載
        await Task.Delay(1300);
        // next round
        continue;
      }

      //# GO
      var info = new WeatherForecast
      {
        Date = DateOnly.FromDateTime(DateTime.Now.AddDays(nonce)),
        TemperatureC = Random.Shared.Next(-20, 55),
        Summary = Summaries[Random.Shared.Next(Summaries.Length)]
      };

      //# 使用 yield return 先 FlushAsync()（可加速資料送出）
      await HttpContext.Response.Body.FlushAsync();

      yield return info;

      _logger.LogInformation("QryDataStream yield return at {Time:HH:mm:ss.fff}", DateTime.Now);

      //# 間隔些許時差以免系統過載
      await Task.Delay(1300);
    }

    //# 結束時，記得回應結束訊號。
    await HttpContext.Response.Body.FlushAsync();
    _logger.LogInformation("QryDataStream END at {Time:HH:mm:ss.fff}", DateTime.Now);
    yield break; // 結束串流
  }


  /// <summary>
  /// 測試 postData
  /// </summary>
  [HttpPost("[action]/{userId}")]
  public ActionResult<StaffAccount> GetFormData(string userId)
  {
    using var conn = DBHelper.AUCDB.Open();
    var info = conn.GetEx<Staff>(new { UserId = userId });
    
    var result = new StaffAccount { 
      UserId = info.UserId,
      Nickname = info.Nickname,
      Phone = info.Phone,
      RoleList = JsonSerializer.Deserialize<string[]>(info.RoleList) ?? [],
      Status = "Authed" //  'Guest' | 'Authing' | 'Authed'
    };

    return Ok(result);
  }

  /// <summary>
  /// 測試寄送 email
  /// </summary>
  [HttpPost("[action]")]
  public ActionResult<MsgObj> TestSendEmail()
  {
    // 組信內容
    //FileInfo file = new FileInfo(@"Template/ReportSampleTpl.html");
    FileInfo file = new FileInfo(@"Template/RaffleBuyerNoteEmailSample.html");

    StringBuilder html = new();
    using (var reader = System.IO.File.OpenText(file.FullName))
    {
      html.Append(reader.ReadToEnd());
    }

//    string html = """
//    <h1 style='color:blue;'>測試 HTML 信件 at {DateTime.Now:MM-dd HH:mm:ss}。</h1>
//""";

    // Go
    string[] toList = new string[] { "rely_kao@asiavista.com.tw" };
    string[]? ccList = null; // new string[] { "elva_lin@asiavista.com.tw" };

    // 測試寄出 純文字 信件。
    //_emlSvc.SendTextEmail(toList, $"[測試信件]測試信件{DateTime.Now:yyMMddTHHmmss}", "測試寄出純文字信件。", ccList);

    // 測試寄出 HTML 信件。
    MailMessage mail = new MailMessage();
    mail.To.Add(new MailAddress("rely_kao@asiavista.com.tw", "高天賜"));

    // 郵件內容
    mail.Subject = $"測試 HTML 信件 at ${DateTime.Now:MM-dd HH:mm:ss}。";
    mail.Body = html.ToString();
    mail.IsBodyHtml = true;

    _emlSvc.SendEmail(mail);

    return Ok(new MsgObj("已送出信件。"));
  }
}
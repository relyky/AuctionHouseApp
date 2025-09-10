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

    ////�������ե��ѡI
    //if (DateTime.Now.Second % 2 == 0)
    //  return BadRequest("�������ե��ѡI");

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
  /// �`�N���G��y�^�����n�]�˦� Task�C�]���n�� ActionResult<T> �^���C
  /// �`�N���G�]�ݷf�t yield return �y�k�C
  /// �]�w ResponseCache �T�Χ֨��]�קK�e�ݧ֨��z�Z��y�^�C
  /// </summary>
  [HttpPost("[action]")]
  [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
  public async IAsyncEnumerable<WeatherForecast> QryDataStream()
  {
    _logger.LogInformation("QryDataStream BEGIN at {Time:HH:mm:ss.fff}", DateTime.Now);
    DateTime startTime = DateTime.Now;

    while (!ControllerContext.HttpContext.RequestAborted.IsCancellationRequested)
    {
      //# �W�L�@�����N������y�C
      if (DateTime.Now - startTime > TimeSpan.FromMinutes(1))
        break; // ���`����

      //# �����H�����p�C�p�G��ݸ���٥��i�s���T�����Φ^���C
      int nonce = Random.Shared.Next(6);
      if (nonce < 2)
      {
        //# ���j�ǳ\�ɮt�H�K�t�ιL��
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

      //# �ϥ� yield return �� FlushAsync()�]�i�[�t��ưe�X�^
      await HttpContext.Response.Body.FlushAsync();

      yield return info;

      _logger.LogInformation("QryDataStream yield return at {Time:HH:mm:ss.fff}", DateTime.Now);

      //# ���j�ǳ\�ɮt�H�K�t�ιL��
      await Task.Delay(1300);
    }

    //# �����ɡA�O�o�^�������T���C
    await HttpContext.Response.Body.FlushAsync();
    _logger.LogInformation("QryDataStream END at {Time:HH:mm:ss.fff}", DateTime.Now);
    yield break; // ������y
  }


  /// <summary>
  /// ���� postData
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
  /// ���ձH�e email
  /// </summary>
  [HttpPost("[action]")]
  public ActionResult<MsgObj> TestSendEmail()
  {
    // �իH���e
    //FileInfo file = new FileInfo(@"Template/ReportSampleTpl.html");
    FileInfo file = new FileInfo(@"Template/RaffleBuyerNoteEmailSample.html");

    StringBuilder html = new();
    using (var reader = System.IO.File.OpenText(file.FullName))
    {
      html.Append(reader.ReadToEnd());
    }

//    string html = """
//    <h1 style='color:blue;'>���� HTML �H�� at {DateTime.Now:MM-dd HH:mm:ss}�C</h1>
//""";

    // Go
    string[] toList = new string[] { "rely_kao@asiavista.com.tw" };
    string[]? ccList = null; // new string[] { "elva_lin@asiavista.com.tw" };

    // ���ձH�X �¤�r �H��C
    //_emlSvc.SendTextEmail(toList, $"[���իH��]���իH��{DateTime.Now:yyMMddTHHmmss}", "���ձH�X�¤�r�H��C", ccList);

    // ���ձH�X HTML �H��C
    MailMessage mail = new MailMessage();
    mail.To.Add(new MailAddress("rely_kao@asiavista.com.tw", "���ѽ�"));

    // �l�󤺮e
    mail.Subject = $"���� HTML �H�� at ${DateTime.Now:MM-dd HH:mm:ss}�C";
    mail.Body = html.ToString();
    mail.IsBodyHtml = true;

    _emlSvc.SendEmail(mail);

    return Ok(new MsgObj("�w�e�X�H��C"));
  }
}
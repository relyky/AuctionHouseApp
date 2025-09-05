using AuctionHouseTpl.Server.DTO;
using Microsoft.AspNetCore.Mvc;

namespace AuctionHouseTpl.Server.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class WeatherForecastController(ILogger<WeatherForecastController> _logger)
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

  }
}

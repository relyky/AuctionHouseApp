using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.Text.Json;
using System.Text;
using Vista.DB;

namespace N8ReactAppTpl.Server.Models;

internal class SimpleHealthCheck : IHealthCheck
{
  async Task<HealthCheckResult> IHealthCheck.CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken)
  {
    try
    {
      try
      {
        // 測試 DB 連線。
        using var conn = await DBHelper.AUCDB.OpenAsync();
        await conn.CloseAsync();
      }
      catch(Exception ex)
      {
        string errMsg = "Database connection test failed!" + $"({DBHelper.AUCDB.ConnString})"  + ex.Message;
        return HealthCheckResult.Unhealthy(errMsg, ex);
      }

      return HealthCheckResult.Healthy("I am fine.");
    }
    catch (Exception ex)
    {
      return HealthCheckResult.Unhealthy(description: ex.Message, exception: ex);
    }
  }

  /// <summary>
  /// 專用資源，用於 HealthCheck 輸出。 
  /// 參考：[ASP.NET Core 中的健康狀態檢查-自訂輸出](https://learn.microsoft.com/zh-tw/aspnet/core/host-and-deploy/health-checks?view=aspnetcore-6.0#customize-output)
  /// </summary>
  internal static Task WriteHealthCheckUIResponse(HttpContext context, HealthReport healthReport)
  {
    context.Response.ContentType = "application/json; charset=utf-8";

    var options = new JsonWriterOptions
    {
      Indented = true,
      Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
    };

    using var memoryStream = new MemoryStream();
    using (var jsonWriter = new Utf8JsonWriter(memoryStream, options))
    {
      jsonWriter.WriteStartObject();
      jsonWriter.WriteString("status", healthReport.Status.ToString());
      jsonWriter.WriteStartObject("results");

      foreach (var healthReportEntry in healthReport.Entries)
      {
        jsonWriter.WriteStartObject(healthReportEntry.Key);
        jsonWriter.WriteString("status",
            healthReportEntry.Value.Status.ToString());
        jsonWriter.WriteString("description",
            healthReportEntry.Value.Description);
        jsonWriter.WriteStartObject("data");

        foreach (var item in healthReportEntry.Value.Data)
        {
          jsonWriter.WritePropertyName(item.Key);

          JsonSerializer.Serialize(jsonWriter, item.Value,
              item.Value?.GetType() ?? typeof(object));
        }

        jsonWriter.WriteEndObject();
        jsonWriter.WriteEndObject();
      }

      jsonWriter.WriteEndObject();
      jsonWriter.WriteEndObject();
    }

    return context.Response.WriteAsync(
       Encoding.UTF8.GetString(memoryStream.ToArray()));
  }
}
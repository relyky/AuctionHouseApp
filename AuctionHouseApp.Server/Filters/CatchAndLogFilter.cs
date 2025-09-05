using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Net;

namespace AuctionHouseTpl.Server.Filters;

/// <summary>
/// 所有未處理的例外都會被這個 Filter 捕捉並記錄下來。
/// 並一律回傳 400 Bad Request。
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
public class CatchAndLogFilter(ILogger<CatchAndLogFilter> _logger)
: ExceptionFilterAttribute
{
  public override void OnException(ExceptionContext context)
  {
    string message = "執行失敗！" + context.Exception.Message;
    _logger.LogError(context.Exception, message);
   
    //return BadRequest(message);
    var result = new ContentResult();
    result.Content = message;
    context.HttpContext.Response.StatusCode = (int)HttpStatusCode.BadRequest; // 400
    context.Result = result;
    context.ExceptionHandled = true; // 標示例外已處理，避免被其他 Filter 或 Middleware 重複處理
  }
}
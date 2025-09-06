using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.Reflection;

namespace AuctionHouseApp.Server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AboutController : ControllerBase
{    
  [HttpGet]
  public IActionResult Get()
  {
    var assembly = Assembly.GetExecutingAssembly();
    var version = FileVersionInfo.GetVersionInfo(assembly.Location);

    var aboutInfo = new
    {
      ApplicationName = "AuctionHouseApp",
      Version = version.ProductVersion ?? "N/A",
      Description = "This is a sample auction house application.",
      Author = "Your Name"
    };
    return Ok(aboutInfo);
  }
}

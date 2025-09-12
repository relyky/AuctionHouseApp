using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Vista.DB;

namespace AuctionHouseApp.Server.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BackendRaffleCheckController : ControllerBase
{
  //取得業務人員清單
  [HttpPost("[action]")]
  public async Task<ActionResult<IEnumerable<SalesCodeName>>> GetSalesList()
  {
    const string sql = """
SELECT [SalesId] = [UserId], [SalesName] = [Nickname]
FROM dbo.Staff S
CROSS APPLY OPENJSON(S.RoleList) WITH ([Role] NVARCHAR(50) '$') AS Roles
WHERE Roles.[Role] = 'Sales'
AND [Enable] = 'Y';
""";

    using var conn = await DBHelper.AUCDB.OpenAsync();
    var salesList = await conn.QueryAsync<SalesCodeName>(sql);
    return Ok(salesList);
  }
}

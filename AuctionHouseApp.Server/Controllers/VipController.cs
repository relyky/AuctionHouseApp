using AuctionHouseApp.Server.Models;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using Vista.DB;
using Vista.DB.Schema;
using Vista.DbPanda;

namespace AuctionHouseApp.Server.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class VipController(
  ILogger<VipController> _logger
  ) : ControllerBase
{
  [HttpPost("[action]")]
  public async Task<ActionResult<IEnumerable<Vip>>> Search([FromQuery(Name = "q")] string? keyword)
  {
    DynamicParameters param = new DynamicParameters(); // Dapper 動態參數
    StringBuilder sql = new("""
SELECT * FROM Vip (NOLOCK) WHERE 1=1 
""");

    if (!String.IsNullOrWhiteSpace(keyword))
    {
      sql.Append("AND (VipName LIKE @VipName OR PaddleNum LIKE @PaddleNum )");
      param.Add("@VipName", $"%{keyword.Trim()}%");
      param.Add("@PaddleNum", $"%{keyword.Trim()}%");
    }

    using var conn = await DBHelper.AUCDB.OpenAsync();
    var dataList = await conn.QueryAsync<Vip>(sql.ToString(), param);

    return Ok(dataList);
  }

  [HttpPost("[action]")]
  public ActionResult<Vip> Create([FromBody] Vip info)
  {
    try
    {
      using var conn = DBHelper.AUCDB.Open();
      using var txn = conn.BeginTransaction();

      // check is exists
      var exists = conn.GetEx<Vip>(new { info.PaddleNum }, txn);
      if(exists != null)
        return BadRequest($"The paddle no. {info.PaddleNum} is exists!");

      conn.InsertEx(info, txn);
      txn.Commit();
      return Ok(info);
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, ex.Message);
      return BadRequest("Exception!" + ex.Message);
    }
  }

  [HttpPost("[action]/{id}")]
  public ActionResult<Vip> Read(string id)
  {
    try
    {
      using var conn = DBHelper.AUCDB.Open();
      var info = conn.GetEx<Vip>(new { PaddleNum = id });
      return Ok(info);
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, ex.Message);
      return BadRequest("Exception!" + ex.Message);
    }
  }

  [HttpPost("[action]")]
  public ActionResult<Vip> Update([FromBody] Vip info)
  {
    try
    {
      using var conn = DBHelper.AUCDB.Open();
      using var txn = conn.BeginTransaction();
      conn.UpdateEx<Vip>(info, new { info.PaddleNum }, txn);
      txn.Commit();
      return Ok(info);
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, ex.Message);
      return BadRequest("Exception!" + ex.Message);
    }
  }

  [HttpPost("[action]/{id}")]
  public ActionResult<MsgObj> Delete(string id)
  {
    try
    {
      using var conn = DBHelper.AUCDB.Open();
      using var txn = conn.BeginTransaction();
      conn.DeleteEx<Vip>(new { PaddleNum = id }, txn);
      txn.Commit();
      return Ok(new MsgObj("SUCCESS"));
    }
    catch (Exception ex)
    {
      _logger.LogError(ex, ex.Message);
      return BadRequest("Exception!" + ex.Message);
    }
  }
}

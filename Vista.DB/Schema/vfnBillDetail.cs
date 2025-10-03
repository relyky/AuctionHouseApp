namespace Vista.DB.Schema
{
using System;
using System.Collections.Generic;
using Dapper;
using Microsoft.Data.SqlClient;

public class vfnBillDetailResult 
{
  public string PadleNum { get; set; } = default!;
  public string VipName { get; set; } = default!;
  public Decimal? Amount { get; set; }
  public string Activity { get; set; } = default!;
  public string ChargingBasis { get; set; } = default!;
  public string ChargingItemId { get; set; } = default!;
  public string HasPaid { get; set; } = default!;
  public DateTime? PaidDtm { get; set; }
}

public class vfnBillDetailArgs 
{
  public string PaddleNum { get; set; } = default!;
}

static partial class DBHelperClassExtensions
{
public static List<vfnBillDetailResult> CallvfnBillDetail(this SqlConnection conn, vfnBillDetailArgs args, SqlTransaction? txn = null)
{
  var sql = @"SELECT * FROM [dbo].[vfnBillDetail](@PaddleNum); "; 
  var dataList = conn.Query<vfnBillDetailResult>(sql, args, txn).AsList();
  return dataList;
}

public static List<vfnBillDetailResult> CallvfnBillDetail(this SqlConnection conn, string PaddleNum, SqlTransaction? txn = null)
{
  var args = new {
    PaddleNum,
  };

  var sql = @"SELECT * FROM [dbo].[vfnBillDetail](@PaddleNum); "; 
  var dataList = conn.Query<vfnBillDetailResult>(sql, args, txn).AsList();
  return dataList;
}
}
}


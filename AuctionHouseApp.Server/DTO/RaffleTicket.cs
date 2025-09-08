using Reinforced.Typings.Attributes;

namespace AuctionHouseApp.Server.DTO;


using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// 抽獎券檔
/// </summary>
[Table("RaffleTicket")]
[TsInterface(Namespace = "dto")]
public class RaffleTicket 
{
/// <summary>
/// 抽獎券編號: 格式 RTnnnnn
/// </summary>
[Display(Name = "抽獎券編號")]
[Key]
public string RaffleTicketNo { get; set; } = default!;
/// <summary>
/// 銷售編號:格式 RSnnnnn
/// </summary>
[Display(Name = "銷售編號")]
public string RaffleSoldNo { get; set; } = default!;
/// <summary>
/// 買家名稱
/// </summary>
[Display(Name = "買家名稱")]
public string BuyerName { get; set; } = default!;
/// <summary>
/// 買家電郵地址
/// </summary>
[Display(Name = "買家電郵地址")]
public string BuyerEmail { get; set; } = default!;
/// <summary>
/// 買家聯絡電話
/// </summary>
[Display(Name = "買家聯絡電話")]
public string BuyerPhone { get; set; } = default!;
/// <summary>
/// 寄出電郵次數
/// </summary>
[Display(Name = "寄出電郵次數")]
public int? EmailTimes { get; set; }
/// <summary>
/// 最後寄出時間: 系統時間
/// </summary>
[Display(Name = "最後寄出時間")]
public DateTime? LastEmailDtm { get; set; }

public void Copy(RaffleTicket src)
{
  this.RaffleTicketNo = src.RaffleTicketNo;
  this.RaffleSoldNo = src.RaffleSoldNo;
  this.BuyerName = src.BuyerName;
  this.BuyerEmail = src.BuyerEmail;
  this.BuyerPhone = src.BuyerPhone;
  this.EmailTimes = src.EmailTimes;
  this.LastEmailDtm = src.LastEmailDtm;
}

public RaffleTicket Clone()
{
  return new RaffleTicket {
    RaffleTicketNo = this.RaffleTicketNo,
    RaffleSoldNo = this.RaffleSoldNo,
    BuyerName = this.BuyerName,
    BuyerEmail = this.BuyerEmail,
    BuyerPhone = this.BuyerPhone,
    EmailTimes = this.EmailTimes,
    LastEmailDtm = this.LastEmailDtm,
  };
}
}


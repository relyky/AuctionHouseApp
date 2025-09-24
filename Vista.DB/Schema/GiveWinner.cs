namespace Vista.DB.Schema
{
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// 福袋中獎清冊
/// </summary>
[Table("GiveWinner")]
public class GiveWinner 
{
  public string GiftId { get; set; } = default!;
  public string GiveTicketNo { get; set; } = default!;

  public void Copy(GiveWinner src)
  {
    this.GiftId = src.GiftId;
    this.GiveTicketNo = src.GiveTicketNo;
  }

  public GiveWinner Clone()
  {
    return new GiveWinner {
      GiftId = this.GiftId,
      GiveTicketNo = this.GiveTicketNo,
    };
  }
}
}


namespace AuctionHouseApp.Server.Models;


//interface MsgObj
//{
//  message: string,
//  formNo?: string,
//  nextStep?: stirng,
//}

public record MsgObj(string Message, string? FormNo = null, string? NextStep = null);

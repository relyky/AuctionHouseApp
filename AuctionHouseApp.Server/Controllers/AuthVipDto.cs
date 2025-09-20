using Reinforced.Typings.Attributes;

namespace AuctionHouseApp.Server.Controllers;

//json
//{
//  "name": "string",  // 姓名
//  "email": "string",  // Email
//}

[TsInterface(Namespace = "dto.authVip")]
public record AuthVipLoginArgs(string Name, string Email);


//** Response:**
//json
//{
//  "success": true,
//  "data": {
//    "token": "string",
//    "guest": {
//      "id": "string",
//      "name": "string",
//      "email": "string",
//      "tableNumber": "string"
//    }
//  }
//}

[TsInterface(Namespace = "dto.authVip")]
public record AuthVipLoginResult(
  Boolean Success,
  AuthVipLoginResult_Data? Data
);

[TsInterface(Namespace = "dto.authVip")]
public record AuthVipLoginResult_Data(
  string Token,
  AuthVipLoginResult_Guest Guest
);

[TsInterface(Namespace = "dto.authVip")]
public record AuthVipLoginResult_Guest(
  string Id,
  string Name,
  string Email,
  string TableNumber
 );

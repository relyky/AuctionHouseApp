using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AuctionHouseApp.Server.Models;

class JwtAuthenticationTool(IConfiguration _config)
{
  /// <summary>
  /// 驗證程序必要步驟。需與登入程序呼應。
  /// </summary>
  public static TokenValidationParameters GenerateTokenValidationParameters(IConfiguration _config)
  {
    return new TokenValidationParameters
    {
      ValidateIssuerSigningKey = true,
      IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_config["JwtSettings:SigningKey"]!)),
      TokenDecryptionKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_config["JwtSettings:SecretKey"]!)), // JWE
      ValidateIssuer = true,
      ValidateAudience = true,
      ValidateLifetime = true,
      ValidIssuer = _config["JwtSettings:Issuer"],
      ValidAudience = _config["JwtSettings:Audience"],
    };
  }

  /// <summary>
  /// 登入程序必要步驟。需與驗證程序呼應。
  /// </summary>
  public string MakeToken(ClaimsIdentity userIdentity, DateTimeOffset expiresUtcTime)
  {
    var signingKey = Encoding.ASCII.GetBytes(_config["JwtSettings:SigningKey"]!);
    var secretKey = Encoding.ASCII.GetBytes(_config["JwtSettings:SecretKey"]!);

    var tokenHandler = new JwtSecurityTokenHandler();
    var token = tokenHandler.CreateToken(new SecurityTokenDescriptor
    {
      Subject = userIdentity,
      Expires = expiresUtcTime.UtcDateTime,
      Issuer = _config["JwtSettings:Issuer"],
      Audience = _config["JwtSettings:Audience"],
      SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(signingKey), SecurityAlgorithms.HmacSha256Signature),
      EncryptingCredentials = new EncryptingCredentials(new SymmetricSecurityKey(secretKey), SecurityAlgorithms.Aes256KW, SecurityAlgorithms.Aes256CbcHmacSha512) // JWE
    });

    string jwtToken = tokenHandler.WriteToken(token);

    return jwtToken;
  }

  /// <summary>
  /// for Refresh Token
  /// </summary>
  public ClaimsPrincipal? GetPrincipalFromToken(string token, TokenValidationParameters tokenValidationParameters)
  {
    try
    {
      var tokenHandler = new JwtSecurityTokenHandler();
      var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var validatedToken);
      if (!IsJwtWithValidSecurityAlgorithm(validatedToken))
        return null;

      return principal;
    }
    catch
    {
      return null;
    }
  }

  /// <summary>
  /// helper
  /// </summary>
  bool IsJwtWithValidSecurityAlgorithm(SecurityToken validatedToken)
  {
    return (validatedToken is JwtSecurityToken jwtSecurityToken) &&
      jwtSecurityToken.Header.Alg.Equals(value: SecurityAlgorithms.HmacSha256,
        StringComparison.InvariantCultureIgnoreCase);
  }
}

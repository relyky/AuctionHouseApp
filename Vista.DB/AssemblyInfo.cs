using Dapper;
using System.Runtime.CompilerServices;

[module: DapperAot(true)]

/// Friend Assembly
[assembly: InternalsVisibleTo("AuctionHouseApp.Server")]

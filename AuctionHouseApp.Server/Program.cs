using AuctionHouseApp.Server.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Serilog;
using System.Text.Json.Serialization;

try
{
  // 使用 Console 紀錄初始化過程，這樣才能讓作業系統抓到錯誤訊息。以讓【事件檢視器】查看錯誤訊息。 
  Console.WriteLine($"{DateTime.Now:yyyy/MM/dd HH:mm:ss} Web host init.");

  var builder = WebApplication.CreateBuilder(args);
  IConfiguration config = builder.Configuration;

  #region §§ Prefix system initialization -------------------------------------
  ////## 取得系統名稱，系統基本參數
  string SystemId = config["SystemID"] ?? builder.Environment.ApplicationName;
  string LogFolder = config["LogFolder"] ?? "Log";

  //※ 或取得全部資料庫連線組態
  Vista.DB.DBHelper.Register(config);

  #endregion

  #region §§ Serilog configuration. -------------------------------------------
  Log.Logger = new LoggerConfiguration()
      .ReadFrom.Configuration(builder.Configuration)
      .Enrich.WithProperty("MachineName", Environment.MachineName)
      .Enrich.WithProperty("DomainUserName", $"{Environment.UserDomainName}\\{Environment.UserName}")
      .Enrich.WithProperty("SysName", SystemId)
      .Enrich.FromLogContext()
      .WriteTo.Async(cfg =>
      {
        //# 文字檔
        cfg.File($"{LogFolder}/{SystemId}Log.txt",
              rollingInterval: RollingInterval.Day);
        //# JSON 檔
        cfg.File(new Serilog.Formatting.Json.JsonFormatter(), $"{LogFolder}/{SystemId}Log.json",
              rollingInterval: RollingInterval.Day);
      })
      .CreateLogger();
  #endregion

  builder.Host.UseSerilog();

  Console.WriteLine($"{DateTime.Now:yyyy/MM/dd HH:mm:ss} Web host start.");
  Log.Information("Web host start.");

  #region §§ Add services to the container. -----------------------------------

  //## for Authentication & Authorization
  builder.Services.Configure<CookiePolicyOptions>(options =>
  {
    options.MinimumSameSitePolicy = SameSiteMode.Lax; // SameSiteMode.Strict;
    //options.Secure = CookieSecurePolicy.Always;
  });

  // for COOKIE Auth
  // ref → https://blazorhelpwebsite.com/ViewBlogPost/36
  builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(cfg =>
    {
      cfg.LoginPath = "/"; // default: /Accout/Login
      cfg.Cookie.Name = ".AuctionHouseApp.Server.Cookies"; //default:.AspNetCore.Cookies
    });

  // Add services to the container.
  builder.Services.AddSingleton<LiveAuctionStatusService>();

  builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
          options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        });
  // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
  builder.Services.AddEndpointsApiExplorer();
  builder.Services.AddSwaggerGen();

  builder.Services.AddMemoryCache();
  builder.Services.AddHttpContextAccessor();
  builder.Services.AddSingleton<AccountService>();

  #endregion

  var app = builder.Build();

  #region §§ Configure the HTTP request pipeline. -----------------------------

  app.UseDefaultFiles();
  app.UseStaticFiles();

  // Configure the HTTP request pipeline.
  if (app.Environment.IsDevelopment())
  {
    app.UseSwagger();
    app.UseSwaggerUI();
  }

  app.UseHttpsRedirection();

  app.UseAuthorization();

  app.MapControllers();

  app.MapFallbackToFile("/index.html");

  #endregion

  app.Run();

  Console.WriteLine($"{DateTime.Now:yyyy/MM/dd HH:mm:ss} Web host exit.");
  Log.Information("Web host exit.");
}
catch (Exception ex)
{
  // 使用 Console 紀錄初始化過程，這樣才能讓作業系統抓到錯誤訊息。以讓【事件檢視器】查看錯誤訊息。
  Console.WriteLine($"{DateTime.Now:yyyy/MM/dd HH:mm:ss} Web host terminated unexpectedly!.\r\n{ex}");
  Log.Fatal(ex, "Web host terminated unexpectedly");
}
finally
{
  Log.CloseAndFlush();
}

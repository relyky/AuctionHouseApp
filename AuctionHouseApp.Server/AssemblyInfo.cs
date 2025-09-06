
//## Reinforced.Typings 全域設定說明
using Reinforced.Typings.Attributes;

[assembly: TsGlobal(
  CamelCaseForProperties = true,            // 小駱駝命名法
  UseModules = true,                        // 啟用 modules
  DiscardNamespacesWhenUsingModules = true, // 需與參數 UseModules 搭配；不產生 "modules"。
  ExportPureTypings = true                  // 生成純宣告檔 .d.ts。 
)]
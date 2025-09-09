import { Typography, Box, Container, LinearProgress, Alert } from "@mui/material";
import SearchWidget from "../../widgets/SearchWidget";
import { useState } from "react";

/**
 * 抽將券買家查詢
 * @returns
 */
export default function RaffleBuyer_AppForm() {
  const [f_loading, setLoading] = useState<boolean>(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)

  const handleSearch = (value: string) => {
    setLoading(true)
    setErrMsg(null)
    setTimeout(() => {
      setErrMsg('未找到相關記錄，請檢查您的輸入是否正確。');
      setLoading(false)
    }, 2000)

    console.log('Searching for:', value);
    // TODO: Implement search logic here
  };

  return (
    <Container maxWidth='sm' sx={{ outline: 'dashed red 1px' }}>
      <Typography variant='h5' component="div" sx={{ mb: 2 }}>買家/抽獎券查詢</Typography>

      <SearchWidget
        placeholder="請輸入訂單編號、名稱、電郵地址、聯絡電話..."
        helpText={helpContent}
        onSearch={handleSearch}
      />

      {f_loading && <LinearProgress color='info' sx={{ m: 1 }} />}

      {errMsg && <Alert severity="error" sx={{ m: 2 }}>{errMsg}</Alert>}

      {/* TODO: Display search results here */}
    </Container>
  )
}

//-----------------
const helpContent = (
  <>
    <Typography sx={{ mb: 1 }}>請在此輸入您的訂單編號以查詢您擁有的抽獎券。請在此輸入您的訂單編號以查詢您擁有的抽獎券。請在此輸入您的訂單編號以查詢您擁有的抽獎券。</Typography>
    <Typography sx={{ mb: 1 }}>訂單編號是您購買時收到的唯一識別碼，通常以 'RS' 開頭。</Typography>
    <Typography>如果您遺失了訂單編號，請聯繫客服尋求協助。</Typography>
  </>
);

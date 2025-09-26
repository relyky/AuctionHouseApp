import { Container, Typography } from "@mui/material";
import { useEffect, useState } from "react";

/**
 * 生成給貴賓掃碼用的 QR Code。
 * 例：Silent Auction 掃碼進入該商品頁面。
 */
export default function SilentQRCode() {
  const [loading, setLoading] = useState<boolean>(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [silentPrizeList, setSilentPrize] = useState<ISilentPrize[]>([])
  const [frontUrlBase, setFrontUrlBase] = useState<string>('')

  useEffect(() => {
    fetch('/api/silentauction/fronturlbase')
      .then(resp => resp.json())
      .then(result => setFrontUrlBase(result.data))
      .catch(console.log)

    setLoading(true)
    fetch('/api/silentauction/items')
      .then(resp => resp.json())
      .then(result => setSilentPrize(result.data.items))
      .catch(console.log)
      .finally(()=> setLoading(true))
  },[])

  return (
    <Container>
      <Typography variant='h5'>Silent Auction Prizes QR Code</Typography>

      <pre>frontUrlBase {JSON.stringify(frontUrlBase, null, 2)}</pre>
      <pre>silentPrizeList {JSON.stringify(silentPrizeList,null,2)}</pre>
    </Container>
  )
}
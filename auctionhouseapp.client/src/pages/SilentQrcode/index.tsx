import { Alert, Box, Container, LinearProgress, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import QrCodeWidget from "../../widgets/QrCodeWidget";

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
    setLoading(true)

    const p1 = new Promise((resolve) => {
    fetch('/api/silentauction/fronturlbase')
      .then(resp => resp.json())
      .then(result => setFrontUrlBase(result.data))
        .catch((err) => {
          console.log(err);
          setErrMsg('Get the url of the front website fail!');
        })
        .finally(() => resolve(true))
    });

    const p2 = new Promise((resolve) => {
    fetch('/api/silentauction/items')
      .then(resp => resp.json())
      .then(result => setSilentPrize(result.data.items))
        .catch((err) => {
          console.log(err);
          setErrMsg('Load the silent prize information fail!');
        })
        .finally(() => resolve(true))
    });

    Promise.all([p1, p2])
      .then(() => setLoading(false));
  }, [])

  return (
    <Container>
      <Typography variant='h5'>Silent Auction Prizes QR Code</Typography>
      {loading && <LinearProgress color='info' />}
      {errMsg && <Alert severity='error'>{errMsg}</Alert>}


      <Box display='flex' flexWrap='wrap'>
        {silentPrizeList.map(prize => (
          <Paper key={prize.itemId} sx={{ p: 3, width: 320 }}>
            <QrCodeWidget value={`${frontUrlBase}/silent-auction/${prize.itemId}`}
              imageSrc='/images/theCenter.jpg'
              style={{ width: 280 }} />
            <Box>#{prize.itemId} {prize.name}</Box>
          </Paper>
        ))}

        {/* 測試資料 */}
        {import.meta.env.DEV && <>
          <Paper sx={{ p: 3, width: 320 }}>
            <QrCodeWidget value='https://www.asiavista.com.tw'
              imageSrc='/vite.svg'
              style={{ width: 280 }} />
            <Box>#888 Fully typed QRCode encoding implementation in JavaScript with no dependencies!.</Box>
          </Paper>

          <Paper sx={{ p: 3, width: 320 }}>
            <QrCodeWidget value='https://www.asiavista.com.tw'
              imageSrc='/vite.svg'
              style={{ width: 280 }} />
            <Box>#888 The Community Services Center Taipei (@the_center_taipei).</Box>
          </Paper>

          <Paper sx={{ p: 3, width: 320 }}>
            <QrCodeWidget value='https://www.asiavista.com.tw'
              imageSrc='/vite.svg'
              style={{ width: 280 }} />
            <Box>#888 Material UI: Material Design Color, Flat Colors, Icons, Color.</Box>
          </Paper>

          <Paper sx={{ p: 3, width: 320 }}>
            <QrCodeWidget value='https://www.asiavista.com.tw'
              imageSrc='/vite.svg'
              style={{ width: 280 }} />
            <Box>#888 Learn MUI (Material UI) in under 10 min!</Box>
          </Paper>

          <Paper sx={{ p: 3, width: 320 }}>
            <QrCodeWidget value='https://www.asiavista.com.tw'
              imageSrc='/vite.svg'
              style={{ width: 280 }} />
            <Box>#888 MUI makes it possible to use different components to create a UI.</Box>
          </Paper>
        </>}

      </Box>
    </Container>
  )
}
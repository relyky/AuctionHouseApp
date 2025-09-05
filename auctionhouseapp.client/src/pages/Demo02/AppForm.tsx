import { useState } from "react";
import { Box, Container, Typography, Button, useEventCallback } from "@mui/material";
import QRCodeScanOnceWidget from "../../widgets/QRCodeScanOnceWidget";
import { beep } from '../../tools/utils'

export default function Demo02_AppForm() {
  const [qrcodeMessage, setQrcodeMessage] = useState<string | null>(null)

  const handleScanSuccess = useEventCallback(async (decodedText: string) => {
    setQrcodeMessage(decodedText)
  });

  return (
    <Container component="main" maxWidth='xs' sx={{ outline: 'dashed 1px red' }}>
      <Typography variant='h3'>測試手機體驗</Typography>

      {qrcodeMessage === null && <Box sx={{ outline: 'dashed 1px red' }}>
        <QRCodeScanOnceWidget onScanSuccess={handleScanSuccess} />
      </Box>}

      <Box>qrcodeMessage:{qrcodeMessage}</Box>

      <Button onClick={() => {
        beep()
      }}>嗶一聲</Button>

      <Button onClick={() => {
        if ("vibrate" in navigator) {
          // 單次震動 300 毫秒
          navigator.vibrate(300);
        } else {
          alert("不支援震動功能");
        }
      }}>振動 300 毫秒</Button>

      <pre>v19</pre>
    </Container>
  )
}
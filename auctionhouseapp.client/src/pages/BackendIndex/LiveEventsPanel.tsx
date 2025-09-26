import { Button, Divider, Paper, Stack, Typography } from "@mui/material";
import { NavLink } from "react-router";

export default function LiveEventsView() {
  return (
    <>
      <Divider sx={{ my: 3 }} />
      <Paper square sx={{ p: 2 }}>
        <Typography variant='h6' gutterBottom>現場活動</Typography>
        <Stack gap={2} sx={{ mb: 2 }}>
          {/* 抽獎券銷售查驗 */}
          <Button component={NavLink} variant='text' to='/site'>活動主控台(大螢幕切換)</Button>
          {/* 抽獎券銷售查驗 */}
          <Button component={NavLink} variant='text' to='/site/ask'>Open Ask 捐贈輸入</Button>
          {/* 抽獎券銷售統計 */}
          <Button component={NavLink} variant='text' to='/site/auction'>Live Auction 競價輸入</Button>

          {/* 生成 Silent Auction QR Code */}
          <Button component={NavLink} variant='text' to='/site/auction'>Silent Auction Prizes QR Code</Button>
        </Stack>
      </Paper>
    </>
  )
}
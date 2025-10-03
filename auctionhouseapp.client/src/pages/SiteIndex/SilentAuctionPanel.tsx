import { Alert, Box, Button, FormControlLabel, Paper, Switch, Typography, useEventCallback } from "@mui/material";
import { useState } from "react";

export default function SilentAuctionPanel(props: {
  activity: ActivityEnum
}) {
  const [foolproof, setFoolproff] = useState(false)

  const handleDrawMinor = useEventCallback(() => {
    alert('未實作手動結標');
  });

  // hidden
  if (props.activity !== 'silentAuction') return (<></>)
  // show
  return (
    <Paper sx={{ pt: 1, px: 2, pb: 2 }}>
      <Typography variant='h6' borderBottom='solid 1px' >4. Silent Auction Control Panel</Typography>

      {/* 自動輪播靜默拍品 */}
      <Alert severity='info' sx={{ m: 3 }}>
        Automatic Slideshow of Silent Auction Items
      </Alert>

      <Box display='flex' justifyContent='space-between' sx={{ my: 3 }}>
        <Button variant='contained' color='secondary'
          disabled={!foolproof}
          onClick={handleDrawMinor}>靜默拍賣結標</Button>

        {/* 防呆: 防止手殘按下抽獎 */}
        <FormControlLabel label="Fool-proof"
          control={<Switch checked={foolproof} onChange={(_, chk) => setFoolproff(chk)} />} />
      </Box>
    </Paper>
  )
}
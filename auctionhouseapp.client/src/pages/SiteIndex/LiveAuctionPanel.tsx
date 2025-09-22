import { Paper, Typography } from "@mui/material";

export default function LiveAuctionPanel(props: {
  activity: ActivityEnum
}) {

  // hidden
  if (props.activity !== 'liveAuction') return (<></>)
  // show
  return (
    <Paper sx={{ pt: 1, px: 2, pb: 2 }}>
      <Typography variant='h6' borderBottom='solid 1px' >3. Live Auction 控制平板</Typography>
      <p>選擇拍品</p>
    </Paper>
  )
}
import { Paper, Typography } from "@mui/material";

export default function SilentAuctionPanel(props: {
  stage: StageEnum
}) {

  // hidden
  if (props.stage !== 'SilentAuction') return (<></>)
  // show
  return (
    <Paper sx={{ pt: 1, px: 2, pb: 2 }}>
      <Typography variant='h6' borderBottom='solid 1px' >4. Silent Auction 控制平板</Typography>
      <p>自動輪播靜默拍品</p>
    </Paper>
  )
}
import { Box, Paper, Typography } from "@mui/material";

export default function DonationPanel(props: {
  activity: ActivityEnum
}) {

  // hidden
  if (props.activity !== 'donation') return (<></>)
  // show
  return (
    <Paper sx={{ pt: 1, px: 2, pb: 2 }}>
      <Typography variant='h6' borderBottom='solid 1px' >6. Donation 控制平板</Typography>
      <Box color='text.secondary'>📃 自動播放捐贈累計金額</Box>
    </Paper>
  )
}
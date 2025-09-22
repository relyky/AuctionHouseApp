import { Paper, Typography } from "@mui/material";

export default function GiveToWinPanel(props: {
  activity: ActivityEnum
}) {

  // hidden
  if (props.activity !== 'give') return (<></>)
  // show
  return (
    <Paper sx={{ pt: 1, px: 2, pb: 2 }}>
      <Typography variant='h6' borderBottom='solid 1px' >2. Give to Win 控制平板</Typography>
      <p>啟動抽獎</p>
    </Paper>
  )
}
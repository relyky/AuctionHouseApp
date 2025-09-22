import { Box, Paper, Typography } from "@mui/material";

export default function OpenAskPanel(props: {
  activity: ActivityEnum
}) {

  // hidden
  if (props.activity !== 'openAsk') return (<></>)
  // show
  return (
    <Paper sx={{ pt: 1, px: 2, pb: 2 }}>
      <Typography variant='h6' borderBottom='solid 1px' >5. Open Ask 控制平板</Typography>
      <Box color='text.secondary'>📃 啟動新一輪 Opan Ask</Box>
    </Paper>
  )
}
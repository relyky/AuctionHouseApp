import { Paper, Typography } from "@mui/material";

export default function OpenAskPanel(props: {
  stage: StageEnum
}) {

  // hidden
  if (props.stage !== 'OpenAsk') return (<></>)
  // show
  return (
    <Paper sx={{ pt: 1, px: 2, pb: 2 }}>
      <Typography variant='h6' borderBottom='solid 1px' >5. Open Ask 控制平板</Typography>
      <p>啟動抽獎</p>
    </Paper>
  )
}
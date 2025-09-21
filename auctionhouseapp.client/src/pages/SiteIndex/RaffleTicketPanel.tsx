import { Paper, Typography } from "@mui/material";

export default function RaffleTicketPanel(props: {
  stage: StageEnum
}) {

  // hidden
  if (props.stage !== 'RaffleTicket') return (<></>)
  // show
  return (
    <Paper sx={{ pt: 1, px: 2, pb: 2 }}>
      <Typography variant='h6' borderBottom='solid 1px' >1. Raffle Ticket 控制平板</Typography>
      <p>啟動抽獎</p>
    </Paper>
  )
}
import { useState } from "react";
import type { FC, ReactNode } from "react";
import { Button, Container, Typography, Box } from "@mui/material";

export default function SiteIndex() {
  const [stage, setStage] = useState<StageEnum>('SilentAuction')

  return (
    <Container maxWidth='md'>
      <Typography variant='h5' gutterBottom>大螢幕切換</Typography>

      <Box display='flex' gap={2} flexWrap='wrap' justifyContent='center' >
        <StageSwitch value={stage} onChange={setStage} stage='RaffleTicket'
          label={<span>1. Raffle Ticket <br />(彩券抽獎)</span>} />
        <StageSwitch value={stage} onChange={setStage} stage='GiftToWin'
          label={<span>2. Gift to Win <br />(福袋抽獎)</span>} />
        <StageSwitch value={stage} onChange={setStage} stage='LiveAuction'
          label={<span>3. Live Auction <br />(現場拍賣)</span>} />
        <StageSwitch value={stage} onChange={setStage} stage='SilentAuction'
          label={<span>4. Silent Auction <br />(靜態拍賣)</span>} />
        <StageSwitch value={stage} onChange={setStage} stage='OpenAsk'
          label={<span>5. Open Ask <br />(募款活動)</span>} />
        <StageSwitch value={stage} onChange={setStage} stage='Donation'
          label={<span>6. Donation <br />(捐款功能)</span>} />
      </Box>

      <pre>{stage}</pre>
    </Container>
  )
}

//-----------
const StageSwitch: FC<{
  label: ReactNode
  stage: StageEnum
  value: StageEnum
  onChange: (stage: StageEnum) => void
}> = (props) => (
  <Button size='large' sx={{ flexGrow: 1 }}
    variant={props.value === props.stage ? 'contained' : 'outlined'}
    onClick={() => props.onChange(props.stage)}
  >
    {props.label}
  </Button>
)

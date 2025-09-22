import { useState } from "react";
import type { FC, ReactNode } from "react";
import { Button, Container, Typography, Box } from "@mui/material";
import RaffleTicketPanel from "./RaffleTicketPanel";
import GiveToWinPanel from "./GiveToWinPanel";
import LiveAuctionPanel from "./LiveAuctionPanel";
import SilentAuctionPanel from "./SilentAuctionPanel";
import OpenAskPanel from "./OpenAskPanel";
import DonationPanel from "./DonationPanel";

export default function SiteIndex() {
  const [activity, setActivity] = useState<ActivityEnum>('silentAuction')

  return (
    <Container maxWidth='md'>
      <Typography variant='h5' gutterBottom>活動主控台(大螢幕切換)</Typography>

      <Box display='flex' gap={2} flexWrap='wrap' justifyContent='center' mb={2} >
        <ActivitySwitch value={activity} onChange={setActivity} activity='raffle'
          label={<span>1. Raffle Ticket <br />(彩券抽獎)</span>} />
        <ActivitySwitch value={activity} onChange={setActivity} activity='give'
          label={<span>2. Give to Win <br />(福袋抽獎)</span>} />
        <ActivitySwitch value={activity} onChange={setActivity} activity='liveAuction'
          label={<span>3. Live Auction <br />(現場拍賣)</span>} />
        <ActivitySwitch value={activity} onChange={setActivity} activity='silentAuction'
          label={<span>4. Silent Auction <br />(靜態拍賣)</span>} />
        <ActivitySwitch value={activity} onChange={setActivity} activity='openAsk'
          label={<span>5. Open Ask <br />(募款活動)</span>} />
        <ActivitySwitch value={activity} onChange={setActivity} activity='donation'
          label={<span>6. Donation <br />(愛心捐款)</span>} />
      </Box>

      <RaffleTicketPanel activity={activity} />
      <GiveToWinPanel activity={activity} />
      <LiveAuctionPanel activity={activity} />
      <SilentAuctionPanel activity={activity} />
      <OpenAskPanel activity={activity} />
      <DonationPanel activity={activity} />
    </Container>
  )
}

//-----------
const ActivitySwitch: FC<{
  label: ReactNode
  activity: ActivityEnum
  value: ActivityEnum
  onChange: (activity: ActivityEnum) => void
}> = (props) => (
  <Button size='large' sx={{ flexGrow: 1, textTransform: 'none' }}
    variant={props.value === props.activity ? 'contained' : 'outlined'}
    onClick={() => props.onChange(props.activity)}
  >
    {props.label}
  </Button>
)

import { Box, Button, Container, Typography, useEventCallback } from "@mui/material";
import { useAtom } from "jotai";
import { giveSellAtom } from "./atom";
import GiveTicketListWidget from "./widgets/GiveTicketListWidget";

export default function GiveSell_Step3View() {
  const [{ giveOrder }, setFormState] = useAtom(giveSellAtom);

  const handleFinish = useEventCallback(() => {
    setFormState(prev => ({ ...prev, mode: 'Finish' }))
  });

  return (
    <Container maxWidth='sm'>
      {/* 只需列出抽獎券清單。福袋抽獎券不用寄。 */}
      <Typography variant='h5'>Give-to-Win Tickets List</Typography>

      <Typography variant='h6'>Order No. {giveOrder?.giveOrderNo}</Typography>
      <Box typography='body2' color='text.secondary' sx={{ mb: 1 }}>Reminder: Please scroll down and send the e-ticket by email to the buyer to complete the order.</Box>
      {/* 抽獎券張數 */}
      <Box typography='body1' color='text.primay' sx={{ mb: 1 }}>Total Tickets: {giveOrder?.purchaseCount}</Box>

      {giveOrder &&
        <GiveTicketListWidget giveOrderNo={giveOrder.giveOrderNo} />}

      {/* 完成 */}
      <Button variant='contained'
        fullWidth sx={{ mb: 3 }}
        onClick={handleFinish}>Complete Order</Button>

    </Container>
  )
}
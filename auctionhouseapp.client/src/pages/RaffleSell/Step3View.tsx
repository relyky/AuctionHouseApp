import { useAtom } from 'jotai';
import { Container, Typography, Button, Box } from '@mui/material'
import { raffleSellAtom } from './atom';
import { useEventCallback } from 'usehooks-ts';
import RaffleTickeEmailWidget from './widgets/RaffleTickeEmailWidget';
import { useState } from 'react';

export default function RaffleSell_Step3View() {
  const [{ raffleOrder }, setFormState] = useAtom(raffleSellAtom);
  const [emailTimes, setEmailTimes] = useState<number>(0)

  const handleFinish = useEventCallback(() => {
    setFormState(prev => ({ ...prev, mode: 'Finish' }))
  });

  return (
    <Container maxWidth='sm'>
      {/* xxxxxx */}
      {/* 寄送抽獎券 */}
      <Typography variant='h5'>Send Raffle Tickets</Typography>

      <Typography variant='h6'>Order No. {raffleOrder?.raffleOrderNo}</Typography>
      <Box typography='body2' color='text.secondary' sx={{ mb: 1 }}>Reminder: Please scroll down and send the e-ticket by email to the buyer to complete the order.</Box>
      {/* 抽獎券張數 */}
      <Box typography='body1' color='text.primay' sx={{ mb: 1 }}>Total Tickets: {raffleOrder?.purchaseCount}</Box>

      {/* raffleOrder && <RaffleOrderWidget raffleOrder={raffleOrder} /> */}

      {raffleOrder &&
        <RaffleTickeEmailWidget raffleOrderNo={raffleOrder.raffleOrderNo}
          afterSendEmail={setEmailTimes}
        />}

      {/* 完成 */}
      <Button variant={emailTimes > 0 ? 'contained' : 'outlined'}
        fullWidth sx={{ mb: 2 }}
        onClick={handleFinish}>Complete Order</Button>

    </Container>
  )
}

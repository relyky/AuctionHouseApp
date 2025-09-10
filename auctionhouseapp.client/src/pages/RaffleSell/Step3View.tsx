import { useAtom } from 'jotai';
import { Container, Typography, Button } from '@mui/material'
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
    <Container maxWidth='xs'>
      <Typography variant='h5' gutterBottom>寄送抽獎券({raffleOrder?.raffleOrderNo})</Typography>

      {/* raffleOrder && <RaffleOrderWidget raffleOrder={raffleOrder} /> */}

      {raffleOrder &&
        <RaffleTickeEmailWidget raffleOrderNo={raffleOrder.raffleOrderNo}
          afterSendEmail={setEmailTimes}
        />}

      <Button variant={emailTimes > 0 ? 'contained' : 'outlined'} onClick={handleFinish} fullWidth>完成</Button>
    </Container>
  )
}

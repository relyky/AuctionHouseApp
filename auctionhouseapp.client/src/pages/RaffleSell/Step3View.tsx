import { useState } from 'react';
import { useAtom } from 'jotai';
import { Container, Typography, Alert, Button } from '@mui/material'
import { raffleSellAtom } from './atom';
import { useEventCallback } from 'usehooks-ts';
import RaffleTickeEmailWidget from './widgets/RaffleTickeEmailWidgettsx';

export default function RaffleSell_Step3View() {
  const [{ raffleOrder }, setFormState] = useAtom(raffleSellAtom);
  const [f_loading, setLoading] = useState<boolean>(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)


  const handleFinish = useEventCallback(() => {
    setFormState(prev => ({ ...prev, mode: 'Finish' }))
  });

  return (
    <Container maxWidth='xs'>
      <Typography variant='h5' gutterBottom>寄送抽獎券({raffleOrder?.raffleOrderNo})</Typography>

      {raffleOrder && <RaffleTickeEmailWidget raffleOrderNo={raffleOrder.raffleOrderNo} />}

      <Button onClick={handleFinish}>完成</Button>
    </Container>
  )
}

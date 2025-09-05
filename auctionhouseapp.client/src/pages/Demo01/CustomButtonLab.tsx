import { Box, Button, CircularProgress, Switch, useEventCallback } from '@mui/material';
import { useState } from 'react';
import Swal from 'sweetalert2';
import useSound from 'use-sound';

export default function CustomButtonLab() {
  const [f_bidding, setBidding] = useState<boolean>(false)
  const [f_disabled, setDisabled] = useState<boolean>(false)
  const [play] = useSound('/sounds/message-13716.mp3');

  const handleBid = useEventCallback(async () => {
    try {
      setBidding(true)
      await new Promise(resolve => setTimeout(resolve, 1600))
      play();
      Swal.fire('出價成功。');
    } catch (err) {
      Swal.fire('出價失敗！')
    } finally {
      setBidding(false)
    }
  })

  return (
    <Box sx={{ textAlign: 'center', m: 4 }}>
      <Switch
        checked={f_disabled}
        onChange={(_, chk) => setDisabled(chk)}
        color="primary"
        sx={{ m: 2 }}
      />

      <Button variant='outlined' sx={{ m: 2 }}
        onClick={handleBid} disabled={f_disabled} loading={f_bidding}>
        出價
      </Button>

      <Button variant='contained' color='primary' sx={{ m: 2, px: 4, py: 1.25, fontSize: '1.25em' }}
        onClick={handleBid} disabled={f_disabled} loading={f_bidding}
        loadingIndicator={<CircularProgress size={32} color="inherit" />}
      >
        出價
      </Button>

      <Button size='large' variant='contained' color='primary' sx={{ m: 2 }}
        onClick={handleBid} disabled={f_disabled} loading={f_bidding}>
        出價
      </Button>
    </Box>
  )
}
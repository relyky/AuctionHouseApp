import { Alert, Button, Container, Typography } from '@mui/material';
import { useAtom } from 'jotai';
import { initialState, raffleSellAtom } from './atom';
//import { useNavigate } from 'react-router'
// icons
import NextIcon from '@mui/icons-material/ArrowForwardIos';

export default function RaffleSell_FinishView() {
  //const navigate = useNavigate()
  const [{ raffleOrder }, setFormStatus] = useAtom(raffleSellAtom);

  if (!raffleOrder) {
    return <Alert severity='error' sx={{ m: 3, p: 3 }} >非預期狀態！</Alert>
  }

  return (
    <Container maxWidth='xs'>

      {/* 抽獎券銷售完成！感謝您的使用。 */}
      {raffleOrder.status === 'HasSold' &&
        <Typography variant='h5' gutterBottom sx={{ my: 3, textAlign: 'center' }}>Sale Completed</Typography>}

      {/* 已放棄！感謝您的使用。 */}
      {raffleOrder.status === 'Invalid' &&
        <Typography variant='h5' gutterBottom sx={{ my: 3, textAlign: 'center' }}>Order cancellation completed</Typography>}

      {/* 啟動下一輪銷售 */}
      <Button variant="contained" size='large' fullWidth sx={{ mt: 3 }} endIcon={<NextIcon />}
        onClick={() => setFormStatus({ ...initialState, mode: 'Step1' })}>
        Start Next Sale
      </Button>
    </Container>
  )
}

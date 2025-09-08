import { useAtomValue } from 'jotai'
import { Container, Typography, Alert, Button } from '@mui/material'
import { raffleSellAtom } from './atom'

export default function RaffleSell_FinishView() {
  const { raffleOrder } = useAtomValue(raffleSellAtom)

  if (!raffleOrder) {
    return <Alert severity='error' sx={{ m: 3, p: 3 }} >非預期狀態！</Alert>
  }

  return (
    <Container maxWidth='xs'>
      <Typography variant='h5' gutterBottom>完成銷售</Typography>
      {raffleOrder.status === 'HasSold' &&
        <Alert severity="success">
          抽獎券銷售完成！感謝您的使用。
        </Alert>
      }
      {raffleOrder.status === 'Invalid' &&
        <Alert severity="info">
          已放棄！感謝您的使用。
        </Alert>
      }
      <Button variant="contained" sx={{ mt: 2 }} onClick={() => window.location.reload()}>
        銷售新抽獎券
      </Button>
    </Container>
  )
}

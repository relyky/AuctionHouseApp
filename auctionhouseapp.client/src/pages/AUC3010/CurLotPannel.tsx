import { Box, Card, CardContent, CardMedia, Paper, Skeleton, Table, TableBody, TableCell, TableRow, Typography } from '@mui/material';
import useAxios from 'axios-hooks';
import StyledLockBadge from './widgets/StyledLockBadge';

export default function CurLotPanel(props: {
  liveSt?: ILiveAuctionStatus
}) {
  const { liveSt } = props;

  if (!liveSt || !liveSt.curLotNo || liveSt.curLotNo === '') {
    return (
      <Paper sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="rounded" width={210} height={60} />
        <Skeleton variant="rounded" width={210} height={60} />
      </Paper>
    );
  }

  return (
    <StyledLockBadge isLocked={liveSt.isLocked}>
      <CurLotWidget lotNo={liveSt.curLotNo} />
    </StyledLockBadge>
  )
}

//-----------------------------------------------------------------------------
/**
 * 現在拍品資訊
 */
export function CurLotWidget(props: {
  lotNo: string
}) {
  const [{ data: lot, loading, error }] = useAxios<ILot>({
    url: `/api/Auction/GetLot/${props.lotNo}`,
    method: 'POST',
  });

  return (
    <Card sx={{ display: 'flex' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography variant="h5">
            {lot?.lotNo} {lot?.lotTitle}
          </Typography>
          <Box typography='body2' color='text.secondary'>
            {lot?.lotDesc}
          </Box>
          <Table size='small'>
            <TableBody>
              <TableRow>
                <TableCell>最高估值</TableCell>
                <TableCell>{lot?.highEstimate}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>最低估值</TableCell>
                <TableCell>{lot?.lowEstimate}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>保留價</TableCell>
                <TableCell>{lot?.reservePrice}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>起價</TableCell>
                <TableCell>{lot?.startPrice}</TableCell>
              </TableRow>
              {/* <TableRow>
                <TableCell>status</TableCell>
                <TableCell>{lot?.status}</TableCell>
              </TableRow> */}
            </TableBody>
          </Table>

          {loading && <p>Loading...</p>}
          {error && <p>{error?.message}</p>}
        </CardContent>
      </Box>
      <CardMedia
        component="img"
        sx={{ width: 151 }}
        image={lot?.catalog}
        alt={lot?.lotTitle}
      />
    </Card>
  )
}
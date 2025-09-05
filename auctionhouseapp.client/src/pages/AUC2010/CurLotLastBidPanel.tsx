import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { Paper, Box, Typography, LinearProgress, Button, Collapse, Alert, Skeleton } from "@mui/material"
import useAxios from 'axios-hooks'
import useFormHand from './useFormHand';

export default function CurLotLastBidPanel(props: {
  liveSt?: ILiveAuctionStatus
}) {
  const { liveSt } = props;

  if (!liveSt || !liveSt.curLotNo || liveSt.curLotNo === '') {
    return (
      <Paper sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2 }}>
        <Skeleton variant="rounded" width={210} height={60} />
        <Skeleton variant="rounded" width={210} height={60} />
      </Paper>
    );
  }

  return (
    <CurLotLastBidWidget
      liveSt={liveSt}
      lastUpdDtm={liveSt.lastBiddingEventUpdDtm} />
  )
}

//-----------------------------------------------------------------------------
/**
 * 現在拍品最高出價
 */
function CurLotLastBidWidget(props: {
  liveSt: ILiveAuctionStatus
  lastUpdDtm?: string, // 上次變動時間。只是用來通知該刷新資料了
}) {
  const { liveSt } = props;
  const handler = useFormHand()
  const [f_debug, toggleDebug] = useReducer(f => !f, false);

  const [{ data: bid, loading, error }, refetch] = useAxios<IBiddingEvent>({
    url: `/api/Broadcast/GetLotLastValidBid/${liveSt.curLotNo}`,
    method: 'POST',
  });

  const [{ data: hammer, loading: loading2, error: error2 }, refetch2] = useAxios<IHammeredRecord>({
    url: `/api/Broadcast/GetLotHammeredRecord/${liveSt.curLotNo}`,
    method: 'POST',
  });

  const handleHammer = useCallback(async (act: 'sold' | 'unsold') => {
    if (!bid) return;
    await handler.hammerBiddingEvent(bid, act)
  }, [bid])

  useEffect(() => {
    refetch()
    refetch2()
  }, [props.lastUpdDtm])

  /** 最高出價格式化 */
  const formatBidPrice = useMemo(() => {
    if (hammer && hammer.bidResult === 'Hammered') {
      return new Intl.NumberFormat('zh-TW', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(hammer.hammerPrice); // "1,234,567"

    } else if (bid) {
      return new Intl.NumberFormat('zh-TW', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(bid.bidPrice); // "1,234,567"

    } else {
      return ''
    }
  }, [bid, hammer])

  // render
  const renderHammered = Boolean(hammer)
  const renderBidding = Boolean(bid) && !Boolean(hammer) && liveSt.step !== 'Step4_CheckBid'
  const renderCheckBid = Boolean(bid) && !Boolean(hammer) && liveSt.step === 'Step4_CheckBid'
  const renderNoBid = !Boolean(bid) && !Boolean(hammer)
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant='subtitle1'>拍品最高出價</Typography>
      {(loading || loading2) && <LinearProgress color='info' />}
      {error && <Alert color='error'>{error.message}</Alert>}
      {error2 && <Alert color='error'>{error2.message}</Alert>}

      {renderHammered &&
        <Box>
          <Typography variant='h2' textAlign='center'>
            {formatBidPrice}
          </Typography>
          <Box typography='h3' textAlign='center'>
            {hammer?.bidResult === 'Hammered' ? '落槌成交'
              : hammer?.bidResult === 'Passed' ? '流標'
                : hammer?.bidResult}
          </Box>
        </Box>}

      {renderBidding &&
        <Box>
          <Typography variant='h2' textAlign='center'>
            {formatBidPrice}
          </Typography>
          <Box typography='h3' textAlign='center'>
            競價中
          </Box>
        </Box>}

      {renderCheckBid &&
        <Box>
          <Typography variant='h2' textAlign='center'>
            {formatBidPrice}
          </Typography>
          <Box display='flex' justifyContent='center' gap={1}>
            <Button onClick={() => handleHammer('sold')} variant='outlined' size='large'>落槌成交</Button>
            <Button onClick={() => handleHammer('unsold')} variant='outlined' size='large'>流標</Button>
          </Box>
        </Box>}

      {renderNoBid &&
        <Box>
          <Typography variant='h5' textAlign='center'>
            尚無出價
          </Typography>
        </Box>}

      <Button size='small' onClick={toggleDebug}>for debug</Button>
      <Collapse in={f_debug}>
        <Typography variant='subtitle2' color='text.secondary'>lastUpdDtm: {props?.lastUpdDtm}</Typography>
        <pre>hammer: {JSON.stringify(hammer, null, ' ')}</pre>
        <pre>bid: {JSON.stringify(bid, null, ' ')}</pre>
      </Collapse>
    </Paper>
  )
}


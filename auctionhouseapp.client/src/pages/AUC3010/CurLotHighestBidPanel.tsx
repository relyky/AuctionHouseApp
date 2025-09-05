import { useRef, useEffect, useMemo, useReducer } from 'react'
import type { FC } from 'react'
import { Paper, Box, Typography, LinearProgress, Button, Collapse, Alert, Skeleton } from "@mui/material"
import useAxios from 'axios-hooks'
import { useCountUp } from 'react-countup';

export default function CurLotHighestBidPanel(props: {
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
    <CurLotHighestBidWidget
      lotNo={liveSt.curLotNo}
      lastUpdDtm={liveSt.lastBiddingEventUpdDtm} />
  )
}

//-----------------------------------------------------------------------------
/**
 * 現在拍品最高出價
 */
function CurLotHighestBidWidget(props: {
  lotNo: string,
  lastUpdDtm?: string, // 上次變動時間。只是用來通知該刷新資料了
}) {
  const [f_debug, toggleDebug] = useReducer(f => !f, false);

  const [{ data: bid, loading, error }, refetch] = useAxios<IBiddingEvent>({
    url: `/api/Broadcast/GetLotLastValidBid/${props.lotNo}`,
    method: 'POST',
  });

  const [{ data: hammer, loading: loading2, error: error2 }, refetch2] = useAxios<IHammeredRecord>({
    url: `/api/Broadcast/GetLotHammeredRecord/${props.lotNo}`,
    method: 'POST',
  });

  useEffect(() => {
    refetch()
    refetch2()
  }, [props.lastUpdDtm])

  /** 最高出價 */
  const highestBidPrice = useMemo(() => {
    return (hammer && hammer.bidResult === 'Hammered') ? hammer.hammerPrice
      : (bid) ? bid.bidPrice
        : 0;
  }, [bid, hammer])

  // render
  const renderHammered = Boolean(hammer)
  const renderLastBid = Boolean(bid) && !Boolean(hammer)
  const renderNoBid = !Boolean(bid) && !Boolean(hammer)
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant='subtitle1'>拍品最高出價</Typography>
      {(loading || loading2) && <LinearProgress color='info' />}
      {error && <Alert color='error'>{error.message}</Alert>}
      {error2 && <Alert color='error'>{error2.message}</Alert>}

      {(renderHammered || renderLastBid) &&
        <CountUpWidget end={highestBidPrice} />}

      {renderHammered &&
        <Box typography='h3' textAlign='center'>
          {hammer?.bidResult === 'Hammered' ? '落槌成交'
            : hammer?.bidResult === 'Passed' ? '流標'
              : hammer?.bidResult}
        </Box>}

      {renderLastBid &&
        <Box typography='h3' textAlign='center'>
          競價中
        </Box>}

      {renderNoBid &&
        <Typography variant='h3' textAlign='center'>
          尚無出價
        </Typography>}

      <Button size='small' onClick={toggleDebug}>for debug</Button>
      <Collapse in={f_debug}>
        <Typography variant='subtitle2' color='text.secondary'>lastUpdDtm: {props?.lastUpdDtm}</Typography>
        <pre>hammer: {JSON.stringify(hammer, null, ' ')}</pre>
        <pre>bid: {JSON.stringify(bid, null, ' ')}</pre>
      </Collapse>
    </Paper>
  )
}

//-------------------------------------
const CountUpWidget: FC<{
  end: number
}> = ({ end }) => {
  const countUpRef = useRef<HTMLDivElement | null>(null);
  const hand = useCountUp({ ref: countUpRef as any, end: end });

  useEffect(() => {
    hand.update(end)
  }, [end])

  return (
    <Typography variant='h2' textAlign='center'>
      <Box component='span' ref={countUpRef} />
    </Typography>
  )
}

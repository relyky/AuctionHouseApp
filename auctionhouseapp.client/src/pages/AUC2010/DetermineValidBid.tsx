import { useEffect, useState } from 'react';
import { Alert, Button, LinearProgress, List, ListItem, ListItemButton, ListItemText, Paper, Toolbar, useEventCallback } from '@mui/material';
//import { parseISO, format } from 'date-fns';
import { toast } from 'react-toastify';
import { delayPromise } from '../../tools/utils';
import useFormHand from './useFormHand';
import Swal from 'sweetalert2';
// icons
import CheckIcon from '@mui/icons-material/Star';
import BlankIcon from '@mui/icons-material/StarBorder';

export default function DetermineValidBid(props: {
  liveSt: ILiveAuctionStatus
}) {
  const { liveSt } = props;
  const [f_loading, setLoading] = useState<Boolean>(false)
  const [bidList, setBidList] = useState<IBiddingEvent[]>([])
  const handler = useFormHand()

  const refreshBiddingEvent = useEventCallback(async () => {
    try {
      if (!liveSt) return; // 無資料不執行
      setLoading(true)
      await delayPromise(800)
      const bidList = await handler.qryBiddingEvent(liveSt)

      // 重新排序
      // 規則一：bidPrice 降序 (DESC)
      // 規則二：bidPrice 相同時，biddingSn 升序 (ASC)
      bidList.sort((a, b) =>
        a.bidPrice !== b.bidPrice ? b.bidPrice - a.bidPrice : a.biddingSn - b.biddingSn
      );

      setBidList(bidList)
    } catch (err) {
      console.error('refreshBiddingEvent FAIL!', { err });
      Swal.fire('執行失敗', (err as Error).message, 'error');
    }
    finally {
      setLoading(false)
    }
  })

  const determineBiddingEvent = useEventCallback(async (bid: IBiddingEvent) => {
    if (liveSt.step == 'Step3_Bidding' || liveSt.step == 'Step4_CheckBid') {
      const info = await handler.toggleBiddingEventValid(bid)
      if (!info) return;
      setBidList(bidList.map(b => b.biddingSn === info.biddingSn ? info : b))
    } else {
      toast.warn('步驟 3/4 才可操作！')
    }
  });

  // 當 BidOpenSn 變更時就清除現在出價清單
  useEffect(() => {
    setBidList([])
  },[liveSt.bidOpenSn])

  // 當切換到 step4 就刷新狀態。
  useEffect(() => {
    if (liveSt.step === 'Step4_CheckBid') {
      refreshBiddingEvent()
    }
  }, [liveSt.step]);

  //# go render
  if (!liveSt) {
    return <Alert>
      無拍賣狀態，請先選擇拍品。
    </Alert>
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Toolbar variant="dense">
        <Button onClick={refreshBiddingEvent} color="primary">
          {`刷新第${liveSt.bidOpenSn}輪出價清單`}
        </Button>
      </Toolbar>
      {f_loading && <LinearProgress color='info' />}
      {bidList.length === 0 && <Alert severity='info'>此輪無出價或競價中</Alert>}
      <List dense>
        {bidList.map((bid) => (
          <ListItem key={bid.biddingSn} disablePadding secondaryAction={bid.isValid == 'Y' ? <CheckIcon color='primary' /> : <BlankIcon />} >
            <ListItemButton onClick={() => determineBiddingEvent(bid)}>
              <ListItemText
                primary={`${bid.bidderNo} 出價 ${bid.bidPrice} 元`}
                secondary={`${bid.bidOpenSn}-${bid.biddingSn}: ${bid.bidTimestamp}`}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

    </Paper>
  )
}
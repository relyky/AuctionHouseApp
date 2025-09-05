import type { FC } from 'react'
import { useMemo, useReducer, useRef, useState } from "react";
import { Alert, Box, Button, CircularProgress, Collapse, Container, LinearProgress, Stack, Toolbar, Typography, useEventCallback } from "@mui/material";
import { useAccountState } from "../../atoms/accountAtom";
import { useBroadcastStream } from "../../hooks/useBroadcastStream";
import { delayPromise } from "../../tools/utils";
import type { SnackbarWidgetHandle } from "../../widgets/SnackbarWidget";
import axios from 'axios';
import useSound from 'use-sound';
import Swal from 'sweetalert2';
import CurLotPanel from '../AUC3010/CurLotPannel';
import SnackbarWidget from "../../widgets/SnackbarWidget";
import BidPriceInputWidget from './BidPriceInputWidget';
import { auc1010Atom } from './atom';
import { useAtom } from 'jotai';
// icons
import StreamIcon from '@mui/icons-material/RunCircle';

/**
 * 競標出價
 */
export default function AUC1010_AppForm() {
  const [f_debug, toggleDebug] = useReducer(f => !f, false);
  const snackbarRef = useRef<SnackbarWidgetHandle>(null);
  const account = useAccountState()
  const [playSound] = useSound('/sounds/message-13716.mp3');
  const [liveSt, setLiveStatus] = useState<ILiveAuctionStatus>();
  const [f_starting, f_streaming] = useBroadcastStream(setLiveStatus);
  const [f_bidding, setBidding] = useState<boolean>(false)
  const [formData, setFormData] = useAtom(auc1010Atom)

  const userBidPriceRef = useRef<number>(0)

  const f_disabled = useMemo(() => {
    return f_starting || !(liveSt?.isBidOpen ?? false)
  }, [f_starting, liveSt]);

  const handleBid = useEventCallback(async () => {
    try {
      setBidding(true)

      if (!liveSt) {
        Swal.fire('無拍品資訊無法執行！');
        return
      }

      if (!account) {
        Swal.fire('無登入者資訊無法執行！');
        return
      }

      const bidMsg: IBidMsg = {
        lotNo: liveSt.curLotNo,
        bidderNo: account.bidderNo,
        bidPrice: userBidPriceRef.current, // liveSt.curBidPrice + liveSt.bidIncrement,
        bidOpenSn: liveSt.bidOpenSn,
      }

      const response = await axios.post<string>(`/api/Bidder/SubmitBid`, bidMsg)
      //console.debug('registerAsync', response)

      if (response.status === 200 && response.data === 'SUCCESS') {
        setFormData({ lastBidMsg: bidMsg })
        playSound();
        snackbarRef.current?.showToast(`已出價 ${bidMsg.bidPrice}`, 'success');
        await delayPromise(1993) // 稍等不讓連按
      } else {
        Swal.fire('出價失敗！', response.data, 'error');
      }
    } catch (err) {
      console.error('出價出現例外！', { err })
      Swal.fire('出價出現例外！')
    }
    finally {
      setBidding(false)
    }
  })

  // go render
  if (account.bidderNo === 'B000') {
    return <Alert severity='warning' sx={{ mx: 3, my: 6 }}>
      請先註冊。
    </Alert>
  }

  if (!liveSt) {
    return (
      <Container component="main" maxWidth='xs'>
        <Stack mt='30vh'>
          <Typography variant='h4' textAlign='center' gutterBottom>競標出價</Typography>
          <Alert severity='info' sx={{ mx: 3 }}>
            拍賣官未選取拍品。
          </Alert>
        </Stack>
      </Container>
    )
  }

  return (
    <Container component="main" maxWidth='xs' sx={{ outline: 'dashed 1px red' }}>
      <Toolbar sx={{ gap: 2 }}>
        <Typography variant='h4'>競標出價</Typography>
        <StreamIcon color={f_streaming ? 'primary' : 'disabled'} titleAccess='拍品推送' />
      </Toolbar>

      {f_starting && <LinearProgress color='warning' />}

      <CurLotPanel liveSt={liveSt} />

      <Typography variant='subtitle1' textAlign='center'>出價金額<small> + 一刀增額</small></Typography>
      <Typography variant='h5' textAlign='center'>{liveSt.curBidPrice}<small> + {liveSt.bidIncrement}</small></Typography>

      {liveSt && <BidPriceInputWidget
        lastBidMsg={formData.lastBidMsg}
        liveSt={liveSt} disabled={f_disabled}
        onChange={(v) => userBidPriceRef.current = v} />}

      <Box sx={{ textAlign: 'center' }}>
        <BidButton handleBid={handleBid}
          disabled={f_disabled}
          bidding={f_bidding} />
      </Box>

      {/* 畫面版次 for debug */}
      <Box typography='body2' color='text.secondary' sx={{ float: 'right' }} >
        v08291618
      </Box>
      <Button size='small' onClick={toggleDebug}>for debug</Button>
      <Collapse in={f_debug}>
        <pre>accountState:{JSON.stringify(account, null, 2)}</pre>
        <pre>liveSt:{JSON.stringify(liveSt, null, 2)}</pre>
      </Collapse>

      <SnackbarWidget ref={snackbarRef} />
    </Container>
  )
}

//---------------------------
const BidButton: FC<{
  handleBid: () => void,
  bidding: boolean,
  disabled: boolean,
}> = ({ handleBid, bidding, disabled }) => (
  <Button variant='contained' color='primary' sx={{ px: 4, py: 1.25, fontSize: '1.25em' }}
    loadingIndicator={<CircularProgress size={32} color="inherit" />}
    onClick={handleBid} disabled={disabled} loading={bidding}>
    出價
  </Button>
)

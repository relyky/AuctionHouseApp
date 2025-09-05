import { useEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from 'react-router';
import { Alert, Box, Button, Collapse, Container, LinearProgress, Paper, Stack, Toolbar, Typography } from "@mui/material";
import { useBiddingEventPump, useBroadcastStream } from "../../hooks/useBroadcastStream";
import CurLotHighestBidPanel from "./CurLotHighestBidPanel";
import CurLotPanel from "./CurLotPannel";
import CurLotValidBidPanel from "./CurLotValidBidPanel";
import BiddingEventPanel, { type BiddingEventPanelRef } from "./BiddingEventPanel";
// icons
import BubbleIcon from '@mui/icons-material/Message';
import StreamIcon from '@mui/icons-material/RunCircle';

/**
 * 拍賣狀態總覽
 */
export default function AUC3010_AppForm() {
  const [f_debug, toggleDebug] = useReducer(f => !f, false);
  const navigate = useNavigate();
  const biddingEventPanelRef = useRef<BiddingEventPanelRef>(null);
  const [liveSt, setLiveStatus] = useState<ILiveAuctionStatus>();
  const [f_starting, f_streaming] = useBroadcastStream((v) => {
    setLiveStatus(v);
  });

  const [f_pumping, baseBiddingSn, resetBaseState] = useBiddingEventPump((e: IBiddingEvent) => {
    //toast.info(`${e.bidderNo}出價${e.bidPrice}元`);
    biddingEventPanelRef.current?.pushEvent(e);
  });

  //# 進入下一拍品時，清除畫面上(之前)的出價訊息。
  useEffect(() => {
    if (liveSt?.step === 'Step1_PickLot') {
      biddingEventPanelRef.current?.clear();
    }
  }, [liveSt?.step])

  // go render
  if (!liveSt) {
    return <Alert severity='warning' sx={{ mx: 3, my: 6 }}>
      拍賣官未選取拍品。
    </Alert>
  }

  return (
    <Container component="main" maxWidth={false} sx={{ outline: 'dashed 1px red' }}>
      <Toolbar sx={{ gap: 2 }}>
        <Typography variant='h4'>拍賣現場狀態</Typography>
        <StreamIcon color={f_streaming ? 'primary' : f_starting ? 'warning' : 'disabled'} titleAccess='拍品推送' />
        <BubbleIcon color={f_pumping ? 'primary' : 'disabled'} titleAccess='出價訊息' />
        <Box flexGrow={1}></Box>
        <Button onClick={() => {
          resetBaseState()
          navigate(0) // reload current page.
          //window.location.reload(); // reload current page.
        }}>{baseBiddingSn}重設</Button>
      </Toolbar>

      {f_starting && <LinearProgress color='warning' />}

      <Box display='flex' gap={1}>
        <Stack gap={1}>
          {/* 拍品資訊 */}
          <CurLotPanel liveSt={liveSt} />
          {/* 拍品最高出價 */}
          <CurLotHighestBidPanel liveSt={liveSt} />
          {/* 拍品有效出價 */}
          <CurLotValidBidPanel liveSt={liveSt} />
        </Stack>
        <Stack gap={1}>
          {/* 現在出價金額 */}
          <Paper sx={{ p: 2 }}>
            <Typography variant='h5' textAlign='center'>出價金額<small> + 一刀增額</small></Typography>
            <Typography variant='h2' textAlign='center'>{liveSt.curBidPrice}<small> + {liveSt.bidIncrement}</small></Typography>
          </Paper>
          {/* 出價訊息 */}
          <BiddingEventPanel ref={biddingEventPanelRef} />
        </Stack>
      </Box>

      {liveSt.isBidOpen && <Box typography='h2' textAlign='center' color='primary.main'>開始競價</Box>}

      <Button size='small' onClick={toggleDebug}>for debug</Button>
      <Collapse in={f_debug}>
        <pre>liveSt: {JSON.stringify(liveSt, null, 2)}</pre>
      </Collapse>
    </Container>
  )
}


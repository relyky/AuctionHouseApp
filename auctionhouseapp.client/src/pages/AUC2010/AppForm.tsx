import { useReducer, useState } from "react";
import { useNavigate } from 'react-router';
import { Box, Button, Collapse, Container, LinearProgress, Paper, Stack, Toolbar, Typography } from "@mui/material";
import { useBiddingEventPump, useBroadcastStream } from "../../hooks/useBroadcastStream";
import { toast } from "react-toastify";
import CommandPanel from "./CommandPanel";
import DetermineValidBid from "./DetermineValidBid";
import CurLotLastBidPanel from "./CurLotLastBidPanel";
import CurLotPannel from "../AUC3010/CurLotPannel";
import CurLotValidBidPanel from "../AUC3010/CurLotValidBidPanel";
// icons
import BubbleIcon from '@mui/icons-material/Message';
import StreamIcon from '@mui/icons-material/RunCircle';

/**
 * 拍賣面板
 * 畫面部局方法：
 *  1) 所以部件全部包裝成 panel。再下層是 widgets。 以 Grid layout 畫面。
 *  2) panel 用 atom 交換訊息。 widgets 不用 atom。
 */
export default function AUC2010_AppForm() {
  const [f_debug, toggleDebug] = useReducer(f => !f, false);
  const navigate = useNavigate();
  const [liveSt, setLiveStatus] = useState<ILiveAuctionStatus>();
  const [f_starting, f_streaming] = useBroadcastStream(setLiveStatus);

  const [f_pumping, baseBiddingSn, resetBaseState] = useBiddingEventPump((e: IBiddingEvent) => {
    console.trace('useBiddingEventStream', e);
    toast.info(`${e.bidderNo}出價${e.bidPrice}元`);
  });

  return (
    <Container component="main" maxWidth='xl' sx={{ outline: 'dashed 1px red' }}>
      <Toolbar sx={{ gap: 2 }}>
        <Typography variant='h4'>拍賣面板</Typography>
        <StreamIcon color={f_streaming ? 'primary' : 'disabled'} titleAccess='拍品推送' />
        <BubbleIcon color={f_pumping ? 'primary' : 'disabled'} titleAccess='出價訊息' />
        <Box flexGrow={1}></Box>
        <Button onClick={() => {
          resetBaseState()
          navigate(0) // reload current page.
          //window.location.reload(); // reload current page.
        }}>{baseBiddingSn}重設</Button>
      </Toolbar>

      {f_starting && <LinearProgress color='warning' />}

      <CommandPanel liveSt={liveSt} />

      <Box display='flex' gap={1}>
        <Stack gap={1}>
          <CurLotPannel liveSt={liveSt} />

          {/* 拍品最高出價 */}
          <CurLotLastBidPanel liveSt={liveSt} />

          {/* 拍品有效出價 */}
          <CurLotValidBidPanel liveSt={liveSt} />

        </Stack>
        <Stack gap={1}>
          {/* 現在出價金額 */}
          <Paper sx={{ p: 2 }}>
            <Typography variant='subtitle1' textAlign='center'>出價金額 + 一刀增額</Typography>
            <Typography variant='h4' textAlign='center'>{liveSt?.curBidPrice}<small> + {liveSt?.bidIncrement}</small></Typography>
          </Paper>

          {liveSt && <DetermineValidBid liveSt={liveSt} />}
        </Stack>
      </Box>

      <Button size='small' onClick={toggleDebug}>for debug</Button>
      <Collapse in={f_debug}>
        <pre>liveSt:{JSON.stringify(liveSt, null, 2)}</pre>
      </Collapse>
    </Container>

  )
}

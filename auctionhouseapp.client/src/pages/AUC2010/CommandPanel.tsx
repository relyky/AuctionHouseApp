import type { FC } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Box, Paper, Typography, Button, Stack, Skeleton, Alert, Autocomplete, TextField, useEventCallback } from '@mui/material';
import GrowTransition from '@mui/material/Grow';
import useAxios from 'axios-hooks';
import axios from 'axios';
import BidIncSetupWidget from './BidIncSetupWidget';
import BidStartSetupWidget from './BidStartSetupWidget';
import useFormHand from './useFormHand';
import Swal from 'sweetalert2';
import { useCountdown } from 'usehooks-ts';
//import { StepEnum } from './stepenum';

export default function CommandPanel(props: {
  liveSt?: ILiveAuctionStatus
}) {
  const { liveSt } = props
  const step = props.liveSt?.step ?? 'Step1_PickLot'

  return (
    <Box mb={1}>
      {step === 'Step1_PickLot' && <Step1Widget liveSt={liveSt} />}
      {step === 'Step2_StartPrice' && <Step2Widget liveSt={liveSt} />}
      {step === 'Step2A_IncPrice' && <Step2AWidget liveSt={liveSt} />}
      {step === 'Step3_Bidding' && <Step3Widget liveSt={liveSt} />}
      {step === 'Step4_CheckBid' && <Step4Widget liveSt={liveSt} />}
      {step === 'Step5_Hammer' && <Step5Widget liveSt={liveSt} />}
    </Box>
  )
}

//--- 以下為輔助元件 ---
const Step1Widget: FC<{
  liveSt?: ILiveAuctionStatus,
}> = ({ liveSt }) => {
  const [curProfile, setCurProfile] = useState<ILotProfile | null>(null)
  const [{ data: profileList = [], loading, error }] = useAxios({
    url: '/api/Auction/QryLotProfileList',
    method: 'POST',
  });

  const handleLockCurLot = useEventCallback(() => {
    axios.post(`/api/Auction/LockLotForBidding`)
  })

  const lockDisabled = (liveSt?.isHammered ?? true);

  // to render
  if (loading) {
    return <Skeleton variant="rectangular" width="100%" height={56} />
  }

  if (error) {
    return <Alert color='error'>{error.message}</Alert>
  }

  return (
    <GrowTransition in>
      <Paper sx={{ p: 1 }}>
        <Typography variant='subtitle2' color='textSecondary' textAlign='center'>Step 1 宣佈拍品</Typography>
        <Stack direction='row' justifyContent='center' alignItems='center' gap={2}  >
          {/*<OutlinedInput placeholder='選取拍品' />*/}

          <Autocomplete
            disablePortal
            getOptionLabel={c => c.lotTitle}
            options={profileList}
            renderInput={(params) => <TextField {...params} placeholder='選擇當前拍品' />}
            disabled={liveSt?.isLocked}
            sx={{ width: 300 }}
            value={curProfile}
            onChange={(_, v) => {
              setCurProfile(v)
              if (v) {
                // 有選到拍品才送出去。
                axios.post(`/api/Auction/SelectLotForBidding/${v?.lotNo}`)
              }
            }}
          />

          <Button onClick={handleLockCurLot} disabled={lockDisabled}>鎖定拍品</Button>
        </Stack>
      </Paper>
    </GrowTransition>
  )
}

const Step2Widget: FC<{
  liveSt?: ILiveAuctionStatus,
}> = ({ liveSt }) => {

  const handleUnlockCurLot = useEventCallback(async () => {
    // 解鎖後才可變更拍品。
    await axios.post(`/api/Auction/UnlockLot`)
  })

  const handleStartLotBidding = useEventCallback(() => {
    // 開始競價。
    axios.post(`/api/Auction/StartBidding`).catch((err) => {
      console.error('handleStartLotBidding FAIL!', { err });
      Swal.fire('執行失敗', (err as Error).message, 'error');
    })
  })

  return (
    <GrowTransition in>
      <Paper sx={{ p: 1 }}>
        <Typography variant='subtitle2' color='textSecondary' textAlign='center'>Step 2 準備第一輪競價</Typography>
        <Stack direction='row' justifyContent='center' alignItems='center' gap={2}  >
          <Button onClick={handleUnlockCurLot}>上一步</Button>

          {/*<OutlinedInput placeholder='一刀增額' /> */}
          {liveSt && <BidStartSetupWidget liveSt={liveSt} />}

          {/*<OutlinedInput placeholder='E 起拍金額' />*/}
          {liveSt && <BidIncSetupWidget liveSt={liveSt} />}

          <Button onClick={handleStartLotBidding}>開始競價</Button>
        </Stack>
      </Paper>
    </GrowTransition>
  )
}

const Step3Widget: FC<{
  liveSt?: ILiveAuctionStatus,
}> = (_) => {
  const [countUp, handCountUp] = useCountdown({ countStart: 0, countStop: Infinity, intervalMs: 100, isIncrement: true })

  const formatedCountUp = useMemo(() => {
    const totalSeconds = Math.floor(countUp / 10);
    const tenths = countUp % 10;
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`;
  }, [countUp])

  const handleStopLotBidding = useEventCallback(async () => {
    // 停止競價。
    await axios.post(`/api/Auction/StopBidding`)
  })

  useEffect(() => {
    handCountUp.startCountdown()
  }, [])

  return (
    <GrowTransition in>
      <Paper sx={{ p: 1 }}>
        <Typography variant='subtitle2' color='textSecondary' textAlign='center'>Step 3 競標人出價</Typography>
        <Stack direction='row' justifyContent='center' alignItems='center' gap={2}  >
          <Box color='info.main'>(計時 {formatedCountUp})</Box>
          <Button onClick={handleStopLotBidding}>停止競價</Button>
        </Stack>
      </Paper>
    </GrowTransition>
  )
}

const Step4Widget: FC<{
  liveSt?: ILiveAuctionStatus,
}> = ({ liveSt }) => {
  const handler = useFormHand()

  const handleNextBidding = useEventCallback(async () => {
    // 下一拍品。
    await axios.post(`/api/Auction/PrepareNextBidding`)
  })

  return (
    <GrowTransition in>
      <Paper sx={{ p: 1 }}>
        <Typography variant='subtitle2' color='textSecondary' textAlign='center'>Step 4 檢選有效出出價</Typography>
        <Stack direction='row' justifyContent='center' alignItems='center' gap={2}  >
          <Button /* onClick={() => setStep('Step5_Hammer')} */ disabled >落槌成交</Button>
          <Button onClick={() => handler.hammerLotPassed(liveSt?.curLotNo!)}>流標</Button>
          <Button onClick={handleNextBidding}>下一輪競價</Button>
        </Stack>
      </Paper>
    </GrowTransition>
  )
}

const Step5Widget: FC<{
  liveSt?: ILiveAuctionStatus,
}> = (_) => {

  const handleNextLotForBidding = useEventCallback(async () => {
    // 下一拍品。
    await axios.post(`/api/Auction/NextLotForBidding`)
  });

  return (
    <GrowTransition in>
      <Paper sx={{ p: 1 }}>
        <Typography variant='subtitle2' color='textSecondary' textAlign='center'>Step 5 記錄與下一拍品</Typography>
        <Stack direction='row' justifyContent='center' alignItems='center' gap={2}>
          <Button onClick={handleNextLotForBidding}>下一拍品</Button>
        </Stack>
      </Paper>
    </GrowTransition>
  )
}


const Step2AWidget: FC<{
  liveSt?: ILiveAuctionStatus,
}> = ({ liveSt }) => {
  const handleStartLotBidding = useEventCallback(async () => {
    // 開始競價。
    axios.post(`/api/Auction/StartBidding`).catch((err) => {
      console.error('handleStartLotBidding FAIL!', { err });
      Swal.fire('執行失敗', (err as Error).message, 'error');
    })
  })

  return (
    <GrowTransition in>
      <Paper sx={{ p: 1 }}>
        <Typography variant='subtitle2' color='textSecondary' textAlign='center'>Step 2A 準備下一輪競價</Typography>
        <Stack direction='row' justifyContent='center' alignItems='center' gap={2}  >

          {/*<OutlinedInput placeholder='一刀增額' /> */}
          {liveSt && <BidIncSetupWidget liveSt={liveSt} />}

          <Button onClick={handleStartLotBidding}>開始競價</Button>
        </Stack>
      </Paper>
    </GrowTransition>
  )
}

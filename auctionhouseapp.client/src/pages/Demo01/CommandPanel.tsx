import type { FC } from 'react'
import { useState } from 'react'
import { Box, Paper, Typography, Button, Stack, OutlinedInput } from '@mui/material';
import GrowTransition from '@mui/material/Grow';
//import { StepEnum } from './stepenum';

type StepEnum =
  'Step1_PickLot' |
  'Step2_StartPrice' |
  'Step2A_IncPrice' |
  'Step3_Bidding' |
  'Step4_CheckBid' |
  'Step5_Hammer';

type SetStepFunc = React.Dispatch<React.SetStateAction<StepEnum>>

export default function CommandPanel() {
  const [step, setStep] = useState<StepEnum>('Step1_PickLot');

  return (
    <Box mb={2}>
      {step === 'Step1_PickLot' && <Step1Widget setStep={setStep} />}
      {step === 'Step2_StartPrice' && <Step2Widget setStep={setStep} />}
      {step === 'Step2A_IncPrice' && <Step2AWidget setStep={setStep} />}
      {step === 'Step3_Bidding' && <Step3Widget setStep={setStep} />}
      {step === 'Step4_CheckBid' && <Step4Widget setStep={setStep} />}
      {step === 'Step5_Hammer' && <Step5Widget setStep={setStep} />}
    </Box>
  )
}

//--- 以下為輔助元件 ---
const Step1Widget: FC<{
  setStep: SetStepFunc,
}> = ({ setStep }) => (
  <GrowTransition in>
    <Paper sx={{ p: 1 }}>
      <Typography variant='subtitle2' color='textSecondary' textAlign='center'>Step 1 宣佈拍品</Typography>
      <Stack direction='row' justifyContent='center' alignItems='center' gap={2}  >
        <OutlinedInput placeholder='選取拍品' />
        <Button onClick={() => setStep('Step2_StartPrice')}>鎖定拍品</Button>
      </Stack>
    </Paper>
  </GrowTransition>
)

const Step2Widget: FC<{
  setStep: SetStepFunc,
}> = ({ setStep }) => (
  <GrowTransition in>
    <Paper sx={{ p: 1 }}>
      <Typography variant='subtitle2' color='textSecondary' textAlign='center'>Step 2 準備第一輪競價</Typography>
      <Stack direction='row' justifyContent='center' alignItems='center' gap={2}  >
        <Button onClick={() => setStep('Step1_PickLot')}>上一步</Button>
        <OutlinedInput placeholder='起拍金額' />
        <Button onClick={() => setStep('Step3_Bidding')}>開始競價</Button>
      </Stack>
    </Paper>
  </GrowTransition>
)

const Step3Widget: FC<{
  setStep: SetStepFunc,
}> = ({ setStep }) => (
  <GrowTransition in>
    <Paper sx={{ p: 1 }}>
      <Typography variant='subtitle2' color='textSecondary' textAlign='center'>Step 3 競標人出價</Typography>
      <Stack direction='row' justifyContent='center' alignItems='center' gap={2}  >
        <Box color='info.main'>(倒數計時)</Box>
        <Button onClick={() => setStep('Step4_CheckBid')}>停止競價</Button>
      </Stack>
    </Paper>
  </GrowTransition>
)

const Step4Widget: FC<{
  setStep: SetStepFunc,
}> = ({ setStep }) => (
  <GrowTransition in>
    <Paper sx={{ p: 1 }}>
      <Typography variant='subtitle2' color='textSecondary' textAlign='center'>Step 4 檢選有效出出價</Typography>
      <Stack direction='row' justifyContent='center' alignItems='center' gap={2}  >
        <Button onClick={() => setStep('Step5_Hammer')}>落槌成交</Button>
        <Button onClick={() => setStep('Step5_Hammer')}>流標</Button>
        <Button onClick={() => setStep('Step2A_IncPrice')}>下一輪競價</Button>
      </Stack>
    </Paper>
  </GrowTransition>
)

const Step5Widget: FC<{
  setStep: SetStepFunc,
}> = ({ setStep }) => (
  <GrowTransition in>
    <Paper sx={{ p: 1 }}>
      <Typography variant='subtitle2' color='textSecondary' textAlign='center'>Step 5 記錄與下一拍品</Typography>
      <Stack direction='row' justifyContent='center' alignItems='center' gap={2}>
        <Button onClick={() => setStep('Step1_PickLot')}>下一拍品</Button>
      </Stack>
    </Paper>
  </GrowTransition>
)


const Step2AWidget: FC<{
  setStep: SetStepFunc,
}> = ({ setStep }) => (
  <GrowTransition in>
    <Paper sx={{ p: 1 }}>
      <Typography variant='subtitle2' color='textSecondary' textAlign='center'>Step 2A 準備下一輪競價</Typography>
      <Stack direction='row' justifyContent='center' alignItems='center' gap={2}  >
        <OutlinedInput placeholder='一刀增額' />
        <Button onClick={() => setStep('Step3_Bidding')}>開啟競價</Button>
      </Stack>
    </Paper>
  </GrowTransition>
)

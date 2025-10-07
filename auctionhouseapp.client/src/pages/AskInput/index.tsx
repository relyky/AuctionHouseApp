import { Box, Container, IconButton, InputAdornment, LinearProgress, OutlinedInput, Paper, Stack, Typography } from "@mui/material";
import type { FormEvent } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { useEventCallback } from "usehooks-ts";
import type { IAskInputDto } from "../../dto/IAskInputDto";
import { postData } from "../../tools/httpHelper";
import ConsecutiveSnackbar, { type ConsecutiveSnackbarRef } from "../../widgets/ConsecutiveSnackbar";
import AskCurrentRound from "./AskCurrentRound";
import { beep } from "../../tools/utils";
// icons
import ReturnIcon from '@mui/icons-material/KeyboardReturn';

export default function AskInput() {
  const snackbarRef = useRef<ConsecutiveSnackbarRef>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [openAskRound, setOpenAskRound] = useState<IOpenAskRound | null>(null); // 現在回合
  const [paddleNum, setPaddleNum] = useState<string>('')
  const [focusRequested, setFocusRequested] = useState(false);

  const handleSubmit = useEventCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!openAskRound) return;
    if (!paddleNum) return;

    setLoading(true)

    const args: IAskInputDto = {
      round: openAskRound!.round,
      amount: openAskRound!.amount,
      paddleNum: paddleNum,
    }

    postData<MsgObj>(`/api/Site/OpenAskEntry`, args)
      .then(msg => {
        console.info('OpenAskEntry.then', msg);
        setPaddleNum('')
        snackbarRef.current?.showSnackbar(msg.message, msg.severity as any)
        beep()
      })
      .catch(console.log)
      .finally(() => setTimeout(() => {
        setLoading(false)
        setFocusRequested(true) // 指示控制 UI,設定 focus
      }, 100))
  });

  //※ UI 控制用 useLayoutEffect 在時序上同步才會有效用。
  useLayoutEffect(() => {
    if (focusRequested) {
      setFocusRequested(false)
      inputRef.current?.focus()
    }
  },[focusRequested])

  return (
    <Container maxWidth='xs'>
      <Typography variant='h5'>Open Ask 認捐輸入</Typography>

      <AskCurrentRound onRoundChange={setOpenAskRound} />

      {openAskRound &&
        <Paper sx={{ py: 3, px: 5, mb: 2 }}>
          <Stack component='form' onSubmit={handleSubmit} sx={{ textAlign: 'center', pb: 2, gap: 1 }}>
            <Box typography='subtitle1'>Entry Paddle No.</Box>
            <OutlinedInput inputRef={inputRef} type='number' name='paddleNum' required autoFocus
              disabled={loading} placeholder="000"
              value={paddleNum} onChange={e => setPaddleNum(e.target.value)}
              slotProps={{ input: { min: 100, max: 999 } }}
              sx={{ color: 'info.main', fontSize: '2em', '& .MuiInputBase-input': { textAlign: 'center' } }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton type='submit' disabled={loading}>
                    <ReturnIcon color='primary' />
                  </IconButton>
                </InputAdornment>
              }
            />
          </Stack>
        </Paper>}

      {loading && <LinearProgress color='info' />}

      <ConsecutiveSnackbar ref={snackbarRef} />
    </Container>
  )
}
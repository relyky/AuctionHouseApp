import { Container, Divider, Stack, Typography, Box, OutlinedInput, Paper, InputAdornment, IconButton } from "@mui/material";
import { useEffect, useState, type FormEvent } from "react";
import AskCurrentRound from "./AskCurrentRound";
import { useEventCallback } from "usehooks-ts";
import { postData } from "../../tools/httpHelper";
import type { IAskInputDto } from "../../dto/IAskInputDto";
// icons
import ReturnIcon from '@mui/icons-material/KeyboardReturn';

export default function AskInput() {
  const [loading, setLoading] = useState(false)
  const [openAskRound, setOpenAskRound] = useState<IOpenAskRound | null>(null); // 現在回合
  const [paddleNum, setPaddleNum] = useState<string>('')

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

    postData<IOpenAskRound>(`/api/Site/OpenAskEntry`, args)
      .then(msg => {
        // post toast.
      })
      .catch(console.log)
      .finally(() => setLoading(false))
  });

  return (
    <Container maxWidth='xs'>
      <Typography variant='h5'>Open Ask 認捐輸入</Typography>

      <AskCurrentRound onRoundChange={setOpenAskRound} />

      {openAskRound &&
        <Paper sx={{ py: 3, px: 5, mb: 2 }}>
          <Stack component='form' onSubmit={handleSubmit} sx={{ textAlign: 'center', pb: 2, gap: 1 }}>
            <Box typography='subtitle1'>Entry Paddle No.</Box>
            <OutlinedInput type='number' name='paddleNum' required autoFocus
              value={paddleNum} onChange={e => setPaddleNum(e.target.value)}
              slotProps={{ input: { min: 100, max: 999 } }}
              sx={{ color: 'info.main', fontSize: '2em', '& .MuiInputBase-input': { textAlign: 'center' } }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton type='submit'>
                    <ReturnIcon color='primary' />
                  </IconButton>
                </InputAdornment>
              }
            />
          </Stack>
        </Paper>}

    </Container>
  )
}
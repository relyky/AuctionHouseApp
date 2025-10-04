import { Box, Button, Divider, LinearProgress, OutlinedInput, Paper, Stack, Toolbar, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useEventCallback } from "usehooks-ts";
import { postData } from "../../tools/httpHelper";
import { delayPromise } from "../../tools/utils";

export default function OpenAskPanel(props: {
  activity: ActivityEnum
}) {
  const [loading, setLoading] = useState(false)
  const [openAskRound, setOpenAskRound] = useState<IOpenAskRound | null>(null); // 現在回合。
  const [newAmount, setNewAmount] = useState<string>('1000')

  const handleNewRound = useEventCallback(() => {
    setLoading(true)
    postData<IOpenAskRound>(`/api/Site/OpenAskNewRound/${newAmount}`)
      .then(setOpenAskRound)
      .catch(console.log)
      .finally(() => {
        setTimeout(() => setLoading(false), 800)
      })
  });

  useEffect(() => {
    setLoading(true)
    postData<IOpenAskRound | null>('/api/site/openaskcurrentround')
      .then(setOpenAskRound)
      .catch(console.error)
      .finally(() => {
        setTimeout(() => setLoading(false), 800)
      })
  }, [])

  // hidden
  if (props.activity !== 'openAsk') return (<></>)
  // show
  return (
    <Paper sx={{ pt: 1, px: 2, pb: 2 }}>
      <Typography variant='h6' borderBottom='solid 1px' >5. Open Ask Control Panel</Typography>

      {loading && <LinearProgress color='info' />}

      {openAskRound && <Box sx={{ m: 3 }}>
        <span>第 {openAskRound.round} 輪 金額 NT${openAskRound.amount}元。啟動:{openAskRound.isActive}</span>
      </Box>}

      <Divider sx={{ my: 3 }} />
      <Toolbar sx={{ gap: 2 }}>
        <Box>認捐金額</Box>
        <OutlinedInput type='number' size='small' autoFocus
          value={newAmount} onChange={e => setNewAmount(String(Number(e.target.value)))}
          slotProps={{
            input: { min: 1000, max: 1000000 }
          }}
        />
        <Button onClick={handleNewRound} variant='contained'>
          開啟新一輪
        </Button>
      </Toolbar>

    </Paper>
  )
}
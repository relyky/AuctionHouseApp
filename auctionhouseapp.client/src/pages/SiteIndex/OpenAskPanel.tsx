import { Box, Button, Divider, IconButton, InputAdornment, LinearProgress, OutlinedInput, Paper, Stack, Toolbar, Typography } from "@mui/material";
import { useEffect, useMemo, useState, type FC, type FormEvent } from "react";
import { useEventCallback } from "usehooks-ts";
import { postData } from "../../tools/httpHelper";
import { delayPromise } from "../../tools/utils";
import { formatWithComma } from '../../tools/utils';
//icons
import PlusIcon from '@mui/icons-material/Add';
import MinusIcon from '@mui/icons-material/Remove';

export default function OpenAskPanel(props: {
  activity: ActivityEnum
}) {
  const [loading, setLoading] = useState(false)
  const [openAskRound, setOpenAskRound] = useState<IOpenAskRound | null>(null); // 現在回合。
  const [newAmount, setNewAmount] = useState<string>('1000')

  const handleNewRound = useEventCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true)
    postData<IOpenAskRound>(`/api/Site/OpenAskNewRound/${newAmount}`)
      .then(setOpenAskRound)
      .catch(console.log)
      .finally(() => {
        setTimeout(() => setLoading(false), 800)
      })
  });

  const formatAskAmount = useMemo(() => {
    if (!openAskRound) return '0';
    return formatWithComma(openAskRound.amount); // 
  }, [openAskRound])

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
        第 <HighlightSpan>{openAskRound.round}</HighlightSpan> 輪 NT$ <HighlightSpan>{formatAskAmount}</HighlightSpan> 元。
      </Box>}

      <Divider sx={{ my: 3 }} />
      <Toolbar component='form' onSubmit={handleNewRound}
        sx={{ gap: 2 }}>
        <Box>認捐金額</Box>
        <OutlinedInput type='number' size='small' autoFocus required
          value={newAmount} onChange={e => setNewAmount(String(Number(e.target.value)))}
          endAdornment={
            <InputAdornment position="end">
              <IconButton onClick={() => setNewAmount(prev => Number(prev) > 500 ? String(Number(prev) - 500) : prev)}>
                <MinusIcon color='primary' />
              </IconButton>
              <IconButton onClick={() => setNewAmount(prev => String(Number(prev) + 500))}>
                <PlusIcon color='primary' />
              </IconButton>
            </InputAdornment>
          }
          slotProps={{
            input: {
              min: 500,
              max: 1000000,
            }
          }}
        />
        <Button type='submit' variant='contained' loading={loading} >
          開啟新一輪
        </Button>
      </Toolbar>

    </Paper>
  )
}

//-------------------------------------
const HighlightSpan: FC<{
  children: string | number
}> = (props) => (
  <Box component='span' sx={{
    fontWeight: 600,
    fontSize: '1.2em',
    color: 'info.main'
  }}>{props.children}</Box>
)

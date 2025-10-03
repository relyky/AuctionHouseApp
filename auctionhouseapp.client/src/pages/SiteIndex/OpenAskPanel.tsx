import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useEventCallback } from "usehooks-ts";
import { postData } from "../../tools/httpHelper";

export default function OpenAskPanel(props: {
  activity: ActivityEnum
}) {
  const [loading, setLoading] = useState(false)
  const [openAskRound, setOpenAskRound] = useState<IOpenAskRound | null>(null);

  const handleNewRound = useEventCallback(() => {
    setLoading(true)
    postData<IOpenAskRound>(`/api/Site/OpenAskNewRound/${openAskRound?.amount ?? 0}`)
      .then(setOpenAskRound)
      .catch(console.log)
      .finally(() => setLoading(false))
  });

  const handleStartRound = useEventCallback(() => {
    alert('not impletement');
  })

  // hidden
  if (props.activity !== 'openAsk') return (<></>)
  // show
  return (
    <Paper sx={{ pt: 1, px: 2, pb: 2 }}>
      <Typography variant='h6' borderBottom='solid 1px' >5. Open Ask Control Panel</Typography>
      <Box color='text.secondary'>📃 啟動新一輪 Opan Ask</Box>

      <Stack>
        {openAskRound && <Box>
          <span>第{openAskRound.round}輪，金額 NT${openAskRound.amount}元。啟動狀態(${openAskRound.isActive})</span>

          <Button variant='contained' onClick={handleStartRound}>更新金額</Button>
          <Button variant='contained' color='secondary' onClick={handleStartRound}>啟動</Button>

          <Button variant='contained' color='secondary' onClick={handleStartRound}>啟動</Button>
        </Box>}

        <Button onClick={handleNewRound}>開啟新一輪</Button>
      </Stack>


    </Paper>
  )
}
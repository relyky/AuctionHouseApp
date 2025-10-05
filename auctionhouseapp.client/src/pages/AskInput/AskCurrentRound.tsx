import { useCallback, useEffect, useMemo, useState, type FC } from "react"
import { Box, CircularProgress, LinearProgress, Paper, useEventCallback } from "@mui/material"
import { formatWithComma } from "../../tools/utils";
import { postData } from "../../tools/httpHelper";

/**
 * 自動取得現在 Open Ask Round。
 * 每秒刷新一次。
 */
export default function AskCurrentRound(props: {
  onRoundChange: (openAskRound: IOpenAskRound | null) => void
}) {
  const [loading, setLoading] = useState(false)
  const [openAskRound, setOpenAskRound] = useState<IOpenAskRound | null>(null); // 現在回合。

  //# 現在 Round，用來比對有否改變
  const [thisRound, setThisRound] = useState(0)

  const formatAskAmount = useMemo(() => {
    if (!openAskRound) return '0';
    return formatWithComma(openAskRound.amount); // 
  }, [openAskRound])

  const handleAskCurrentRound = useEventCallback(() => {
    setLoading(true)
    postData<IOpenAskRound | null>('/api/site/openaskcurrentround')
      .then(setOpenAskRound)
      .catch(console.error)
      .finally(() => setLoading(false))
  });

  // Set up the interval.
  useEffect(() => {
    const timer = setInterval(() => {
      handleAskCurrentRound();
    }, 1000)

    handleAskCurrentRound(); // 一開始就跑一次
    return () => {
      clearInterval(timer)
    }
  }, [])

  // 異動次數
  useEffect(() => {
    if (openAskRound) {
      if (openAskRound.round !== thisRound) {
        //# 偵測到有改變
        setThisRound(openAskRound.round)
        //# 偵測到有改變 => 發出訊息
        props.onRoundChange(openAskRound)
      }
    } else {
      setThisRound(0)
    }
  }, [openAskRound])


  // GO render
  const renderOpenAskRound = useCallback(() => {
    if (openAskRound) {
      return (<Box>
        第 <HighlightSpan>{openAskRound.round}</HighlightSpan> 輪 NT$ <HighlightSpan>{formatAskAmount}</HighlightSpan> 元。
      </Box>)
    } else {
      return (<Box>
        未開啟。
      </Box>)
    }
  }, [openAskRound])

  return (
    <Paper sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, mb: 2 }}>
      {renderOpenAskRound()}
      {/* openAskRound && <Box>
        第 <HighlightSpan>{openAskRound.round}</HighlightSpan> 輪 NT$ <HighlightSpan>{formatAskAmount}</HighlightSpan> 元。
      </Box> */}

      {loading && <CircularProgress color='info' size={24} />}
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

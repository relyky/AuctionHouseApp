import { Alert, Box, LinearProgress, Typography, useEventCallback } from "@mui/material";
import { useEffect, useState } from "react";
import { postData } from "../../tools/httpHelper";
import type { ICalcRaffleOrderStatisticsResult } from "./dto/ICalcRaffleOrderStatisticsResult";
import StatisticsTable from "./StatisticsTable";

/**
 * 後台-抽獎券銷售統計
 */
export default function RaffleStatisticsPanel() {
  const [result, setResult] = useState<ICalcRaffleOrderStatisticsResult | null>(null)
  const [f_loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null)

  const handleQuery = useEventCallback(() => {
    setLoading(true);
    setErrMsg(null); // 先清除錯誤訊息
    postData<ICalcRaffleOrderStatisticsResult>(`/api/BackendRaffleQuery/CalcRaffleOrderStatistics`)
      .then((data) => {
        console.info('handleQuery done', { data });
        setResult(data)
      })
      .catch((error) => {
        console.error('handleQuery error', { error });
        setErrMsg('發生錯誤請稍後再試。')
        setResult(null)
      })
      .finally(() => {
        setLoading(false)
      });
  });

  useEffect(() => {
    handleQuery()
  }, [])

  return (
    <Box>
      {/* 抽獎券銷售統計 */}
      <Typography variant='h5' gutterBottom>Raffle Ticket Sales Statistics</Typography>

      {f_loading && <LinearProgress color='info' />}

      {errMsg && <Alert severity='error' sx={{ m: 3 }}>{errMsg}</Alert>}

      {result && <StatisticsTable result={result} />}
      
      {/* result && <pre>{JSON.stringify(result, null, 2)}</pre> */}
    </Box>
  )
}

import { Container, LinearProgress, Typography, useEventCallback } from "@mui/material";
import { useEffect, useState } from "react";
import { postData } from "../../tools/httpHelper";
import { delayPromise, formatDateHms } from "../../tools/utils";
import AskCurrentRound from "../AskInput/AskCurrentRound";
import AskRecordLister from "./AskRecordLister";

export default function AskInputFix() {
  const [loading, setLoading] = useState(false)
  const [openAskRound, setOpenAskRound] = useState<IOpenAskRound | null>(null); // 現在回合
  const [askRecordList, setAskRecordList] = useState<IOpenAskRecord[]>([]);
  const [tick, setTick] = useState<number>(0)

  const loadOpenAskRecordAsync = useEventCallback(async () => {
    try {
      if (!openAskRound) return;

      setLoading(true)
      const recordList = await postData<IOpenAskRecord[]>(`/api/Site/LoadOpenAskRecord/${openAskRound.round}`)
      const recordList2 = recordList.map(c => ({
        ...c,
        recordDtm1: formatDateHms(c.recordDtm1),
        recordDtm2: formatDateHms(c.recordDtm2),
      })).sort((a, b) => {
        const sort1 = b.status.localeCompare(a.status)
        return sort1 === 0 ? (a.status === 'Confirmed' ? (b.ssn - a.ssn) : (a.ssn - b.ssn)) : sort1;
      })
      
      setAskRecordList(recordList2);
    } catch (error) {
      console.log(error)
    } finally {
      await delayPromise(800)
      setLoading(false)
    }
  })

  useEffect(() => {
    loadOpenAskRecordAsync()
      .then(() => setTimeout(() =>
        setTick(c => c + 1),
        1000))
  }, [tick])

  return (
    <Container>
      <Typography variant='h5'>Open Ask 認捐校正</Typography>
      <AskCurrentRound onRoundChange={setOpenAskRound} />

      <LinearProgress color='primary' variant={loading ? 'indeterminate' : 'determinate'} value={100} />

      {askRecordList &&
        <AskRecordLister recordList={askRecordList} />}

    </Container>
  )
}

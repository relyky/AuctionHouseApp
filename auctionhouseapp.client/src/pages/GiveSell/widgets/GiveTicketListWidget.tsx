import { Alert, Box, LinearProgress, Stack } from "@mui/material"
import { useEffect, useState } from "react"
import { postData, ResponseError } from "../../../tools/httpHelper"
import GiveTicketCardWidget from "./GiveTicketCardWidget"

/**
 * 福袋抽獎券清單
 */
export default function GiveTicketListWidget(props: {
  giveOrderNo: string
}) {
  const [ticketList, setTicketList] = useState<IGiveTicket[]>([])
  const [f_loading, setLoading] = useState<boolean>(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)

  //# 一進入就取出訂單下的抽獎券清單
  useEffect(() => {
    setLoading(true)
    setErrMsg(null)
    postData<IGiveTicket[]>(`/api/GiveSell/ListGiveTicket/${props.giveOrderNo}`)
      .then((newTicketList) => {
        setTicketList(newTicketList)
      }).catch(error => {
        if (error instanceof ResponseError) {
          console.error('handleSubmit ResponseError', error.message);
          setErrMsg(error.message)
        }
        else {
          console.error('handleSubmit error', { error });
          setErrMsg("出現預期之外的錯誤請通知系統工程師。" + error);
        }
      }).finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <Box>
      {f_loading && <LinearProgress color='info' />}

      {errMsg && <Alert severity='error' sx={{ m: 3 }} >{errMsg}</Alert>}

      <Stack gap={2} mb={2}>
        {ticketList.map((ticket) => (
          <GiveTicketCardWidget key={ticket.giveTicketNo} ticket={ticket} />
        ))}
      </Stack>
    </Box>
  );
}
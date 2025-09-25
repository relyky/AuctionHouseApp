import { Alert, Box, LinearProgress, Stack } from "@mui/material"
import { useEffect, useState } from "react"
import { postData, ResponseError } from "../../../tools/httpHelper"
import GiveTicketCardWidget from "./GiveTicketCardWidget"

/**
 * �ֳU�����M��
 */
export default function GiveTicketListWidget(props: {
  giveOrderNo: string
}) {
  const [ticketList, setTicketList] = useState<IGiveTicket[]>([])
  const [f_loading, setLoading] = useState<boolean>(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)

  //# �@�i�J�N���X�q��U�������M��
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
          setErrMsg("�X�{�w�����~�����~�гq���t�Τu�{�v�C" + error);
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
import { Typography, Box, Container, LinearProgress, Alert, Stack } from "@mui/material";
import SearchWidget from "../../widgets/SearchWidget";
import { useState } from "react";
import { useEventCallback } from "usehooks-ts";
import { postData, ResponseError } from "../../tools/httpHelper";
import type { IQryRaffleOrderArgs } from "./dto/IQryRaffleOrderArgs";
import RaffleTicketCardWidget from "../RaffleSell/widgets/RaffleTicketCardWidget";

/**
 * 抽將券買家查詢
 * @returns
 */
export default function RaffleBuyer_AppForm() {
  const [f_loading, setLoading] = useState<boolean>(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [orderList, setOrderList] = useState<IRaffleOrder[]>([]); // TODO: Define proper type
  const [ticketList, setTicketList] = useState<IRaffleTicket[]>([]); // TODO: Define proper type

  const handleSearch = useEventCallback(async (value: string) => {
    try {
      setLoading(true)
      setErrMsg(null)

      // reset previous results
      setOrderList([])
      setTicketList([])

      // GO
      const args: IQryRaffleOrderArgs = { buyerEmail: value };
      const orderListTmp = await postData<IRaffleOrder[]>('/api/RaffleBuyer/QryRaffleOrder', args);
      if (orderListTmp.length === 0) {
        setErrMsg("查無訂單資料，請確認輸入的E-mail地址是否正確。")
        return;
      };
     
      const ticketListTmp = await postData<IRaffleTicket[]>('/api/RaffleBuyer/QryRaffleTicket', args);

      setOrderList(orderListTmp);
      setTicketList(ticketListTmp);
    } catch (error) {
      if (error instanceof ResponseError) {
        console.error('handleSubmit ResponseError', error.message);
        setErrMsg(error.message)
      }
      else {
        console.error('handleSubmit error', { error });
        setErrMsg("出現預期之外的錯誤請通知系統工程師。" + error);
      }
    } finally {
      setLoading(false)
    }
  });

  return (
    <Container maxWidth='sm' sx={{ outline: 'dashed red 1px' }}>
      <Typography variant='h5' component="div" sx={{ mb: 2 }}>買家/抽獎券查詢</Typography>

      <SearchWidget
        placeholder="請輸入E-mail 地址"
        helpText={helpContent}
        onSearch={handleSearch}
      />

      {f_loading && <LinearProgress color='info' sx={{ m: 1 }} />}

      {errMsg && <Alert severity="error" sx={{ m: 2 }}>{errMsg}</Alert>}

      <Stack gap={2}>
        {ticketList.map((ticket) => (
          <RaffleTicketCardWidget key={ticket.raffleTicketNo} ticket={ticket} />
        ))}
      </Stack>

      {/* TODO: Display search results here */}
      <pre>orderList: {JSON.stringify(orderList, null, 2)}</pre>
      <pre>ticketList: {JSON.stringify(ticketList, null, 2)}</pre>

    </Container>
  )
}

//-----------------
const helpContent = (
  <>
    <Typography sx={{ mb: 1 }}>請在此輸入您的訂單編號以查詢您擁有的抽獎券。請在此輸入您的訂單編號以查詢您擁有的抽獎券。請在此輸入您的訂單編號以查詢您擁有的抽獎券。</Typography>
    <Typography sx={{ mb: 1 }}>訂單編號是您購買時收到的唯一識別碼，通常以 'RS' 開頭。</Typography>
    <Typography>如果您遺失了訂單編號，請聯繫客服尋求協助。</Typography>
  </>
);

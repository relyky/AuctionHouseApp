import { Alert, Container, LinearProgress, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useEventCallback } from "usehooks-ts";
import { postData, ResponseError } from "../../tools/httpHelper";
import SearchWidget from "../../widgets/SearchWidget";
import RaffleTicketCardWidget from "../RaffleSell/widgets/RaffleTicketCardWidget";
import type { IQryRaffleOrderArgs } from "../RaffleSellQuery/dto/IQryRaffleOrderArgs";
import RaffleOrderTableWidget from "../RaffleSellQuery/widgets/RaffleOrderTableWidget";

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
        // 查無訂單資料，請確認輸入的E-mail地址是否正確。
        setErrMsg("No order information found. Please check whether the email address you entered is correct.")
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
    <Container maxWidth='sm'>
      {/* 買家/抽獎券查詢 */}
      <Typography variant='h5' component="div" sx={{ mb: 2 }}>Search Tickets</Typography>

      <SearchWidget
        placeholder="Please enter your email address"
        helpText={helpContent}
        onSearch={handleSearch}
      />

      {f_loading && <LinearProgress color='info' sx={{ m: 1 }} />}

      {errMsg && <Alert severity="error" sx={{ m: 2 }}>{errMsg}</Alert>}

      {/* TODO: Display search results here */}

      {orderList.map((order) => (
        <RaffleOrderTableWidget key={order.raffleOrderNo} order={order} />
      ))}

      <Stack gap={2}>
        {ticketList.map((ticket) => (
          <RaffleTicketCardWidget key={ticket.raffleTicketNo} ticket={ticket} />
        ))}
      </Stack>

      {import.meta.env.DEV && false &&
        <pre>orderList: {JSON.stringify(orderList, null, 2)}<br />
          ticketList: {JSON.stringify(ticketList, null, 2)}</pre>
      }
    </Container>
  )
}

//-----------------
const helpContent = (
  <>
    <Typography sx={{ mb: 1 }}>Need help? Please contact us at tropicalnights@communitycenter.org.tw</Typography>
    {/*
    <Typography sx={{ mb: 1 }}>請在此輸入您的電郵地址以查詢您擁有的抽獎券。</Typography>
    <Typography>如果您有其他疑問請聯繫客服尋求協助。</Typography> 
    */}
  </>
);

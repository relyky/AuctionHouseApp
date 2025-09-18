import { useEventCallback, Box, Alert, Container, LinearProgress, Stack, Typography, Toolbar, Divider } from "@mui/material";
import { useState } from "react";
import { postData, ResponseError } from "../../tools/httpHelper";
import RaffleTicketCardWidget from "../RaffleSell/widgets/RaffleTicketCardWidget";
import type { IQryRaffleOrderArgs } from "./dto/IQryRaffleOrderArgs";
import RaffleOrderTableWidget from "./widgets/RaffleOrderTableWidget";
import RaffleOrderGridWidget from "./widgets/RaffleOrderGridWidget";
import PickBuyerDlg from "../RaffleSell/PickBuyerDlg";
import type { IBuyerProfile } from "../RaffleSell/dto/IBuyerProfile";
import BuyerProfileTableWidget from "./widgets/BuyerProfileTableWidget";
//import SearchWidget from "../../widgets/SearchWidget";

/**
 * 業務-協助買家查詢賣出訂單/抽獎券
 * 角色:不限
 * 查詢範圍:不限
 */
export default function RaffleSellQuery_AppForm() {
  const [f_loading, setLoading] = useState<boolean>(false)
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [orderList, setOrderList] = useState<IRaffleOrder[]>([]); // TODO: Define proper type
  const [ticketList, setTicketList] = useState<IRaffleTicket[]>([]); // TODO: Define proper type
  //
  const [pickedBuyer, setPickedBuyer] = useState<IBuyerProfile | null>(null)

  const handleSearch = useEventCallback(async (value: string) => {
    try {
      setLoading(true)
      setErrMsg(null)

      // reset previous results
      setOrderList([])
      setTicketList([])

      // GO
      const args: IQryRaffleOrderArgs = { buyerEmail: value };
      const orderListTmp = await postData<IRaffleOrder[]>('/api/RaffleSellQuery/QryRaffleOrder', args);
      if (orderListTmp.length === 0) {
        // 查無訂單資料，請確認輸入的E-mail地址是否正確。
        setErrMsg("No order record found. Please check that the email address you entered is correct.")
        return;
      };

      const ticketListTmp = await postData<IRaffleTicket[]>('/api/RaffleSellQuery/QryRaffleTicket', args);

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

  const handlePickBuyer = useEventCallback((buyer: IBuyerProfile) => {
    console.info('handlePickBuyer', { buyer })
    setPickedBuyer(buyer)
    handleSearch(buyer.buyerEmail);
  });

  return (
    <Container maxWidth='sm'>
      {/* 業務/銷售查詢 */}
      <Typography variant='h5'>Sales Records</Typography>
      <Toolbar>
        {/* 選取買家 */}
        <PickBuyerDlg label='Select Buyer' onPick={handlePickBuyer} />
      </Toolbar>

      {pickedBuyer && <BuyerProfileTableWidget buyer={pickedBuyer} />}

      <Divider sx={{ my: 2 }} />

      {f_loading && <LinearProgress color='info' sx={{ m: 1 }} />}

      {errMsg && <Alert severity="error" sx={{ m: 2 }}>{errMsg}</Alert>}

      {/* TODO: Display search results here */}

      {orderList.map((order) => (
        <RaffleOrderGridWidget key={order.raffleOrderNo} order={order} />
      ))}

      {/* orderList.map((order) => (
        <RaffleOrderTableWidget key={order.raffleOrderNo} order={order} />
      )) */}

      <Stack gap={2} sx={{ mb: 2 }}>
        {ticketList.map((ticket) => (
          <RaffleTicketCardWidget key={ticket.raffleTicketNo} ticket={ticket} />
        ))}
      </Stack>

      {/* import.meta.env.DEV &&
        <pre>orderList: {JSON.stringify(orderList, null, 2)}<br />
          ticketList: {JSON.stringify(ticketList, null, 2)}</pre>
      */}
    </Container>
  )
}

//-----------------
const helpContent = (
  <>
    <Typography sx={{ mb: 1 }}>請在此輸入您的電郵地址以查詢您擁有的抽獎券。</Typography>
    <Typography>如果您有其他疑問請聯繫客服尋求協助。</Typography>
  </>
);

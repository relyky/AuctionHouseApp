import { Alert, Box, Divider, LinearProgress, Stack, useEventCallback } from "@mui/material";
import { useEffect, useState } from "react";
import { postData, ResponseError } from "../../tools/httpHelper";
import type { IBuyerProfile } from "../RaffleSell/dto/IBuyerProfile";
import RaffleTicketCardWidget from "../RaffleSell/widgets/RaffleTicketCardWidget";
import type { IQryRaffleOrderArgs } from "./dto/IQryRaffleOrderArgs";
import BuyerProfileTableWidget from "./widgets/BuyerProfileTableWidget";
import RaffleOrderGridWidget from "./widgets/RaffleOrderGridWidget";
//import SearchWidget from "../../widgets/SearchWidget";

/**
 * �~��-��U�R�a�d�߽�X�q��/�����
 * ����:����
 */
export default function SelectBuyerView(props: {
  buyer: IBuyerProfile
}) {
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
      const orderListTmp = await postData<IRaffleOrder[]>('/api/RaffleSellQuery/QryRaffleOrder', args);
      if (orderListTmp.length === 0) {
        // �d�L�q���ơA�нT�{��J��E-mail�a�}�O�_���T�C
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
        setErrMsg("�X�{�w�����~�����~�гq���t�Τu�{�v�C" + error);
      }
    } finally {
      setLoading(false)
    }
  });

  useEffect(() => {
    if (props.buyer) {
      handleSearch(props.buyer.buyerEmail);
    }
  }, [props.buyer])

  if(!props.buyer) return <></>
  return (
    <Box>
      <BuyerProfileTableWidget buyer={props.buyer} />

      <Divider sx={{ my: 2 }} />

      {f_loading && <LinearProgress color='info' sx={{ m: 1 }} />}

      {errMsg && <Alert severity="error" sx={{ m: 2 }}>{errMsg}</Alert>}

      {/* TODO: Display search results here */}

      {orderList.map((order) => (
        <RaffleOrderGridWidget key={order.raffleOrderNo} order={order} />
      ))}

      <Stack gap={2} sx={{ mb: 2 }}>
        {ticketList.map((ticket) => (
          <RaffleTicketCardWidget key={ticket.raffleTicketNo} ticket={ticket} />
        ))}
      </Stack>

      {/* import.meta.env.DEV &&
        <pre>orderList: {JSON.stringify(orderList, null, 2)}<br />
          ticketList: {JSON.stringify(ticketList, null, 2)}</pre>
      */}
    </Box>
  )
}


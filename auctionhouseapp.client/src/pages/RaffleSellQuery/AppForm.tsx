import { Button, ButtonGroup, Container, Toolbar, Typography, useEventCallback } from "@mui/material";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { staffAccountAtom } from "../../atoms/staffAccountAtom";
import type { ISalesCodeName } from "../BackendRaffleCheck/dto/ISalesCodeName";
import PickBuyerDlg from "../RaffleSell/PickBuyerDlg";
import type { IBuyerProfile } from "../RaffleSell/dto/IBuyerProfile";
import SelectBuyerView from "./SelectBuyerView";
import TicketSalesView from "./TicketSalesView";

/**
 * 業務-協助買家查詢賣出訂單/抽獎券
 * 角色:不限
 * 查詢範圍:不限
 */
export default function RaffleSellQuery_AppForm() {
  const acct = useAtomValue(staffAccountAtom)
  const [pickedBuyer, setPickedBuyer] = useState<IBuyerProfile | null>(null)
  const [sales, setSales] = useState<ISalesCodeName | null>(null)

  const handlePickBuyer = useEventCallback((buyer: IBuyerProfile) => {
    console.info('handlePickBuyer', { buyer })
    setPickedBuyer(buyer)
    setSales(null)
  });

  const handleTicketSales = useEventCallback(() => {
    setSales({ salesId: acct.loginUserId, salesName: acct.loginUserName })
    setPickedBuyer(null)
  });

  return (
    <Container maxWidth='sm'>
      {/* 業務/銷售查詢 */}
      <Typography variant='h5'>Sales Records</Typography>
      <Toolbar>
        <ButtonGroup variant='text' fullWidth>
          {/* 選取買家 */}
          <PickBuyerDlg label='Select Buyer' onPick={handlePickBuyer} />

          {/* 業務售出訂單紀錄 */}
          <Button onClick={handleTicketSales}>Ticket Sales</Button>
        </ButtonGroup>
      </Toolbar>

      {pickedBuyer && <SelectBuyerView buyer={pickedBuyer} />}
      {sales && <TicketSalesView sales={sales} />}
    </Container>
  )
}


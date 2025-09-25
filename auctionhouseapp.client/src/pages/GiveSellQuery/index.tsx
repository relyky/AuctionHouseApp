import { Container, Typography } from "@mui/material";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { staffAccountAtom } from "../../atoms/staffAccountAtom";
import GiveTicketSalesView from "./GiveTicketSalesView";

/**
 * 業務-查詢賣出訂單/抽獎券
 */
export default function GiveSellQuery() {
  const acct = useAtomValue(staffAccountAtom)

  const sales = useMemo(() => ({
    salesId: acct.loginUserId,
    salesName: acct.loginUserName
  }), [acct])

  return (
    <Container maxWidth='sm'>
      {/* 業務/銷售查詢 */}
      <Typography variant='h5'>Sales Records</Typography>

      {sales && <GiveTicketSalesView sales={sales} />}
    </Container>
  );
}

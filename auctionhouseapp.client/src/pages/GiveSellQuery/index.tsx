import { Container, Typography } from "@mui/material";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { staffAccountAtom } from "../../atoms/staffAccountAtom";
import GiveTicketSalesView from "./GiveTicketSalesView";

/**
 * �~��-�d�߽�X�q��/�����
 */
export default function GiveSellQuery() {
  const acct = useAtomValue(staffAccountAtom)

  const sales = useMemo(() => ({
    salesId: acct.loginUserId,
    salesName: acct.loginUserName
  }), [acct])

  return (
    <Container maxWidth='sm'>
      {/* �~��/�P��d�� */}
      <Typography variant='h5'>Sales Records</Typography>

      {sales && <GiveTicketSalesView sales={sales} />}
    </Container>
  );
}

import { Paper, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material'
import type { IBuyerProfile } from "../../RaffleSell/dto/IBuyerProfile";

export default function BuyerProfileTableWidget(props: {
  buyer: IBuyerProfile
}) {
  const { buyer } = props;

  return (
    <TableContainer component={Paper} sx={{ mb: 2 }}>
      <Table size='small'  >
        <TableBody>
          <TableRow>
            <TableCell component="th" scope="row">買家名稱</TableCell>
            <TableCell>{buyer.buyerName}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">電郵地址</TableCell>
            <TableCell>{buyer.buyerEmail}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell component="th" scope="row">聯絡電話</TableCell>
            <TableCell>{buyer.buyerPhone}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  )
}

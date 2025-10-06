import { Paper, styled, Table, TableBody, TableCell, tableCellClasses, TableContainer, TableHead, TableRow } from "@mui/material";

/**
 * 只顯示結果
 */
export default function AskRecordLister(props: {
  recordList: IOpenAskRecord[]
}) {
  const { recordList } = props

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 220px)' }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <HeadCell align='center'>SN.</HeadCell>
            <HeadCell align='center'>Paddle No</HeadCell>
            {/* <HeadCell>VIP Name</HeadCell> */}
            <HeadCell>Staff 1</HeadCell>
            <HeadCell>Staff 2</HeadCell>
            <HeadCell>Status</HeadCell>
            <HeadCell>Dtm1</HeadCell>
            <HeadCell>Dtm2</HeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.isArray(recordList) && recordList.map((item) => (
            <TableRow key={item.ssn}>
              <TableCell align='center'>{item.ssn}</TableCell>
              <TableCell align='center' sx={item.status === 'Pending' ? { color: 'info.main', fontWeight: 600 } : { color: 'text.primary' }} >
                {item.paddleNum}
              </TableCell>
              {/* <TableCell>{item.paddleName}</TableCell> */}
              <TableCell>{item.recordStaff1}</TableCell>
              <TableCell>{item.recordStaff2}</TableCell>
              <TableCell sx={{ color: item.status === 'Confirmed' ? 'success.main' : 'text.secondary' }}>
                {item.status}
              </TableCell>
              <TableCell>{item.recordDtm1}</TableCell>
              <TableCell>{item.recordDtm2}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

//-----------------------------------------------------------------------------
/**
 * <th>: The Table Header element
 * ref→(https://mui.com/material-ui/react-table/#customization)
 */
const HeadCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText
  },
}));

//-----------------------------------------------------------------------------
/**
 * <td>: The Table Data Cell element
 * ref→(https://mui.com/material-ui/react-table/#customization)
 */
//const DataCell = styled(TableCell)(({ theme: _ }) => ({
//  [`&.${tableCellClasses.body}`]: {
//    fontSize: '1rem',
//  },
//}));

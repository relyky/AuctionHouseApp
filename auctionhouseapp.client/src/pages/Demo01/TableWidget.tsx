import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { tableCellClasses } from '@mui/material/TableCell';
import { styled } from '@mui/material/styles';
import type { IWeatherForecast } from '../../dto/IWeatherForecast';

export default function TableWidget(props: {
  forecasts: IWeatherForecast[]
}) {
  const { forecasts } = props;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <HeadCell>Date</HeadCell>
            <HeadCell align="right">Temp. (C)</HeadCell>
            <HeadCell align="right">Temp. (F)</HeadCell>
            <HeadCell>Summary</HeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.isArray(forecasts) && forecasts.map((item, i) => (
            <TableRow key={i}>
              <DataCell>{item.date}</DataCell>
              <DataCell align="right">{item.temperatureC}</DataCell>
              <DataCell align="right">{item.temperatureF}</DataCell>
              <DataCell>{item.summary}</DataCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

//-----------------------------------------------------------------------------
/**
 * <th>: The Table Header element
 * ref¡÷(https://mui.com/material-ui/react-table/#customization)
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
 * ref¡÷(https://mui.com/material-ui/react-table/#customization)
 */
const DataCell = styled(TableCell)(({ theme: _ }) => ({
  [`&.${tableCellClasses.body}`]: {
    fontSize: '1rem',
  },
}));

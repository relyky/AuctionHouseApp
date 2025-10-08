import {
  Box,
  Button,
  Checkbox,
  Container,
  OutlinedInput,
  Paper,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
  styled,
  useEventCallback,
  Chip,
} from '@mui/material';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { closingPaymentAtom } from './atom';
import type { IPaymentTransaction } from './atom';
import useFormHand from './useFormHand';

export default function ListView() {
  const [{ paddleNum, paddleName, dataList, selectedItems, mode }, setFormState] = useAtom(closingPaymentAtom);
  const handler = useFormHand();
  const [keyword, setKeyword] = useState('');

  const handleSearch = useEventCallback(() => {
    handler.searchVip(keyword);
    console.log(unpaidItems);
  });

  const handleToggleItem = useEventCallback((transactionId: string) => {
    setFormState(prev => {
      const newSelected = new Set(prev.selectedItems);
      if (newSelected.has(transactionId)) {
        newSelected.delete(transactionId);
      } else {
        newSelected.add(transactionId);
      }
      return { ...prev, selectedItems: newSelected };
    });
  });

  const handleBatchPayment = useEventCallback(() => {
    const selectedTransactions = dataList.filter(item =>
      selectedItems.has(item.transactionId) && item.status === 'Unpaid'
    );
    const totalAmount = selectedTransactions.reduce((sum, item) => sum + item.amount, 0);
    handler.batchUpdatePayment(selectedItems, totalAmount, dataList);
  });

  const handleEdit = useEventCallback((item: IPaymentTransaction) => {
    handler.getFormData(item);
    setFormState(prev => ({ ...prev, mode: 'Edit', dataAim: item }));
  });

  // 分類交易記錄
  const unpaidItems = dataList.filter(item => item.status === 'Unpaid');
  const partialItems = dataList.filter(item => item.status === 'Partial');
  const paidItems = dataList.filter(item => item.status === 'Paid');

  // 計算選中的金額
  const selectedAmount = dataList
    .filter(item => selectedItems.has(item.transactionId))
    .reduce((sum, item) => sum + item.amount, 0);

  // 計算總金額
  const totalUnpaid = unpaidItems.reduce((sum, item) => sum + item.amount, 0);
  const totalPartial = partialItems.reduce((sum, item) => sum + (item.amount - (item.paidAmount || 0)), 0);
  const totalPaid = paidItems.reduce((sum, item) => sum + item.amount, 0);

  if (mode !== 'List') return null;

  return (
    <Container maxWidth="xl">
      <Typography variant="h5" gutterBottom>
        結帳項目註記
      </Typography>

      <Toolbar sx={{ gap: 1, px: 0 }}>
        <OutlinedInput
          placeholder="Paddle No. / Name"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          size="small"
          autoFocus
        />
        <Button onClick={handleSearch} variant="contained">
          查詢
        </Button>
      </Toolbar>

      {paddleNum && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">
            {paddleName} ({paddleNum})
          </Typography>
        </Box>
      )}

      {/* 未付款項目 */}
      {unpaidItems.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" color="error">
              未付款項目 (總計: ${totalUnpaid.toLocaleString()})
            </Typography>
            {selectedItems.size > 0 && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="body2">
                  已選擇: ${selectedAmount.toLocaleString()}
                </Typography>
                <Button variant="contained" color="success" onClick={handleBatchPayment}>
                  確認收款
                </Button>
              </Box>
            )}
          </Box>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableHeadCell width={50}>
                    <Checkbox
                      checked={unpaidItems.every(item => selectedItems.has(item.transactionId))}
                      indeterminate={
                        unpaidItems.some(item => selectedItems.has(item.transactionId)) &&
                        !unpaidItems.every(item => selectedItems.has(item.transactionId))
                      }
                      onChange={e => {
                        if (e.target.checked) {
                          setFormState(prev => ({
                            ...prev,
                            selectedItems: new Set([...prev.selectedItems, ...unpaidItems.map(i => i.transactionId)]),
                          }));
                        } else {
                          setFormState(prev => {
                            const newSet = new Set(prev.selectedItems);
                            unpaidItems.forEach(i => newSet.delete(i.transactionId));
                            return { ...prev, selectedItems: newSet };
                          });
                        }
                      }}
                    />
                  </TableHeadCell>
                  <TableHeadCell>類型</TableHeadCell>
                  <TableHeadCell>項目</TableHeadCell>
                  <TableHeadCell align="right">金額</TableHeadCell>
                  <TableHeadCell>時間</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {unpaidItems.map(item => (
                  <TableRow key={item.transactionId}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.has(item.transactionId)}
                        onChange={() => handleToggleItem(item.transactionId)}
                      />
                    </TableCell>
                    <TableCell>{getTypeLabel(item.type)}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align="right">${item.amount.toLocaleString()}</TableCell>
                    <TableCell>{item.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* 部分付款項目 */}
      {partialItems.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" color="warning.main" gutterBottom>
            部分付款項目 (剩餘: ${totalPartial.toLocaleString()})
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableHeadCell>類型</TableHeadCell>
                  <TableHeadCell>項目</TableHeadCell>
                  <TableHeadCell align="right">總金額</TableHeadCell>
                  <TableHeadCell align="right">已付</TableHeadCell>
                  <TableHeadCell align="right">剩餘</TableHeadCell>
                  <TableHeadCell>時間</TableHeadCell>
                  <TableHeadCell>操作</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {partialItems.map(item => (
                  <TableRow key={item.transactionId}>
                    <TableCell>{getTypeLabel(item.type)}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align="right">${item.amount.toLocaleString()}</TableCell>
                    <TableCell align="right">${(item.paidAmount || 0).toLocaleString()}</TableCell>
                    <TableCell align="right">${(item.amount - (item.paidAmount || 0)).toLocaleString()}</TableCell>
                    <TableCell>{item.time}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleEdit(item)}>
                        編輯
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* 已付款項目 */}
      {paidItems.length > 0 && (
        <Box>
          <Typography variant="h6" color="success.main" gutterBottom>
            已付款項目 (總計: ${totalPaid.toLocaleString()})
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableHeadCell>類型</TableHeadCell>
                  <TableHeadCell>項目</TableHeadCell>
                  <TableHeadCell align="right">金額</TableHeadCell>
                  <TableHeadCell>時間</TableHeadCell>
                  <TableHeadCell>狀態</TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paidItems.map(item => (
                  <TableRow key={item.transactionId}>
                    <TableCell>{getTypeLabel(item.type)}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align="right">${item.amount.toLocaleString()}</TableCell>
                    <TableCell>{item.time}</TableCell>
                    <TableCell>
                      <Chip label="已付款" color="success" size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {dataList.length === 0 && paddleNum && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">此 VIP 尚無交易記錄</Typography>
        </Box>
      )}
    </Container>
  );
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'liveAuction':
      return 'Live Auction';
    case 'silentAuction':
      return 'Silent Auction';
    case 'openAsk':
      return 'Open Ask';
    case 'donation':
      return 'Donation';
    default:
      return type;
  }
}

const TableHeadCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
}));

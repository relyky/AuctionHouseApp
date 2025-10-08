import { useAtom } from 'jotai';
import { useEventCallback } from '@mui/material';
import { closingPaymentAtom } from './atom';
import type { IPaymentTransaction } from './atom';
import { postData } from '../../tools/httpHelper';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import type { ICommonResult } from '../../dto/activities/ICommonResult';

export default function useFormHand() {
  const [, setFormState] = useAtom(closingPaymentAtom);

  /**
   * 查詢 VIP 的所有交易記錄
   */
  const qryDataList = useEventCallback(async (paddleNum: string) => {
    try {
      // 使用 GET 方法取得交易摘要,傳入 paddleNum 參數
      const response = await fetch(`/api/transactions/summary?paddleNum=${encodeURIComponent(paddleNum)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const resp = await response.json();

      if (resp.success && resp.data) {
        const transactions = resp.data.transactions || [];

        setFormState(prev => ({
          ...prev,
          paddleNum: paddleNum,
          dataList: transactions,
        }));
      } else {
        toast.error(resp.message || '查詢失敗');
      }
    } catch (err) {
      console.error('qryDataList error:', err);
      toast.error('查詢失敗');
    }
  });

  /**
   * 搜尋 VIP 並載入交易記錄
   * 注意:目前這個功能需要工作人員權限來查詢指定 VIP 的資料
   * 如果是 VIP 自己登入,應該直接載入自己的交易記錄
   */
  const searchVip = useEventCallback(async (keyword: string) => {
    try {
      // 直接使用 keyword 作為 paddleNum 載入交易記錄
      // 實際應用中可能需要先驗證此 paddleNum 是否存在
      setFormState(prev => ({
        ...prev,
        paddleNum: keyword,
        paddleName: '', // 需要從交易記錄中取得
        keyword: keyword,
      }));

      // 載入該 VIP 的交易記錄
      await qryDataList(keyword);
    } catch (err) {
      console.error('searchVip error:', err);
      toast.error('搜尋失敗');
    }
  });

  /**
   * 取得單筆交易資料以進行編輯
   */
  const getFormData = useEventCallback(async (transaction: any) => {
    setFormState(prev => ({
      ...prev,
      formData: {
        type: transaction.type,
        transactionId: transaction.transactionId,
        name: transaction.name,
        amount: transaction.amount,
        paymentStatus: transaction.status || 'unpaid',
        paidAmount: transaction.paidAmount || 0,
        paymentNotes: '',
      },
    }));
  });

  /**
   * 更新付款狀態
   */
  const updFormSubmit = useEventCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // 從狀態中獲取 paddleNum
    let currentPaddleNum = '';
    setFormState(prev => {
      currentPaddleNum = prev.paddleNum;
      return prev;
    });

    const data = {
      paddleNum: currentPaddleNum,
      type: formData.get('type') as string,
      transactionId: formData.get('transactionId') as string,
      paymentStatus: formData.get('paymentStatus') as string,
      paidAmount: Number(formData.get('paidAmount')),
      paymentNotes: formData.get('paymentNotes') as string || '',
    };

    try {
      const resp = await postData<ICommonResult<any>>('/api/transactions/updatePayment', data);

      if (resp.success) {
        toast.success(resp.data?.message || '更新成功');
        setFormState(prev => ({
          ...prev,
          mode: 'List',
          formData: null,
        }));

        // 重新載入資料
        await qryDataList(currentPaddleNum);
      } else {
        toast.error(resp.message || '更新失敗');
      }
    } catch (err) {
      console.error('updFormSubmit error:', err);
      toast.error('更新失敗');
    }
  });

  /**
   * 批次更新選中的項目為已付款
   */
  const batchUpdatePayment = useEventCallback(async (selectedItems: Set<string>, totalAmount: number, dataList: IPaymentTransaction[]) => {
    try {
      const result = await Swal.fire({
        title: '確認付款',
        html: `總金額: <strong>$${totalAmount.toLocaleString()}</strong><br/>是否確認已收款?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '確認付款',
        cancelButtonText: '取消',
      });

      if (!result.isConfirmed) return;

      // 從狀態中獲取 paddleNum
      let currentPaddleNum = '';
      setFormState(prev => {
        currentPaddleNum = prev.paddleNum;
        return prev;
      });

      // 將 Set 轉換為 API 需要的格式
      const transactions = Array.from(selectedItems).map(transactionId => {
        const item = dataList.find(t => t.transactionId === transactionId);
        return {
          type: item?.type || '',
          transactionId: transactionId,
        };
      });

      const resp = await postData<ICommonResult<any>>('/api/transactions/batchUpdatePayment', {
        paddleNum: currentPaddleNum,
        transactions,
        paymentStatus: 'paid',
        paymentNotes: `批次付款 - ${new Date().toLocaleString()}`,
      });

      if (resp.success) {
        toast.success(resp.data?.message || '批次更新成功');
        setFormState(prev => ({
          ...prev,
          selectedItems: new Set(),
        }));

        // 重新載入資料
        await qryDataList(currentPaddleNum);
      } else {
        toast.error(resp.message || '批次更新失敗');
      }
    } catch (err) {
      console.error('batchUpdatePayment error:', err);
      toast.error('批次更新失敗');
    }
  });

  return {
    qryDataList,
    searchVip,
    getFormData,
    updFormSubmit,
    batchUpdatePayment,
  };
}

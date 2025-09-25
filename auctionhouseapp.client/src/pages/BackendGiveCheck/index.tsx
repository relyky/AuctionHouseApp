import { Alert, Box, Button, Checkbox, Container, Divider, FormControlLabel, LinearProgress, Stack, Typography, useEventCallback } from "@mui/material";
import { useEffect, useMemo, useState, type FC } from "react";
import type { ISalesCodeName } from "../BackendRaffleCheck/dto/ISalesCodeName";
import SalesAutocomplete from "../BackendRaffleCheck/widgets/SalesAutocomplete";
import { postData, ResponseError } from "../../tools/httpHelper";
import GiveOrderSoldSummaryWidget from "./widgets/GiveOrderSoldSummaryWidget";
import GiveOrderSoldTableWidget from "./widgets/GiveOrderSoldTableWidget";
import type { ICheckGiveOrdersArgs } from "./dto/ICheckGiveOrdersArgs";

/**
 * �ֳU�����P�⦬�O�d�� 
 * �~�ȧ⦬�쪺���浹�g�z��A�g�z���ĽT�{�C
 */

export default function BackendGiveCheck() {
  const [sales, setSales] = useState<ISalesCodeName | null>(null)
  const [orderList, setOrderList] = useState<IGiveOrder[]>([])
  const [isConfirm, setIsConfirm] = useState(false)
  const [f_loading, setLoading] = useState(false);
  //const [errMsg, setErrMsg] = useState<string | null>(null)
  const [msgObj, setMsgObj] = useState<MsgObj | null>(null)

  // �P�_�w���\ => ���i��U�@��
  const isSuccessDone = useMemo(() => {
    return msgObj?.severity === 'success';
  }, [msgObj]);

  const handleSubmit = useEventCallback(async () => {
    try {
      setLoading(true);
      setMsgObj(null); // ���M�����~�T��

      const args: ICheckGiveOrdersArgs = {
        orderNoList: orderList.map(o => o.giveOrderNo)
      };

      const msg = await postData<MsgObj>(`/api/BackendRaffleCheck/CheckGiveOrders`, args);
      console.info('handleSubmit done', { msg });

      setMsgObj(msg)
      //setFormState(prev => ({ ...prev, mode: 'Step3', raffleOrder: data }))
    } catch (error) {
      if (error instanceof ResponseError) {
        console.error('handleSubmit ResponseError', error.message);
        setMsgObj({ severity: 'error', message: error.message })
      }
      else {
        console.error('handleSubmit error', { error });
        setMsgObj({ severity: 'error', message: "�X�{�w�����~�����~�гq���t�Τu�{�v�C" + error });
      }
    } finally {
      setLoading(false)
    }
  });


  return (
    <Container maxWidth='sm'>
      {/* �����P��d�� */}
      <Typography variant='h5' gutterBottom>Give to Win Ticket Sales Verification</Typography>
      {/* �~�ȧ⦬�쪺���浹�g�z��A�g�z���ĽT�{�C */}
      <Box>The finance staff will verify and confirm the amount.</Box>

      {/* ����~�� */}
      <SalesAutocomplete onChange={(sales) => {
        setSales(sales)
        // reset UI
        setIsConfirm(false)
        setMsgObj(null)
      }} />

      {/* ��ܾP�⪬�p */}
      <GiveOrderList sales={sales}
        orderList={orderList}
        setOrderList={setOrderList}
      />

      {/* �d�禬�����B */}
      <Divider sx={{ my: 1 }} />

      {/* CommandBar */}
      {!isSuccessDone && Array.isArray(orderList) && orderList.length > 0 &&
        <Stack spacing={2} alignItems='center'>

          {/* �w�d��~�Ŀ� */}
          <FormControlLabel label="Verified and Confirmed" sx={{ flexGrow: 1 }}
            control={<Checkbox
              checked={isConfirm}
              onChange={(_, chk) => setIsConfirm(chk)} />}
          />

          {/* �d��T�{ */}
          <Button variant='contained'
            color='primary'
            loading={f_loading} disabled={!isConfirm}
            onClick={handleSubmit}
          >Confirm</Button>
        </Stack>
      }

      {msgObj &&
        <Alert severity={msgObj.severity || 'info'} sx={{ m: 3 }}>
          {msgObj.message}
        </Alert>}

      {/* tail */}
      <Box sx={{ pb: 3 }}></Box>
    </Container>
  );
}

//-------------------------------------
const GiveOrderList: FC<{
  sales: ISalesCodeName | null
  orderList: IGiveOrder[]
  setOrderList: (orderList: IGiveOrder[]) => void
}> = (props) => {
  const { orderList, setOrderList } = props
  const [f_loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null)

  const handleLoadSalesSoldGiveOrder = useEventCallback(() => {
    if (!props.sales) {
      setOrderList([])
      return
    }

    setLoading(true)
    setErrMsg(null)
    postData<IGiveOrder[]>(`/api/BackendRaffleCheck/LoadSalesSoldGiveOrder/${props.sales.salesId}`)
      .then((data) => {
        setOrderList(data)
      }).catch(error => {
        if (error instanceof ResponseError) {
          console.error('handleLoadSalesSoldGiveOrder ResponseError', error.message);
          setErrMsg(error.message)
        }
        else {
          console.error('handleLoadSalesSoldGiveOrder error', { error });
          setErrMsg("�X�{�w�����~�����~�гq���t�Τu�{�v�C" + error);
        }
      }).finally(() => {
        setLoading(false)
      })
  })

  useEffect(() => {
    handleLoadSalesSoldGiveOrder();
  }, [props.sales])

  //# to render 
  {/*  ����ܭt�d�~�ȡC */ }
  if (!props.sales) {
    return <></>
    // return <Alert severity="info">
    //  ����ܭt�d�~�ȡC
    // </Alert>
  }

  {/* �L�q���� */ }
  if (!orderList || orderList.length === 0) {
    return <Alert severity="info">
      No new data.
    </Alert>
  }

  return (
    <>
      {f_loading && <LinearProgress color='info' />}
      {errMsg && <Alert severity='error'>{errMsg}</Alert>}

      <GiveOrderSoldSummaryWidget orderList={orderList} />

      <GiveOrderSoldTableWidget orderList={orderList} />
    </>
  )
}


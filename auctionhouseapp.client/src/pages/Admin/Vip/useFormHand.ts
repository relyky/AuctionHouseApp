import { useSetAtom } from "jotai";
import { useCallback, useMemo, type FormEvent } from "react";
import Swal from "sweetalert2";
import { blockingAtom } from "../../../atoms/metaAtom";
import { postData, ResponseError } from "../../../tools/httpHelper";
import { delayPromise } from "../../../tools/utils";
import { adminVipAtom } from "./atom";

export default function AdminVip_Handler() {
  const setFormState = useSetAtom(adminVipAtom)
  const setBlocking = useSetAtom(blockingAtom)

  // ������ call Promise
  const qryDataList = useCallback(async (keyword: string) => {
    try {
      setBlocking(true)
      const dataList = await postData<IVip[]>(`/api/vip/search?q=${keyword}`)
      setFormState(prev => ({ ...prev, dataList }))
    } catch (error) {
      console.error(error);
      if (error instanceof ResponseError)
        Swal.fire('Error!', error.message, 'error')
      else
        Swal.fire('Exception!', "�X�{�w�����~�����~�гq���t�Τu�{�v�C" + error, 'error')
    } finally {
      await delayPromise(800)
      setBlocking(false)
    }
  }, [postData, setFormState])

  const addFormSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setBlocking(true)
      const formValues = new FormData(event.currentTarget);
      const info: IVip = {
        paddleNum: String(formValues.get('paddleNum')) ?? '',
        vipName: String(formValues.get('vipName')) ?? '',
        vipEmail: String(formValues.get('vipEmail')) ?? '',
        vipPhone: String(formValues.get('vipPhone')) ?? '',
        tableNumber: String(formValues.get('tableNumber')) ?? '',
        seatNumber: String(formValues.get('seatNumber')) ?? '',
        isEnterprise: 'on' === (String(formValues.get('isEnterprise')) ?? '') ? 'Y' : 'N',
        receiptHeader: String(formValues.get('receiptHeader')) ?? '',
        taxNum: String(formValues.get('taxNum')) ?? '',
      }

      const newData = await postData<IVip>(`/api/vip/create`, info)

      // SUCCESS
      setFormState(prev => ({
        ...prev
        , dataList: [newData, ...prev.dataList] // �s�W��J�Ĥ@��
        , dataAim: newData
        , formData: null
        , mode: 'Edit'
      }))

      Swal.fire('Success', 'Create seccess.', 'success');
    } catch (error) {
      console.error(error);
      if (error instanceof ResponseError)
        Swal.fire('Error!', error.message, 'error')
      else
        Swal.fire('Exception!', "�X�{�w�����~�����~�гq���t�Τu�{�v�C" + error, 'error')
    } finally {
      await delayPromise(800)
      setBlocking(false)
    }
  }, [])

  const getFormData = useCallback(async (id: string) => {
    try {
      setBlocking(true)
      const formData = await postData<IVip>(`/api/vip/read/${id}`)
      setFormState(prev => ({ ...prev, formData }))
    } catch (error) {
      console.error(error);
      if (error instanceof ResponseError)
        Swal.fire('Error!', error.message, 'error')
      else
        Swal.fire('Exception!', "�X�{�w�����~�����~�гq���t�Τu�{�v�C" + error, 'error')
    } finally {
      await delayPromise(800)
      setBlocking(false)
    }
  }, [postData, setFormState])

  const updFormSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setBlocking(true)
      const formValues = new FormData(event.currentTarget);
      const info: IVip = {
        paddleNum: String(formValues.get('paddleNum')) ?? '',
        vipName: String(formValues.get('vipName')) ?? '',
        vipEmail: String(formValues.get('vipEmail')) ?? '',
        vipPhone: String(formValues.get('vipPhone')) ?? '',
        tableNumber: String(formValues.get('tableNumber')) ?? '',
        seatNumber: String(formValues.get('seatNumber')) ?? '',
        isEnterprise: 'on' === (String(formValues.get('isEnterprise')) ?? '') ? 'Y' : 'N',
        receiptHeader: String(formValues.get('receiptHeader')) ?? '',
        taxNum: String(formValues.get('taxNum')) ?? '',
      }

      const formData = await postData<IVip>(`/api/vip/update`, info)

      // SUCCESS
      setFormState(prev => ({
        ...prev
        , formData // ��s
        , dataList: prev.dataList.map(c => c.paddleNum === formData.paddleNum ? formData : c) // ��s�M��
      }))

      Swal.fire('Success','Update seccess.','success');
    } catch (error) {
      console.error(error);
      if (error instanceof ResponseError)
        Swal.fire('Error!', error.message, 'error')
      else
        Swal.fire('Exception!', "�X�{�w�����~�����~�гq���t�Τu�{�v�C" + error, 'error')
    } finally {
      await delayPromise(800)
      setBlocking(false)
    }
  }, [])

  const delFormData = useCallback(async (id: string) => {
    try {
      setBlocking(true)
      const msg = await postData<MsgObj>(`/api/vip/delete/${id}`)
      setFormState(prev => ({
        ...prev
        , dataList: prev.dataList.filter(c => c.paddleNum !== id) // �����R��������
        , formData: null
        , mode: 'List'
      }))

      Swal.fire('Success', 'Delete seccess.', 'success');
    } catch (error) {
      console.error(error);
      if (error instanceof ResponseError)
        Swal.fire('Error!', error.message, 'error')
      else
        Swal.fire('Exception!', "�X�{�w�����~�����~�гq���t�Τu�{�v�C" + error, 'error')
    } finally {
      await delayPromise(800)
      setBlocking(false)
    }
  }, [])

  // �^�� handlers
  return useMemo(() =>
    ({ qryDataList, addFormSubmit, getFormData, updFormSubmit, delFormData }),
    [qryDataList, addFormSubmit, getFormData, updFormSubmit, delFormData]);
}
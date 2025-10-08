import { atom } from 'jotai';

export type PaymentEditMode = 'List' | 'Edit';

export interface IPaymentTransaction {
  type: 'liveAuction' | 'silentAuction' | 'openAsk' | 'donation';
  transactionId: string;
  name: string;
  amount: number;
  status: string;
  paidAmount?: number;
  time: string;
}

export interface IPaymentFormState {
  mode: PaymentEditMode;
  keyword: string;
  paddleNum: string;
  paddleName: string;
  dataList: IPaymentTransaction[];
  selectedItems: Set<string>; // Set of transactionId
  dataAim: IPaymentTransaction | null;
  formData: IPaymentFormData | null;
}

export interface IPaymentFormData {
  type: string;
  transactionId: string;
  name: string;
  amount: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  paidAmount: number;
  paymentNotes: string;
}

export const closingPaymentAtom = atom<IPaymentFormState>({
  mode: 'List',
  keyword: '',
  paddleNum: '',
  paddleName: '',
  dataList: [],
  selectedItems: new Set<string>(),
  dataAim: null,
  formData: null,
});

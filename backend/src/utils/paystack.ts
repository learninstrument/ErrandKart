import { env } from '../config/env.js';
import { HttpError } from './http-error.js';

type PaystackRecipientResponse = {
  status: boolean;
  message?: string;
  data?: {
    recipient_code: string;
  };
};

type PaystackTransferResponse = {
  status: boolean;
  message?: string;
  data?: Record<string, unknown>;
};

type PaystackResolveResponse = {
  status: boolean;
  message?: string;
  data?: {
    account_number: string;
    account_name: string;
    bank_id: number;
  };
};

export const createRecipient = async (payload: {
  name: string;
  accountNumber: string;
  bankCode: string;
}) => {
  const response = await fetch('https://api.paystack.co/transferrecipient', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'nuban',
      name: payload.name,
      account_number: payload.accountNumber,
      bank_code: payload.bankCode,
      currency: 'NGN',
    }),
  });

  const data = (await response.json().catch(() => ({}))) as PaystackRecipientResponse;

  if (!response.ok || !data.status || !data.data?.recipient_code) {
    throw new HttpError(502, data.message ?? 'Failed to create Paystack recipient');
  }

  return data.data.recipient_code;
};

export const initiateTransfer = async (payload: { amount: number; recipientCode: string; reference: string }) => {
  const response = await fetch('https://api.paystack.co/transfer', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: 'balance',
      amount: Math.round(payload.amount * 100), // Paystack expects kobo
      recipient: payload.recipientCode,
      reason: 'ErrandKart Payment',
      reference: payload.reference,
    }),
  });

  const data = (await response.json().catch(() => ({}))) as PaystackTransferResponse;

  if (!response.ok || !data.status) {
    throw new HttpError(502, data.message ?? 'Paystack transfer failed');
  }

  return data.data ?? null;
};

export const resolveAccountNumber = async (accountNumber: string, bankCode: string) => {
  const response = await fetch(`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
    },
  });

  const data = (await response.json().catch(() => ({}))) as PaystackResolveResponse;

  if (!response.ok || !data.status || !data.data) {
    throw new HttpError(400, data.message ?? 'Failed to resolve account number. Check the details and try again.');
  }

  return data.data;
};

export const getBanks = async () => {
  const response = await fetch('https://api.paystack.co/bank?country=nigeria', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
    },
  });

  const data = await response.json().catch(() => ({}));
  
  if (!response.ok || !data.status) {
    throw new HttpError(500, 'Failed to fetch bank list');
  }

  return data.data;
};

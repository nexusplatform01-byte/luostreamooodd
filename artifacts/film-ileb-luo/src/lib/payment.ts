const API = 'https://function-bun-production-b22d.up.railway.app';
const WITHDRAW_FEE = 2500;

export { WITHDRAW_FEE };

export function makeRef(prefix = 'luostream'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function formatUgPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('256')) return `+${digits}`;
  if (digits.startsWith('0') && digits.length === 10) return `+256${digits.slice(1)}`;
  if (digits.length === 9) return `+256${digits}`;
  return `+256${digits}`;
}

export type DepositResult = {
  success: boolean;
  internal_reference?: string;
  message?: string;
  [key: string]: any;
};

export type StatusResult = {
  success: boolean;
  request_status?: string;
  status?: string;
  internal_reference?: string;
  customer_reference?: string;
  msisdn?: string;
  amount?: number;
  provider?: string;
  message?: string;
  [key: string]: any;
};

export type WithdrawResult = {
  success: boolean;
  internal_reference?: string;
  request_status?: string;
  message?: string;
  [key: string]: any;
};

export async function apiDeposit(
  msisdn: string,
  amount: number,
  description: string,
): Promise<DepositResult & { reference: string }> {
  const reference = makeRef('luostream');
  const res = await fetch(`${API}/api/deposit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ msisdn, amount, reference, description }),
  });
  const data: DepositResult = await res.json();
  return { ...data, reference };
}

export async function apiPollStatus(internalReference: string): Promise<StatusResult> {
  const res = await fetch(
    `${API}/api/request-status?internal_reference=${encodeURIComponent(internalReference)}`,
  );
  return res.json();
}

export async function apiValidatePhone(msisdn: string): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${API}/api/validate-phone`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ msisdn }),
  });
  return res.json();
}

export async function apiWithdraw(
  msisdn: string,
  amount: number,
  description: string,
): Promise<WithdrawResult & { reference: string }> {
  const reference = makeRef('luostream');
  const res = await fetch(`${API}/api/withdraw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ msisdn, amount, reference, description }),
  });
  const data: WithdrawResult = await res.json();
  return { ...data, reference };
}

export async function apiGetTransactions(): Promise<any[]> {
  const res = await fetch(`${API}/api/transactions`);
  const data = await res.json();
  const list: any[] = Array.isArray(data) ? data : (data?.data ?? data?.transactions ?? []);
  return list.filter((t: any) => {
    const ref: string = t.customer_reference || t.reference || t.internal_reference || '';
    return ref.toLowerCase().startsWith('luostream');
  });
}

export function isPaymentSuccess(status: StatusResult): boolean {
  return status.request_status === 'success';
}

export function isPaymentFailed(status: StatusResult): boolean {
  if (!status.success && status.request_status !== 'pending' && status.request_status !== 'processing') return true;
  return status.request_status === 'failed' || status.request_status === 'error';
}

export function detectProvider(rawPhone: string): 'mtn' | 'airtel' | null {
  const digits = rawPhone.replace(/\D/g, '');
  const local = digits.startsWith('256') ? digits.slice(3) : digits.startsWith('0') ? digits.slice(1) : digits;
  const p2 = local.slice(0, 2);
  if (['77', '78', '39'].includes(p2)) return 'mtn';
  if (['70', '75', '74'].includes(p2)) return 'airtel';
  return null;
}

export function getDepositError(result: any): string {
  return result?.details?.message || result?.details?.error || result?.message || result?.error || 'Payment could not be initiated. Please try again.';
}

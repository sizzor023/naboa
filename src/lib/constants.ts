export interface DeliveryZoneOption {
  id: string;
  label: string;
  areaHint: string;
  feeUgx: number;
  etaMinutes: number;
}

export const DELIVERY_ZONES: DeliveryZoneOption[] = [
  {
    id: 'pickup',
    label: 'Naboa Centre Pickup (Courtyard Desk)',
    areaHint: 'Collect in person at Courtyard Desk, Naboa Road',
    feeUgx: 0,
    etaMinutes: 15,
  },
  {
    id: 'mbale-central',
    label: 'Mbale Central & Naboa Road',
    areaHint: 'Republic Street, Cathedral Ave, Clock Tower, Bus Park',
    feeUgx: 3000,
    etaMinutes: 25,
  },
  {
    id: 'senior-quarters',
    label: 'Senior Quarters & Milly',
    areaHint: 'Senior Quarters, Indian Quarters, Elgon Hospital Ridge',
    feeUgx: 5000,
    etaMinutes: 35,
  },
  {
    id: 'nkoma-namakwekwe',
    label: 'Nkoma & Namakwekwe',
    areaHint: 'Nkoma Estate, IUIU Campus Road, Namakwekwe',
    feeUgx: 6000,
    etaMinutes: 40,
  },
  {
    id: 'wanale-industrial',
    label: 'Wanale Foothills & Industrial Area',
    areaHint: 'Wanale Ridge, Mooni, Mbale Industrial Park',
    feeUgx: 8000,
    etaMinutes: 50,
  },
];

export type PaymentMethod = 'mtn_momo' | 'airtel_money' | 'cash_on_delivery';

export const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  subtitle: string;
  requiresPhone: boolean;
  prefixHint: string;
}[] = [
  {
    id: 'mtn_momo',
    label: 'MTN MoMo',
    subtitle: 'Instant MoMo Pay prompt sent to your MTN line',
    requiresPhone: true,
    prefixHint: 'e.g. 0772 418 290 or 078...',
  },
  {
    id: 'airtel_money',
    label: 'Airtel Money',
    subtitle: 'Fast Airtel Money merchant confirmation',
    requiresPhone: true,
    prefixHint: 'e.g. 0702 519 840 or 075...',
  },
  {
    id: 'cash_on_delivery',
    label: 'Cash on Delivery',
    subtitle: 'Pay in Uganda Shillings when our Mbale rider arrives',
    requiresPhone: false,
    prefixHint: '',
  },
];

export const CENTRE_OPENING_HOURS = [
  { days: 'Monday – Friday', hours: '07:30 – 21:00' },
  { days: 'Saturday', hours: '08:00 – 21:30' },
  { days: 'Sunday & Public Holidays', hours: '09:00 – 19:00' },
];

export function formatUgx(amount: number): string {
  return `UGX ${Math.round(amount).toLocaleString('en-UG')}`;
}

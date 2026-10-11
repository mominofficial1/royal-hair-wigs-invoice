export interface Currency {
  code: string;
  symbol: string;
  label: string;
  decimals: number;
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', label: 'USD — US Dollar ($)', decimals: 2 },
  { code: 'BDT', symbol: '৳', label: 'BDT — Bangladeshi Taka (৳)', decimals: 2 },
  { code: 'INR', symbol: '₹', label: 'INR — Indian Rupee (₹)', decimals: 2 },
  { code: 'EUR', symbol: '€', label: 'EUR — Euro (€)', decimals: 2 },
  { code: 'GBP', symbol: '£', label: 'GBP — British Pound (£)', decimals: 2 },
  { code: 'AED', symbol: 'د.إ', label: 'AED — UAE Dirham (د.إ)', decimals: 2 },
  { code: 'SAR', symbol: 'ر.س', label: 'SAR — Saudi Riyal (ر.س)', decimals: 2 },
  { code: 'CAD', symbol: 'C$', label: 'CAD — Canadian Dollar (C$)', decimals: 2 },
  { code: 'AUD', symbol: 'A$', label: 'AUD — Australian Dollar (A$)', decimals: 2 },
  { code: 'PKR', symbol: '₨', label: 'PKR — Pakistani Rupee (₨)', decimals: 2 },
  { code: 'JPY', symbol: '¥', label: 'JPY — Japanese Yen (¥)', decimals: 0 },
  { code: 'CNY', symbol: '¥', label: 'CNY — Chinese Yuan (¥)', decimals: 2 },
  { code: 'LKR', symbol: 'Rs', label: 'LKR — Sri Lankan Rupee (Rs)', decimals: 2 },
];

export interface InvoiceColumn {
  id: string;
  key: string;
  label: string;
  visible: boolean;
  isCustom?: boolean;
}

export const DEFAULT_COLUMNS: InvoiceColumn[] = [
  { id: 'col-name', key: 'name', label: 'Product Name', visible: true },
  { id: 'col-color', key: 'hairColour', label: 'Hair colour', visible: true },
  { id: 'col-size', key: 'baseSize', label: 'Base size', visible: true },
  { id: 'col-qty', key: 'quantity', label: 'Quantity', visible: true },
  { id: 'col-price', key: 'unitPrice', label: 'Unit price', visible: true },
  { id: 'col-total', key: 'totalPrice', label: 'Total Price', visible: true },
];

export interface InvoiceItem {
  id: string;
  name: string;
  hairColour: string;
  baseSize: string;
  quantity: number;
  unitPrice: number;
  unitLabel?: string; // e.g. 'pcs'
  customFields?: Record<string, string>;
}

export interface ExtraCharge {
  id: string;
  title: string;
  amount: number;
}

export interface InvoiceData {
  id: string;
  invoiceNumber: number;
  invoiceDate: string; // e.g. '12-10-2026'
  dueDate: string;     // e.g. '01-11-2026'
  paymentTerms: string; // e.g. 'Within 20 days'
  paymentCurrency: string; // e.g. 'USD'
  
  // Sender Details
  senderName: string;
  senderTitle: string;
  
  // Company Details
  companyName: string;
  businessDescription: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWebsite?: string;
  companyLogoUrl?: string;
  
  // Customer Details
  customerName: string;
  customerCompany?: string;
  customerAddress?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerNotes?: string;
  
  // Table Configuration & Products
  columns: InvoiceColumn[];
  items: InvoiceItem[];
  
  // Cost Breakdown
  shippingCost: number;
  extraCharges: ExtraCharge[];
  
  // Calculations
  subtotal: number;
  grandTotal: number;
  
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanySettings {
  companyName: string;
  businessDescription: string;
  senderName: string;
  senderTitle: string;
  defaultCurrency: string;
  defaultPaymentTerms: string;
  defaultDueDays: number;
  defaultShippingCost: number;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite: string;
}

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'Royal Hair Wigs',
  businessDescription: 'Processed Hair & Wig Manufacturer',
  senderName: 'Md Boshirul Islam',
  senderTitle: 'Managing Director',
  defaultCurrency: 'USD',
  defaultPaymentTerms: 'Within 20 days',
  defaultDueDays: 20,
  defaultShippingCost: 35,
  companyAddress: '',
  companyPhone: '',
  companyEmail: '',
  companyWebsite: '',
};

export const INITIAL_SAMPLE_ITEMS: InvoiceItem[] = [
  {
    id: 'item-1',
    name: 'Hollywood gents',
    hairColour: 'As per Requirements',
    baseSize: 'As per Requirements',
    quantity: 5,
    unitPrice: 60,
    unitLabel: 'pcs',
  },
  {
    id: 'item-2',
    name: 'Hollywood Ladies 13 inch',
    hairColour: 'As per Requirements',
    baseSize: 'As per Requirements',
    quantity: 1,
    unitPrice: 180,
    unitLabel: 'pcs',
  },
];

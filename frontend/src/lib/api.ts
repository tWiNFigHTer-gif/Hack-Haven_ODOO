import axios from 'axios';

// Environment switch: defaults to true (mock) for standalone demo, set VITE_USE_MOCK_API="false" to use real backend
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// -------------------------------------------------------------
// Type Definitions
// -------------------------------------------------------------
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  clientRef: string;
  tier: string;
}

export interface SubscriptionItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;
  cycle: string;
  icon: string;
  imageUrl?: string;
  batchInfo?: string;
}

export type SubscriptionLifecycle = 'Draft' | 'Quotation' | 'Confirmed' | 'Active' | 'Closed';

export interface Subscription {
  id: string;
  subscriptionNumber: string;
  planName: string;
  tagline: string;
  edition: string;
  status: 'active' | 'paused' | 'closed';
  lifecycleStep: SubscriptionLifecycle;
  startDate: string;
  nextRenewalDate: string;
  billingFrequency: string;
  pricePerPeriod: number;
  currency: string;
  items: SubscriptionItem[];
  destination: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  courier: {
    service: string;
    spec: string;
    note: string;
  };
  paymentMethod: {
    brand: string;
    last4: string;
    exp: string;
    holder: string;
  };
  nextBatch: {
    name: string;
    date: string;
    formulation: string;
    vessel: string;
  };
}

export interface InvoiceLineItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  amount: number;
  batch?: string;
  imageUrl?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  subscriptionId: string;
  subscriptionName: string;
  periodCovered: string;
  issueDate: string;
  dueDate: string;
  paidAt?: string;
  status: 'paid' | 'outstanding' | 'overdue';
  subtotal: number;
  discount: number;
  discountLabel?: string;
  tax: number;
  shipping: number;
  totalAmount: number;
  currency: string;
  customer: {
    name: string;
    clientRef: string;
    address: string;
    email: string;
  };
  issuer: {
    company: string;
    ein: string;
    address: string;
    email: string;
  };
  items: InvoiceLineItem[];
  receiptRef?: string;
}

export interface PaymentPayload {
  invoiceId: string;
  method: 'card' | 'bank' | 'upi';
  cardDetails?: {
    cardholder: string;
    cardNumber: string;
    exp: string;
    cvc: string;
  };
  upiId?: string;
}

export interface PaymentResult {
  success: boolean;
  receiptReference: string;
  settledAt: string;
  amountPaid: number;
  invoiceId: string;
  error?: string;
}

// -------------------------------------------------------------
// In-Memory Mock Store
// -------------------------------------------------------------
const INITIAL_USERS: User[] = [
  {
    id: 'user-1',
    email: 'elena.rostova@atelier-nord.com',
    firstName: 'Elena',
    lastName: 'Rostova',
    clientRef: 'BL-78201',
    tier: 'Private Client',
  },
  {
    id: 'user-2',
    email: 'clara@botanical-studio.com',
    firstName: 'Clara',
    lastName: 'Vance',
    clientRef: 'BL-49102',
    tier: 'Private Atelier',
  },
];

let currentUser: User | null = INITIAL_USERS[0];

const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-84920',
    subscriptionNumber: 'SUB-84920',
    planName: 'Botanical Essence Tier III',
    tagline: 'Rare distillation extracts delivered per solstice cycle, featuring cold-pressed resins and custom macerations.',
    edition: 'Edition 2024–2025',
    status: 'active',
    lifecycleStep: 'Active',
    startDate: 'April 15, 2024',
    nextRenewalDate: 'April 15, 2025',
    billingFrequency: '/ quarter',
    pricePerPeriod: 180.0,
    currency: 'USD',
    nextBatch: {
      name: 'Spring Solstice Batch #09',
      date: 'April 15, 2025',
      formulation: 'Cold-Pressed Myrtle',
      vessel: 'Miron Violet Glass',
    },
    destination: {
      name: 'Upper East Side Flat',
      street: '740 Park Avenue, Apt 11B',
      city: 'New York',
      state: 'NY',
      zip: '10021',
    },
    courier: {
      service: 'White Glove Courier #4',
      spec: 'Climate Controlled Compartment',
      note: 'Direct Signature Required',
    },
    paymentMethod: {
      brand: 'Mastercard',
      last4: '4088',
      exp: '09/27',
      holder: 'Elena Rostova',
    },
    items: [
      {
        id: 'item-1',
        name: 'Miron Violet Glass Resin Extract (50ml)',
        description: 'Wildcrafted Frankincense & Royal Pine essential resins',
        quantity: 2,
        unitPrice: 55.0,
        tax: 9.76,
        total: 110.0,
        cycle: 'Quarterly',
        icon: 'science',
        batchInfo: 'Batch: #WF-2025-A1 • Harvest origin: Dhofar',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1KBfsV5bFtfoOrdxayH_Ar1eg8bOJh2VxFid0UBgZPikNOh5hWE_sQ8y62YFPEEaCF9IbJLRzCNMMOySaFkoLssD4qT5BfyaQtTjzRrx8-ySGPlBllLmT4TVF208G1KG7dILqznf_dqkL2otz-DEZjxcfWbZNt122_J7JcaGfYzuGgdhrE1oOtbHco0HNCqcK8z_m674WFP_sjxBx17V1TFVLHBEvhaC-SAwpKoQ',
      },
      {
        id: 'item-2',
        name: 'Cold-Pressed Myrtle Hydrosol (100ml)',
        description: 'Steam-distilled Corsican myrtle blossoms with active botanicals',
        quantity: 1,
        unitPrice: 40.0,
        tax: 3.55,
        total: 40.0,
        cycle: 'Quarterly',
        icon: 'water_drop',
        batchInfo: 'Batch: #MH-109-CO • Distillation date: Feb 2025',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDT0sLWXS9HK5AqdMfZoTIGSB-f3_nlOUhwOsObrkdwLkixNZnxQ4u_7G3NorjD7wINRhrvBTP2jBu13zVyTVGqNYcKhHbBBDFEjAoNMpdichuHbF197mmIBZfGC1MBp0lR-5BEmRkoRNINqVJnkGd_WSyLC-15VHZ7WnwOBGoDym3fC8VUHcWPqr60t-IcjYHux6FGOQB0jRTPmEz1tOXg07646gg75IZzdCerfmw',
      },
      {
        id: 'item-3',
        name: 'Seasonal Wild Chamomile Infusion (50ml)',
        description: 'Biodynamic harvest in cold-pressed jojoba balancing base',
        quantity: 1,
        unitPrice: 30.0,
        tax: 2.66,
        total: 30.0,
        cycle: 'Quarterly',
        icon: 'local_florist',
        batchInfo: 'Batch: #WC-992-BIO • Certified Demeter',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuq64o1LEu-OBwYGBUZ6r7CNBZKPOX_Hf531__iDW_d2ooyI__duLha1kR1Mk3rUaaKXJEOYpplAfIvF_R7E3zS-nxSFFOY7fRfS59fEL4hzGtFL0t8yykAa_UkxrDeoZKdhexMDMhAFsVJpQD9pDbFPCmIR3rPMECQRLKO1ko-XMhGl-c8or7g-rBuJ50iDqSVHEesORhYz57p_JeJ_HyN_L7p_6p_ItaZZopf5E',
      },
    ],
  },
  {
    id: 'sub-71043',
    subscriptionNumber: 'SUB-71043',
    planName: 'Atelier Botanical Care',
    tagline: 'Continuous monthly replenish of signature hydration serums, skin tisanes, and ceremonial balm vessels.',
    edition: 'Edition 2025',
    status: 'active',
    lifecycleStep: 'Active',
    startDate: 'November 1, 2024',
    nextRenewalDate: 'May 1, 2025',
    billingFrequency: '/ month',
    pricePerPeriod: 65.0,
    currency: 'USD',
    nextBatch: {
      name: 'May Hydration Pack',
      date: 'May 1, 2025',
      formulation: 'Tisane Blend',
      vessel: 'Amber Dropper',
    },
    destination: {
      name: 'Upper East Side Flat',
      street: '740 Park Avenue, Apt 11B',
      city: 'New York',
      state: 'NY',
      zip: '10021',
    },
    courier: {
      service: 'Standard Courier',
      spec: 'Protected Packaging',
      note: 'Signature Required',
    },
    paymentMethod: {
      brand: 'Mastercard',
      last4: '4088',
      exp: '09/27',
      holder: 'Elena Rostova',
    },
    items: [
      {
        id: 'item-care',
        name: 'Signature Hydration Serum (30ml)',
        description: 'Restorative botanical extracts',
        quantity: 1,
        unitPrice: 65.0,
        tax: 5.76,
        total: 65.0,
        cycle: 'Monthly',
        icon: 'spa',
      },
    ],
  },
  {
    id: 'sub-52918',
    subscriptionNumber: 'SUB-52918',
    planName: 'Seasonal Harvest Reserve',
    tagline: 'Annual allocation of vintage olive leaf extracts, lavender distillates, and beeswax apothecary jars.',
    edition: 'Archive 2024',
    status: 'closed',
    lifecycleStep: 'Closed',
    startDate: 'January 1, 2024',
    nextRenewalDate: 'Completed Dec 31, 2024',
    billingFrequency: '/ year',
    pricePerPeriod: 320.0,
    currency: 'USD',
    nextBatch: {
      name: 'Concluded Archive',
      date: 'Completed',
      formulation: 'Olive Leaf Vintage',
      vessel: 'Beeswax Seal Jar',
    },
    destination: {
      name: 'Upper East Side Flat',
      street: '740 Park Avenue, Apt 11B',
      city: 'New York',
      state: 'NY',
      zip: '10021',
    },
    courier: {
      service: 'Archived Courier Record',
      spec: 'Delivered',
      note: 'Closed',
    },
    paymentMethod: {
      brand: 'Mastercard',
      last4: '4088',
      exp: '09/27',
      holder: 'Elena Rostova',
    },
    items: [
      {
        id: 'item-harvest',
        name: 'Vintage Olive Leaf Extract & Distillates',
        description: 'Apothecary edition box',
        quantity: 1,
        unitPrice: 320.0,
        tax: 28.4,
        total: 320.0,
        cycle: 'Annual',
        icon: 'local_florist',
      },
    ],
  },
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-2025-005',
    invoiceNumber: 'INV-2025-005',
    subscriptionId: 'sub-84920',
    subscriptionName: 'Botanical Essence Tier III',
    periodCovered: 'Quarterly Solstice Allocation',
    issueDate: 'March 15, 2025',
    dueDate: 'April 01, 2025',
    status: 'overdue',
    subtotal: 180.0,
    discount: 3.0,
    discountLabel: 'Atelier Solstice Benefit (10%)',
    tax: 15.71,
    shipping: 0.0,
    totalAmount: 192.71,
    currency: 'USD',
    customer: {
      name: 'Elena Rostova',
      clientRef: 'BL-78201',
      address: '740 Park Avenue, Apt 11B\nNew York, NY 10021\nUnited States',
      email: 'elena.rostova@atelier-nord.com',
    },
    issuer: {
      company: 'Brightloop Sanctuary Apothecary LLC',
      ein: 'US-94-3829102',
      address: '108 Mercer Street, Floor 3\nSoHo Historic District\nNew York, NY 10012',
      email: 'concierge@brightloop-sanctuary.com',
    },
    items: [
      {
        id: 'inv-item-1',
        title: 'Miron Violet Glass Resin Extract (50ml)',
        description: 'Wildcrafted Frankincense & Royal Pine essential resins',
        quantity: 2,
        unitPrice: 55.0,
        tax: 9.76,
        amount: 110.0,
        batch: '#WF-2025-A1 • Dhofar',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1KBfsV5bFtfoOrdxayH_Ar1eg8bOJh2VxFid0UBgZPikNOh5hWE_sQ8y62YFPEEaCF9IbJLRzCNMMOySaFkoLssD4qT5BfyaQtTjzRrx8-ySGPlBllLmT4TVF208G1KG7dILqznf_dqkL2otz-DEZjxcfWbZNt122_J7JcaGfYzuGgdhrE1oOtbHco0HNCqcK8z_m674WFP_sjxBx17V1TFVLHBEvhaC-SAwpKoQ',
      },
      {
        id: 'inv-item-2',
        title: 'Cold-Pressed Myrtle Hydrosol (100ml)',
        description: 'Steam-distilled Corsican myrtle blossoms with active botanicals',
        quantity: 1,
        unitPrice: 40.0,
        tax: 3.55,
        amount: 40.0,
        batch: '#MH-109-CO • Corsica',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDT0sLWXS9HK5AqdMfZoTIGSB-f3_nlOUhwOsObrkdwLkixNZnxQ4u_7G3NorjD7wINRhrvBTP2jBu13zVyTVGqNYcKhHbBBDFEjAoNMpdichuHbF197mmIBZfGC1MBp0lR-5BEmRkoRNINqVJnkGd_WSyLC-15VHZ7WnwOBGoDym3fC8VUHcWPqr60t-IcjYHux6FGOQB0jRTPmEz1tOXg07646gg75IZzdCerfmw',
      },
      {
        id: 'inv-item-3',
        title: 'Seasonal Wild Chamomile Infusion (50ml)',
        description: 'Biodynamic harvest in cold-pressed jojoba balancing base',
        quantity: 1,
        unitPrice: 30.0,
        tax: 2.66,
        amount: 30.0,
        batch: '#WC-992-BIO • Demeter',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuq64o1LEu-OBwYGBUZ6r7CNBZKPOX_Hf531__iDW_d2ooyI__duLha1kR1Mk3rUaaKXJEOYpplAfIvF_R7E3zS-nxSFFOY7fRfS59fEL4hzGtFL0t8yykAa_UkxrDeoZKdhexMDMhAFsVJpQD9pDbFPCmIR3rPMECQRLKO1ko-XMhGl-c8or7g-rBuJ50iDqSVHEesORhYz57p_JeJ_HyN_L7p_6p_ItaZZopf5E',
      },
    ],
  },
  {
    id: 'inv-2025-004',
    invoiceNumber: 'INV-2025-004',
    subscriptionId: 'sub-84920',
    subscriptionName: 'Botanical Essence Tier III',
    periodCovered: 'Winter Solstice Batch',
    issueDate: 'Jan 15, 2025',
    dueDate: 'Jan 15, 2025',
    paidAt: 'Jan 15, 2025',
    status: 'paid',
    subtotal: 180.0,
    discount: 0,
    tax: 15.98,
    shipping: 0.0,
    totalAmount: 180.0,
    currency: 'USD',
    customer: {
      name: 'Elena Rostova',
      clientRef: 'BL-78201',
      address: '740 Park Avenue, Apt 11B\nNew York, NY 10021\nUnited States',
      email: 'elena.rostova@atelier-nord.com',
    },
    issuer: {
      company: 'Brightloop Sanctuary Apothecary LLC',
      ein: 'US-94-3829102',
      address: '108 Mercer Street, Floor 3\nSoHo Historic District\nNew York, NY 10012',
      email: 'concierge@brightloop-sanctuary.com',
    },
    items: [
      {
        id: 'inv-item-4',
        title: 'Botanical Essence Tier III Curation',
        description: 'Winter Solstice Batch Allocation',
        quantity: 1,
        unitPrice: 180.0,
        tax: 15.98,
        amount: 180.0,
      },
    ],
    receiptRef: '#REC-88120-WT',
  },
  {
    id: 'inv-2025-002',
    invoiceNumber: 'INV-2025-002',
    subscriptionId: 'sub-71043',
    subscriptionName: 'Atelier Botanical Care',
    periodCovered: 'Care & Conditioning Bundle',
    issueDate: 'Nov 01, 2024',
    dueDate: 'Nov 01, 2024',
    paidAt: 'Nov 01, 2024',
    status: 'paid',
    subtotal: 65.0,
    discount: 0,
    tax: 5.76,
    shipping: 0.0,
    totalAmount: 65.0,
    currency: 'USD',
    customer: {
      name: 'Elena Rostova',
      clientRef: 'BL-78201',
      address: '740 Park Avenue, Apt 11B\nNew York, NY 10021\nUnited States',
      email: 'elena.rostova@atelier-nord.com',
    },
    issuer: {
      company: 'Brightloop Sanctuary Apothecary LLC',
      ein: 'US-94-3829102',
      address: '108 Mercer Street, Floor 3\nSoHo Historic District\nNew York, NY 10012',
      email: 'concierge@brightloop-sanctuary.com',
    },
    items: [
      {
        id: 'inv-item-2',
        title: 'Atelier Botanical Care Package',
        description: 'Monthly replenishment pack',
        quantity: 1,
        unitPrice: 65.0,
        tax: 5.76,
        amount: 65.0,
      },
    ],
    receiptRef: '#REC-72019-BC',
  },
  {
    id: 'inv-2024-089',
    invoiceNumber: 'INV-2024-089',
    subscriptionId: 'sub-84920',
    subscriptionName: 'Botanical Essence Tier III',
    periodCovered: 'Midsummer Allocation',
    issueDate: 'Jul 15, 2024',
    dueDate: 'Jul 15, 2024',
    paidAt: 'Jul 15, 2024',
    status: 'paid',
    subtotal: 180.0,
    discount: 0,
    tax: 15.98,
    shipping: 0.0,
    totalAmount: 180.0,
    currency: 'USD',
    customer: {
      name: 'Elena Rostova',
      clientRef: 'BL-78201',
      address: '740 Park Avenue, Apt 11B\nNew York, NY 10021\nUnited States',
      email: 'elena.rostova@atelier-nord.com',
    },
    issuer: {
      company: 'Brightloop Sanctuary Apothecary LLC',
      ein: 'US-94-3829102',
      address: '108 Mercer Street, Floor 3\nSoHo Historic District\nNew York, NY 10012',
      email: 'concierge@brightloop-sanctuary.com',
    },
    items: [
      {
        id: 'inv-item-89',
        title: 'Botanical Essence Tier III Curation',
        description: 'Summer Solstice Batch',
        quantity: 1,
        unitPrice: 180.0,
        tax: 15.98,
        amount: 180.0,
      },
    ],
    receiptRef: '#REC-61029-MS',
  },
  {
    id: 'inv-2024-055',
    invoiceNumber: 'INV-2024-055',
    subscriptionId: 'sub-52918',
    subscriptionName: 'Seasonal Harvest Reserve',
    periodCovered: 'Spring Curated Vintage',
    issueDate: 'May 15, 2024',
    dueDate: 'May 15, 2024',
    paidAt: 'May 15, 2024',
    status: 'paid',
    subtotal: 320.0,
    discount: 0,
    tax: 28.4,
    shipping: 0.0,
    totalAmount: 320.0,
    currency: 'USD',
    customer: {
      name: 'Elena Rostova',
      clientRef: 'BL-78201',
      address: '740 Park Avenue, Apt 11B\nNew York, NY 10021\nUnited States',
      email: 'elena.rostova@atelier-nord.com',
    },
    issuer: {
      company: 'Brightloop Sanctuary Apothecary LLC',
      ein: 'US-94-3829102',
      address: '108 Mercer Street, Floor 3\nSoHo Historic District\nNew York, NY 10012',
      email: 'concierge@brightloop-sanctuary.com',
    },
    items: [
      {
        id: 'inv-item-55',
        title: 'Seasonal Harvest Reserve Annual',
        description: 'Rare vintage extracts reserve',
        quantity: 1,
        unitPrice: 320.0,
        tax: 28.4,
        amount: 320.0,
      },
    ],
    receiptRef: '#REC-55102-HR',
  },
];

let subscriptionsStore = [...INITIAL_SUBSCRIPTIONS];
let invoicesStore = [...INITIAL_INVOICES];

// -------------------------------------------------------------
// API Client Facade
// -------------------------------------------------------------
export const api = {
  // Auth endpoints
  auth: {
    async getCurrentUser(): Promise<User | null> {
      if (USE_MOCK_API) {
        return currentUser;
      }
      try {
        const res = await apiClient.get('/auth/me');
        return res.data;
      } catch {
        return null;
      }
    },

    async login(email: string, _password: string): Promise<{ user: User }> {
      if (USE_MOCK_API) {
        await new Promise((r) => setTimeout(r, 400));
        const user = INITIAL_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!user) {
          throw new Error('Invalid email or credentials.');
        }
        currentUser = user;
        return { user };
      }
      const res = await apiClient.post('/auth/login', { email, password: _password });
      return res.data;
    },

    async signup(email: string, _password: string): Promise<{ user: User }> {
      if (USE_MOCK_API) {
        await new Promise((r) => setTimeout(r, 500));
        const exists = INITIAL_USERS.some((u) => u.email.toLowerCase() === email.toLowerCase());
        if (exists) {
          throw new Error('This email already has an account.');
        }
        const newUser: User = {
          id: `user-${Date.now()}`,
          email,
          firstName: email.split('@')[0],
          lastName: 'Client',
          clientRef: `BL-${Math.floor(10000 + Math.random() * 90000)}`,
          tier: 'Sanctuary Client',
        };
        INITIAL_USERS.push(newUser);
        currentUser = newUser;
        return { user: newUser };
      }
      const res = await apiClient.post('/auth/register', { email, password: _password });
      return res.data;
    },

    async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
      if (USE_MOCK_API) {
        await new Promise((r) => setTimeout(r, 450));
        return {
          success: true,
          message: `Password reset instructions sent to ${email}.`,
        };
      }
      const res = await apiClient.post('/auth/forgot-password', { email });
      return res.data;
    },

    logout(): void {
      currentUser = null;
    },
  },

  // Subscriptions endpoints
  subscriptions: {
    async list(filter?: 'all' | 'active' | 'closed'): Promise<Subscription[]> {
      if (USE_MOCK_API) {
        await new Promise((r) => setTimeout(r, 300));
        if (!filter || filter === 'all') return subscriptionsStore;
        return subscriptionsStore.filter((s) => s.status === filter);
      }
      const res = await apiClient.get('/subscriptions', { params: { filter } });
      return res.data;
    },

    async getById(id: string): Promise<Subscription | null> {
      if (USE_MOCK_API) {
        await new Promise((r) => setTimeout(r, 250));
        const found = subscriptionsStore.find(
          (s) => s.id === id || s.subscriptionNumber.toLowerCase() === id.toLowerCase()
        );
        return found || null;
      }
      const res = await apiClient.get(`/subscriptions/${id}`);
      return res.data;
    },

    async togglePause(id: string): Promise<Subscription> {
      if (USE_MOCK_API) {
        await new Promise((r) => setTimeout(r, 400));
        const sub = subscriptionsStore.find((s) => s.id === id);
        if (!sub) throw new Error('Subscription not found');
        sub.status = sub.status === 'active' ? 'paused' : 'active';
        return { ...sub };
      }
      const res = await apiClient.post(`/subscriptions/${id}/toggle-pause`);
      return res.data;
    },

    async updateStatus(id: string, newStatus: 'active' | 'paused' | 'closed'): Promise<Subscription> {
      if (USE_MOCK_API) {
        await new Promise((r) => setTimeout(r, 300));
        const sub = subscriptionsStore.find((s) => s.id === id);
        if (!sub) throw new Error('Subscription not found');
        sub.status = newStatus;
        if (newStatus === 'closed') {
          sub.lifecycleStep = 'Closed';
        } else if (newStatus === 'active') {
          sub.lifecycleStep = 'Active';
        }
        return { ...sub };
      }
      const res = await apiClient.patch(`/subscriptions/${id}/status`, { status: newStatus });
      return res.data;
    },
  },

  // Invoices endpoints
  invoices: {
    async list(filter?: 'all' | 'outstanding' | 'paid'): Promise<Invoice[]> {
      if (USE_MOCK_API) {
        await new Promise((r) => setTimeout(r, 300));
        if (!filter || filter === 'all') return invoicesStore;
        if (filter === 'outstanding') {
          return invoicesStore.filter((i) => i.status === 'outstanding' || i.status === 'overdue');
        }
        return invoicesStore.filter((i) => i.status === filter);
      }
      const res = await apiClient.get('/invoices', { params: { filter } });
      return res.data;
    },

    async getById(id: string): Promise<Invoice | null> {
      if (USE_MOCK_API) {
        await new Promise((r) => setTimeout(r, 200));
        const inv = invoicesStore.find(
          (i) => i.id === id || i.invoiceNumber.toLowerCase() === id.toLowerCase()
        );
        return inv || null;
      }
      const res = await apiClient.get(`/invoices/${id}`);
      return res.data;
    },
  },

  // Payment processing
  payments: {
    async payInvoice(payload: PaymentPayload): Promise<PaymentResult> {
      if (USE_MOCK_API) {
        await new Promise((r) => setTimeout(r, 800));

        const invoice = invoicesStore.find((i) => i.id === payload.invoiceId || i.invoiceNumber === payload.invoiceId);
        if (!invoice) {
          throw new Error('Invoice not found');
        }

        const receiptRef = `#REC-${Math.floor(10000 + Math.random() * 90000)}-BT`;
        invoice.status = 'paid';
        invoice.paidAt = new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        invoice.receiptRef = receiptRef;

        return {
          success: true,
          receiptReference: receiptRef,
          settledAt: new Date().toISOString(),
          amountPaid: invoice.totalAmount,
          invoiceId: invoice.id,
        };
      }
      const res = await apiClient.post('/payments/charge', payload);
      return res.data;
    },
  },
};


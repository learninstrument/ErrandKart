export type AdminUserRole = 'customer' | 'runner' | 'admin';
export type AdminUserStatus = 'active' | 'inactive' | 'suspended';

export interface AdminUserProfile {
  id: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  avatarUrl: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  country: string;
  joinedAt: string;
  lastSeen: string;
  totalErrands: number;
  totalSpendOrEarnings: string;
  walletBalance: string;
  rating: string;
  ninNumber: string;
  ninStatus: string;
  govIdType: string;
  govIdNumber: string;
  govIdFrontImage: string;
  govIdBackImage: string;
  selfieImage: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  runnerInfo?: {
    vehicleType: string;
    licensePlate: string;
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
}

export const ADMIN_USER_PROFILES: AdminUserProfile[] = [
  {
    id: 'U-1001',
    role: 'customer',
    status: 'active',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    fullName: 'Sarah Daniels',
    email: 'sarah@errandkart.com',
    phone: '+234 801 234 5678',
    gender: 'Female',
    dateOfBirth: '1994-03-18',
    address: '12 Admiralty Way',
    city: 'Lekki',
    state: 'Lagos',
    country: 'Nigeria',
    joinedAt: '2026-04-08',
    lastSeen: '2 mins ago',
    totalErrands: 47,
    totalSpendOrEarnings: '₦512,000 spent',
    walletBalance: '₦48,200',
    rating: '4.9',
    ninNumber: '12345678901',
    ninStatus: 'Verified',
    govIdType: 'National ID',
    govIdNumber: 'NIN-1234-5678',
    govIdFrontImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=900&q=60',
    govIdBackImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=60',
    selfieImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=60',
    emergencyContactName: 'David Daniels',
    emergencyContactPhone: '+234 802 112 3344',
    emergencyContactRelation: 'Brother',
  },
  {
    id: 'U-1002',
    role: 'runner',
    status: 'active',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    fullName: 'Michael B.',
    email: 'michael@errandkart.com',
    phone: '+234 801 123 9876',
    gender: 'Male',
    dateOfBirth: '1991-07-12',
    address: '17A Idejo Street',
    city: 'Victoria Island',
    state: 'Lagos',
    country: 'Nigeria',
    joinedAt: '2026-04-01',
    lastSeen: 'Online',
    totalErrands: 120,
    totalSpendOrEarnings: '₦1,420,000 earned',
    walletBalance: '₦26,400',
    rating: '4.8',
    ninNumber: '23456789012',
    ninStatus: 'Verified',
    govIdType: "Driver's License",
    govIdNumber: 'DRV-9087-1122',
    govIdFrontImage: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=60',
    govIdBackImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=60',
    selfieImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=60',
    emergencyContactName: 'Grace B.',
    emergencyContactPhone: '+234 803 445 9911',
    emergencyContactRelation: 'Wife',
    runnerInfo: {
      vehicleType: 'Motorbike',
      licensePlate: 'LAG-392KD',
      accountName: 'Michael B.',
      accountNumber: '0123456789',
      bankName: 'GTBank',
    },
  },
  {
    id: 'U-1005',
    role: 'admin',
    status: 'active',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    fullName: 'Super Admin',
    email: 'admin@errandkart.com',
    phone: '+234 700 000 0000',
    gender: 'N/A',
    dateOfBirth: 'N/A',
    address: 'ErrandKart HQ',
    city: 'Lagos',
    state: 'Lagos',
    country: 'Nigeria',
    joinedAt: '2026-01-04',
    lastSeen: 'Online',
    totalErrands: 0,
    totalSpendOrEarnings: 'N/A',
    walletBalance: 'N/A',
    rating: 'N/A',
    ninNumber: 'N/A',
    ninStatus: 'Internal',
    govIdType: 'Internal Admin Record',
    govIdNumber: 'ADM-0001',
    govIdFrontImage: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=900&q=60',
    govIdBackImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=60',
    selfieImage: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=900&q=60',
    emergencyContactName: 'Operations',
    emergencyContactPhone: '+234 700 111 2222',
    emergencyContactRelation: 'Team',
  },
];

export type SupermarketVerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended';

export interface AdminSupermarketProfile {
  id: string;
  businessName: string;
  managerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  verificationStatus: SupermarketVerificationStatus;
  cacNumber: string;
  taxId: string;
  submittedAt: string;
  lastUpdated: string;
  dispatchOrders: number;
  activeRunners: number;
  documents: {
    cacCertificateImage: string;
    governmentIdImage: string;
    storefrontImage: string;
  };
}

export const ADMIN_SUPERMARKETS: AdminSupermarketProfile[] = [
  {
    id: 'SM-2001',
    businessName: 'Shoprite Lekki',
    managerName: 'Amina Yusuf',
    email: 'dispatch.lekki@shoprite.ng',
    phone: '+234 809 320 1000',
    address: 'Circle Mall, Jakande Roundabout',
    city: 'Lagos',
    verificationStatus: 'verified',
    cacNumber: 'RC-9987611',
    taxId: 'TIN-445-118-09',
    submittedAt: '2026-04-10',
    lastUpdated: '2 hrs ago',
    dispatchOrders: 128,
    activeRunners: 14,
    documents: {
      cacCertificateImage: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=60',
      governmentIdImage: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=60',
      storefrontImage: 'https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?auto=format&fit=crop&w=900&q=60',
    },
  },
  {
    id: 'SM-2002',
    businessName: 'Spar Victoria Island',
    managerName: 'Tunde Adebayo',
    email: 'ops.vi@spar.ng',
    phone: '+234 803 201 8890',
    address: '17 Adeola Odeku Street',
    city: 'Lagos',
    verificationStatus: 'pending',
    cacNumber: 'RC-6721102',
    taxId: 'TIN-337-900-22',
    submittedAt: '2026-05-11',
    lastUpdated: 'just now',
    dispatchOrders: 0,
    activeRunners: 0,
    documents: {
      cacCertificateImage: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=900&q=60',
      governmentIdImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=60',
      storefrontImage: 'https://images.unsplash.com/photo-1604719312566-8912e9c8a213?auto=format&fit=crop&w=900&q=60',
    },
  },
  {
    id: 'SM-2003',
    businessName: 'Ebeano Ikoyi',
    managerName: 'Kemi Oladele',
    email: 'manager@ebeanoikoyi.com',
    phone: '+234 802 771 3349',
    address: '15 Awolowo Road',
    city: 'Lagos',
    verificationStatus: 'suspended',
    cacNumber: 'RC-5530984',
    taxId: 'TIN-129-410-77',
    submittedAt: '2026-03-02',
    lastUpdated: '1 day ago',
    dispatchOrders: 56,
    activeRunners: 0,
    documents: {
      cacCertificateImage: 'https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&w=900&q=60',
      governmentIdImage: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=900&q=60',
      storefrontImage: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=900&q=60',
    },
  },
];

export interface ActiveErrandTrack {
  orderId: string;
  source: 'customer-direct' | 'supermarket-dispatch';
  customerUserId: string;
  runnerUserId: string;
  customerName: string;
  runnerName: string;
  customerPhone: string;
  runnerPhone: string;
  status: 'shopping' | 'en-route' | 'arrived';
  etaMinutes: number;
  payout: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupLocation: [number, number];
  dropoffLocation: [number, number];
  currentLocation: [number, number];
  supermarketName?: string;
  supermarketContact?: string;
}

export const ADMIN_ACTIVE_ERRANDS: ActiveErrandTrack[] = [
  {
    orderId: 'EK-4920',
    source: 'supermarket-dispatch',
    customerUserId: 'U-1001',
    runnerUserId: 'U-1002',
    customerName: 'Sarah Daniels',
    runnerName: 'Michael B.',
    customerPhone: '+234 801 234 5678',
    runnerPhone: '+234 801 123 9876',
    status: 'shopping',
    etaMinutes: 18,
    payout: '₦4,500',
    pickupAddress: 'Shoprite, Lekki Phase 1',
    dropoffAddress: 'Eko Atlantic, Victoria Island',
    pickupLocation: [6.4474, 3.4558],
    dropoffLocation: [6.4281, 3.4219],
    currentLocation: [6.4408, 3.4469],
    supermarketName: 'Shoprite Lekki',
    supermarketContact: '+234 809 320 1000',
  },
  {
    orderId: 'EK-4961',
    source: 'customer-direct',
    customerUserId: 'U-1001',
    runnerUserId: 'U-1002',
    customerName: 'Sarah Daniels',
    runnerName: 'Michael B.',
    customerPhone: '+234 801 234 5678',
    runnerPhone: '+234 801 123 9876',
    status: 'en-route',
    etaMinutes: 11,
    payout: '₦3,200',
    pickupAddress: 'MedPlus, Victoria Island',
    dropoffAddress: 'Oniru Estate, Lekki',
    pickupLocation: [6.4304, 3.4211],
    dropoffLocation: [6.4458, 3.4721],
    currentLocation: [6.4361, 3.4465],
  },
];

export type SupportRequesterRole = Extract<AdminUserRole, 'customer' | 'runner'>;
export type SupportChannel = 'live-chat' | 'email' | 'phone';
export type SupportTicketStatus = 'open' | 'in-progress' | 'resolved' | 'escalated';

export interface AdminSupportTicket {
  id: string;
  orderId?: string;
  requesterUserId: string;
  requesterName: string;
  requesterRole: SupportRequesterRole;
  channel: SupportChannel;
  category: string;
  summary: string;
  priority: 'low' | 'medium' | 'high';
  status: SupportTicketStatus;
  createdAt: string;
  updatedAt: string;
  slaTarget: string;
  lastMessage: string;
}

export const ADMIN_SUPPORT_TICKETS: AdminSupportTicket[] = [
  {
    id: 'SUP-1001',
    orderId: 'EK-4920',
    requesterUserId: 'U-1001',
    requesterName: 'Sarah Daniels',
    requesterRole: 'customer',
    channel: 'live-chat',
    category: 'Order delayed',
    summary: 'Customer needs updated ETA and item pickup confirmation.',
    priority: 'medium',
    status: 'in-progress',
    createdAt: 'Today · 10:24 AM',
    updatedAt: '2 mins ago',
    slaTarget: '2 mins',
    lastMessage: 'Runner says checkout queue is long.',
  },
  {
    id: 'SUP-1002',
    orderId: 'EK-4811',
    requesterUserId: 'U-1001',
    requesterName: 'Sarah Daniels',
    requesterRole: 'customer',
    channel: 'email',
    category: 'Refund or dispute',
    summary: 'Customer reported wrong item delivered and requested partial refund.',
    priority: 'high',
    status: 'escalated',
    createdAt: 'Yesterday · 6:40 PM',
    updatedAt: '35 mins ago',
    slaTarget: '24 hrs',
    lastMessage: 'Waiting for receipt + delivery photo verification.',
  },
  {
    id: 'SUP-1003',
    orderId: 'EK-4961',
    requesterUserId: 'U-1002',
    requesterName: 'Michael B.',
    requesterRole: 'runner',
    channel: 'phone',
    category: 'Payout not received',
    summary: 'Runner requested payout status check after completed delivery.',
    priority: 'high',
    status: 'open',
    createdAt: 'Today · 9:12 AM',
    updatedAt: '12 mins ago',
    slaTarget: '10 mins',
    lastMessage: 'Finance queue shows transfer pending.',
  },
  {
    id: 'SUP-1004',
    requesterUserId: 'U-1002',
    requesterName: 'Michael B.',
    requesterRole: 'runner',
    channel: 'live-chat',
    category: 'Verification pending',
    summary: 'Runner requested KYC review ETA before weekend shifts.',
    priority: 'medium',
    status: 'resolved',
    createdAt: 'Apr 30 · 2:15 PM',
    updatedAt: 'Resolved',
    slaTarget: '24 hrs',
    lastMessage: 'Verification completed and account cleared.',
  },
  {
    id: 'SUP-1005',
    orderId: 'EK-4920',
    requesterUserId: 'U-1001',
    requesterName: 'Sarah Daniels',
    requesterRole: 'customer',
    channel: 'live-chat',
    category: 'Supermarket handoff delay',
    summary: 'Customer requested update after supermarket held dispatch for item replacement.',
    priority: 'medium',
    status: 'open',
    createdAt: 'Today · 11:05 AM',
    updatedAt: 'Just now',
    slaTarget: '2 mins',
    lastMessage: 'Store confirmed replacement item is now packed.',
  },
];

export interface AdminOrderRating {
  orderId: string;
  customerUserId: string;
  runnerUserId: string;
  customerName: string;
  runnerName: string;
  customerToRunnerRating: number;
  runnerToCustomerRating: number;
  customerComment: string;
  runnerComment: string;
  submittedAt: string;
  linkedSupportTicketId?: string;
}

export const ADMIN_ORDER_RATINGS: AdminOrderRating[] = [
  {
    orderId: 'EK-4920',
    customerUserId: 'U-1001',
    runnerUserId: 'U-1002',
    customerName: 'Sarah Daniels',
    runnerName: 'Michael B.',
    customerToRunnerRating: 5,
    runnerToCustomerRating: 5,
    customerComment: 'Fast delivery and clear communication.',
    runnerComment: 'Customer was responsive and order details were accurate.',
    submittedAt: 'Today · 1:06 PM',
  },
  {
    orderId: 'EK-4811',
    customerUserId: 'U-1001',
    runnerUserId: 'U-1002',
    customerName: 'Sarah Daniels',
    runnerName: 'Michael B.',
    customerToRunnerRating: 2,
    runnerToCustomerRating: 4,
    customerComment: 'One item was missing and delivery took longer than expected.',
    runnerComment: 'Customer communication was good, issue came from store stock.',
    submittedAt: 'Yesterday · 8:42 PM',
    linkedSupportTicketId: 'SUP-1002',
  },
  {
    orderId: 'EK-4961',
    customerUserId: 'U-1001',
    runnerUserId: 'U-1002',
    customerName: 'Sarah Daniels',
    runnerName: 'Michael B.',
    customerToRunnerRating: 4,
    runnerToCustomerRating: 5,
    customerComment: 'Good service overall, minor delay at checkout.',
    runnerComment: 'Clear list and quick payment confirmation.',
    submittedAt: 'Today · 4:09 PM',
    linkedSupportTicketId: 'SUP-1003',
  },
];

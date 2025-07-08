export interface PromotionPlan {
  id: string;
  name: string;
  duration: number; // days
  price: number; // USD
  features: string[];
  popular?: boolean;
}

export interface GroupPromotion {
  id: string;
  groupId: string;
  userId: string;
  planId: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'pending';
  paymentId?: string;
  amount: number;
  currency: string;
}

export interface CryptomusPayment {
  id: string;
  amount: string;
  currency: string;
  order_id: string;
  status: 'pending' | 'paid' | 'failed' | 'expired';
  payment_url?: string;
  created_at: string;
  expires_at: string;
}

export interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  onPromotionSuccess: (promotion: GroupPromotion) => void;
}
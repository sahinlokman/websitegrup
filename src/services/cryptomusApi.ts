import { CryptomusPayment } from '../types/promotion';

// Cryptomus API configuration
const CRYPTOMUS_API_BASE = 'https://api.cryptomus.com/v1';
const MERCHANT_ID = import.meta.env.VITE_CRYPTOMUS_MERCHANT_ID || 'your-merchant-id';
const API_KEY = import.meta.env.VITE_CRYPTOMUS_API_KEY || 'your-api-key';

export interface CreatePaymentRequest {
  amount: string;
  currency: string;
  order_id: string;
  url_return?: string;
  url_callback?: string;
  is_payment_multiple?: boolean;
  lifetime?: number;
  to_currency?: string;
}

export interface CreatePaymentResponse {
  state: number;
  result?: {
    uuid: string;
    order_id: string;
    amount: string;
    payment_amount?: string;
    payer_amount?: string;
    discount_percent?: string;
    discount?: string;
    payer_currency?: string;
    currency: string;
    comments?: string;
    merchant_amount?: string;
    network?: string;
    address?: string;
    from?: string;
    txid?: string;
    payment_status: string;
    url: string;
    expired_at: number;
    status: string;
    is_final: boolean;
    additional_data?: string;
    currencies?: Array<{
      currency: string;
      network: string;
    }>;
  };
  errors?: Record<string, string[]>;
}

class CryptomusApiService {
  private generateSignature(data: string): string {
    // Bu production'da gerçek imza algoritması kullanılmalı
    // Şimdilik basit bir hash simülasyonu
    return btoa(data + API_KEY).substring(0, 32);
  }

  async createPayment(paymentData: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    try {
      const requestBody = {
        ...paymentData,
        merchant: MERCHANT_ID
      };

      const dataString = JSON.stringify(requestBody);
      const signature = this.generateSignature(dataString);

      const response = await fetch(`${CRYPTOMUS_API_BASE}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'merchant': MERCHANT_ID,
          'sign': signature
        },
        body: dataString
      });

      const result: CreatePaymentResponse = await response.json();
      
      if (result.state !== 0) {
        throw new Error(result.errors ? Object.values(result.errors).flat().join(', ') : 'Ödeme oluşturulamadı');
      }

      return result;
    } catch (error) {
      console.error('Cryptomus API Error:', error);
      throw error;
    }
  }

  async getPaymentStatus(paymentId: string): Promise<any> {
    try {
      const requestData = {
        merchant: MERCHANT_ID,
        uuid: paymentId
      };

      const dataString = JSON.stringify(requestData);
      const signature = this.generateSignature(dataString);

      const response = await fetch(`${CRYPTOMUS_API_BASE}/payment/info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'merchant': MERCHANT_ID,
          'sign': signature
        },
        body: dataString
      });

      const result = await response.json();
      
      if (result.state !== 0) {
        throw new Error('Ödeme durumu alınamadı');
      }

      return result.result;
    } catch (error) {
      console.error('Payment status check error:', error);
      throw error;
    }
  }

  // Demo amaçlı - gerçek uygulamada webhook kullanılmalı
  async simulatePaymentSuccess(orderId: string): Promise<boolean> {
    // Bu sadece demo amaçlı, gerçek uygulamada Cryptomus webhook'ları kullanılmalı
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Math.random() > 0.3); // %70 başarı oranı simülasyonu
      }, 2000);
    });
  }
}

export const cryptomusApi = new CryptomusApiService();
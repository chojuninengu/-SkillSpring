import axios from 'axios';

const NKWA_API_URL = process.env.NEXT_PUBLIC_NKWA_API_URL;
const NKWA_API_KEY = process.env.NEXT_PUBLIC_NKWA_API_KEY;

interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  customerEmail: string;
  customerName: string;
  metadata?: Record<string, any>;
}

interface PaymentResponse {
  status: string;
  message: string;
  data: {
    reference: string;
    checkoutUrl: string;
  };
}

export const initializePayment = async (paymentDetails: PaymentRequest): Promise<PaymentResponse> => {
  try {
    const response = await axios.post(
      `${NKWA_API_URL}/payments/initialize`,
      paymentDetails,
      {
        headers: {
          'Authorization': `Bearer ${NKWA_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Payment initialization failed:', error);
    throw error;
  }
};

export const verifyPayment = async (reference: string) => {
  try {
    const response = await axios.get(
      `${NKWA_API_URL}/payments/verify/${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${NKWA_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Payment verification failed:', error);
    throw error;
  }
}; 
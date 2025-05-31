import { useState } from 'react';
import { useRouter } from 'next/router';
import { initializePayment } from '../utils/nkwaPayment';

interface PaymentButtonProps {
  amount: number;
  description: string;
  customerEmail: string;
  customerName: string;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  description,
  customerEmail,
  customerName,
  onSuccess,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      const response = await initializePayment({
        amount,
        currency: 'XAF', // Cameroon CFA Franc
        description,
        customerEmail,
        customerName,
        metadata: {
          orderId: Date.now().toString(),
        },
      });

      // Redirect to Nkwa's checkout page
      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      }

      onSuccess?.(response);
    } catch (error) {
      console.error('Payment failed:', error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors"
    >
      {isLoading ? 'Processing...' : 'Pay Now'}
    </button>
  );
};

export default PaymentButton; 
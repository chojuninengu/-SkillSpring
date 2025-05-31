import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { verifyPayment } from '../../utils/nkwaPayment';

const PaymentVerificationPage = () => {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyTransaction = async () => {
      const { reference } = router.query;

      if (!reference) {
        setStatus('error');
        setMessage('No payment reference found');
        return;
      }

      try {
        const response = await verifyPayment(reference as string);
        
        if (response.status === 'success') {
          setStatus('success');
          setMessage('Payment successful!');
          
          // Here you can update your backend about the successful payment
          // For example:
          // await updateOrderStatus(response.data);
          
          // Redirect to success page after 3 seconds
          setTimeout(() => {
            router.push('/payment/success');
          }, 3000);
        } else {
          setStatus('error');
          setMessage('Payment verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred while verifying payment');
      }
    };

    if (router.isReady) {
      verifyTransaction();
    }
  }, [router.isReady, router.query]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Verifying your payment...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Payment Successful!</h2>
            <p className="text-gray-600">Redirecting you to the success page...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">×</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Payment Failed</h2>
            <p className="text-gray-600">{message}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark transition-colors"
            >
              Return Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentVerificationPage; 
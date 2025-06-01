import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface PaymentButtonProps {
    courseId: number;
    price: number;
    isEnrolled?: boolean;
}

export default function PaymentButton({ courseId, price, isEnrolled = false }: PaymentButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handlePayment = async () => {
        if (isEnrolled) {
            toast.error('You are already enrolled in this course');
            return;
        }

        if (!confirm('Confirm payment via Nkwa App?')) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/payments/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ courseId }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Payment initiation failed');
            }

            toast.success('Payment initiated. Confirm in the Nkwa App.');
            
            // Optional: Poll for payment status
            // You could implement a polling mechanism here to check payment status
            // and redirect to course page once confirmed

        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Payment failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handlePayment}
            disabled={isLoading || isEnrolled}
            className={`
                px-6 py-2 rounded-lg font-medium text-white
                ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
                ${isEnrolled ? 'bg-green-600 cursor-not-allowed' : ''}
                transition-colors duration-200
            `}
        >
            {isEnrolled ? 'Enrolled' : isLoading ? 'Processing...' : `Pay ${(price / 100).toFixed(2)} XAF`}
        </button>
    );
} 
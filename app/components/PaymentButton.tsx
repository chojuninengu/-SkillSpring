'use client';

import React, { useState } from 'react';
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

        if (!confirm('Do you want to pay via Nkwa App?')) {
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

            toast.success(data.message || 'Payment initiated. Check Nkwa App to confirm.');
            
            // Start polling for payment status
            if (data.paymentId) {
                pollPaymentStatus(data.paymentId);
            }

        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Payment failed');
        } finally {
            setIsLoading(false);
        }
    };

    const pollPaymentStatus = async (paymentId: string) => {
        const maxAttempts = 30; // Poll for 5 minutes (10 seconds interval)
        let attempts = 0;

        const checkStatus = async () => {
            try {
                const response = await fetch(`/api/payments/status?paymentId=${paymentId}`);
                const data = await response.json();

                if (data.status === 'success') {
                    toast.success('Payment successful! Redirecting to course...');
                    router.refresh(); // Refresh the page to show enrolled status
                    return true;
                } else if (data.status === 'failed') {
                    toast.error('Payment failed. Please try again.');
                    return true;
                }
            } catch (error) {
                console.error('Error checking payment status:', error);
            }
            return false;
        };

        const poll = async () => {
            if (attempts >= maxAttempts) {
                toast.error('Payment status check timed out. Please refresh the page.');
                return;
            }

            attempts++;
            const isDone = await checkStatus();

            if (!isDone) {
                setTimeout(poll, 10000); // Check every 10 seconds
            }
        };

        setTimeout(poll, 10000); // Start first check after 10 seconds
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
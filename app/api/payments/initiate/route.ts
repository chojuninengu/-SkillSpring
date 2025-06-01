import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { courseId } = await request.json();

        if (!courseId) {
            return NextResponse.json(
                { error: 'Course ID is required' },
                { status: 400 }
            );
        }

        // Call backend API to initiate payment
        const response = await fetch(`${process.env.BACKEND_URL}/api/payments/initiate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.accessToken}`,
            },
            body: JSON.stringify({ courseId }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Payment initiation failed');
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Payment initiation error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Payment initiation failed' },
            { status: 500 }
        );
    }
} 
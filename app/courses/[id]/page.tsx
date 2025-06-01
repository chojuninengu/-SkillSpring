'use client';

import React from 'react';
import { Toaster } from 'react-hot-toast';
import PaymentButton from '../../../components/PaymentButton';

interface CourseDetailsProps {
    params: {
        id: string;
    }
}

export default async function CourseDetails({ params }: CourseDetailsProps) {
    const courseId = parseInt(params.id);
    
    // Fetch course details
    const response = await fetch(`/api/courses/${courseId}`);
    const course = await response.json();

    // Check if user is enrolled
    const enrollmentResponse = await fetch(`/api/courses/${courseId}/enrollment`);
    const { isEnrolled } = await enrollmentResponse.json();

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Toaster position="top-center" />
            
            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
            <p className="text-gray-600 mb-6">{course.description}</p>
            
            <div className="flex items-center justify-between bg-gray-50 p-6 rounded-lg">
                <div>
                    <p className="text-lg font-semibold">
                        Price: {course.price > 0 ? `${(course.price / 100).toFixed(2)} XAF` : 'Free'}
                    </p>
                    {isEnrolled && (
                        <p className="text-green-600 mt-2">You are enrolled in this course</p>
                    )}
                </div>
                
                {course.price > 0 && (
                    <PaymentButton 
                        courseId={courseId}
                        price={course.price}
                        isEnrolled={isEnrolled}
                    />
                )}
            </div>

            {/* Course content section */}
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Course Content</h2>
                {/* Add course content here */}
            </div>
        </div>
    );
} 
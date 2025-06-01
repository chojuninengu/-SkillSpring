import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { getStudentDashboardData } from '@/lib/api';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

async function StudentDashboardPage() {
  const data = await getStudentDashboardData();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6">
        <h1 className="text-3xl font-bold text-gray-900 px-6 mb-6">
          Student Dashboard
        </h1>
        <Suspense fallback={<LoadingSpinner />}>
          <StudentDashboard data={data} />
        </Suspense>
      </div>
    </main>
  );
}

export default StudentDashboardPage; 
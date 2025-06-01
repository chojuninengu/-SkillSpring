import { MentorDashboard } from '@/components/dashboard/MentorDashboard';
import { getMentorDashboardData } from '@/lib/api';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

async function MentorDashboardPage() {
  const data = await getMentorDashboardData();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6">
        <h1 className="text-3xl font-bold text-gray-900 px-6 mb-6">
          Mentor Dashboard
        </h1>
        <Suspense fallback={<LoadingSpinner />}>
          <MentorDashboard data={data} />
        </Suspense>
      </div>
    </main>
  );
}

export default MentorDashboardPage; 
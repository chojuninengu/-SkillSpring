import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge
} from '@/components/ui';
import { Users, FileCheck, Clock } from 'lucide-react';

interface MentorDashboardProps {
  data: {
    mentees: {
      total: number;
      active: number;
    };
    projects: {
      total: number;
      pendingReviews: number;
      completedReviews: number;
      reviewCompletionRate: number;
    };
    pendingReviews: Array<{
      studentId: string;
      studentName: string;
      studentEmail: string;
      projectId: string;
      projectTitle: string;
      submittedAt: string;
    }>;
    menteeList: Array<{
      id: string;
      name: string;
      email: string;
      enrolledCourses: number;
      completedProjects: number;
    }>;
  };
}

export const MentorDashboard: React.FC<MentorDashboardProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Stats Overview */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Mentees</p>
                <h3 className="text-2xl font-bold mt-2">{data.mentees.total}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {data.mentees.active} active
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                <h3 className="text-2xl font-bold mt-2">{data.projects.pendingReviews}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {data.projects.reviewCompletionRate}% completion rate
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Reviews</p>
                <h3 className="text-2xl font-bold mt-2">{data.projects.completedReviews}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  out of {data.projects.total} total
                </p>
              </div>
              <FileCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Reviews */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <h2 className="text-2xl font-bold">Pending Reviews</h2>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.pendingReviews.map((review) => (
                <TableRow key={review.projectId}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{review.studentName}</p>
                      <p className="text-sm text-gray-600">{review.studentEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>{review.projectTitle}</TableCell>
                  <TableCell>
                    {new Date(review.submittedAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mentee List */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Mentee Progress</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.menteeList.map((mentee) => (
              <div
                key={mentee.id}
                className="p-4 bg-gray-50 rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{mentee.name}</h3>
                  <Badge variant="outline">
                    {mentee.completedProjects} projects
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{mentee.email}</p>
                <p className="text-sm">
                  <span className="font-medium">{mentee.enrolledCourses}</span> courses enrolled
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 
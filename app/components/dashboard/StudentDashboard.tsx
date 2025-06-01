import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Progress,
  Avatar,
  Badge
} from '@/components/ui';
import { BookOpen, CheckCircle, Clock, User } from 'lucide-react';

interface StudentDashboardProps {
  data: {
    courses: {
      total: number;
      completed: number;
      active: number;
      progressPercentage: number;
    };
    projects: {
      total: number;
      completed: number;
      pending: number;
      progressPercentage: number;
    };
    mentor: {
      id: string;
      name: string;
      email: string;
      totalReviewedProjects: number;
    } | null;
    savedCourses: Array<{
      id: string;
      title: string;
      description: string;
      category: string;
      price: number;
    }>;
  };
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {/* Progress Overview */}
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <h2 className="text-2xl font-bold">Learning Progress</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Course Progress</span>
                <span>{data.courses.progressPercentage}%</span>
              </div>
              <Progress value={data.courses.progressPercentage} />
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>{data.courses.completed} Completed</span>
                <span>{data.courses.active} Active</span>
                <span>{data.courses.total} Total</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Project Completion</span>
                <span>{data.projects.progressPercentage}%</span>
              </div>
              <Progress value={data.projects.progressPercentage} />
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>{data.projects.completed} Completed</span>
                <span>{data.projects.pending} Pending</span>
                <span>{data.projects.total} Total</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mentor Information */}
      {data.mentor && (
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold">Your Mentor</h2>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar>
                <User className="h-12 w-12" />
              </Avatar>
              <div>
                <h3 className="font-medium">{data.mentor.name}</h3>
                <p className="text-sm text-gray-600">{data.mentor.email}</p>
                <p className="text-sm mt-2">
                  <span className="font-medium">{data.mentor.totalReviewedProjects}</span> projects reviewed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Courses */}
      <Card className="col-span-full">
        <CardHeader>
          <h2 className="text-2xl font-bold">Your Courses</h2>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {data.savedCourses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{course.title}</h3>
                  <p className="text-sm text-gray-600">{course.category}</p>
                </div>
                <Badge variant="secondary">
                  ${course.price.toFixed(2)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 
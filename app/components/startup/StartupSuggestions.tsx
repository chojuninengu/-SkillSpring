import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Badge,
  Button
} from '@/components/ui';
import {
  TrendingUp,
  DollarSign,
  BarChart,
  AlertTriangle,
  BookOpen
} from 'lucide-react';

interface StartupIdea {
  title: string;
  description: string;
  requiredSkills: string[];
  potentialRevenue: string;
  initialInvestment: string;
  marketDemand: string;
  challengeLevel: string;
}

interface RelatedCourse {
  id: string;
  title: string;
  description: string;
  price: number;
}

interface StartupSuggestionsProps {
  ideas: StartupIdea[];
  relatedCourses?: RelatedCourse[];
  onCourseSelect?: (courseId: string) => void;
}

const getRevenueColor = (level: string) => {
  switch (level.toLowerCase()) {
    case 'very high':
      return 'text-green-600';
    case 'high':
      return 'text-green-500';
    case 'medium':
      return 'text-yellow-500';
    case 'low':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};

const getChallengeColor = (level: string) => {
  switch (level.toLowerCase()) {
    case 'high':
      return 'text-red-500';
    case 'medium':
      return 'text-yellow-500';
    case 'low':
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
};

export const StartupSuggestions: React.FC<StartupSuggestionsProps> = ({
  ideas,
  relatedCourses,
  onCourseSelect
}) => {
  return (
    <div className="space-y-6">
      {/* Startup Ideas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ideas.map((idea, index) => (
          <Card key={index}>
            <CardHeader>
              <h3 className="text-xl font-bold">{idea.title}</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{idea.description}</p>
              
              <div className="space-y-4">
                {/* Required Skills */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {idea.requiredSkills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Business Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">
                      Revenue Potential:{' '}
                      <span className={getRevenueColor(idea.potentialRevenue)}>
                        {idea.potentialRevenue}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      Initial Investment: {idea.initialInvestment}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <BarChart className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">
                      Market Demand: {idea.marketDemand}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">
                      Challenge Level:{' '}
                      <span className={getChallengeColor(idea.challengeLevel)}>
                        {idea.challengeLevel}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Related Courses */}
      {relatedCourses && relatedCourses.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-xl font-bold">
              Recommended Courses to Support Your Startup
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {relatedCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    <div>
                      <h4 className="font-medium">{course.title}</h4>
                      <p className="text-sm text-gray-600">{course.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">
                      ${course.price.toFixed(2)}
                    </span>
                    {onCourseSelect && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCourseSelect(course.id)}
                      >
                        Learn More
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 
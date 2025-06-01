import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Progress,
  Button,
  Input,
  Badge,
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui';
import {
  PiggyBank,
  TrendingUp,
  Target,
  History,
  Plus,
  Minus,
  AlertCircle
} from 'lucide-react';

interface SavingsOverviewProps {
  savings: {
    amount: number;
    goal: number;
    lastUpdated: string;
  };
  startupSuggestions: Array<{
    title: string;
    description: string;
    requiredAmount: number;
    affordability: 'ready' | 'saving' | 'not_ready';
    savingsMessage: string;
  }>;
  onUpdateSavings: (amount: number, type: 'deposit' | 'withdraw', description: string) => Promise<void>;
  onUpdateGoal: (amount: number) => Promise<void>;
}

export const SavingsOverview: React.FC<SavingsOverviewProps> = ({
  savings,
  startupSuggestions,
  onUpdateSavings,
  onUpdateGoal
}) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSavingsUpdate = async (type: 'deposit' | 'withdraw') => {
    if (!amount || isNaN(parseFloat(amount))) return;
    
    setIsUpdating(true);
    try {
      await onUpdateSavings(parseFloat(amount), type, description);
      setAmount('');
      setDescription('');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGoalUpdate = async () => {
    if (!newGoal || isNaN(parseFloat(newGoal))) return;
    
    setIsUpdating(true);
    try {
      await onUpdateGoal(parseFloat(newGoal));
      setNewGoal('');
    } finally {
      setIsUpdating(false);
    }
  };

  const progressPercentage = savings.goal > 0
    ? Math.min(100, (savings.amount / savings.goal) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Savings Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Savings</h2>
            <PiggyBank className="h-8 w-8 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Current Amount */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Current Savings</span>
                <span className="font-medium">${savings.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Savings Goal</span>
                <span className="font-medium">${savings.goal.toFixed(2)}</span>
              </div>
              <Progress value={progressPercentage} />
              <p className="text-sm text-gray-500 mt-2">
                Last updated: {new Date(savings.lastUpdated).toLocaleDateString()}
              </p>
            </div>

            {/* Update Savings */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
                <Input
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSavingsUpdate('deposit')}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Deposit
                </Button>
                <Button
                  onClick={() => handleSavingsUpdate('withdraw')}
                  disabled={isUpdating}
                  variant="outline"
                  className="flex-1"
                >
                  <Minus className="h-4 w-4 mr-2" />
                  Withdraw
                </Button>
              </div>
            </div>

            {/* Update Goal */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="New Savings Goal"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  min="0"
                  step="0.01"
                />
                <Button
                  onClick={handleGoalUpdate}
                  disabled={isUpdating}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Set Goal
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Startup Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {startupSuggestions.map((suggestion, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold mb-2">{suggestion.title}</h3>
              <p className="text-gray-600 mb-4">{suggestion.description}</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Required Investment</span>
                  <span className="font-medium">
                    ${suggestion.requiredAmount.toFixed(2)}
                  </span>
                </div>

                <Alert
                  variant={suggestion.affordability === 'ready' ? 'default' : 'warning'}
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>
                    {suggestion.affordability === 'ready' ? 'Ready to Start!' : 'Savings Goal'}
                  </AlertTitle>
                  <AlertDescription>
                    {suggestion.savingsMessage}
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}; 
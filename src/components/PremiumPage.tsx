
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Check } from 'lucide-react';

export const PremiumPage: React.FC = () => {
  const features = [
    'Unlimited book access',
    'Early access to new releases',
    'Exclusive premium content',
    'Ad-free reading experience',
    'Priority customer support',
    'Special premium badges'
  ];

  return (
    <div className="space-y-6 pb-20">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Star className="h-8 w-8 text-yellow-500" />
          <h2 className="text-3xl font-bold">Premium Membership</h2>
          <Star className="h-8 w-8 text-yellow-500" />
        </div>
        <p className="text-muted-foreground">Unlock the full potential of your reading experience</p>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Premium Plan</CardTitle>
          <div className="text-4xl font-bold text-primary">$9.99/month</div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
          
          <Button className="w-full" size="lg">
            Upgrade to Premium
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            Cancel anytime. 30-day money-back guarantee.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Why Go Premium?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Join thousands of readers who have enhanced their reading experience with our premium features. 
            Get access to exclusive content, advanced features, and priority support.
          </p>
          <div className="bg-secondary/20 p-4 rounded-lg">
            <p className="text-sm">
              <strong>Limited Time Offer:</strong> Get your first month for just $4.99! 
              Use code READER50 at checkout.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

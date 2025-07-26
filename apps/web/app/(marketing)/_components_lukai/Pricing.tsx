import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for getting started with expense tracking',
      badge: null,
      features: [
        'Up to 10 expenses',
        'WhatsApp integration',
        'Basic categorization',
        'Simple analytics',
        'Web dashboard access',
      ],
      cta: 'Get Started Free',
      variant: 'outline' as const,
    },
    {
      name: 'Premium',
      price: '$4.99',
      period: 'per month',
      description: 'Complete expense tracking for individuals and small teams',
      badge: 'Most Popular',
      features: [
        'Unlimited expenses',
        'Advanced AI categorization',
        'OCR document processing',
        'Multi-currency support',
        'Advanced analytics & insights',
        'Mobile app access',
        'Budget management',
        'Financial reports',
        'Priority support',
      ],
      cta: 'Start 14-Day Free Trial',
      variant: 'default' as const,
    },
  ];

  return (
    <section id="pricing" className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
            Simple,{' '}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Transparent Pricing
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade when you need more. No hidden fees, cancel
            anytime.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative group hover:shadow-large transition-all duration-300 ${plan.badge ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/20'}`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-hero text-white px-4 py-1 font-semibold">
                    <Star className="w-3 h-3 mr-1" />
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center space-y-4 pt-8">
                <CardTitle className="text-2xl font-bold text-foreground">
                  {plan.name}
                </CardTitle>
                <div className="space-y-2">
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-4xl lg:text-5xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground">
                      /{plan.period}
                    </span>
                  </div>
                  <CardDescription className="text-muted-foreground">
                    {plan.description}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center space-x-3"
                    >
                      <div className="w-5 h-5 rounded-full bg-lukai-success/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-lukai-success" />
                      </div>
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button variant={plan.variant} size="lg" className="w-full">
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 space-y-4">
          <p className="text-sm text-muted-foreground">
            All plans include end-to-end encryption and data ownership
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
            <span>✓ 14-day free trial</span>
            <span>✓ No credit card required</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;

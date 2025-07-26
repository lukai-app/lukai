import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Brain, BarChart3, ArrowDown } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: MessageCircle,
      step: '01',
      title: 'Message WhatsApp',
      description:
        'Send a natural message like "I spent $25 on lunch at the cafe" to our WhatsApp bot.',
      color: 'bg-gradient-to-br from-[#25D366] to-[#128C7E]',
    },
    {
      icon: Brain,
      step: '02',
      title: 'AI Processes',
      description:
        'Our advanced AI extracts amount, category, and context. Automatically learns your spending patterns.',
      color: 'bg-gradient-hero',
    },
    {
      icon: BarChart3,
      step: '03',
      title: 'View Insights',
      description:
        'Access beautiful dashboards, analytics, and reports through web or mobile app.',
      color: 'bg-gradient-accent',
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started in seconds with our simple three-step process. No
            complex setup, no learning curve.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="group hover:shadow-large transition-all duration-300 border-border hover:border-primary/20">
                  <CardContent className="p-8 text-center space-y-6">
                    <div className="relative">
                      <div
                        className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300`}
                      >
                        <step.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center text-sm font-bold">
                        {step.step}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2">
                    <ArrowDown className="w-6 h-6 text-muted-foreground rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  MessageCircle,
  Brain,
  Shield,
  Globe,
  Camera,
  BarChart3,
  Smartphone,
  FileText,
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: MessageCircle,
      title: 'WhatsApp Integration',
      description:
        'Track expenses naturally through WhatsApp. Just message "I spent $20 on coffee" and we\'ll handle the rest.',
      color: 'text-[#25D366]',
    },
    {
      icon: Brain,
      title: 'AI-Powered Categorization',
      description:
        'Advanced AI automatically categorizes your expenses and learns from your spending patterns.',
      color: 'text-lukai-primary',
    },
    {
      icon: Camera,
      title: 'OCR Document Processing',
      description:
        'Upload receipts, invoices, or bank statements. Our AI extracts and processes financial data instantly.',
      color: 'text-lukai-secondary',
    },
    {
      icon: Globe,
      title: 'Multi-Language & Currency',
      description:
        'Supports multiple languages and currencies. Perfect for international users and businesses.',
      color: 'text-blue-500',
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description:
        'Beautiful dashboards with insights, spending patterns, and budget tracking to optimize your finances.',
      color: 'text-purple-500',
    },
    {
      icon: Shield,
      title: 'End-to-End Encryption',
      description:
        'Your financial data is encrypted and secure. Open source means full transparency and trust.',
      color: 'text-red-500',
    },
    {
      icon: Smartphone,
      title: 'Multi-Platform Access',
      description:
        'Access your data through web dashboard, mobile app, or directly through WhatsApp.',
      color: 'text-green-500',
    },
    {
      icon: FileText,
      title: 'Smart Financial Reports',
      description:
        'Generate comprehensive financial statements and reports with AI-driven insights.',
      color: 'text-orange-500',
    },
  ];

  return (
    <section id="features" className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
            Powerful Features for{' '}
            <span className="bg-primary bg-clip-text text-transparent">
              Smart Finance
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the future of expense tracking with AI-powered
            automation, natural language processing, and comprehensive financial
            insights.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-large transition-all duration-300 border-border hover:border-primary/20"
            >
              <CardHeader className="space-y-4">
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br from-background to-lukai-muted flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

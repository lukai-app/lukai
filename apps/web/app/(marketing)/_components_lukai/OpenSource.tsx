import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Github, Shield, Users, Heart } from 'lucide-react';

const OpenSource = () => {
  const benefits = [
    {
      icon: Shield,
      title: 'Transparent & Secure',
      description:
        'Open source means full code transparency. No hidden algorithms or backdoors.',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description:
        'Built with and for the community. Contribute features, report bugs, shape the future.',
    },
    {
      icon: Heart,
      title: 'Free Forever',
      description:
        'Core features will always be free. Premium features fund continued development.',
    },
  ];

  return (
    <section id="about" className="py-16 lg:py-24 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 bg-lukai-muted rounded-full px-4 py-2 text-sm font-medium text-lukai-primary mb-4">
            <Github className="w-4 h-4" />
            <span>Open Source & Transparent</span>
          </div>

          <h2 className="text-3xl lg:text-5xl font-bold text-foreground">
            Built in the{' '}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Open
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            LukAI is completely open source under AGPLv3 license. Inspect the
            code, contribute features, or host your own instance.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className="group hover:shadow-large transition-all duration-300 border-border hover:border-primary/20"
            >
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-hero flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="group">
              <Github className="w-5 h-5" />
              View on GitHub
              <span className="group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Button>
            <Button variant="outline" size="lg">
              Read Documentation
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Star us on GitHub • Join our community • Contribute to the future of
            expense tracking
          </p>
        </div>
      </div>
    </section>
  );
};

export default OpenSource;

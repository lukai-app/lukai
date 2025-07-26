import { Button } from '@/components/ui/button';
import { MessageCircle, ArrowRight, Sparkles } from 'lucide-react';

const CTA = () => {
  return (
    <section className="py-16 lg:py-24 bg-lukai-secondary">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-background border border-border rounded-full px-3 py-1.5 text-sm font-medium text-lukai-primary">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ready to transform your expense tracking?</span>
            </div>

            <h2 className="text-3xl lg:text-5xl font-bold text-lukai-primary leading-tight tracking-tight">
              Start tracking expenses with{' '}
              <span className="underline decoration-2 underline-offset-4">
                natural language
              </span>
            </h2>

            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Join thousands of users who have simplified their financial
              management with LukAI's intelligent WhatsApp integration.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="default" size="lg" className="group">
              <MessageCircle className="w-5 h-5" />
              Start Free Trial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg">
              Watch Demo
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border">
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-lukai-primary">
                10k+
              </div>
              <div className="text-sm text-muted-foreground">
                Expenses Tracked
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-lukai-primary">
                500+
              </div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-lukai-primary">
                99%
              </div>
              <div className="text-sm text-muted-foreground">Accuracy Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;

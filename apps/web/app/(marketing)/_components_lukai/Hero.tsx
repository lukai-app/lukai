'use client';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageCircle, Sparkles, Play } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

const Hero = () => {
  return (
    <section className="pt-24 pb-12 lg:pt-32 lg:pb-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-lukai-secondary border border-border rounded-full px-3 py-1.5 text-sm font-medium text-lukai-primary">
              <Sparkles className="w-3.5 h-3.5" />
              <span>WhatsApp-powered expense tracking</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-lukai-primary leading-tight tracking-tight">
              Track your expenses with{' '}
              <span className="text-lukai-primary underline decoration-2 underline-offset-4">
                natural language
              </span>
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Simply send a message to LukAI on WhatsApp: "Coffee $5" or "Uber
              $12 from work to home" and watch your expenses get tracked
              automatically with AI-powered categorization.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="default" size="lg" className="group">
              <MessageCircle className="w-5 h-5" />
              Start with WhatsApp
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg">
              <Play className="w-4 h-4" />
              Watch Demo
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Free forever • No credit card required • 2-minute setup
          </p>
        </div>

        <div className="mt-12 lg:mt-16 max-w-5xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-lukai-primary/5 to-transparent blur-2xl"></div>
            <div className="mt-8 h-[700px] md:mt-16 lg:mt-32">
              <video
                width="315px"
                playsInline={true}
                autoPlay={true}
                muted={true}
                loop={true}
                poster="/static/video-poster-5d52795e8fdd8db4391411308bc0cce8.webp"
                className="lg:hidden"
              >
                <source
                  src="https://pub-ec8befc8b1f943689bc95c09db6dac80.r2.dev/apolo/mobile.mp4"
                  type="video/mp4"
                />
              </video>

              {/* Desktop version */}
              <div className="hidden lg:block relative w-full">
                <div className="relative w-full max-w-6xl rounded-2xl overflow-hidden border border-[#696969]">
                  {/* Frame/Layout container */}
                  <img
                    src="/landing/dash-layout.png"
                    alt="Dashboard Interface"
                    className="w-full object-cover relative z-10 pointer-events-none"
                  />

                  {/* Scrollable content */}
                  <motion.div
                    className="absolute inset-0 z-10 max-w-[698px] top-[30px] left-[315px]"
                    initial={{ y: 0 }}
                    style={{
                      y: useTransform(
                        useScroll({
                          offset: ['start 200px', 'end end'],
                        }).scrollYProgress,
                        [0, 1],
                        [0, -100] // Adjust this value based on how much you want to scroll
                      ),
                    }}
                  >
                    <img
                      src="/landing/dash-content.png"
                      alt="Dashboard Content"
                      className="w-full object-cover"
                    />
                  </motion.div>
                </div>

                <div className="absolute z-20 -right-[130px] top-[80px] w-[285px] rounded-3xl overflow-hidden border border-gray-800/30 shadow-2xl">
                  <img
                    src="/landing/mobile.png"
                    alt="Mobile Interface"
                    className="w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

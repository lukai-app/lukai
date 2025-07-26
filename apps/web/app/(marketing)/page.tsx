import Header from './_components_lukai/Header';
import Hero from './_components_lukai/Hero';
import Features from './_components_lukai/Features';
import HowItWorks from './_components_lukai/HowItWorks';
import Pricing from './_components_lukai/Pricing';
import OpenSource from './_components_lukai/OpenSource';
import CTA from './_components_lukai/CTA';
import Footer from './_components_lukai/Footer';

const Page = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <OpenSource />
      <CTA />
      <Footer />
    </div>
  );
};

export default Page;

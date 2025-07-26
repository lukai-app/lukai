import { MessageCircle, Github, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  const links = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      /* { name: 'Documentation', href: '#' },
      { name: 'API', href: '#' }, */
    ],
    /* company: [
      { name: 'About', href: '#about' },
      { name: 'Blog', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Contact', href: '#' },
    ], */
    resources: [
      { name: 'GitHub', href: 'https://github.com/lukai-app/lukai' },
      /* { name: 'Community', href: '#' },
      { name: 'Support', href: '#' }, */
      //{ name: 'Status', href: '#' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy.html' },
      { name: 'Terms of Service', href: '/terms.html' },
      {
        name: 'License',
        href: 'https://github.com/lukai-app/lukai/blob/main/LICENSE',
      },
    ],
  };

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-6 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">LukAI</span>
            </div>
            <p className="text-muted-foreground max-w-md">
              Record your expenses in 3 seconds from WhatsApp
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/lukai-app/lukai"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-lukai-muted rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              {/* <a
                href="#"
                className="w-10 h-10 bg-lukai-muted rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a> */}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Product</h3>
            <ul className="space-y-2">
              {links.product.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Company</h3>
            <ul className="space-y-2">
              {links.company.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div> */}

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Resources</h3>
            <ul className="space-y-2">
              {links.resources.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Legal</h3>
            <ul className="space-y-2">
              {links.legal.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-sm text-muted-foreground">
            © 2025 LukAI. All rights reserved. Open source under AGPLv3
            license.
          </p>
          <p className="text-sm text-muted-foreground">❤️ Peru is password</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

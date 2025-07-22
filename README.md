# LukAI

<div align="center">
  <img src="https://lukai.com/logo.png" alt="LukAI Logo" width="120" height="120">
  <h3>Open-source AI scheduling infrastructure</h3>
  <p>The open-core scheduling infrastructure for absolutely everyone.</p>
</div>

## 🚀 About LukAI

LukAI is an open-core AI-powered scheduling platform that provides:

- **Smart Scheduling**: AI-powered meeting scheduling and optimization
- **Multi-Platform**: Web app, mobile app, and API
- **Open Source**: Core features available under AGPLv3
- **Enterprise Ready**: Commercial features for scaling businesses

## 📋 Table of Contents

- [📦 Tech Stack](#-tech-stack)
- [🏗️ Project Structure](#️-project-structure)
- [📄 License](#-license)
- [🚦 Getting Started](#-getting-started)
- [🔧 Development](#-development)
- [🤝 Contributing](#-contributing)

## 📦 Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Mobile**: React Native, Expo
- **Backend**: Node.js, TypeScript, Prisma
- **Database**: PostgreSQL
- **Monorepo**: Turborepo
- **Infrastructure**: Railway, Vercel

## 🏗️ Project Structure

```
lukai/
├── apps/
│   ├── web/              # Next.js web application (AGPLv3)
│   ├── mobile/           # React Native mobile app (AGPLv3)
│   └── backend/          # Node.js API server (AGPLv3)
├── packages/
│   ├── ui/               # Shared UI components (AGPLv3)
│   ├── config/           # Shared configurations (AGPLv3)
│   └── types/            # Shared TypeScript types (AGPLv3)
├── ee/                   # Enterprise Edition (Commercial License)
│   ├── features/         # Enterprise-only features
│   └── LICENSE           # Commercial license
├── docs/                 # Documentation
├── .github/              # GitHub templates and workflows
├── LICENSE               # AGPLv3 license
└── README.md
```

## 📄 License

LukAI uses a dual licensing approach:

### Open Source (AGPLv3)
- All code outside the `/ee` directory
- Core scheduling functionality
- Basic AI features
- API and integrations
- Mobile and web applications

### Commercial License
- Code in the `/ee` directory
- Enterprise features (coming soon)
- Advanced AI capabilities
- White-labeling options
- Priority support

> **Important**: If you're using LukAI in a SaaS product or modifying the code, the AGPLv3 license requires you to open-source your changes. For commercial use without open-sourcing, contact us about enterprise licensing.

For commercial licensing inquiries: licensing@lukai.com

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/lukai/lukai.git
   cd lukai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy example environment files
   cp apps/web/env.example apps/web/.env.local
   cp apps/backend/env.example apps/backend/.env.local
   cp apps/mobile/env.example apps/mobile/.env.local
   
   # Edit each .env.local file with your values
   # See docs/environment-setup.md for detailed instructions
   ```

4. **Set up the database**
   ```bash
   npm run db:migrate
   npm run db:generate
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Web app: http://localhost:3000
   - Backend API: http://localhost:3001
   - Mobile app: Expo development server

## 🔧 Development

### Commands

```bash
# Development
npm run dev          # Start all apps in development mode
npm run build        # Build all apps for production
npm run lint         # Run linting across all packages
npm run type-check   # Run TypeScript type checking
npm run test         # Run tests across all packages

# Database
npm run db:migrate   # Run database migrations
npm run db:generate  # Generate Prisma client
npm run db:deploy    # Deploy migrations to production

# Utilities
npm run clean        # Clean all build artifacts
npm run format       # Format code with Prettier
```

### Working with the Monorepo

Each app/package has its own:
- `package.json` with specific dependencies
- `README.md` with app-specific documentation
- `.env.example` with required environment variables

### Adding New Packages

```bash
# Generate a new package
npx turbo gen workspace --name @lukai/new-package
```

## 🤝 Contributing

We love contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contributing Steps

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests if needed
5. Run `npm run lint` and `npm run type-check`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## 🏢 Enterprise

Looking for enterprise features, support, or custom integrations?

- 📧 Email: enterprise@lukai.com
- 🌐 Website: https://lukai.com/enterprise
- 📅 Book a call: https://lukai.com/demo

---

<div align="center">
  <p>Built with ❤️ by the LukAI team</p>
  <p>
    <a href="https://lukai.com">Website</a> •
    <a href="https://docs.lukai.com">Documentation</a> •
    <a href="https://discord.gg/lukai">Discord</a> •
    <a href="https://twitter.com/lukai">Twitter</a>
  </p>
</div> 
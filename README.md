# Online Utilities

A modern, privacy-focused collection of web utilities built with Next.js. Features a sleek glassmorphism design with persistent data storage that works entirely in your browser.

## 🌟 Features

### Utilities

- **Timer** - Customizable countdown timers with sound alerts
- **Stopwatch** - Multi-stopwatch support with lap tracking
- **Notepad** - Markdown-enabled text editor with auto-save
- **Color Picker** - Advanced color tools with image color extraction
- **QR Code Generator** - Customizable QR codes with various output formats
- **Calculator** - Basic calculator with calculation history

### Core Features

- 🎨 **Glassmorphism UI** - Modern frosted glass design aesthetic
- 🗄️ **Local Storage** - All data stored locally using IndexedDB via Dexie
- 🌍 **Internationalization** - Multi-language support with next-intl
- 🌙 **Dark/Light Theme** - System-aware theme switching
- 📱 **Responsive Design** - Works seamlessly on all device sizes
- 🔍 **Command Palette** - Quick navigation and search functionality
- 📊 **Analytics** - Privacy-focused analytics with PostHog
- ⚡ **Performance** - Optimized with Turbopack for fast development

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/jaycho1214/onlineutilities.git
cd onlineutilities
```

2. Install dependencies:

```bash
pnpm install
# or
npm install
```

3. Run the development server:

```bash
pnpm dev
# or
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── calculator/         # Calculator page
│   ├── color-picker/       # Color picker page
│   ├── notepad/           # Notepad pages (with dynamic routing)
│   ├── qr-code/           # QR code generator page
│   ├── stopwatch/         # Stopwatch pages
│   └── timer/             # Timer pages
├── components/            # Shared UI components
├── features/              # Feature-specific modules
│   ├── calculator/        # Calculator functionality
│   ├── color-picker/      # Color picker tools
│   ├── feedback/          # User feedback system
│   ├── notepad/          # Markdown editor and notes
│   ├── qr-code/          # QR code generation
│   ├── shared/           # Shared components and utilities
│   ├── stopwatch/        # Stopwatch functionality
│   └── timer/            # Timer functionality
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and database
└── constants.ts          # Application constants and configuration
```

## 🛠️ Technology Stack

### Core

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS 4** - Utility-first CSS framework

### UI & Design

- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library
- **next-themes** - Theme management
- **Glassmorphism** - Custom glass-effect components

### Data & Storage

- **Dexie** - IndexedDB wrapper for local data persistence
- **dexie-react-hooks** - React hooks for Dexie integration

### Developer Experience

- **ESLint** - Code linting and formatting
- **Turbopack** - Fast development bundler
- **PostHog** - Privacy-focused analytics

### Additional Libraries

- **next-intl** - Internationalization framework
- **react-colorful** - Color picker components
- **qr-code-styling** - QR code generation with styling
- **MDXEditor** - Rich markdown editing experience
- **cmdk** - Command palette functionality
- **sonner** - Toast notifications

## 🎨 Design System

The application uses a custom glassmorphism design system built on top of Tailwind CSS:

- **Glass Surfaces** - Frosted glass effect with backdrop blur
- **Responsive Grid** - Adaptive layouts for all screen sizes
- **Theme Support** - Seamless dark/light mode transitions
- **Gradient Backgrounds** - Dynamic animated backgrounds
- **Accessible** - WCAG compliant with proper focus management

## 💾 Data Persistence

All user data is stored locally in the browser using IndexedDB through Dexie:

- **Notes** - Markdown content with metadata
- **Timer History** - Custom timer configurations
- **Stopwatch Sessions** - Multiple stopwatch states
- **Color History** - Recently used colors
- **Calculator History** - Previous calculations
- **User Preferences** - Theme, settings, and personalization

## 🌍 Internationalization

The app supports multiple languages using next-intl:

- **English** (default) - Complete localization
- **Extensible** - Easy to add new languages
- **Dynamic Loading** - Only loads required locale data
- **Type-safe** - Full TypeScript support for translations

## 🔧 Available Scripts

```bash
# Development
pnpm dev          # Start development server with Turbopack
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Package management
pnpm install      # Install dependencies
```

## 🚀 Deployment

### Vercel (Recommended)

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Deploy automatically with zero configuration

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- **Netlify** - Static export or server functions
- **Railway** - Full-stack deployment
- **AWS** - Using AWS Amplify or EC2
- **Self-hosted** - Using Docker or PM2

## 🛡️ Privacy

This application prioritizes user privacy:

- **Local Storage Only** - No data sent to external servers
- **No Registration** - Use without creating accounts
- **Optional Analytics** - PostHog integration for usage insights
- **Open Source** - Full transparency in code and data handling

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- **Live Demo**: [https://onlineutilities.org](https://onlineutilities.org)
- **GitHub**: [https://github.com/jaycho1214/onlineutilities](https://github.com/jaycho1214/onlineutilities)

---

Built with ❤️ using Next.js and modern web technologies.

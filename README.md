# Collaborative Notes Web 🌐

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 📖 About

My modern React frontend for collaborative note-taking - a sleek, responsive web application that enables real-time collaboration, hierarchical organization, and seamless team communication. Built with the latest React 19, TypeScript, and a beautiful UI powered by Shadcn components.

## ✨ Features

- 📝 **Real-time Note Editing** - Collaborative editing with live updates
- 📁 **Smart Folder Management** - Unlimited nested folder hierarchy with breadcrumb navigation
- 💬 **Team Messaging** - Built-in chat system for collaboration
- 🎨 **Beautiful UI** - Modern design with Shadcn UI components and TailwindCSS
- 📱 **Fully Responsive** - Optimized for desktop, tablet, and mobile devices
- 🌙 **Dark Mode** - Built-in theme switching with system preference detection
- ⚡ **Lightning Fast** - Vite-powered development with React Query caching
- 🔐 **Secure Authentication** - Better Auth integration with session management
- 🎯 **Type Safety** - Full TypeScript coverage for better developer experience
- ♿ **Accessibility** - WCAG compliant with keyboard navigation support

## 🛠️ Tech Stack

### Core Framework

- **React 19** - Latest React with concurrent features
- **TypeScript** - Full type safety and developer experience
- **Vite** - Fast build tool and dev server

### Styling & UI

- **TailwindCSS v4** - Utility-first CSS framework
- **Shadcn UI** - Unstyled, accessible components
- **Lucide React** - Beautiful icon library
- **next-themes** - Dark mode support

### State Management

- **TanStack Query** - Server state management with caching
- **Zustand** - Client state management
- **React Hook Form** - Form state with validation

### Routing & Navigation

- **React Router v7** - Client-side routing
- **Path aliases** - Clean imports with `@/` prefix

### Development Tools

- **ESLint** - Code linting and quality
- **React Query DevTools** - Query debugging
- **TypeScript Strict Mode** - Enhanced type checking

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend server running (see [collaborative.notes.backend](../collaborative.notes.backend))

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/kubilayture/collaborative.notes.web.git
   cd collaborative.notes.web
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   Create a `.env.local` file in the root directory:

   ```env
   # Backend API URL
   VITE_API_URL=http://localhost:4000

   # Better Auth Configuration
   BETTER_AUTH_SECRET=your_secret_key_here
   BETTER_AUTH_URL=http://localhost:5173
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/         # Reusable components
│   ├── auth/          # Authentication components
│   ├── common/        # Shared components
│   ├── folders/       # Folder management
│   ├── layout/        # Layout components
│   └── ui/            # Shadcn UI components
├── hooks/             # Custom React hooks
├── lib/               # Utilities and configurations
│   ├── auth-client.ts # Better Auth client
│   └── date-utils.ts  # Date formatting utilities
├── pages/             # Route components
│   ├── auth/          # Authentication pages
│   ├── messaging/     # Chat functionality
│   └── notes/         # Note management
├── providers/         # React context providers
├── types/             # TypeScript type definitions
├── globals.css        # Global styles
└── main.tsx           # Application entry point
```

## 🔧 Development Scripts

```bash
npm run dev           # Start development server with hot reload
npm run build         # Build for production
npm run preview       # Preview production build locally
npm run lint          # Run ESLint
```

## 🎨 Key Features Showcase

### Real-time Collaboration

- Live cursor tracking and user presence
- Conflict-free collaborative editing
- Auto-save functionality with optimistic updates

### Smart Folder Management

- Drag-and-drop organization
- Breadcrumb navigation with click-to-navigate
- Nested folder support with unlimited depth
- Smart folder pre-selection based on current location

### Responsive Design

- Mobile-first approach with touch-friendly interactions
- Adaptive layouts for different screen sizes
- Progressive enhancement for better performance

### Dark Mode Support

- System preference detection
- Smooth transitions between themes
- Consistent color schemes across all components

## 🌐 Related Projects

- **Backend**: [Collaborative Notes Backend](../collaborative.notes.backend) - NestJS API server

## 📝 License

This project is part of my personal portfolio. Feel free to explore the code!

## 🤝 Contributing

This is a personal project, but I'm open to suggestions and feedback. Feel free to open an issue or reach out!

---

Built with ❤️ using React, TypeScript, and modern web technologies

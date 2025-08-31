# Exness Frontend

A modern React application with authentication, routing, and local state management for the Exness trading platform.

## Features

- 🎨 **Modern UI/UX**: Beautiful landing page with gradient backgrounds and glassmorphism effects
- 🔐 **Authentication**: Complete sign-in and sign-up functionality with form validation
- 🛡️ **Protected Routes**: Secure dashboard access with authentication guards
- 📱 **Responsive Design**: Mobile-first approach with Tailwind CSS
- 🔄 **Local State Management**: React hooks for component state management
- 🚀 **React Router**: Client-side routing with React Router DOM
- ⚡ **TypeScript**: Full TypeScript support for better development experience

## Pages

### Landing Page (`/`)
- Hero section with call-to-action buttons
- Feature highlights with icons
- Navigation to sign-in and sign-up pages
- Modern gradient background design

### Sign In (`/signin`)
- Email and password authentication
- Form validation with error handling
- Remember me functionality
- Link to sign-up page

### Sign Up (`/signup`)
- User registration with name, email, and password
- Password confirmation validation
- Terms of service agreement
- Link to sign-in page

### Dashboard (`/dashboard`)
- Protected route requiring authentication
- User account overview
- Quick action buttons
- Recent activity display
- Sign out functionality

## Tech Stack

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # React components
│   ├── LandingPage.tsx
│   ├── SignIn.tsx
│   ├── SignUp.tsx
│   ├── Dashboard.tsx
│   └── ProtectedRoute.tsx
├── App.tsx             # Main app component
├── main.tsx           # App entry point
└── index.css          # Global styles
```

## State Management

The application uses React's built-in state management:

- **Local State**: Each component manages its own state using `useState`
- **Authentication**: Token-based authentication using localStorage
- **Form Validation**: Client-side validation with error handling
- **Loading States**: Loading indicators for async operations

## Authentication Flow

1. User visits landing page
2. Clicks "Sign In" or "Sign Up"
3. Fills out form with validation
4. Submits form (simulated API call)
5. Token is stored in localStorage
6. User is redirected to dashboard
7. Protected routes check for token in localStorage

## Styling

The application uses Tailwind CSS with:
- Custom gradient backgrounds
- Glassmorphism effects
- Responsive design
- Smooth transitions and animations
- Custom scrollbar styling

## Development Notes

- All forms include client-side validation
- Error states are handled gracefully
- Loading states provide user feedback
- Responsive design works on all screen sizes
- TypeScript ensures type safety throughout
- No external state management libraries required

## Future Enhancements

- Real API integration
- User profile management
- Password reset functionality
- Email verification
- Two-factor authentication
- Dark/light theme toggle
- Internationalization (i18n)
- Unit and integration tests

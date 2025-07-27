# HomeHerosApp

A full-stack React Native application with Expo that runs on Web, iOS, and Android. HomeHerosApp is a service provider application for the HomeHeros platform.

## Features

- Cross-platform support (Web, iOS, Android) from a single codebase
- Styled with Nativewind (Tailwind CSS for React Native)
- Supabase integration for authentication and database
- CI/CD with GitHub and Vercel
- Smooth onboarding flow with location selection
- Persistent user preferences across sessions
- Responsive design that works on all platforms

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- Expo CLI
- Supabase account (for backend)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/HomeherosApp.git
cd HomeherosApp
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```
Update the `.env` file with your Supabase credentials.

4. Start the development server
```bash
# For web
npm run web

# For iOS
npm run ios

# For Android
npm run android
```

## Deployment

The web version of this app is automatically deployed to Vercel when changes are pushed to the main branch.

### Web Deployment

```bash
npm run build:web
```

This will create a production build in the `web-build` directory that can be deployed to Vercel.

## Project Structure

```
├── app/                # Main application code
├── assets/             # Static assets
├── components/         # Reusable components
├── contexts/           # React contexts (Auth, Location)
├── lib/                # Utility functions and libraries
├── navigation/         # Navigation components
│   ├── AppNavigator.native.tsx  # Native navigation
│   └── AppNavigator.web.tsx     # Web navigation
└── screens/            # Application screens
```

## Current Status

- ✅ Authentication with Supabase
- ✅ Location selection and persistence
- ✅ Cross-platform navigation
- ✅ Tab-based main interface
- ✅ Profile and settings
- 🚧 Styling and UI polish

## Built With

- [Expo](https://expo.dev/) - Cross-platform React framework
- [React Native](https://reactnative.dev/) - Mobile app framework
- [React Native Web](https://necolas.github.io/react-native-web/) - Web compatibility
- [Nativewind](https://www.nativewind.dev/) - Tailwind CSS for React Native
- [Supabase](https://supabase.io/) - Backend as a Service
- [Vercel](https://vercel.com/) - Web deployment platform

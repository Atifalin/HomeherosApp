# HomeHerosApp

A full-stack React Native application with Expo that runs on Web, iOS, and Android. HomeHerosApp is a service provider application for the HomeHeros platform with integrated HomeherosGo onboarding system.

## Features

### Core Application
- Cross-platform support (Web, iOS, Android) from a single codebase
- Styled with Nativewind (Tailwind CSS for React Native)
- Supabase integration for authentication and database
- CI/CD with GitHub and Vercel
- Smooth onboarding flow with location selection
- Persistent user preferences across sessions
- Responsive design that works on all platforms

### HomeherosGo Onboarding System 🚀
- **Multi-step onboarding flow** for service providers
- **Two user types**: Homehero and Contractor with different application forms
- **Homehero path**: Eligibility check, service interest, document upload requirements
- **Contractor path**: Banking info, start date, company overview, terms agreement
- **Application submission** with pending status for admin approval
- **Admin dashboard** for reviewing and managing applications
- **Role-based access control** with secure RLS policies

### Admin Features 🛠️
- **Admin dashboard** accessible from profile screen
- **Application management**: View, approve, reject pending applications
- **Dashboard statistics**: Pending applications count and metrics
- **Secure role-based access** using Supabase RLS policies

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

## HomeherosGo Usage

### For Service Providers (Onboarding)
1. **Access HomeherosGo**: Click the "🚀 HomeherosGo" button on the login screen
2. **Personal Details**: Fill out name, phone, address, email, and password
3. **User Type Selection**: Choose between "Homehero" or "Contractor"
4. **Application Form**: Complete the specific form for your user type
   - **Homehero**: Eligibility, service interest, document requirements
   - **Contractor**: Banking info, start date, company overview, terms
5. **Submit Application**: Review and submit for admin approval
6. **Confirmation**: Receive confirmation message with next steps

### For Admins (Application Management)
1. **Access Admin Dashboard**: Click "🛠️ Admin Dashboard" button on profile screen (admin-only)
2. **View Applications**: See list of pending HomeherosGo applications
3. **Review Details**: Check applicant information and application data
4. **Manage Applications**: Approve or reject applications (coming soon)
5. **Dashboard Stats**: Monitor application metrics and counts

### Database Migrations
Apply the following migrations in order:
1. `20250813_add_homeheros_go_support.sql` - Core schema extensions
2. `20250813_add_homeheros_go_functions.sql` - Admin functions and views
3. `20250813_fix_user_creation_trigger.sql` - User creation trigger fix
4. `20250813_fix_infinite_recursion_policies.sql` - RLS policy fixes
5. `20250813_add_admin_view_policy.sql` - Admin access policies

## Project Structure

```
├── app/                # Main application code
├── assets/             # Static assets
├── components/         # Reusable components
├── contexts/           # React contexts (Auth, Location)
├── lib/                # Utility functions and libraries
├── navigation/         # Navigation components
│   ├── AppNavigator.native.tsx  # Native navigation
│   ├── AppNavigator.web.tsx     # Web navigation
│   ├── TabNavigator.native.tsx  # Native tab navigation
│   └── TabNavigator.web.tsx     # Web tab navigation
├── screens/            # Application screens
│   ├── AdminDashboardScreen.tsx      # Admin dashboard
│   ├── HomeherosGoOnboardingScreen.tsx # HomeherosGo onboarding
│   ├── LoginScreen.tsx               # Login with HomeherosGo button
│   ├── ProfileScreen.tsx             # Profile with admin access
│   └── ...                          # Other screens
└── supabase/           # Database migrations and schema
    └── migrations/     # SQL migration files
```

## Database Schema

### Tables
- **`profiles`**: Extended user profiles with HomeherosGo fields
  - `user_type`: 'homehero' | 'contractor' | null
  - `status`: 'pending' | 'approved' | 'rejected' | null
  - `application_data`: JSONB field storing form responses
  - `approved_at`, `approved_by`: Approval tracking

- **`user_roles`**: Role-based access control
  - `user_id`: Reference to auth.users
  - `role`: 'admin' | 'user'
  - `is_active`: Boolean for role status

### Security
- **Row Level Security (RLS)** policies for data protection
- **Admin-only functions** for application approval/rejection
- **Safe role-checking functions** to prevent infinite recursion
- **Secure profile access** with proper user isolation

## Current Status

### Core Features ✅
- ✅ Authentication with Supabase
- ✅ Location selection and persistence
- ✅ Cross-platform navigation
- ✅ Tab-based main interface
- ✅ Profile and settings

### HomeherosGo Features ✅
- ✅ Multi-step onboarding flow (Personal Details → User Type → Application → Confirmation)
- ✅ Homehero and Contractor application forms
- ✅ Application submission with pending status
- ✅ Admin dashboard with application listing
- ✅ Role-based access control and RLS policies
- ✅ Database schema with proper migrations
- ✅ Cross-platform navigation support
- ✅ Admin dashboard navigation and back button

### Pending Features 🚧
- 🚧 **Hero profile indicator** when account is pending approval
- 🚧 **Approval process implementation** on admin dashboard (approve/reject buttons)
- 🚧 **UI beautification** for onboarding and admin dashboard
- 🚧 **Document upload functionality** for required documents
- 🚧 **Email notifications** for application status changes
- 🚧 **Enhanced error handling** and user feedback

## Built With

- [Expo](https://expo.dev/) - Cross-platform React framework
- [React Native](https://reactnative.dev/) - Mobile app framework
- [React Native Web](https://necolas.github.io/react-native-web/) - Web compatibility
- [Nativewind](https://www.nativewind.dev/) - Tailwind CSS for React Native
- [Supabase](https://supabase.io/) - Backend as a Service
- [Vercel](https://vercel.com/) - Web deployment platform

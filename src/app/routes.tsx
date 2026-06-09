import { createBrowserRouter } from 'react-router';
import Home from './pages/home';
import Pricing from './pages/pricing';
import GetStarted from './pages/get-started';
import Login from './pages/login';
import Signup from './pages/signup';
import VerifyPending from './pages/verify-pending';
import VerifyEmail from './pages/verify-email';
import AcceptInvitation from './pages/accept-invitation';
import LeadDashboard from './pages/lead-dashboard';
import MemberDashboard from './pages/member-dashboard';
import NewProject from './pages/new-project';
import BillingUser from './pages/billing-user';
import Deployboard from './pages/deployboard';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Home,
  },
  {
    path: '/home',
    Component: Home,
  },
  {
    path: '/pricing',
    Component: Pricing,
  },
  {
    path: '/get-started',
    Component: GetStarted,
  },
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/signup',
    Component: Signup,
  },
  {
    path: '/verify-pending',
    Component: VerifyPending,
  },
  {
    path: '/verify-email',
    Component: VerifyEmail,
  },
  {
    path: '/accept-invitation',
    Component: AcceptInvitation,
  },
  {
    path: '/dashboard/lead',
    Component: LeadDashboard,
  },
  {
    path: '/dashboard/member',
    Component: MemberDashboard,
  },
  {
    path: '/new-project',
    Component: Deployboard,
  },
  {
    path: '/billing',
    Component: BillingUser,
  },
  {
    path: '/deployboard',
    Component: Deployboard,
  },
]);

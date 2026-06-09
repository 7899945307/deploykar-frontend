import { RouterProvider } from 'react-router';
import { ThemeProvider } from './components/theme-provider';
import { UserProvider } from './context/user-context';
import { ThreeBackground } from './components/three-background';
import { router } from './routes';

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <ThreeBackground />
        <div className="relative z-[1]">
          <RouterProvider router={router} />
        </div>
      </UserProvider>
    </ThemeProvider>
  );
}

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '@/hooks/use-app-data';
import { Onboarding } from '@/components/onboarding';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const { userData, isInitialized } = useAppData();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInitialized && userData) {
      navigate('/app/dashboard');
    }
  }, [userData, isInitialized, navigate]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="w-full max-w-lg space-y-4 p-4">
           <div className="flex items-center justify-center space-x-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-6 w-[250px]" />
                <Skeleton className="h-4 w-[350px]" />
            </div>
           </div>
           <div className="space-y-6 pt-8">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
           </div>
        </div>
      </div>
    );
  }

  if (userData) {
    // Already redirecting, show loader
     return (
        <div className="flex min-h-screen w-full items-center justify-center">
         <p>Loading your dashboard...</p>
       </div>
     );
  }

  return <Onboarding />;
}

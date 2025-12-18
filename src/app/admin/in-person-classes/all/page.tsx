'use client';
import { useEffect, useState } from 'react';
import { InPersonClass, VirtualClass } from '../../../../../typings';
import AdmimDashboardLayout from '../../../../components/AdmimDashboardLayout';
import { MiniLoadingSpinner } from '../../../../components/PageComponent/Products/MiniSpinner';
import { AllInPersonClasses } from '../../../../components/PageComponent/AdminInPersonClass';
import { useAuth } from '../../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function Page() {
  const [classes, setClasses] = useState<InPersonClass[]>([]);
  const [virtualClasses, setVirtualClasses] = useState<VirtualClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    const cookies: any = Cookies.get('userToken');
    
    if (!cookies) {
      router.push('/login');
      return;
    }
    
    if (!auth.user) {
      auth.fetchUser();
    } else if (auth.user?.rol !== 'Admin') {
      router.push('/login');
    }
  }, [auth.user, auth, router]);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const [presencialRes, virtualRes] = await Promise.all([
          fetch('/api/inPersonClass/getClasses', {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
            },
          }),
          fetch('/api/virtualClass/getClasses', {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
            },
          })
        ]);

        if (!presencialRes.ok) {
          throw new Error('Error fetching presencial classes');
        }

        if (!virtualRes.ok) {
          throw new Error('Error fetching virtual classes');
        }

        const presencialData = await presencialRes.json();
        const virtualData = await virtualRes.json();
        
        setClasses(presencialData);
        setVirtualClasses(virtualData);
      } catch (err) {
        console.error('Error fetching classes:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchClasses();
  }, []);

  if (isLoading) {
    return (
      <AdmimDashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <MiniLoadingSpinner />
        </div>
      </AdmimDashboardLayout>
    );
  }

  return (
    <AdmimDashboardLayout>
      <AllInPersonClasses 
        classes={classes} 
        setClasses={setClasses}
        virtualClasses={virtualClasses}
        setVirtualClasses={setVirtualClasses}
      />
    </AdmimDashboardLayout>
  );
}


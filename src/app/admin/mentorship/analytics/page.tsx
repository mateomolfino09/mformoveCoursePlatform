"use client"
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../hooks/useAuth';
import Cookies from 'js-cookie';
import AdmimDashboardLayout from '../../../../components/AdmimDashboardLayout';

export default function AdminMentorshipAnalyticsPage() {
  const router = useRouter();
  const auth = useAuth();
  const [loading, setLoading] = useState(true);

  // Protección de admin
  useEffect(() => {
    const cookies: any = Cookies.get('userToken')
    
    if (!cookies) {
      router.push('/login');
    }
    
    if (!auth.user) {
      auth.fetchUser()
    }
    else if (auth.user.rol != 'Admin') {
      router.push('/login');
    }
  }, [auth.user]);

  return (
    <AdmimDashboardLayout>
      <div className="bg-gray-700 w-full md:h-[100vh] p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-white font-montserrat text-3xl mb-8 font-bold">
            Analytics de Mentoría
          </h1>
          
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">
              Esta sección estará disponible próximamente para mostrar estadísticas y métricas de los planes de mentoría.
            </p>
          </div>
        </div>
      </div>
    </AdmimDashboardLayout>
  );
} 
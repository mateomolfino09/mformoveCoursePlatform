'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdmimDashboardLayout from '../../../../../components/AdmimDashboardLayout';
import Head from 'next/head';
import { MiniLoadingSpinner } from '../../../../../components/PageComponent/Products/MiniSpinner';
import CreateInPersonClass from '../../../../../components/PageComponent/AdminInPersonClass/CreateInPersonClass';
import { InPersonClass, VirtualClass } from '../../../../../../typings';
import { toast } from 'react-toastify';

interface PageProps {
  params: {
    id: string;
  };
}

type ClassType = 'presencial' | 'virtual';

const EditInPersonClassPage = ({ params }: PageProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preferredType = (searchParams?.get('type') as ClassType | null) || 'presencial';
  const [resolvedType, setResolvedType] = useState<ClassType>('presencial');
  const [classData, setClassData] = useState<InPersonClass | VirtualClass | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const typesToTry: ClassType[] = preferredType === 'virtual' ? ['virtual', 'presencial'] : ['presencial', 'virtual'];
      for (const type of typesToTry) {
        try {
          const endpoint = type === 'virtual'
            ? `/api/virtualClass/getClassById/${params.id}`
            : `/api/inPersonClass/getClassById/${params.id}`;
          const res = await fetch(endpoint, { cache: 'no-store' });
          if (!res.ok) {
            continue;
          }
          const data = await res.json();
          setClassData(data);
          setResolvedType(type);
          setIsLoading(false);
          return;
        } catch (error) {
          console.error('Error fetching class data', error);
        }
      }
      toast.error('No encontramos la clase solicitada.');
      router.push('/admin/in-person-classes/all');
    };

    fetchData();
  }, [params.id, preferredType, router]);

  return (
    <>
      <Head>
        <title>Editar Clase</title>
        <meta name='description' content='Editar clase presencial o virtual' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      {isLoading || !classData ? (
        <div className='flex justify-center items-center min-h-[60vh]'>
          <MiniLoadingSpinner />
        </div>
      ) : (
        <CreateInPersonClass
          initialData={classData}
          mode='edit'
          initialClassType={resolvedType}
          initialId={params.id}
        />
      )}
    </>
  );
};

export default EditInPersonClassPage;
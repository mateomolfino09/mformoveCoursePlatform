// app/admin/users/page.tsx

import ShowUsers from '../../../components/PageComponent/AdminUsers';
import { getConfirmedUsers } from '../../api/user/getConfirmedUsers';

interface InitialData {
  users: any[];
  total: number;
  totalPages?: number; 
  currentPage?: number; 
}


interface PageProps {
  searchParams: {
    page?: string;
    limit?: string;
  };
}

export default async function Page({ searchParams }: PageProps) {
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const limit = searchParams.limit ? parseInt(searchParams.limit, 10) : 10;

  const initialData: InitialData = await getConfirmedUsers(page, limit);

  // Asegúrate de que los datos sean serializables
  return <ShowUsers initialData={JSON.parse(JSON.stringify(initialData))} />;
}

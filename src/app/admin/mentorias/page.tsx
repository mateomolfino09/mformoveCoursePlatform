import AdminMentorshipIndex from '../../../components/PageComponent/AdminMentorship/AdminMentorshipIndex';
import connectDB from '../../../config/connectDB';

export default async function Page() {
  connectDB();

  return (
    <AdminMentorshipIndex />
  );
}; 
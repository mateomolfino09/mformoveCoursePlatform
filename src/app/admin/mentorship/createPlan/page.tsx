import CreateMentorshipPlan from '../../../../components/PageComponent/AdminMentorship/CreateMentorshipPlan';
import connectDB from '../../../../config/connectDB';

export default async function Page() {
  connectDB();

  return (
    <CreateMentorshipPlan />
  );
}; 
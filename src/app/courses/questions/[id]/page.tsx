import { getQuestionById } from '../../../api/question/getQuestionById';
import connectDB from '../../../../config/connectDB';
import QuestionPage from '../../../../components/PageComponent/QuestionPage';

  export default async function Page({ params }: { params: { id: number }}) {
  connectDB();
  const { id } = params;
  const question = await getQuestionById(id);

  
    return (
      <QuestionPage question={question}/>
    );
  };
import { IndividualClass, Question } from "../../../../../../typings";
import IndividualClassPage from "../../../../../components/PageComponent/ClassPage/IndividualClass";
import connectDB from "../../../../../config/connectDB";
import { getQuestionsFromClass } from "../../../../api/individualClass/getAllQuestions";
import { getClassById } from "../../../../api/individualClass/getClassById";
import { getClassByUrl } from "../../../../api/individualClass/getClassByUrl";



export default async function Page({ params }: { params: { url: string }}) {
    connectDB();
    const { url } = params;

     const clase: IndividualClass = await getClassByUrl(url);
     const questions: Question[] = await getQuestionsFromClass(clase._id)

  return (
     <IndividualClassPage clase={clase} questions={questions}/>
    
  );
}
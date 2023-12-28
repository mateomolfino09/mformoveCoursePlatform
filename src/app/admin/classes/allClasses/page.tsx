import {
    CoursesDB, IndividualClass,
  } from '../../../../../typings';
import AllClasses from '../../../../components/AllClasses';
  import connectDB from '../../../../config/connectDB';
import { getClasses } from '../../../api/individualClass/getClasses';
  
  
  export default async function Page() {
  connectDB();
  const classes: IndividualClass[] = await getClasses();
  
    return (
      <AllClasses classes={classes}/>
    );
  };
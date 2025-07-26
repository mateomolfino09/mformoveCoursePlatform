import { ClassesDB, IndividualClass, Item } from '../../../../typings';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

interface Props {
  clase: IndividualClass;
}

const ClassDescription = ({ clase }: Props) => {
  return (
    <div className='w-full h-full flex items-center justify-center mt-6'>
      <div className='w-3/5 h-full p-6 md:pl-20 lg:ml-24 lg:pl-32 md:ml-8 flex items-center justify-end'>
        <h2 className='h-full'>{clase.description}</h2>
      </div>
      {/* <div className='w-1/3 h-full p-6 pr-12 overflow-scroll scrollbar-hide'>
        <Row
          items={items}
          courseDB={courseDB}
          title={item !== null ? item.snippet.title : ''}
          coursesDB={null}
          setSelectedCourse={null}
          actualCourseIndex={clase.id - 1}
          setRef={null}
          isClass={true}
          user={null}
          courseIndex={0}
        />
      </div> */}
    </div>
  );
};

export default ClassDescription;

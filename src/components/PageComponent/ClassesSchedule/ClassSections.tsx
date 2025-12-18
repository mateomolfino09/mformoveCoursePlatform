'use client'
import React from 'react';
import { InPersonClass } from '../../../../typings';
import ClassIntro from './ClassIntro';
import ClassIsForYou from './ClassIsForYou';
import ClassIncludes from './ClassIncludes';
import ClassProcess from './ClassProcess';

interface ClassSectionsProps {
  classType: 'comun' | 'personalizado';
  classes?: InPersonClass[];
}

const ClassSections = ({ classType, classes }: ClassSectionsProps) => {
  const classData = classes && classes.length > 0 ? classes[0] : undefined;

  return (
    <>
      <ClassIntro classType={classType} classData={classData} />
      <ClassIsForYou classType={classType} />
      <ClassIncludes classType={classType} />
      <ClassProcess classType={classType} />
    </>
  );
};

export default ClassSections;



'use client'
import React from 'react';
import CommonClassIntro from './CommonClassIntro';
import PersonalizedClassIntro from './PersonalizedClassIntro';
import { InPersonClass } from '../../../../typings';

interface ClassIntroProps {
  classType: 'comun' | 'personalizado';
  classData?: InPersonClass;
}

const ClassIntro = ({ classType, classData }: ClassIntroProps) => {
  if (classType === 'personalizado') {
    return <PersonalizedClassIntro classData={classData} />;
  }
  
  return <CommonClassIntro classData={classData} />;
};

export default ClassIntro;



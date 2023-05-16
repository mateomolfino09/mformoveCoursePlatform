import { ClassesDB } from '../typings';
import React from 'react';

interface Props {
  clase: ClassesDB;
}

const ClassResources = ({ clase }: Props) => {
  return (
    <div className='p-8 lg:w-2/3'>
      <p>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Numquam
        aliquam, quidem, ad doloribus repudiandae atque illo a, vitae et
        temporibus ipsa incidunt nisi. Nobis eius dolor, similique facere vitae
        sequi! Lorem ipsum dolor sit amet consectetur adipisicing elit. Saepe
        repudiandae sit repellat eaque, illum sequi! Quos laudantium deserunt
        debitis facere nemo laborum, atque, similique doloremque voluptatem
        inventore molestias quisquam magnam! Lorem ipsum dolor sit amet
        consectetur adipisicing elit. Incidunt perspiciatis unde nisi? Neque nam
        autem rerum accusantium, at, ipsam ipsa velit placeat deleniti facilis
        non maiores blanditiis asperiores debitis repudiandae?
      </p>
    </div>
  );
};

export default ClassResources;

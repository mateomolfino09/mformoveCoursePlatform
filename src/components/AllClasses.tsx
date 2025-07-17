import React from 'react';
import { IndividualClass } from '../../typings';


interface AllClassesProps {
  classes: IndividualClass[];
}

const AllClasses: React.FC<AllClassesProps> = ({ classes }) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Todas las Clases</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((clase) => (
          <div key={clase.id} className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold mb-2">{clase.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{clase.description}</p>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Duración: {clase.totalTime}</span>
              <span>Nivel: {clase.level}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllClasses; 
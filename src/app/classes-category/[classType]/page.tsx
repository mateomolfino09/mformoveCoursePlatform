'use client';
import { useEffect, useState } from "react";
import { ClassTypes, IndividualClass } from "../../../../typings";
import ClassesCategory from "../../../components/PageComponent/ClassCategory/ClassCategory";
import HomeSearch from "../../../components/PageComponent/HomeSearch/HomeSearch";
import connectDB from "../../../config/connectDB";
import { getClassTypes } from "../../api/individualClass/getClassTypes";
import { getClasses } from "../../api/individualClass/getClasses";

export default async function Page({ params }: { params: { classType: string }}) {
    connectDB();
    const { classType } = params;
    const [classes, setClasses] = useState([]);

    //const [filters, setFilters] = useState([]);
    const filters: ClassTypes[] = await getClassTypes();

    useEffect(() => {
      async function fetchClasses() {
        try {
          const res = await fetch(`/api/individualClassesByType?classType=${classType}`, {
            // Configuración para evitar el caché:
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
            },
            next: {
              tags: ['classes'],
            },
          });
          const data = await res.json();
          setClasses(data);
        } catch (err) {
          console.error('Error fetching classes:', err);
        }
      }

      fetchClasses() 

    },[])



  return (
    <ClassesCategory classesDB={classes} filters={filters} filter={classType}/>
  );
}
'use client';
import { useEffect, useState } from "react";
import { ClassTypes, IndividualClass } from "../../../../typings";
import ClassesCategory from "../../../components/PageComponent/ClassCategory/ClassCategory";
import HomeSearch from "../../../components/PageComponent/HomeSearch/HomeSearch";

export default function Page({ params }: { params: { classType: string } }) {
  const { classType } = params;
  const [classes, setClasses] = useState<IndividualClass[]>([]);
  const [filters, setFilters] = useState<ClassTypes[]>([]);

  useEffect(() => {
    async function fetchClassTypes() {
      try {
        const res = await fetch('/api/individualClass/getClassTypes', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0',
          },
          next: {
            tags: ['classFilters'],
          },
        });
        const data = await res.json();
        setFilters(data);
        } catch (err) {
        console.error('Error fetching class types:', err);
      }
    }
    async function fetchClasses() {
      try {
        const res = await fetch(`/api/individualClass/getClassesByType/${classType}`, {
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

    // Fetch both class types and classes when component mounts
    fetchClassTypes();
    fetchClasses();
  }, [classType]); // The effect will run whenever classType changes

  return (
    <ClassesCategory classesDB={classes} filters={filters} filter={classType} />
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePermissions } from "@/context/PermissionContext";

export const useEntityAliases = () => {
  const { userData } = usePermissions();

  const [entityAccess, setEntityAccess] = useState([]);

  const ENTITY_ALIASES = [
    { alias: 'GTEL', color: 'bg-amber-500' },
    { alias: 'WIBRO', color: 'bg-cyan-600' },
    { alias: 'GISPL', color: 'bg-indigo-500' },
    { alias: 'GNS', color: 'bg-emerald-500' },
  ];

  const employeeCode = userData?.employeeCode;

  const admin = userData?.role;


  useEffect(() => {


    const fetchAliases = async () => {
      try {

        if (admin === 'Admin') {


          const allAliases = ENTITY_ALIASES.map(
            (item) => item.alias
          );

          setEntityAccess(allAliases);

          return;
        }


        const res = await fetch(
          'https://gist.githubusercontent.com/SurajSingh7/ee934466c4ac158ebb20dd8eee7604fc/raw/5014163f2461806c06ed01e7efaeffc9b512cba9/entity-alias.json'
        );

        const data = await res.json();

        const currentEmployee = data.find((item) => {

          // ✅ Convert string → array
          const codes = Array.isArray(item.employeeCode)
            ? item.employeeCode
            : [item.employeeCode];

          return codes.includes(employeeCode);

        });


        const aliases = currentEmployee?.alias || [];

        setEntityAccess(aliases);

      } catch (error) {


      }
    };

    if (employeeCode || admin === 'Admin') {
      fetchAliases();
    }

  }, [employeeCode, admin]);


  const filteredEntityAliases = useMemo(() => {


    const filtered = ENTITY_ALIASES.filter((item) =>
      entityAccess.includes(item.alias)
    );


    return filtered;

  }, [entityAccess]);


  return filteredEntityAliases;
};
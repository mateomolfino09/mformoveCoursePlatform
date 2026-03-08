'use client';
import React, { createContext, useContext } from 'react';

interface MoveCrewNavContextValue {
  toggleNav: () => void;
  showNav: boolean;
}

const MoveCrewNavContext = createContext<MoveCrewNavContextValue | null>(null);

export const useMoveCrewNav = () => useContext(MoveCrewNavContext);
export const MoveCrewNavProvider = MoveCrewNavContext.Provider;

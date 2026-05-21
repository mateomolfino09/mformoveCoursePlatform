'use client';

import React, { createContext, useContext } from 'react';

interface MembershipNavContextValue {
  toggleNav: () => void;
  showNav: boolean;
}

const MembershipNavContext = createContext<MembershipNavContextValue | null>(null);

export const useMembershipNav = () => useContext(MembershipNavContext);
export const MembershipNavProvider = MembershipNavContext.Provider;

"use client";

import React, { createContext, useContext } from 'react';

const SidebarVisibleContext = createContext<boolean>(false);

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarVisibleContext.Provider value={true}>
      {children}
    </SidebarVisibleContext.Provider>
  );
};

export const useSidebarVisible = () => useContext(SidebarVisibleContext);

export default SidebarVisibleContext;

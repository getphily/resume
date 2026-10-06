'use client';
import { createContext, useContext, useState } from 'react';

const MobileNavContext = createContext({
  isOpen: false,
  setIsOpen: (v: boolean | ((prev: boolean) => boolean)) => {}
});

export const MobileNavProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return <MobileNavContext.Provider value={{ isOpen, setIsOpen }}>{children}</MobileNavContext.Provider>;
};

export const useMobileNav = () => useContext(MobileNavContext);

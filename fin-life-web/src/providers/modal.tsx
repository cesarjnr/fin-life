'use client'

import { Dispatch, SetStateAction, createContext, useContext, useState } from 'react';

interface ModalProviderProps {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}

export const ModalContext = createContext<ModalProviderProps>({
  show: false,
  setShow: () => {}
});

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [show, setShow] = useState(false);

  return (
    <ModalContext.Provider value={{ show, setShow }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModalContext = () => useContext(ModalContext);

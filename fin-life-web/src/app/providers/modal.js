'use client'

import { createContext, useContext, useState } from 'react';

export const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState();
  const [actions, setActions] = useState();

  return (
    <ModalContext.Provider value={{
      show,
      setShow,
      title,
      setTitle,
      content,
      setContent,
      actions,
      setActions
    }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModalContext = () => useContext(ModalContext);

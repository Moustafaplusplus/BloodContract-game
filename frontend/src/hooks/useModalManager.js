import { useContext } from 'react';
import { ModalContext } from '../contexts/ModalContextDef';

export const useModalManager = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModalManager must be used within a ModalProvider');
  }
  return context;
}; 
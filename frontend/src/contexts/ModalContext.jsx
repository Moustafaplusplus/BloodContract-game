import React, { useState, useCallback } from 'react';
import { ModalContext } from './ModalContextDef.js';

export const ModalProvider = ({ children }) => {
  const [activeModals, setActiveModals] = useState([]);

  const showModal = useCallback((modalId, priority = 0) => {
    setActiveModals(prev => {
      // Remove any modals with lower priority
      const filtered = prev.filter(modal => modal.priority >= priority);
      // Add the new modal
      return [...filtered, { id: modalId, priority }];
    });
  }, []);

  const hideModal = useCallback((modalId) => {
    setActiveModals(prev => prev.filter(modal => modal.id !== modalId));
  }, []);

  const isModalVisible = useCallback((modalId) => {
    return activeModals.some(modal => modal.id === modalId);
  }, [activeModals]);

  const getTopModal = useCallback(() => {
    if (activeModals.length === 0) return null;
    // Return the modal with the highest priority
    return activeModals.reduce((top, current) => 
      current.priority > top.priority ? current : top
    );
  }, [activeModals]);

  const clearAllModals = useCallback(() => {
    setActiveModals([]);
  }, []);

  const value = {
    showModal,
    hideModal,
    isModalVisible,
    getTopModal,
    clearAllModals,
    activeModals
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
}; 
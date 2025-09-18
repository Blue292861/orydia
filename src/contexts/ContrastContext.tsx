import React, { createContext, useContext, useState, useEffect } from 'react';

interface ContrastContextType {
  isHighContrast: boolean;
  toggleContrast: () => void;
}

const ContrastContext = createContext<ContrastContextType | undefined>(undefined);

export const useContrast = () => {
  const context = useContext(ContrastContext);
  if (!context) {
    throw new Error('useContrast must be used within a ContrastProvider');
  }
  return context;
};

export const ContrastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHighContrast, setIsHighContrast] = useState(() => {
    const saved = localStorage.getItem('high-contrast');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('high-contrast', isHighContrast.toString());
    
    if (isHighContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [isHighContrast]);

  const toggleContrast = () => {
    setIsHighContrast(!isHighContrast);
  };

  return (
    <ContrastContext.Provider value={{ isHighContrast, toggleContrast }}>
      {children}
    </ContrastContext.Provider>
  );
};
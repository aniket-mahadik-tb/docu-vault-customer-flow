import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Promoter {
  name: string;
  email: string;
  phone: string;
  pan: string;
}

interface PromoterContextType {
  selectedPromoter: Promoter | null;
  setSelectedPromoter: (promoter: Promoter) => void;
  clearSelectedPromoter: () => void;
}

const PromoterContext = createContext<PromoterContextType | undefined>(undefined);

export const PromoterProvider = ({ children }: { children: ReactNode }) => {
  const [selectedPromoter, setSelectedPromoterState] = useState<Promoter | null>(null);

  const setSelectedPromoter = (promoter: Promoter) => {
    setSelectedPromoterState(promoter);
  };

  const clearSelectedPromoter = () => {
    setSelectedPromoterState(null);
  };

  return (
    <PromoterContext.Provider value={{ selectedPromoter, setSelectedPromoter, clearSelectedPromoter }}>
      {children}
    </PromoterContext.Provider>
  );
};

export const usePromoter = () => {
  const context = useContext(PromoterContext);
  if (!context) {
    throw new Error("usePromoter must be used within a PromoterProvider");
  }
  return context;
}; 
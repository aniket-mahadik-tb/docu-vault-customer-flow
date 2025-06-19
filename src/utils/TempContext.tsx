import { create } from "domain";
import React, { createContext } from "react";
import { CustomerType } from "./types"

interface TempCustomerContextType {
    tempCustomer: CustomerType | null;
    setTempCustomer: React.Dispatch<React.SetStateAction<CustomerType | null>>;
}
const ctx = createContext<TempCustomerContextType | null>(null)

export function TempCustomerContextProvider({ children }: { children: React.ReactNode }) {

    const [tempCustomer, setTempCustomer] = React.useState<CustomerType | null>(null);


    return (
        <ctx.Provider value={{ tempCustomer, setTempCustomer }}>
            {children}
        </ctx.Provider>
    );
}


export function useTempCustomer() {
    const context = React.useContext(ctx);
    if (context === null) {
        throw new Error("useTempCustomer must be used within a TempCustomerContext");
    }
    return context;
}
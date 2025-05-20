
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CustomerDocument {
  id: string;
  name: string;
  sectionId: string;
  documentTypeId: string;
  status: "pending" | "approved" | "rejected" | "on_hold";
  remarks?: string;
  uploadedAt: string;
  reviewedAt?: string;
  fileUrl: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  panCard: string;
  businessName?: string;
  documentsSubmitted: boolean;
  createdAt: string;
  documents: CustomerDocument[];
}

interface CustomerContextType {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, "id" | "createdAt" | "documentsSubmitted" | "documents">) => Customer;
  getCustomer: (id: string) => Customer | undefined;
  updateDocumentStatus: (
    customerId: string, 
    documentId: string, 
    status: "approved" | "rejected" | "on_hold", 
    remarks?: string
  ) => void;
  getCustomerDocuments: (customerId: string) => CustomerDocument[];
  generateUploadLink: (customerId: string) => string;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

const STORAGE_KEY = "admin_customers";

// Mock data for initial customers
const initialCustomers: Customer[] = [
  {
    id: "CUST001",
    name: "Rajesh Kumar",
    email: "rajesh@example.com",
    phone: "9876543210",
    panCard: "ABCDE1234F",
    businessName: "Kumar Enterprises",
    documentsSubmitted: true,
    createdAt: new Date().toISOString(),
    documents: [
      {
        id: "DOC001",
        name: "PAN Card.pdf",
        sectionId: "section1",
        documentTypeId: "kyc1",
        status: "pending",
        uploadedAt: new Date().toISOString(),
        fileUrl: "/placeholder.svg",
      },
      {
        id: "DOC002",
        name: "Aadhaar Card.pdf",
        sectionId: "section1",
        documentTypeId: "kyc2",
        status: "pending",
        uploadedAt: new Date().toISOString(),
        fileUrl: "/placeholder.svg",
      },
    ],
  },
  {
    id: "CUST002",
    name: "Priya Sharma",
    email: "priya@example.com",
    phone: "8765432109",
    panCard: "FGHIJ5678K",
    businessName: "Sharma Trading Co.",
    documentsSubmitted: true,
    createdAt: new Date().toISOString(),
    documents: [
      {
        id: "DOC003",
        name: "Income Tax Returns.pdf",
        sectionId: "section4",
        documentTypeId: "fin1",
        status: "pending",
        uploadedAt: new Date().toISOString(),
        fileUrl: "/placeholder.svg",
      },
    ],
  },
  {
    id: "CUST003",
    name: "Amit Patel",
    email: "amit@example.com",
    phone: "7654321098",
    panCard: "LMNOP9012Q",
    businessName: "Patel Industries",
    documentsSubmitted: false,
    createdAt: new Date().toISOString(),
    documents: [],
  },
];

export const CustomerProvider = ({ children }: { children: ReactNode }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Load customers from localStorage on mount
  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        setCustomers(JSON.parse(storedData));
      } catch (error) {
        console.error("Failed to parse stored customers:", error);
        // If parsing fails, use initial data
        setCustomers(initialCustomers);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCustomers));
      }
    } else {
      // If no stored data, use initial data
      setCustomers(initialCustomers);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCustomers));
    }
  }, []);

  // Save customers to localStorage whenever they change
  useEffect(() => {
    if (customers.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    }
  }, [customers]);

  const addCustomer = (customerData: Omit<Customer, "id" | "createdAt" | "documentsSubmitted" | "documents">) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `CUST${String(customers.length + 1).padStart(3, '0')}`,
      documentsSubmitted: false,
      createdAt: new Date().toISOString(),
      documents: []
    };

    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  };

  const getCustomer = (id: string) => {
    return customers.find(customer => customer.id === id);
  };

  const updateDocumentStatus = (
    customerId: string,
    documentId: string,
    status: "approved" | "rejected" | "on_hold",
    remarks?: string
  ) => {
    setCustomers(prev => 
      prev.map(customer => {
        if (customer.id === customerId) {
          const updatedDocuments = customer.documents.map(doc => {
            if (doc.id === documentId) {
              return {
                ...doc,
                status,
                remarks,
                reviewedAt: new Date().toISOString()
              };
            }
            return doc;
          });
          return { ...customer, documents: updatedDocuments };
        }
        return customer;
      })
    );
  };

  const getCustomerDocuments = (customerId: string): CustomerDocument[] => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.documents : [];
  };

  const generateUploadLink = (customerId: string): string => {
    return `https://example.com/upload/${customerId}/${Date.now()}`;
  };

  return (
    <CustomerContext.Provider
      value={{
        customers,
        addCustomer,
        getCustomer,
        updateDocumentStatus,
        getCustomerDocuments,
        generateUploadLink
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomers = () => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error("useCustomers must be used within a CustomerProvider");
  }
  return context;
};

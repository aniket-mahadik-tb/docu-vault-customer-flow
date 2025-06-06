// No need to import useAxios anymore
import { Customer } from "../contexts/CustomerContext";

// Simulated data
const mockCustomers: Customer[] = [
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

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useCustomerService() {
  const service: any = {};

  service.getAllCustomers = async () => {
    try {
      await delay(500);
      return {
        data: mockCustomers,
        status: 200,
      };
    } catch (error: any) {
      console.error("Failed to fetch customers");
      throw error;
    }
  };

  service.getCustomerById = async (id: string) => {
    try {
      await delay(300);
      const customer = mockCustomers.find(c => c.id === id);
      if (!customer) throw new Error("Customer not found");
      return {
        data: customer,
        status: 200,
      };
    } catch (error: any) {
      console.error("Failed to fetch customer");
      throw error;
    }
  };

  service.getCustomerByPanCard = async (panCard: string) => {
    try {
      await delay(300);
      const customer = mockCustomers.find(
        c => c.panCard.toLowerCase() === panCard.toLowerCase()
      );
      if (!customer) throw new Error("Customer not found");
      return {
        data: customer,
        status: 200,
      };
    } catch (error: any) {
      console.error("Failed to fetch customer");
      throw error;
    }
  };

  service.addCustomer = async (customerData: Omit<Customer, "id" | "createdAt" | "documentsSubmitted" | "documents">) => {
    try {
      await delay(500);
      const newCustomer: Customer = {
        ...customerData,
        id: `CUST${String(mockCustomers.length + 1).padStart(3, '0')}`,
        documentsSubmitted: false,
        createdAt: new Date().toISOString(),
        documents: []
      };

      // If using a real API:
      // const response = await fetch("/api/customers", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(newCustomer),
      // });
      // return await response.json();

      return {
        data: newCustomer,
        status: 201,
      };
    } catch (error: any) {
      console.error("Failed to add customer");
      throw error;
    }
  };

  service.updateCustomer = async (id: string, customerData: Partial<Customer>) => {
    try {
      await delay(500);
      const customerIndex = mockCustomers.findIndex(c => c.id === id);
      if (customerIndex === -1) throw new Error("Customer not found");

      const updatedCustomer = {
        ...mockCustomers[customerIndex],
        ...customerData,
      };

      return {
        data: updatedCustomer,
        status: 200,
      };
    } catch (error: any) {
      console.error("Failed to update customer");
      throw error;
    }
  };

  service.updateDocumentStatus = async (
    customerId: string,
    documentId: string,
    status: "approved" | "rejected" | "on_hold" | "pending",
    remarks?: string
  ) => {
    try {
      await delay(500);
      const customer = mockCustomers.find(c => c.id === customerId);
      if (!customer) throw new Error("Customer not found");

      const document = customer.documents.find(d => d.id === documentId);
      if (!document) throw new Error("Document not found");

      const updatedDocument = {
        ...document,
        status,
        remarks: status === "pending" ? undefined : remarks,
        reviewedAt: status === "pending" ? undefined : new Date().toISOString(),
      };

      return {
        data: updatedDocument,
        status: 200,
      };
    } catch (error: any) {
      console.error("Failed to update document status");
      throw error;
    }
  };

  service.getCustomerDocuments = async (customerId: string) => {
    try {
      await delay(300);
      const customer = mockCustomers.find(c => c.id === customerId);
      if (!customer) throw new Error("Customer not found");

      return {
        data: customer.documents,
        status: 200,
      };
    } catch (error: any) {
      console.error("Failed to fetch customer documents");
      throw error;
    }
  };

  service.generateUploadLink = async (customerId: string, documentId?: string, remarks?: string) => {
    try {
      await delay(300);
      const customer = mockCustomers.find(c => c.id === customerId);
      if (!customer) throw new Error("Customer not found");

      const baseUrl = window.location.origin;
      const uploadLink = documentId
        ? `${baseUrl}/customer/reupload?customerId=${customerId}&documentId=${documentId}&remarks=${encodeURIComponent(remarks || '')}`
        : `${baseUrl}/customer?userId=${customerId}`;

      return {
        data: { uploadLink },
        status: 200,
      };
    } catch (error: any) {
      console.error("Failed to generate upload link");
      throw error;
    }
  };

  return service;
}

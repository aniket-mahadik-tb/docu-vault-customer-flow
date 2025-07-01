// No need to import useAxios anymore
import { Customer } from "../contexts/CustomerContext";
import { CustomerType, GetDocumentByPanCardResponseType } from "@/utils/types";
import { constants, initialCustomers } from "@/utils/globalConstants";
import api from "../instances/axios";
import axios from "axios";
import { GetDocumentByPanCardResponse } from "@/utils/globalConstants";

// Types for API requests and responses
export interface ClientCreateRequest {
  clientType: "INDIVIDUAL" | "ORGANIZATION";
  name: string;
  pan: string;
  email: string;
  phone: string;
  promoters: Array<{
    name: string;
    pan: string;
    email: string;
    phone: string;
  }>;
}

export interface CustomersToShareWithBank {
  pan: string,
  name: string,
  approvedDocumentCount: number
}

export interface ClientCreateResponse {
  clientPan: string;
  status: String
  // id: string;
  // clientType: "Individual" | "Organisation";
  // name: string;
  // pan: string;
  // email: string;
  // phone: string;
  // promoters: Array<{
  //   id: string;
  //   name: string;
  //   pan: string;
  //   email: string;
  //   phone: string;
  // }>;
  // createdAt: string;
}

export interface GenericApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

let customers: CustomerType[];

// Simulated data
const mockCustomers: Customer[] = initialCustomers;

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useCustomerService() {
  const service: any = {};

  service.createClient = async (data: ClientCreateRequest): Promise<any> => {
    try {
      const response = await api.post<GenericApiResponse<ClientCreateResponse>>('/clients', data);
      return response;
    } catch (error: any) {
      console.error("Failed to create client:", error);
      throw error;
    }
  };



  service.getAllCustomers = async () => {
    try {
      const res = await api.get<GenericApiResponse<CustomerType[]>>('/clients');

      // customers = res.data.map((customer: CustomerType) => {
      //   return {
      //     ...customer,
      //     documents: constants.mockFile
      //   }
      // }
      // );
      // return customers;

      return res.data;
    } catch (error: any) {
      console.error("Failed to fetch customers");
      throw error;
    }
  };

  service.getCustomersToShareWithBank = async () => {
    try {
      const res = await api.get<GenericApiResponse<CustomersToShareWithBank[]>>("/clients/clients-with-approved-docs")
      return res.data.data;
    } catch (e: any) {
      console.error(e)
      throw e;
    }
  }

  service.getCustomerById = async (pan: string) => {
    try {
      await delay(300);
      const customer = customers.find(c => c.pan === pan);
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
    pan: string,
    documentId: string,
    status: "APPROVED" | "REJECTED" | "UPLOADED" | "PENDING",
    remarks?: string
  ) => {
    try {
      type ExtendedGenericResponse = GenericApiResponse<null> & { timestamp: String }
      const response = await api.put<ExtendedGenericResponse>(`documents/${documentId}/status`, { note: remarks, status: status });
   
      return response;
    } catch (error: any) {
      console.error("Failed to update document status");
      throw error;
    }
  };

  service.getCustomerDocuments = async (panCard: string) => {
    try {
      const response = await api.get<GenericApiResponse<GetDocumentByPanCardResponseType>>(`/documents/client?pan=${panCard}`);
      return response.data
    } catch (error: any) {
      console.error("Failed to fetch customer documents");
      throw error;
    }
  };

  service.generateUploadLink = async (panCard: string, documentId?: string, remarks?: string) => {
    try {

      const res = await api.post<GenericApiResponse<{ uploadLink: string[] }>>(`clients/${panCard}/send-upload-link`, {});
      if (res.status !== 200) {
        throw new Error("Failed to generate upload link");
      }
      return res.data.data;
    } catch (error: any) {
      console.error("Failed to generate upload link");
      throw error;
    }
  };

  service.getCustomerByStatus = async (status: "SELECTED" | "SUBMITTED" | "APPROVED") => {
    try {
      const response = await api.get<GenericApiResponse<CustomerType[]>>(`/clients?documentStatus=${status}`);
      return response.data;
    } catch (e: any) {
      console.error(e)
      throw e;
    }
  }

  return service;
}

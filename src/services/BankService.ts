// Mock data for bank service
const MOCK_ALLOWED_PANS = ["ABCDE1234F", "PQRST5678G", "XYZAB9012C"];
const MOCK_OTP = "123456"; // Default OTP for demo
const MOCK_DELAY = 1000; // Simulate network delay

// Types
export interface BankAuthResponse {
  success: boolean;
  message: string;
  data?: {
    pan: string;
    otpSent: boolean;
  };
}

export interface BankOTPResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    role: string;
  };
}

export interface BankDocument {
  id: string;
  name: string;
  type: string;
  thumbnail: string;
  fileUrl: string;
  status: string;
  uploadedAt: string;
}

export interface BankNote {
  id: string;
  title: string;
  date: string;
  content: string;
  status: string;
}

// Mock API calls
export const BankService = {
  // Verify PAN and request OTP
  verifyPAN: async (pan: string): Promise<BankAuthResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const isAllowed = MOCK_ALLOWED_PANS.includes(pan);
        
        if (!isAllowed) {
          resolve({
            success: false,
            message: "This PAN is not authorized to access the system."
          });
          return;
        }

        resolve({
          success: true,
          message: "OTP sent successfully",
          data: {
            pan,
            otpSent: true
          }
        });
      }, MOCK_DELAY);
    });
  },

  // Verify OTP
  verifyOTP: async (pan: string, otp: string): Promise<BankOTPResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (otp !== MOCK_OTP) {
          resolve({
            success: false,
            message: "Invalid OTP. Please try again."
          });
          return;
        }

        resolve({
          success: true,
          message: "Verification successful",
          data: {
            token: `mock-token-${pan}-${Date.now()}`,
            role: "Bank"
          }
        });
      }, MOCK_DELAY);
    });
  },

  // Get customer documents (approved only)
  getCustomerDocuments: async (pan: string): Promise<BankDocument[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock documents based on PAN
        const documents: BankDocument[] = [
          {
            id: "doc1",
            name: "PAN Card.pdf",
            type: "application/pdf",
            thumbnail: "/placeholder.svg",
            fileUrl: "/placeholder.svg",
            status: "approved",
            uploadedAt: new Date().toISOString()
          },
          {
            id: "doc2",
            name: "Aadhaar Card.pdf",
            type: "application/pdf",
            thumbnail: "/placeholder.svg",
            fileUrl: "/placeholder.svg",
            status: "approved",
            uploadedAt: new Date().toISOString()
          }
        ];

        resolve(documents);
      }, MOCK_DELAY);
    });
  },

  // Get customer notes
  getCustomerNotes: async (pan: string): Promise<BankNote[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock notes based on PAN
        const notes: BankNote[] = [
          {
            id: "note1",
            title: "Loan Eligibility Assessment",
            date: "2025-05-10",
            content: "The customer meets all eligibility criteria for the home loan. Income documents verified and found satisfactory.",
            status: "Approved"
          }
        ];

        resolve(notes);
      }, MOCK_DELAY);
    });
  }
}; 
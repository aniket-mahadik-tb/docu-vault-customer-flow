// Type definitions
export type UserRole = "Admin" | "SuperAdmin" | "Customer" | "Bank";
export type DocumentStatus = "pending" | "approved" | "rejected" | "on_hold";
export type DocumentSection = {
  id: string;
  title: string;
};

// User Roles
export const USER_ROLES: Record<string, UserRole> = {
  ADMIN: "Admin",
  SUPER_ADMIN: "SuperAdmin",
  CUSTOMER: "Customer",
  BANK: "Bank"
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  ROLE: "role",
  USER_ID: "userId",
  AUTH_TOKEN: "authToken"
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  USERS: "/api/users",
  CUSTOMERS: "/api/customers",
  DOCUMENTS: "/api/documents",
  AUTH: "/api/auth"
} as const;

// Document Status
export const DOCUMENT_STATUS: Record<string, DocumentStatus> = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  ON_HOLD: "on_hold"
} as const;

// Document Sections
export const DOCUMENT_SECTIONS: readonly DocumentSection[] = [
  { id: "section1", title: "KYC Documents" },
  { id: "section2", title: "Bank Statements" },
  { id: "section3", title: "Loan Statements" },
  { id: "section4", title: "Financial Documents" },
  { id: "section5", title: "Property Documents" },
  { id: "section6", title: "Business Documents" }
] as const;

// Routes
export const ROUTES = {
  HOME: "/",
  ADMIN: {
    LOGIN: "/admin",
    DASHBOARD: "/admin/dashboard",
    CUSTOMERS: "/admin/customers",
    NEW_CUSTOMER: "/admin/new-customer",
    NEW_ADMIN: "/admin/new-admin",
    REVIEW: "/admin/review",
    SHARE: "/admin/share"
  },
  CUSTOMER: {
    LOGIN: "/customer",
    DASHBOARD: "/customer/dashboard",
    UPLOAD: "/customer/upload",
    STATUS: "/customer/status",
    REUPLOAD: "/customer/reupload"
  },
  BANK: {
    LOGIN: "/bank",
    DASHBOARD: "/bank/dashboard",
    DOCUMENTS: "/bank/documents",
    NOTES: "/bank/notes"
  }
} as const;

// UI Constants
export const UI = {
  MAX_INPUT_LENGTH: 10,
  API_DELAY: 500,
  TOAST_DURATION: 3000
} as const;

// Validation Constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  EMAIL_REGEX: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  PHONE_REGEX: /^[0-9]{10}$/
} as const; 
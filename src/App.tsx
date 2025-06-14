import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "@/contexts/UserContext";
import { DocumentProvider } from "@/contexts/DocumentContext";
import { CustomerProvider } from "@/contexts/CustomerContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Customer pages
import CustomerEntry from "./pages/Customer/CustomerEntry";
import CustomerDashboard from "./pages/Customer/CustomerDashboard";
import DocumentUpload from "./pages/Customer/DocumentUpload";
import DocumentStatus from "./pages/Customer/DocumentStatus";
import DocumentReupload from "./pages/Customer/DocumentReupload";

// Admin pages
import AdminEntry from "./pages/Admin/AdminEntry";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import CustomerList from "./pages/Admin/CustomerList";
import CustomerDetail from "./pages/Admin/CustomerDetail";
import ReviewDocument from "./pages/Admin/ReviewDocument";
import ReviewDocuments from "./pages/Admin/ReviewDocuments";
import NewCustomer from "./pages/Admin/NewCustomer";
import ShareWithBank from "./pages/Admin/ShareWithBank";

// Bank pages
import BankEntry from "./pages/Bank/BankEntry";
import BankDashboard from "./pages/Bank/BankDashboard";
import BankDocuments from "./pages/Bank/BankDocuments";
import BankNotes from "./pages/Bank/BankNotes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserProvider>
        <DocumentProvider>
          <CustomerProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                
                {/* Customer routes */}
                <Route path="/customer" element={<CustomerEntry />} />
                <Route path="/customer/dashboard" element={<CustomerDashboard />} />
                <Route path="/customer/upload" element={<DocumentUpload />} />
                <Route path="/customer/status" element={<DocumentStatus />} />
                <Route path="/customer/reupload" element={<DocumentReupload />} />
                
                {/* Admin routes */}
                <Route path="/admin" element={<AdminEntry />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/customers" element={<CustomerList />} />
                <Route path="/admin/customers/:id" element={<CustomerDetail />} />
                <Route path="/admin/review" element={<ReviewDocuments />} />
                <Route path="/admin/review/:customerId/:documentId" element={<ReviewDocument />} />
                <Route path="/admin/new-customer" element={<NewCustomer />} />
                <Route path="/admin/share" element={<ShareWithBank />} />
                
                {/* Bank routes */}
                <Route path="/bank" element={<BankEntry />} />
                <Route path="/bank/dashboard" element={<BankDashboard />} />
                <Route path="/bank/documents" element={<BankDocuments />} />
                <Route path="/bank/notes" element={<BankNotes />} />
                
                {/* 404 route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CustomerProvider>
        </DocumentProvider>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

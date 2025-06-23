import React from "react";
import MainLayout from "@/layouts/MainLayout";
import { usePromoter } from "@/contexts/PromoterContext";

const PromotersUploadDocuments = () => {
  const { selectedPromoter } = usePromoter();

  return (
    <MainLayout showSidebar={true}>
      <div className="py-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Upload Documents</h1>
        {selectedPromoter ? (
          <div className="bg-gray-50 border rounded p-6 mb-4">
            <h2 className="text-xl font-semibold mb-2">Promoter Details</h2>
            <div className="space-y-1">
              <div><strong>Full Name:</strong> {selectedPromoter.name}</div>
              <div><strong>Email:</strong> {selectedPromoter.email}</div>
              <div><strong>Phone Number:</strong> {selectedPromoter.phone}</div>
              <div><strong>PAN Number:</strong> {selectedPromoter.pan}</div>
            </div>
          </div>
        ) : (
          <div className="text-red-500">No promoter selected.</div>
        )}
        {/* Upload UI will go here in the future */}
      </div>
    </MainLayout>
  );
};

export default PromotersUploadDocuments; 
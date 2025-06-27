import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface PromoterActionsProps {
  customerType: 'Individual' | 'Organization';
  currentPage: number;
  handleAddPromoter: () => void;
  handleRemovePromoter: (index: number) => void;
  disableAdd?: boolean;
}

const PromoterActions: React.FC<PromoterActionsProps> = ({ customerType, currentPage, handleAddPromoter, handleRemovePromoter, disableAdd }) => (
  <div className="flex gap-2 items-center">
    {customerType === 'Organization' && (
      <Button
        onClick={handleAddPromoter}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white border border-blue-700 shadow-lg flex items-center gap-2 text-base font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-none"
        variant="default"
        type="button"
        style={{ borderRadius: 0 }}
        disabled={disableAdd}
      >
        <Plus className="h-5 w-5" />
        Add Promoter
      </Button>
    )}
    {customerType === 'Organization' && currentPage > 0 && (
      <Button
        onClick={() => handleRemovePromoter(currentPage - 1)}
        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white border border-red-700 shadow-lg flex items-center gap-2 text-base font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-400 rounded-none"
        variant="destructive"
        type="button"
        style={{ borderRadius: 0 }}
      >
        <Trash2 className="h-5 w-5" />
        Remove Promoter
      </Button>
    )}
  </div>
);

export default PromoterActions; 
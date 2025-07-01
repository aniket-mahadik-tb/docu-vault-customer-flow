import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  goToPage: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, goToPreviousPage, goToNextPage, goToPage }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>Page {currentPage + 1} of {totalPages}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousPage}
          disabled={currentPage === 0}
          className="border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }).map((_, index) => (
            <Button
              key={index}
              variant={currentPage === index ? "default" : "outline"}
              size="sm"
              onClick={() => goToPage(index)}
              className={`w-8 h-8 p-0 ${currentPage === index
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                }`}
            >
              {index + 1}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextPage}
          disabled={currentPage === totalPages - 1}
          className="border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination; 
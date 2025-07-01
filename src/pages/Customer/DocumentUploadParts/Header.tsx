import React from "react";

interface HeaderProps {
  currentPage: number;
  customerType: 'Individual' | 'Organization';
}

const Header: React.FC<HeaderProps> = ({ currentPage, customerType }) => (
  <div>
    <h1 className="text-2xl font-bold text-gray-900">
      {currentPage === 0 ? "Document Upload" : `Promoter ${currentPage} Documents`}
    </h1>
    <p className="text-gray-600 mt-1">
      {currentPage === 0
        ? "Please upload the required documents for your application"
        : "Please upload the required documents for this promoter"
      }
    </p>
  </div>
);

export default Header; 
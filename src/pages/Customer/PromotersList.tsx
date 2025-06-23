import React, { useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { usePromoter } from "@/contexts/PromoterContext";

// Mock data for promoters
const mockPromoters = [
  {
    name: "Amit Sharma",
    email: "amit.sharma@example.com",
    phone: "9876543210",
    pan: "ABCDE1234F",
  },
  {
    name: "Priya Verma",
    email: "priya.verma@example.com",
    phone: "8765432109",
    pan: "FGHIJ5678K",
  },
  {
    name: "Rohit Singh",
    email: "rohit.singh@example.com",
    phone: "7654321098",
    pan: "LMNOP9012Q",
  },
  {
    name: "Sunita Patel",
    email: "sunita.patel@example.com",
    phone: "9123456780",
    pan: "QRSTU3456V",
  },
  {
    name: "Vikas Gupta",
    email: "vikas.gupta@example.com",
    phone: "9988776655",
    pan: "WXYZA7890B",
  },
];

const PromotersList = () => {
  const navigate = useNavigate();
  const { setSelectedPromoter } = usePromoter();

  const handleUploadClick = (promoter: any) => {
    setSelectedPromoter(promoter);
    navigate("/promoters/upload-documents");
  };

  return (
    <MainLayout showSidebar={true}>
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Promoters List</h1>
            <p className="text-muted-foreground mt-1">
              View and manage promoters for this customer
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Registered Promoters</CardTitle>
            <CardDescription>
              Total {mockPromoters.length} promoters registered
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Full Name</TableHead>
                    <TableHead className="text-center">Email</TableHead>
                    <TableHead className="text-center">Phone Number</TableHead>
                    <TableHead className="text-center">PAN Number</TableHead>
                    <TableHead className="text-center">Upload Documents</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPromoters.length > 0 ? (
                    mockPromoters.map((promoter) => (
                      <TableRow key={promoter.pan}>
                        <TableCell className="text-center font-medium">{promoter.name}</TableCell>
                        <TableCell className="text-center">{promoter.email}</TableCell>
                        <TableCell className="text-center">{promoter.phone}</TableCell>
                        <TableCell className="text-center">{promoter.pan}</TableCell>
                        <TableCell className="text-center">
                          <Button variant="outline" size="sm" onClick={() => handleUploadClick(promoter)}>
                            Upload
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No promoters found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default PromotersList; 
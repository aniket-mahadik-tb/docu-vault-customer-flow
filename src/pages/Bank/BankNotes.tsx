
import React from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock notes data
const BANK_NOTES = {
  "ABCDE1234F": [
    {
      id: "note1",
      title: "Loan Eligibility Assessment",
      date: "2025-05-10",
      content: "The customer meets all eligibility criteria for the home loan. Income documents verified and found satisfactory. Recommended approval for loan amount of ₹50,00,000.",
      status: "Approved"
    }
  ],
  "PQRST5678G": [
    {
      id: "note2",
      title: "Car Loan Proposal",
      date: "2025-05-12",
      content: "Customer has requested for car loan of ₹10,00,000. Credit score is excellent at 820. All KYC documents verified.",
      status: "Pending"
    }
  ],
  "XYZAB9012C": [
    {
      id: "note3",
      title: "Business Loan Assessment",
      date: "2025-05-15",
      content: "The requested business expansion loan of ₹25,00,000 is recommended for approval. All financial documents are in order and business projections show good growth potential.",
      status: "Approved"
    },
    {
      id: "note4",
      title: "Property Valuation Report",
      date: "2025-05-16",
      content: "The mortgaged property has been valued at ₹1,25,00,000 which is sufficient collateral for the requested loan amount. Property documents verified and found authentic.",
      status: "Completed"
    }
  ]
};

const BankNotes = () => {
  const navigate = useNavigate();
  const { userId } = useUser();
  
  // Redirect if not authenticated
  React.useEffect(() => {
    if (!userId) {
      navigate("/bank");
    }
  }, [userId, navigate]);

  if (!userId) {
    return null; // Will redirect in useEffect
  }

  const notes = (BANK_NOTES[userId as keyof typeof BANK_NOTES] || []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Approved": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Completed": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <MainLayout showSidebar={true}>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-2">View Notes</h1>
        <p className="text-muted-foreground mb-6">
          Review notes and proposals shared by the admin
        </p>

        {notes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No notes or proposals available for this customer.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <Card key={note.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{note.title}</CardTitle>
                    <Badge className={getStatusColor(note.status)}>
                      {note.status}
                    </Badge>
                  </div>
                  <CardDescription>Added on {note.date}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line">{note.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default BankNotes;

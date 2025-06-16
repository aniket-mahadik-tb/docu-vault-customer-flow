import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Circle } from "lucide-react";
import { documentSections } from "@/utils/globalConstants";

interface SectionStatus {
  id: string;
  title: string;
  submittedCount: number;
  requiredCount: number;
}

interface OverallProgressProps {
  sections: SectionStatus[];
  hasAnyDocumentsUploaded: boolean;
  onSubmitAllDocuments: () => void;
}

const OverallProgress: React.FC<OverallProgressProps> = ({
  sections,
  hasAnyDocumentsUploaded,
  onSubmitAllDocuments
}) => {
  return (
    <Card className="bg-gray-50">
      <CardHeader>
        <CardTitle className="text-xl">Submission Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sections.map(section => (
          <div key={`summary-${section.id}`} className="flex justify-between items-center">
            <div className="font-medium">{section.title}</div>
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {section.submittedCount}/{section.requiredCount} required docs
              </span>
              <Circle 
                className="h-3 w-3" 
                fill={section.submittedCount > 0 ? "#FFA500" : "none"} 
                stroke={section.submittedCount > 0 ? "#FFA500" : "currentColor"} 
              />
            </div>
          </div>
        ))}
        
        <Separator className="my-4" />
        
        <Button 
          className="w-full py-6" 
          disabled={!hasAnyDocumentsUploaded}
          onClick={onSubmitAllDocuments}
        >
          Submit All Documents
        </Button>
      </CardContent>
    </Card>
  );
};

export default OverallProgress; 
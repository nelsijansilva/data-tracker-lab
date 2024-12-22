import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Analytics() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
      
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Analytics functionality is currently being updated. Please check back later.
        </AlertDescription>
      </Alert>
    </div>
  );
}
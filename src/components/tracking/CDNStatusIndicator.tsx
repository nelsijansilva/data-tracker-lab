import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CDNStatusIndicatorProps {
  isVerified: boolean;
  subdomain: string;
}

export const CDNStatusIndicator = ({ isVerified, subdomain }: CDNStatusIndicatorProps) => {
  return (
    <div className={cn(
      "flex items-center gap-2 text-sm",
      isVerified ? "text-green-600" : "text-gray-500"
    )}>
      {isVerified ? (
        <>
          <Check className="h-4 w-4" />
          <span>Verificado</span>
        </>
      ) : (
        <>
          <AlertCircle className="h-4 w-4" />
          <span>Não verificado</span>
        </>
      )}
    </div>
  );
};
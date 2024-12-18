import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface ScriptDisplayProps {
  script: string;
}

export const ScriptDisplay = ({ script }: ScriptDisplayProps) => {
  const { toast } = useToast();

  const copyScript = () => {
    navigator.clipboard.writeText(script);
    toast({
      title: "Script Copied",
      description: "Tracking script has been copied to clipboard",
    });
  };

  return (
    <>
      <Alert>
        <AlertDescription>
          Copy this script and add it to your website's &lt;head&gt; section to enable tracking.
        </AlertDescription>
      </Alert>
      <div className="relative">
        <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
          <code>{script}</code>
        </pre>
        <Button
          onClick={copyScript}
          className="absolute top-2 right-2"
          variant="secondary"
        >
          Copy Script
        </Button>
      </div>
    </>
  );
};
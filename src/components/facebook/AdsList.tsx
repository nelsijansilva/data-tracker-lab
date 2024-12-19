import { useQuery } from "@tanstack/react-query";
import { fetchAds } from "@/lib/facebook/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AdsList = () => {
  const { toast } = useToast();
  
  const { data: ads, isLoading, error } = useQuery({
    queryKey: ['ads'],
    queryFn: fetchAds,
    staleTime: 30000, // Cache data for 30 seconds
    retry: (failureCount, error: any) => {
      // Retry up to 3 times, but only for rate limit errors
      if (error?.code === 17) {
        return failureCount < 3;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * (2 ** attemptIndex), 30000), // Exponential backoff
    meta: {
      onError: (error: any) => {
        if (error?.code === 17) {
          toast({
            title: "Limite de requisições atingido",
            description: "Aguarde alguns segundos e tente novamente.",
            variant: "destructive",
          });
        }
      }
    }
  });

  if (isLoading) return <div>Carregando anúncios...</div>;
  
  if (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Erro ao carregar anúncios. Por favor, tente novamente em alguns instantes.';
      
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {errorMessage}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Conjunto de Anúncios</TableHead>
          <TableHead>Preview</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ads?.map((ad: any) => (
          <TableRow key={ad.id}>
            <TableCell>{ad.name}</TableCell>
            <TableCell>{ad.status}</TableCell>
            <TableCell>{ad.adset?.name}</TableCell>
            <TableCell>
              {ad.preview_url && (
                <a
                  href={ad.preview_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                >
                  Ver Preview
                </a>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
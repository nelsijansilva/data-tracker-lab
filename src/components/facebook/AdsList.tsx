import { useQuery } from "@tanstack/react-query";
import { fetchAds } from "@/lib/facebook/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export const AdsList = () => {
  const { data: ads, isLoading, error } = useQuery({
    queryKey: ['ads'],
    queryFn: fetchAds
  });

  if (isLoading) return <div>Carregando anúncios...</div>;
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error instanceof Error ? error.message : 'Erro ao carregar anúncios'}
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
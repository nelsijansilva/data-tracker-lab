import { useQuery } from "@tanstack/react-query";
import { fetchAds } from "@/lib/facebook/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const AdsList = () => {
  const { data: ads, isLoading, error } = useQuery({
    queryKey: ['ads'],
    queryFn: fetchAds
  });

  if (isLoading) return <div>Loading ads...</div>;
  if (error) return <div>Error loading ads</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Ad Set</TableHead>
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
                  View Preview
                </a>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
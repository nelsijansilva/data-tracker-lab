import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AccountCard } from "./AccountCard";
import type { TictoAccount } from "./types";

interface TictoAccountListProps {
  onEdit: (account: TictoAccount) => void;
  onDelete: (id: string) => void;
}

export const TictoAccountList = ({ onEdit, onDelete }: TictoAccountListProps) => {
  const { data: tictoAccounts } = useQuery({
    queryKey: ['tictoAccounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ticto_accounts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TictoAccount[];
    }
  });

  return (
    <div className="grid gap-4">
      {tictoAccounts?.map((account) => (
        <AccountCard
          key={account.id}
          account={account}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { AccountForm } from "./ticto/AccountForm";
import { AccountCard } from "./ticto/AccountCard";

interface TictoAccount {
  id: string;
  account_name: string;
  token?: string;
  webhook_url?: string;
}

export const IntegrationsTab = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTictoAccount, setSelectedTictoAccount] = useState<TictoAccount | undefined>();

  const { data: tictoAccounts, refetch: refetchTicto } = useQuery({
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

  const handleTictoSubmit = async (data: { account_name: string; token: string }) => {
    try {
      const webhookUrl = `https://avxgduktxkorwfmccwbs.supabase.co/functions/v1/webhook?account=${data.account_name}`;

      if (selectedTictoAccount) {
        const { error } = await supabase
          .from('ticto_accounts')
          .update({ 
            account_name: data.account_name,
            token: data.token,
            webhook_url: webhookUrl
          })
          .eq('id', selectedTictoAccount.id);

        if (error) throw error;
        toast.success("Conta Ticto atualizada com sucesso!");
      } else {
        const { error } = await supabase
          .from('ticto_accounts')
          .insert([{ 
            account_name: data.account_name,
            token: data.token,
            webhook_url: webhookUrl
          }]);

        if (error) throw error;
        toast.success("Conta Ticto criada com sucesso!");
      }
      
      refetchTicto();
      setSelectedTictoAccount(undefined);
      setIsOpen(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro ao salvar conta Ticto");
    }
  };

  const handleTictoDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ticto_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Conta Ticto removida com sucesso!");
      refetchTicto();
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro ao remover conta Ticto");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Integração Ticto</CardTitle>
          <CardDescription>
            Configure a integração com a Ticto para receber webhooks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setSelectedTictoAccount(undefined);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Conta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedTictoAccount ? "Editar Conta Ticto" : "Adicionar Nova Conta Ticto"}
                </DialogTitle>
              </DialogHeader>
              <AccountForm
                account={selectedTictoAccount}
                onSubmit={handleTictoSubmit}
                onClose={() => {
                  setIsOpen(false);
                  setSelectedTictoAccount(undefined);
                }}
              />
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {tictoAccounts?.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            onEdit={(account) => {
              setSelectedTictoAccount(account);
              setIsOpen(true);
            }}
            onDelete={handleTictoDelete}
          />
        ))}
      </div>
    </div>
  );
};
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
import type { TictoAccount } from "./ticto/types";

export const TictoIntegration = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<TictoAccount | undefined>();

  const { data: tictoAccounts, refetch } = useQuery({
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

  const handleSubmit = async (data: { account_name: string; token: string }) => {
    try {
      const webhookUrl = `${window.location.origin}/api/webhook?account=${data.account_name}`;

      if (selectedAccount) {
        const { error } = await supabase
          .from('ticto_accounts')
          .update({ 
            account_name: data.account_name,
            token: data.token,
            webhook_url: webhookUrl
          })
          .eq('id', selectedAccount.id);

        if (error) throw error;
        toast.success("Conta atualizada com sucesso!");
      } else {
        const { error } = await supabase
          .from('ticto_accounts')
          .insert([{ 
            account_name: data.account_name,
            token: data.token,
            webhook_url: webhookUrl
          }]);

        if (error) throw error;
        toast.success("Conta criada com sucesso!");
      }
      
      refetch();
      setSelectedAccount(undefined);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro ao salvar conta");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ticto_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Conta removida com sucesso!");
      refetch();
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro ao remover conta");
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
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Conta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedAccount ? "Editar Conta" : "Adicionar Nova Conta"}
                </DialogTitle>
              </DialogHeader>
              <AccountForm
                account={selectedAccount}
                onSubmit={handleSubmit}
                onClose={() => {
                  setIsOpen(false);
                  setSelectedAccount(undefined);
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
              setSelectedAccount(account);
              setIsOpen(true);
            }}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
};
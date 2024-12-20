import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { TictoAccountForm } from "./ticto/AccountForm";
import { TictoAccountCard } from "./ticto/AccountCard";
import { CartPandaAccountForm } from "./cartpanda/AccountForm";
import { CartPandaAccountCard } from "./cartpanda/AccountCard";
import type { TictoAccount, CartPandaAccount } from "./ticto/types";

export const IntegrationsTab = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTictoAccount, setSelectedTictoAccount] = useState<TictoAccount | undefined>();
  const [selectedCartPandaAccount, setSelectedCartPandaAccount] = useState<CartPandaAccount | undefined>();
  const [activeIntegration, setActiveIntegration] = useState<'ticto' | 'cartpanda'>('ticto');

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

  const { data: cartPandaAccounts, refetch: refetchCartPanda } = useQuery({
    queryKey: ['cartPandaAccounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cartpanda_accounts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CartPandaAccount[];
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

  const handleCartPandaSubmit = async (data: CartPandaAccount) => {
    try {
      if (selectedCartPandaAccount) {
        const { error } = await supabase
          .from('cartpanda_accounts')
          .update(data)
          .eq('id', selectedCartPandaAccount.id);

        if (error) throw error;
        toast.success("Conta CartPanda atualizada com sucesso!");
      } else {
        const { error } = await supabase
          .from('cartpanda_accounts')
          .insert([data]);

        if (error) throw error;
        toast.success("Conta CartPanda criada com sucesso!");
      }
      
      refetchCartPanda();
      setSelectedCartPandaAccount(undefined);
      setIsOpen(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro ao salvar conta CartPanda");
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

  const handleCartPandaDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cartpanda_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Conta CartPanda removida com sucesso!");
      refetchCartPanda();
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro ao remover conta CartPanda");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 mb-4">
        <Button 
          variant={activeIntegration === 'ticto' ? 'default' : 'outline'}
          onClick={() => setActiveIntegration('ticto')}
        >
          Ticto
        </Button>
        <Button 
          variant={activeIntegration === 'cartpanda' ? 'default' : 'outline'}
          onClick={() => setActiveIntegration('cartpanda')}
        >
          CartPanda
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {activeIntegration === 'ticto' ? 'Integração Ticto' : 'Integração CartPanda'}
          </CardTitle>
          <CardDescription>
            {activeIntegration === 'ticto' 
              ? 'Configure a integração com a Ticto para receber webhooks' 
              : 'Configure a integração com a CartPanda para sincronizar pedidos'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setSelectedTictoAccount(undefined);
                setSelectedCartPandaAccount(undefined);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Conta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {activeIntegration === 'ticto' 
                    ? (selectedTictoAccount ? "Editar Conta Ticto" : "Adicionar Nova Conta Ticto")
                    : (selectedCartPandaAccount ? "Editar Conta CartPanda" : "Adicionar Nova Conta CartPanda")}
                </DialogTitle>
              </DialogHeader>
              {activeIntegration === 'ticto' ? (
                <TictoAccountForm
                  account={selectedTictoAccount}
                  onSubmit={handleTictoSubmit}
                  onClose={() => {
                    setIsOpen(false);
                    setSelectedTictoAccount(undefined);
                  }}
                />
              ) : (
                <CartPandaAccountForm
                  account={selectedCartPandaAccount}
                  onSubmit={handleCartPandaSubmit}
                  onClose={() => {
                    setIsOpen(false);
                    setSelectedCartPandaAccount(undefined);
                  }}
                />
              )}
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {activeIntegration === 'ticto' ? (
          tictoAccounts?.map((account) => (
            <TictoAccountCard
              key={account.id}
              account={account}
              onEdit={(account) => {
                setSelectedTictoAccount(account);
                setIsOpen(true);
              }}
              onDelete={handleTictoDelete}
            />
          ))
        ) : (
          cartPandaAccounts?.map((account) => (
            <CartPandaAccountCard
              key={account.id}
              account={account}
              onEdit={(account) => {
                setSelectedCartPandaAccount(account);
                setIsOpen(true);
              }}
              onDelete={handleCartPandaDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};
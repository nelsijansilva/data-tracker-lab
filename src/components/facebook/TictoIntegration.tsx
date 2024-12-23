import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TictoHeader } from "./ticto/TictoHeader";
import { TictoAccountList } from "./ticto/TictoAccountList";
import type { TictoAccount } from "./ticto/types";

export const IntegrationsTab = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTictoAccount, setSelectedTictoAccount] = useState<TictoAccount | undefined>();

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
    } catch (error) {
      console.error('Error:', error);
      toast.error("Erro ao remover conta Ticto");
    }
  };

  return (
    <div className="space-y-6">
      <TictoHeader
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSubmit={handleTictoSubmit}
      />
      <TictoAccountList
        onEdit={(account) => {
          setSelectedTictoAccount(account);
          setIsOpen(true);
        }}
        onDelete={handleTictoDelete}
      />
    </div>
  );
};
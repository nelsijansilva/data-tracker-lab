import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import type { CartPandaAccount } from '../ticto/types';

interface AccountFormProps {
  account?: CartPandaAccount;
  onSubmit: (data: CartPandaAccount) => void;
  onClose: () => void;
}

export const CartPandaAccountForm = ({ account, onSubmit, onClose }: AccountFormProps) => {
  const [accountName, setAccountName] = useState(account?.account_name || "");
  const [storeSlug, setStoreSlug] = useState(account?.store_slug || "");
  const [token, setToken] = useState(account?.token || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountName.trim() || !storeSlug.trim() || !token.trim()) {
      toast.error("Todos os campos são obrigatórios");
      return;
    }

    const webhookUrl = `https://avxgduktxkorwfmccwbs.supabase.co/functions/v1/cartpanda-webhook?account=${accountName}`;
    
    onSubmit({
      account_name: accountName,
      store_slug: storeSlug,
      token: token,
      webhook_url: webhookUrl,
      ...(account?.id && { id: account.id })
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          placeholder="Nome da conta"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
        />
        <Input
          placeholder="Store Slug"
          value={storeSlug}
          onChange={(e) => setStoreSlug(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Token da CartPanda"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">
          {account ? "Atualizar" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
};
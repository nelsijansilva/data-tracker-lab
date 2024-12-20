import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CartPandaAccount } from '../ticto/types';

interface AccountFormProps {
  account?: CartPandaAccount;
  onSubmit: (data: CartPandaAccount) => Promise<void>;
  onClose: () => void;
}

export const CartPandaAccountForm = ({ 
  account, 
  onSubmit, 
  onClose 
}: AccountFormProps) => {
  const [accountName, setAccountName] = useState(account?.account_name || '');
  const [storeSlug, setStoreSlug] = useState(account?.store_slug || '');
  const [token, setToken] = useState(account?.token || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      account_name: accountName,
      store_slug: storeSlug,
      token: token
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nome da Conta</Label>
        <Input 
          value={accountName} 
          onChange={(e) => setAccountName(e.target.value)}
          placeholder="Nome da conta CartPanda"
          required 
        />
      </div>
      <div>
        <Label>Store Slug</Label>
        <Input 
          value={storeSlug} 
          onChange={(e) => setStoreSlug(e.target.value)}
          placeholder="Slug da loja (ex: example-test)"
          required 
        />
      </div>
      <div>
        <Label>Token</Label>
        <Input 
          value={token} 
          onChange={(e) => setToken(e.target.value)}
          placeholder="Token de autenticação"
          required 
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">
          {account ? 'Atualizar' : 'Adicionar'}
        </Button>
      </div>
    </form>
  );
};
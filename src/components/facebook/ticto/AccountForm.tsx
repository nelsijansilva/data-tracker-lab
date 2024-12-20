import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

interface TictoAccount {
  id: string;
  account_name: string;
  token?: string;
  webhook_url?: string;
}

interface AccountFormProps {
  account?: TictoAccount;
  onSubmit: (data: { account_name: string; token: string }) => void;
  onClose: () => void;
}

export const AccountForm = ({ account, onSubmit, onClose }: AccountFormProps) => {
  const [accountName, setAccountName] = useState(account?.account_name || "");
  const [token, setToken] = useState(account?.token || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim() || !token.trim()) {
      toast.error("Todos os campos são obrigatórios");
      return;
    }
    onSubmit({ account_name: accountName, token });
    onClose();
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
          type="password"
          placeholder="Token da Ticto"
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
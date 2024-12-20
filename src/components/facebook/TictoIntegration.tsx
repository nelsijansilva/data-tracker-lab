import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Trash2, Plus } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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

const AccountForm = ({ account, onSubmit, onClose }: AccountFormProps) => {
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
      if (selectedAccount) {
        const { error } = await supabase
          .from('ticto_accounts')
          .update({ 
            account_name: data.account_name,
            token: data.token
          })
          .eq('id', selectedAccount.id);

        if (error) throw error;
        toast.success("Conta atualizada com sucesso!");
      } else {
        const { error } = await supabase
          .from('ticto_accounts')
          .insert([{ 
            account_name: data.account_name,
            token: data.token
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
          <Card key={account.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{account.account_name}</CardTitle>
                  <CardDescription>
                    {account.webhook_url ? (
                      <span className="text-green-500">Webhook configurado</span>
                    ) : (
                      <span className="text-yellow-500">Webhook pendente</span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedAccount(account);
                      setIsOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover conta</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja remover esta conta? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(account.id)}>
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {account.webhook_url ? (
                <div className="bg-gray-800 p-3 rounded-md">
                  <code className="text-sm">{account.webhook_url}</code>
                </div>
              ) : (
                <p className="text-gray-400">
                  O webhook será gerado após a configuração do token da Ticto
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
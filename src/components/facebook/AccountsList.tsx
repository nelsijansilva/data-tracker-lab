import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AccountCredentialsForm } from "./AccountCredentialsForm";
import { useState } from "react";
import { fetchFacebookAccounts } from "@/services/api";

interface Account {
  id: string;
  account_id: string;
  access_token: string;
  app_id: string;
  app_secret: string;
  account_name: string;
}

export const AccountsList = () => {
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['fbAccounts'],
    queryFn: fetchFacebookAccounts
  });

  const deleteMutation = useMutation({
    mutationFn: async (accountId: string) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/facebook/accounts/${accountId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete account');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fbAccounts'] });
      toast({
        title: "Sucesso",
        description: "Conta removida com sucesso",
      });
    },
    onError: (error) => {
      console.error('Error deleting account:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover a conta",
        variant: "destructive",
      });
    }
  });

  const handleDelete = (accountId: string) => {
    if (window.confirm('Tem certeza que deseja remover esta conta?')) {
      deleteMutation.mutate(accountId);
    }
  };

  if (isLoading) return <div>Carregando contas...</div>;

  return (
    <div className="space-y-4">
      {!editingAccount && <AccountCredentialsForm />}
      
      {editingAccount && (
        <div className="space-y-4">
          <Button 
            variant="outline" 
            onClick={() => setEditingAccount(null)}
          >
            Cancelar Edição
          </Button>
          <AccountCredentialsForm 
            initialData={editingAccount}
            onSuccess={() => setEditingAccount(null)}
          />
        </div>
      )}

      {accounts && accounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Contas Conectadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accounts.map((account: Account) => (
                <div 
                  key={account.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-lg mb-1">{account.account_name || 'Conta sem nome'}</p>
                    <p className="text-sm text-gray-500">ID da Conta: {account.account_id}</p>
                    <p className="text-sm text-gray-500">
                      App ID: {account.app_id}
                    </p>
                    <p className="text-sm text-gray-500">
                      Token: {account.access_token.substring(0, 20)}...
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditingAccount(account)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(account.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

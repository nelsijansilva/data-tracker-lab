import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const TictoIntegration = () => {
  const [accountName, setAccountName] = useState("");

  const { data: tictoAccounts, refetch } = useQuery({
    queryKey: ['tictoAccounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ticto_accounts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const handleCreateAccount = async () => {
    if (!accountName.trim()) {
      toast.error("Nome da conta é obrigatório");
      return;
    }

    const { error } = await supabase
      .from('ticto_accounts')
      .insert([{ account_name: accountName }]);

    if (error) {
      toast.error("Erro ao criar conta: " + error.message);
      return;
    }

    toast.success("Conta criada com sucesso!");
    setAccountName("");
    refetch();
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
          <div className="flex gap-4">
            <Input
              placeholder="Nome da conta"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={handleCreateAccount}>
              Adicionar Conta
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {tictoAccounts?.map((account) => (
          <Card key={account.id}>
            <CardHeader>
              <CardTitle>{account.account_name}</CardTitle>
              <CardDescription>
                {account.webhook_url ? (
                  <span className="text-green-500">Webhook configurado</span>
                ) : (
                  <span className="text-yellow-500">Webhook pendente</span>
                )}
              </CardDescription>
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
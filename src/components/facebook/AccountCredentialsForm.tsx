import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createFacebookAccount, updateFacebookAccount } from "@/services/api";

interface AccountCredentialsFormProps {
  initialData?: {
    id: string;
    account_id: string;
    access_token: string;
    app_id: string;
    app_secret: string;
    account_name: string;
  };
  onSuccess?: () => void;
}

export const AccountCredentialsForm = ({ initialData, onSuccess }: AccountCredentialsFormProps) => {
  const [accountId, setAccountId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [appId, setAppId] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [accountName, setAccountName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (initialData) {
      setAccountId(initialData.account_id.replace('act_', ''));
      setAccessToken(initialData.access_token);
      setAppId(initialData.app_id);
      setAppSecret(initialData.app_secret);
      setAccountName(initialData.account_name);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const accountData = {
        account_id: accountId.startsWith('act_') ? accountId : `act_${accountId}`,
        access_token: accessToken,
        app_id: appId,
        app_secret: appSecret,
        account_name: accountName,
      };

      if (initialData) {
        await updateFacebookAccount(initialData.id, accountData);
        toast({
          title: "Sucesso",
          description: "Credenciais atualizadas com sucesso",
        });
      } else {
        await createFacebookAccount(accountData);
        toast({
          title: "Sucesso",
          description: "Credenciais salvas com sucesso",
        });
      }

      queryClient.invalidateQueries({ queryKey: ['fbAccounts'] });
      setAccountId("");
      setAccessToken("");
      setAppId("");
      setAppSecret("");
      setAccountName("");
      onSuccess?.();
    } catch (error) {
      console.error('Error saving credentials:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar credenciais",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? "Editar Conta do Facebook Ads" : "Conectar Conta do Facebook Ads"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="accountName" className="block text-sm font-medium mb-1">
              Nome da Conta
            </label>
            <Input
              id="accountName"
              placeholder="Digite um nome para identificar esta conta"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="accountId" className="block text-sm font-medium mb-1">
              ID da Conta
            </label>
            <Input
              id="accountId"
              placeholder="Digite o ID da conta (com ou sem prefixo act_)"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="appId" className="block text-sm font-medium mb-1">
              App ID
            </label>
            <Input
              id="appId"
              placeholder="Digite o ID do aplicativo do Facebook"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="appSecret" className="block text-sm font-medium mb-1">
              App Secret
            </label>
            <Input
              id="appSecret"
              type="password"
              placeholder="Digite o App Secret do aplicativo"
              value={appSecret}
              onChange={(e) => setAppSecret(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="accessToken" className="block text-sm font-medium mb-1">
              Token de Acesso
            </label>
            <Input
              id="accessToken"
              type="password"
              placeholder="Digite o token de acesso"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              required
            />
          </div>
          <Button type="submit">
            {initialData ? "Atualizar Conta" : "Conectar Conta"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
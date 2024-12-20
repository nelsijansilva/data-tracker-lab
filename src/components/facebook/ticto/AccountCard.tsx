import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2 } from "lucide-react";

interface TictoAccount {
  id: string;
  account_name: string;
  token?: string;
  webhook_url?: string;
}

interface AccountCardProps {
  account: TictoAccount;
  onEdit: (account: TictoAccount) => void;
  onDelete: (id: string) => void;
}

export const AccountCard = ({ account, onEdit, onDelete }: AccountCardProps) => {
  return (
    <Card>
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
              onClick={() => onEdit(account)}
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
                  <AlertDialogAction onClick={() => onDelete(account.id)}>
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
  );
};
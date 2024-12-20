import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { CartPandaAccount } from '../ticto/types';

interface AccountCardProps {
  account: CartPandaAccount;
  onEdit: (account: CartPandaAccount) => void;
  onDelete: (id: string) => Promise<void>;
}

export const CartPandaAccountCard = ({ 
  account, 
  onEdit, 
  onDelete 
}: AccountCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>{account.account_name}</CardTitle>
        <div className="flex space-x-2">
          <Button 
            size="icon" 
            variant="outline" 
            onClick={() => onEdit(account)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            size="icon" 
            variant="destructive" 
            onClick={() => account.id && onDelete(account.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            <p>Store Slug: {account.store_slug}</p>
            <p>Token: {account.token.substring(0, 10)}...</p>
          </div>
          {account.webhook_url && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Webhook URL:</p>
              <div className="bg-gray-800 p-3 rounded-md">
                <code className="text-sm break-all">{account.webhook_url}</code>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
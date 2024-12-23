import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AccountForm } from "./AccountForm";
import type { TictoAccount } from "./types";

interface TictoHeaderProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { account_name: string; token: string }) => Promise<void>;
}

export const TictoHeader = ({ isOpen, onOpenChange, onSubmit }: TictoHeaderProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Integração Ticto</CardTitle>
        <CardDescription>
          Configure a integração com a Ticto para receber webhooks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Conta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Adicionar Nova Conta Ticto
              </DialogTitle>
            </DialogHeader>
            <AccountForm
              onSubmit={onSubmit}
              onClose={() => onOpenChange(false)}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
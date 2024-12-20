import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";

interface IntegrationFormProps {
  open: boolean;
  onClose: () => void;
}

export const IntegrationForm = ({ open, onClose }: IntegrationFormProps) => {
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState<"hotmart" | "eduzz" | "ticto" | "buygoods" | "other">("ticto");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const webhookToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const webhookUrl = `https://avxgduktxkorwfmccwbs.supabase.co/functions/v1/${platform}-webhook?token=${webhookToken}`;
      
      const { data, error } = await supabase
        .from('platform_integrations')
        .insert([
          {
            name,
            platform,
            webhook_token: webhookToken,
            webhook_url: webhookUrl,
            is_active: true
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Integração criada com sucesso!",
        description: "A nova integração foi adicionada ao sistema.",
      });

      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      onClose();
    } catch (error) {
      console.error('Erro ao criar integração:', error);
      toast({
        variant: "destructive",
        title: "Erro ao criar integração",
        description: "Ocorreu um erro ao tentar criar a integração. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#1f2937] text-white">
        <DialogHeader>
          <DialogTitle>Nova Integração</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nome da Integração
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#374151] border-gray-600"
              placeholder="Ex: Minha Loja Ticto"
              required
            />
          </div>
          <div>
            <label htmlFor="platform" className="block text-sm font-medium mb-1">
              Plataforma
            </label>
            <Select value={platform} onValueChange={(value: any) => setPlatform(value)}>
              <SelectTrigger className="bg-[#374151] border-gray-600">
                <SelectValue placeholder="Selecione a plataforma" />
              </SelectTrigger>
              <SelectContent className="bg-[#374151] border-gray-600">
                <SelectItem value="ticto">Ticto</SelectItem>
                <SelectItem value="hotmart">Hotmart</SelectItem>
                <SelectItem value="eduzz">Eduzz</SelectItem>
                <SelectItem value="buygoods">BuyGoods</SelectItem>
                <SelectItem value="other">Outra</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-600 hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {loading ? "Criando..." : "Criar Integração"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
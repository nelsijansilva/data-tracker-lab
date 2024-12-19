import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PixelForm } from "./PixelForm";
import { PixelsList } from "./PixelsList";

export interface FacebookPixel {
  id: string;
  pixel_name: string;
  pixel_id: string;
  pixel_token: string;
  event_test_code: string | null;
}

type PixelFormData = Omit<FacebookPixel, 'id'>;

export const PixelConfigForm = () => {
  const [editingPixel, setEditingPixel] = useState<FacebookPixel | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pixels, isLoading } = useQuery({
    queryKey: ['fbPixels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('facebook_pixels')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as FacebookPixel[];
    }
  });

  const handleSubmit = async (pixelData: PixelFormData) => {
    try {
      if (editingPixel) {
        const { error } = await supabase
          .from('facebook_pixels')
          .update(pixelData)
          .eq('id', editingPixel.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Pixel atualizado com sucesso",
        });
      } else {
        const { error } = await supabase
          .from('facebook_pixels')
          .insert([pixelData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Pixel salvo com sucesso",
        });
      }

      queryClient.invalidateQueries({ queryKey: ['fbPixels'] });
      setEditingPixel(null);
    } catch (error) {
      console.error('Error saving pixel config:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configuração do pixel",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('facebook_pixels')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Pixel excluído com sucesso",
      });

      queryClient.invalidateQueries({ queryKey: ['fbPixels'] });
    } catch (error) {
      console.error('Error deleting pixel:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir o pixel",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <PixelForm
        editingPixel={editingPixel}
        onSubmit={handleSubmit}
        onCancel={() => setEditingPixel(null)}
      />
      {pixels && pixels.length > 0 && (
        <PixelsList
          pixels={pixels}
          onEdit={setEditingPixel}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};
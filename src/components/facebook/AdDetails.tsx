import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface AdDetailsProps {
  ad: any;
  isOpen: boolean;
  onClose: () => void;
}

export const AdDetails = ({ ad, isOpen, onClose }: AdDetailsProps) => {
  if (!ad) return null;

  const getCreativeContent = () => {
    const creative = ad.creative;
    if (!creative) return null;

    let title = creative.title;
    let body = creative.body;
    let imageUrl = null;
    let message = null;
    let description = null;

    // Tentar obter dados do object_story_spec
    if (creative.object_story_spec?.link_data) {
      const linkData = creative.object_story_spec.link_data;
      message = linkData.message;
      description = linkData.description;
      imageUrl = linkData.image_url;
    }

    // Tentar obter dados do asset_feed_spec
    if (creative.asset_feed_spec) {
      const assetFeed = creative.asset_feed_spec;
      title = assetFeed.titles?.[0]?.text || title;
      body = assetFeed.bodies?.[0]?.text || body;
      description = assetFeed.descriptions?.[0]?.text || description;
      imageUrl = assetFeed.images?.[0]?.url || imageUrl;
    }

    return {
      title,
      body,
      message,
      description,
      imageUrl
    };
  };

  const creativeContent = getCreativeContent();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-[#2a2f3d] border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            {ad.name}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6">
            {/* Status */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Status</h3>
              <Badge variant={ad.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {ad.status}
              </Badge>
            </div>

            <Separator className="border-gray-700" />

            {/* Preview URL */}
            {ad.preview_url && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-4">Prévia do Anúncio</h3>
                <div className="relative aspect-video w-full">
                  <iframe 
                    src={ad.preview_url}
                    className="absolute inset-0 w-full h-full rounded-lg border border-gray-700"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            <Separator className="border-gray-700" />

            {/* Creative Details */}
            {creativeContent && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-400">Detalhes Criativos</h3>
                
                {creativeContent.title && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Título</p>
                    <p className="text-sm">{creativeContent.title}</p>
                  </div>
                )}

                {creativeContent.message && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Mensagem</p>
                    <p className="text-sm whitespace-pre-wrap">{creativeContent.message}</p>
                  </div>
                )}

                {creativeContent.body && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Texto</p>
                    <p className="text-sm whitespace-pre-wrap">{creativeContent.body}</p>
                  </div>
                )}

                {creativeContent.description && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Descrição</p>
                    <p className="text-sm whitespace-pre-wrap">{creativeContent.description}</p>
                  </div>
                )}

                {creativeContent.imageUrl && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Imagem</p>
                    <img 
                      src={creativeContent.imageUrl} 
                      alt="Creative preview"
                      className="rounded-lg max-w-full h-auto"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
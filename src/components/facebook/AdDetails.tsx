import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface AdDetailsProps {
  ad: any;
  isOpen: boolean;
  onClose: () => void;
}

export const AdDetails = ({ ad, isOpen, onClose }: AdDetailsProps) => {
  if (!ad) return null;

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
              <div className={`inline-block px-2 py-1 rounded-full text-xs ${
                ad.status === 'ACTIVE' ? 'bg-green-500/20 text-green-500' :
                ad.status === 'PAUSED' ? 'bg-yellow-500/20 text-yellow-500' :
                'bg-red-500/20 text-red-500'
              }`}>
                {ad.status}
              </div>
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
            {ad.creative && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-400">Detalhes Criativos</h3>
                
                {ad.creative.title && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Título</p>
                    <p className="text-sm">{ad.creative.title}</p>
                  </div>
                )}

                {ad.creative.body && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Texto</p>
                    <p className="text-sm whitespace-pre-wrap">{ad.creative.body}</p>
                  </div>
                )}

                {ad.creative.link_url && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">URL de Destino</p>
                    <a 
                      href={ad.creative.link_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      {ad.creative.link_url}
                    </a>
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
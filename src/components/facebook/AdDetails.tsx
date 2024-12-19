import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { buildAdPreviewEndpoint } from "@/lib/facebook/apiBuilder";
import { fetchFacebookData } from "@/lib/facebook/api";
import { useToast } from "@/hooks/use-toast";

interface AdDetailsProps {
  ad: any;
  isOpen: boolean;
  onClose: () => void;
}

const AD_FORMATS = [
  { value: "DESKTOP_FEED_STANDARD", label: "Desktop Feed" },
  { value: "MOBILE_FEED_STANDARD", label: "Mobile Feed" },
  { value: "INSTAGRAM_STANDARD", label: "Instagram Feed" },
  { value: "INSTAGRAM_STORY", label: "Instagram Story" },
  { value: "INSTAGRAM_REELS", label: "Instagram Reels" },
  { value: "INSTAGRAM_EXPLORE_GRID_HOME", label: "Instagram Explore" },
];

export const AdDetails = ({ ad, isOpen, onClose }: AdDetailsProps) => {
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState("DESKTOP_FEED_STANDARD");
  const { toast } = useToast();

  useEffect(() => {
    const fetchPreview = async () => {
      if (!ad?.id) return;
      
      try {
        const endpoint = buildAdPreviewEndpoint(ad.id, selectedFormat);
        const response = await fetchFacebookData(endpoint, ad.access_token);
        
        if (response.data?.[0]?.body) {
          setPreviewHtml(response.data[0].body);
        }
      } catch (error) {
        console.error('Error fetching ad preview:', error);
        toast({
          title: "Error",
          description: "Failed to load ad preview. Please try again.",
          variant: "destructive",
        });
      }
    };

    if (isOpen && ad) {
      fetchPreview();
    }
  }, [ad, isOpen, selectedFormat, toast]);

  if (!ad) return null;

  const getCreativeContent = () => {
    const creative = ad.creative;
    if (!creative) return null;

    let title = creative.title;
    let body = creative.body;
    let imageUrl = null;
    let message = null;
    let description = null;

    if (creative.object_story_spec?.link_data) {
      const linkData = creative.object_story_spec.link_data;
      message = linkData.message;
      description = linkData.description;
      imageUrl = linkData.image_url;
    }

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

            {/* Preview Format Selector */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Preview Format</h3>
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger className="w-full bg-[#2a2f3d] border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#2a2f3d] border-gray-700">
                  {AD_FORMATS.map((format) => (
                    <SelectItem 
                      key={format.value} 
                      value={format.value}
                      className="text-white hover:bg-[#3b4252]"
                    >
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ad Preview */}
            {previewHtml && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-4">Ad Preview</h3>
                <div 
                  className="w-full bg-white rounded-lg overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: previewHtml }} 
                />
              </div>
            )}

            <Separator className="border-gray-700" />

            {/* Creative Details */}
            {creativeContent && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-400">Creative Details</h3>
                
                {creativeContent.title && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Title</p>
                    <p className="text-sm">{creativeContent.title}</p>
                  </div>
                )}

                {creativeContent.message && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Message</p>
                    <p className="text-sm whitespace-pre-wrap">{creativeContent.message}</p>
                  </div>
                )}

                {creativeContent.body && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Text</p>
                    <p className="text-sm whitespace-pre-wrap">{creativeContent.body}</p>
                  </div>
                )}

                {creativeContent.description && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Description</p>
                    <p className="text-sm whitespace-pre-wrap">{creativeContent.description}</p>
                  </div>
                )}

                {creativeContent.imageUrl && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Image</p>
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
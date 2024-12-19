import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AdCreativeDetailsProps {
  creative: any;
}

export const AdCreativeDetails = ({ creative }: AdCreativeDetailsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!creative) return null;

  let title = creative.title;
  let body = creative.body;
  let imageUrl = null;
  let message = null;
  let description = null;
  let link = null;

  if (creative.object_story_spec?.link_data) {
    const linkData = creative.object_story_spec.link_data;
    message = linkData.message;
    description = linkData.description;
    imageUrl = linkData.image_url;
    link = linkData.link;
  }

  if (creative.asset_feed_spec) {
    const assetFeed = creative.asset_feed_spec;
    title = assetFeed.titles?.[0]?.text || title;
    body = assetFeed.bodies?.[0]?.text || body;
    description = assetFeed.descriptions?.[0]?.text || description;
    imageUrl = assetFeed.images?.[0]?.url || imageUrl;
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full space-y-2"
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full flex justify-between items-center py-2 hover:bg-gray-700/50"
        >
          <span className="text-sm font-medium text-gray-400">Creative Details</span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="space-y-4">
        <ScrollArea className="max-h-[400px] rounded-md border border-gray-700 bg-gray-800/50">
          <div className="space-y-4 p-4">
            {title && (
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-1">Title</p>
                <p className="text-sm">{title}</p>
              </div>
            )}

            {message && (
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-1">Message</p>
                <p className="text-sm whitespace-pre-wrap">{message}</p>
              </div>
            )}

            {body && (
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-1">Text</p>
                <p className="text-sm whitespace-pre-wrap">{body}</p>
              </div>
            )}

            {description && (
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-1">Description</p>
                <p className="text-sm whitespace-pre-wrap">{description}</p>
              </div>
            )}

            {link && (
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-1">Link</p>
                <a 
                  href={link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  {link}
                </a>
              </div>
            )}

            {imageUrl && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Image</p>
                <img 
                  src={imageUrl} 
                  alt="Creative preview"
                  className="rounded-lg max-w-full h-auto"
                />
              </div>
            )}
          </div>
        </ScrollArea>
      </CollapsibleContent>
    </Collapsible>
  );
};
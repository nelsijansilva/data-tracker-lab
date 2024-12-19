import React, { useState, useEffect } from "react";
import { buildAdPreviewEndpoint } from "@/lib/facebook/apiBuilder";
import { fetchFacebookData } from "@/lib/facebook/api";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdPreviewProps {
  ad: any;
}

const AD_FORMATS = [
  { value: "RIGHT_COLUMN_STANDARD", label: "Right Column" },
  { value: "DESKTOP_FEED_STANDARD", label: "Desktop Feed" },
  { value: "MOBILE_FEED_STANDARD", label: "Mobile Feed" },
  { value: "FACEBOOK_STORY_MOBILE", label: "Facebook Story" },
];

export const AdPreview = ({ ad }: AdPreviewProps) => {
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState("DESKTOP_FEED_STANDARD");
  const { toast } = useToast();

  useEffect(() => {
    const fetchPreview = async () => {
      if (!ad?.id || !ad?.account_id || !ad?.account_access_token) {
        console.error('Missing required ad data for preview:', { ad });
        return;
      }
      
      try {
        const endpoint = buildAdPreviewEndpoint(ad.account_id, ad.id, selectedFormat);
        const response = await fetchFacebookData(endpoint, ad.account_access_token);
        
        if (response.data?.[0]?.body) {
          setPreviewHtml(response.data[0].body);
        } else {
          console.error('Invalid preview response:', response);
          toast({
            title: "Error",
            description: "Failed to generate ad preview. The response format was invalid.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching ad preview:', error);
        toast({
          title: "Error",
          description: "Failed to generate ad preview. Please verify your Facebook access token and permissions.",
          variant: "destructive",
        });
      }
    };

    if (ad) {
      fetchPreview();
    }
  }, [ad, selectedFormat, toast]);

  return (
    <div className="space-y-4">
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

      {previewHtml && (
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-4">Ad Preview</h3>
          <div 
            className="w-full bg-white rounded-lg overflow-hidden"
            dangerouslySetInnerHTML={{ __html: previewHtml }} 
          />
        </div>
      )}
    </div>
  );
};
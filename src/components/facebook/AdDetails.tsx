import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AdCreativeDetails } from "./AdCreativeDetails";

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
        
        <div className="space-y-6">
          {/* Status */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-2">Status</h3>
            <Badge variant={ad.status === 'ACTIVE' ? 'default' : 'secondary'}>
              {ad.status}
            </Badge>
          </div>

          <Separator className="border-gray-700" />

          {/* Creative Details */}
          <div className="space-y-4">
            <AdCreativeDetails creative={ad.creative} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
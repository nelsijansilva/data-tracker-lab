import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FunnelStep } from "@/types/tracking";

interface FunnelStepFormProps {
  step: FunnelStep;
  onUpdate: (id: string, field: keyof FunnelStep, value: string | 'pageview' | 'click' | 'scroll') => void;
  onRemove: (id: string) => void;
}

// Standard Facebook Events
const FB_STANDARD_EVENTS = [
  'AddPaymentInfo',
  'AddToCart',
  'AddToWishlist',
  'CompleteRegistration',
  'Contact',
  'CustomizeProduct',
  'Donate',
  'FindLocation',
  'InitiateCheckout',
  'Lead',
  'Purchase',
  'Schedule',
  'Search',
  'StartTrial',
  'SubmitApplication',
  'Subscribe',
  'ViewContent'
];

export const FunnelStepForm = ({ step, onUpdate, onRemove }: FunnelStepFormProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
      <Input
        placeholder="Step Name"
        value={step.name}
        onChange={(e) => onUpdate(step.id, "name", e.target.value)}
        className="md:col-span-1"
      />
      <Input
        placeholder="Page Path (e.g., /checkout)"
        value={step.path}
        onChange={(e) => onUpdate(step.id, "path", e.target.value)}
        className="md:col-span-1"
      />
      <Select
        value={step.event}
        onValueChange={(value) => onUpdate(step.id, "event", value)}
      >
        <SelectTrigger className="md:col-span-1">
          <SelectValue placeholder="Select Event" />
        </SelectTrigger>
        <SelectContent>
          {FB_STANDARD_EVENTS.map((event) => (
            <SelectItem key={event} value={event}>
              {event}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={step.triggerType}
        onValueChange={(value) => onUpdate(step.id, "triggerType", value as 'pageview' | 'click' | 'scroll')}
      >
        <SelectTrigger className="md:col-span-1">
          <SelectValue placeholder="Select Trigger" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pageview">Page View</SelectItem>
          <SelectItem value="click">Click Event</SelectItem>
          <SelectItem value="scroll">Scroll Event</SelectItem>
        </SelectContent>
      </Select>
      {(step.triggerType === 'click' || step.triggerType === 'scroll') && (
        <Input
          placeholder="CSS Selector (class or ID)"
          value={step.selector || ''}
          onChange={(e) => onUpdate(step.id, "selector", e.target.value)}
          className="md:col-span-1"
        />
      )}
      <Button
        variant="destructive"
        size="icon"
        onClick={() => onRemove(step.id)}
        className="md:col-span-1"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const AccountCredentialsForm = () => {
  const [accountId, setAccountId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('facebook_ad_accounts')
        .insert([
          {
            account_id: accountId.startsWith('act_') ? accountId : `act_${accountId}`,
            access_token: accessToken,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Facebook Ads credentials saved successfully",
      });

      queryClient.invalidateQueries({ queryKey: ['fbCredentials'] });
    } catch (error) {
      console.error('Error saving credentials:', error);
      toast({
        title: "Error",
        description: "Failed to save credentials",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect Facebook Ads Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="accountId" className="block text-sm font-medium mb-1">
              Account ID
            </label>
            <Input
              id="accountId"
              placeholder="Enter your account ID (with or without act_ prefix)"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="accessToken" className="block text-sm font-medium mb-1">
              Access Token
            </label>
            <Input
              id="accessToken"
              type="password"
              placeholder="Enter your access token"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              required
            />
          </div>
          <Button type="submit">Connect Account</Button>
        </form>
      </CardContent>
    </Card>
  );
};
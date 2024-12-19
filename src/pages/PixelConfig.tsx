import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountCredentialsForm } from "@/components/facebook/AccountCredentialsForm";
import { AccountsList } from "@/components/facebook/AccountsList";

const PixelConfig = () => {
  return (
    <div className="min-h-screen bg-[#1a1f2e] text-white">
      <div className="border-b border-primary/20 bg-hacker-darker">
        <div className="container mx-auto py-4 px-6">
          <h1 className="text-2xl font-bold text-primary neon-text">Configuração do Pixel</h1>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        <AccountsList />
      </div>
    </div>
  );
};

export default PixelConfig;
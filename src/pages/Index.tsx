import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-hacker-dark flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary neon-text animate-glow mb-2">
            Data Tracker
          </h1>
          <p className="text-muted-foreground">
            Access your analytics dashboard
          </p>
        </div>
        
        <div className="glass-card p-6 rounded-lg">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#8B5CF6',
                    brandAccent: '#7C3AED',
                    inputBackground: '#1A1F2C',
                    inputText: '#FFFFFF',
                    inputPlaceholder: '#666666',
                  },
                },
              },
              className: {
                container: 'auth-container',
                button: 'cyber-button w-full',
                input: 'bg-hacker-dark border-primary/30 text-white',
                label: 'text-primary',
              },
            }}
            theme="dark"
            providers={[]}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
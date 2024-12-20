import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

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
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Enter Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
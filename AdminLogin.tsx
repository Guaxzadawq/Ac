import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password);
      if (error) {
        toast({ title: "Erro ao cadastrar", description: error.message, variant: "destructive" });
      } else {
        // After signup, try to sign in
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          toast({ title: "Conta criada! Faça login.", variant: "default" });
          setIsSignUp(false);
        } else {
          navigate("/admin");
        }
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
      } else {
        navigate("/admin");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Painel Admin</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isSignUp ? "Criar conta de administrador" : "Faça login para gerenciar a loja"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <Button type="submit" className="w-full rounded-xl py-5" disabled={loading}>
            {loading ? "Aguarde..." : isSignUp ? "Criar Conta" : "Entrar"}
          </Button>
        </form>

        <button
          className="w-full text-center text-sm text-primary mt-4 hover:underline"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? "Já tem conta? Faça login" : "Criar conta de administrador"}
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;

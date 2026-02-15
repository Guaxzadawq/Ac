import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const OrderSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Pedido Enviado!</h1>
        <p className="text-muted-foreground mb-8">
          Seu pedido foi enviado com sucesso pelo WhatsApp. Aguarde a confirmação da loja.
        </p>
        <Button className="w-full rounded-xl py-5" onClick={() => navigate("/")}>
          Voltar ao Início
        </Button>
      </div>
    </div>
  );
};

export default OrderSuccess;

import { useNavigate } from "react-router-dom";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, ShoppingBag } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { data: settings, isLoading } = useStoreSettings();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-primary text-lg">Carregando...</div>
      </div>
    );
  }

  const isOpen = settings?.is_open ?? false;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <div className="bg-primary text-primary-foreground px-6 pt-12 pb-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary-foreground/20" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-primary-foreground/10" />
        </div>
        <div className="relative z-10">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <span className="text-4xl">🍇</span>
          </div>
          <h1 className="text-3xl font-bold mb-1">{settings?.store_name || "Açaí da Casa"}</h1>
          <div className="flex items-center justify-center gap-1 text-primary-foreground/80 text-sm mt-2">
            <MapPin className="w-4 h-4" />
            <span>{settings?.store_address || "Carregando..."}</span>
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="px-6 -mt-8 relative z-10 flex flex-col gap-4 max-w-md mx-auto w-full">
        <div className="bg-card rounded-xl shadow-lg p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isOpen ? "bg-green-500" : "bg-destructive"}`} />
            <span className="font-semibold text-card-foreground">
              {isOpen ? "Aberto agora" : "Fechado"}
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Clock className="w-4 h-4" />
            <span>{settings?.delivery_time || "30-50 min"}</span>
          </div>
        </div>

        {!isOpen && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-center text-destructive text-sm font-medium">
            No momento não estamos aceitando pedidos. Volte mais tarde!
          </div>
        )}

        <Button
          size="lg"
          className="w-full text-lg py-6 rounded-xl shadow-lg"
          onClick={() => navigate("/cardapio")}
          disabled={!isOpen}
        >
          <ShoppingBag className="w-5 h-5 mr-2" />
          Pedir Agora
        </Button>

        <p className="text-center text-muted-foreground text-xs mt-2">
          Taxa de entrega: R$ {Number(settings?.delivery_fee || 0).toFixed(2).replace(".", ",")}
        </p>
      </div>

      <div className="flex-1" />
      <footer className="text-center text-muted-foreground text-xs py-4">
        © {new Date().getFullYear()} {settings?.store_name}
      </footer>
    </div>
  );
};

export default Index;

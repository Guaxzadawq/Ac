import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Minus, Plus, Trash2, Loader2 } from "lucide-react";

const Cart = () => {
  const navigate = useNavigate();
  const { items = [], updateQuantity, removeItem, subtotal = 0 } = useCart();
  const { data: settings, isLoading } = useStoreSettings();
  
  const deliveryFee = Number(settings?.delivery_fee || 0);
  // No carrinho, mostramos o total com a taxa por padrão, mas o checkout decidirá se aplica ou não
  const total = subtotal + deliveryFee;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate("/cardapio")} className="p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">Carrinho</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Seu carrinho está vazio</p>
            <Button onClick={() => navigate("/cardapio")}>Ver Cardápio</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-48">
      <div className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => navigate("/cardapio")} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">Carrinho</h1>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto space-y-3">
        {items.map((item) => {
          const itemPrice = Number(item.price || 0);
          const itemAddons = item.addons || [];
          const addonTotal = itemAddons.reduce((s, a) => s + Number(a.price || 0), 0);
          const itemTotal = (itemPrice + addonTotal) * (item.quantity || 1);
          
          return (
            <div key={item.id} className="bg-card rounded-xl border border-border p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-card-foreground text-sm">{item.name || "Produto"}</h3>
                  {itemAddons.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      + {itemAddons.map((a) => a.name).join(", ")}
                    </p>
                  )}
                </div>
                <button onClick={() => removeItem(item.id)} className="text-destructive p-1 ml-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                    className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-semibold text-sm w-6 text-center">{item.quantity || 1}</span>
                  <button
                    onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                    className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <span className="font-bold text-primary text-sm">
                  R$ {itemTotal.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer with totals */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 max-w-lg mx-auto">
        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>R$ {(subtotal || 0).toFixed(2).replace(".", ",")}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Taxa de entrega (estimada)</span>
            <span>R$ {deliveryFee.toFixed(2).replace(".", ",")}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-1 border-t border-border">
            <span>Total Estimado</span>
            <span className="text-primary">R$ {(total || 0).toFixed(2).replace(".", ",")}</span>
          </div>
        </div>
        <Button className="w-full py-5 text-base rounded-xl" onClick={() => navigate("/checkout")}>
          Finalizar Pedido
        </Button>
      </div>
    </div>
  );
};

export default Cart;

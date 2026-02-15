import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Checkout = () => {
  const navigate = useNavigate();
  const { items = [], subtotal = 0, clearCart } = useCart();
  const { data: settings, isLoading } = useStoreSettings();
  
  const deliveryFee = useMemo(() => Number(settings?.delivery_fee || 0), [settings]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    reference: "",
    serviceType: "",
    paymentMethod: "",
    change: "",
  });

  // Prevenir tela branca se o carrinho estiver vazio ou nulo
  if (!items || items.length === 0) {
    setTimeout(() => navigate("/cardapio"), 0);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const total = form.serviceType === "retirada" ? subtotal : subtotal + deliveryFee;

  const handleSubmit = () => {
    try {
      if (!form.name.trim() || !form.phone.trim() || !form.serviceType || !form.paymentMethod) {
        toast({ title: "Preencha todos os campos obrigatórios (*)", variant: "destructive" });
        return;
      }

      if (form.serviceType === "entrega" && !form.address.trim()) {
        toast({ title: "Informe o endereço de entrega", variant: "destructive" });
        return;
      }

      const itemsText = items
        .map((i) => {
          const itemPrice = Number(i.price || 0);
          const itemAddons = i.addons || [];
          const addonTotal = itemAddons.reduce((s, a) => s + Number(a.price || 0), 0);
          const quantity = Number(i.quantity || 1);
          const line = `• ${quantity}x ${i.name || "Produto"} - R$ ${((itemPrice + addonTotal) * quantity).toFixed(2).replace(".", ",")}`;
          
          if (itemAddons.length > 0) {
            return `${line}\n  _Adicionais: ${itemAddons.map((a) => a.name).join(", ")}_`;
          }
          return line;
        })
        .join("\n");

      const deliveryLine = form.serviceType === "entrega"
        ? `Taxa de entrega: R$ ${deliveryFee.toFixed(2).replace(".", ",")}`
        : "Retirada no local";

      const changeLine = form.paymentMethod === "dinheiro" && form.change
        ? `\nTroco para: R$ ${form.change}`
        : "";

      const message = `🍇 *NOVO PEDIDO*\n\n` +
        `*Itens:*\n${itemsText}\n\n` +
        `Subtotal: R$ ${subtotal.toFixed(2).replace(".", ",")}\n` +
        `${deliveryLine}\n` +
        `*Total: R$ ${total.toFixed(2).replace(".", ",")}*\n\n` +
        `*Cliente:* ${form.name}\n` +
        `*Telefone:* ${form.phone}\n` +
        `${form.serviceType === "entrega" ? `*Endereço:* ${form.address}\n` : ""}` +
        `${form.reference ? `*Referência:* ${form.reference}\n` : ""}` +
        `*Serviço:* ${form.serviceType === "entrega" ? "Entrega" : "Retirada"}\n` +
        `*Pagamento:* ${form.paymentMethod.charAt(0).toUpperCase() + form.paymentMethod.slice(1)}` +
        changeLine;

      const whatsapp = settings?.whatsapp_number || "5521979917408";
      const cleanWhatsapp = whatsapp.replace(/\D/g, "");
      const url = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(message)}`;
      
      window.open(url, "_blank");
      clearCart();
      navigate("/pedido-enviado");
    } catch (error) {
      console.error("Erro ao gerar pedido:", error);
      toast({ title: "Erro ao processar pedido", description: "Tente novamente ou entre em contato.", variant: "destructive" });
    }
  };

  const setField = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => navigate("/carrinho")} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">Finalizar Pedido</h1>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo *</Label>
          <Input id="name" value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="Seu nome" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone *</Label>
          <Input id="phone" value={form.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="(21) 99999-9999" />
        </div>

        <div className="space-y-2">
          <Label>Tipo de serviço *</Label>
          <Select value={form.serviceType} onValueChange={(v) => setField("serviceType", v)}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="entrega">Entrega</SelectItem>
              <SelectItem value="retirada">Retirada no local</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {form.serviceType === "entrega" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço de entrega *</Label>
              <Input id="address" value={form.address} onChange={(e) => setField("address", e.target.value)} placeholder="Rua, número, bairro" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">Ponto de referência</Label>
              <Input id="reference" value={form.reference} onChange={(e) => setField("reference", e.target.value)} placeholder="Próximo a..." />
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label>Forma de pagamento *</Label>
          <Select value={form.paymentMethod} onValueChange={(v) => setField("paymentMethod", v)}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pix">Pix</SelectItem>
              <SelectItem value="dinheiro">Dinheiro</SelectItem>
              <SelectItem value="cartao">Cartão</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {form.paymentMethod === "dinheiro" && (
          <div className="space-y-2">
            <Label htmlFor="change">Troco para quanto?</Label>
            <Input id="change" value={form.change} onChange={(e) => setField("change", e.target.value)} placeholder="R$ 50,00" />
          </div>
        )}

        {/* Resumo do Pedido */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-1 mt-6">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>R$ {(subtotal || 0).toFixed(2).replace(".", ",")}</span>
          </div>
          {form.serviceType === "entrega" && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Taxa de entrega</span>
              <span>R$ {deliveryFee.toFixed(2).replace(".", ",")}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base pt-1 border-t border-border">
            <span>Total</span>
            <span className="text-primary">R$ {(total || 0).toFixed(2).replace(".", ",")}</span>
          </div>
        </div>

        <Button className="w-full py-5 text-base rounded-xl mt-4" onClick={handleSubmit}>
          <Send className="w-5 h-5 mr-2" />
          Enviar Pedido via WhatsApp
        </Button>
      </div>
    </div>
  );
};

export default Checkout;

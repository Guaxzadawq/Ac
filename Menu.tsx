import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProducts, useCategories, useAddons } from "@/hooks/useProducts";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, ShoppingCart } from "lucide-react";
import type { Product, Addon } from "@/hooks/useProducts";

const Menu = () => {
  const navigate = useNavigate();
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: addons = [] } = useAddons();
  const { data: settings } = useStoreSettings();
  const { addItem, totalItems } = useCart();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const isOpen = settings?.is_open ?? false;

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    const chosenAddons = addons
      .filter((a) => selectedAddons.includes(a.id))
      .map((a) => ({ id: a.id, name: a.name, price: Number(a.price) }));

    addItem({
      productId: selectedProduct.id,
      name: selectedProduct.name,
      price: Number(selectedProduct.price),
      quantity: 1,
      addons: chosenAddons,
      imageUrl: selectedProduct.image_url,
    });
    setSelectedProduct(null);
    setSelectedAddons([]);
  };

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const productsByCategory = categories
    .map((cat) => ({
      ...cat,
      products: products.filter((p) => p.category_id === cat.id),
    }))
    .filter((cat) => cat.products.length > 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 py-4 flex items-center gap-3 sticky top-0 z-20">
        <button onClick={() => navigate("/")} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold flex-1">Cardápio</h1>
        {!isOpen && (
          <span className="text-xs bg-destructive/80 px-2 py-1 rounded-full">Fechado</span>
        )}
      </div>

      {/* Categories & Products */}
      <div className="px-4 py-4 max-w-lg mx-auto">
        {productsByCategory.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            Nenhum produto disponível no momento.
          </p>
        )}
        {productsByCategory.map((cat) => (
          <div key={cat.id} className="mb-6">
            <h2 className="text-lg font-bold text-foreground mb-3 border-b border-border pb-2">
              {cat.name}
            </h2>
            <div className="flex flex-col gap-3">
              {cat.products.map((product) => (
                <div
                  key={product.id}
                  className="bg-card rounded-xl shadow-sm border border-border flex overflow-hidden"
                >
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-24 h-24 object-cover flex-shrink-0"
                      loading="lazy"
                    />
                  )}
                  <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                    <div>
                      <h3 className="font-semibold text-card-foreground text-sm truncate">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-primary text-sm">
                        R$ {Number(product.price).toFixed(2).replace(".", ",")}
                      </span>
                      <Button
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full"
                        onClick={() => {
                          setSelectedProduct(product);
                          setSelectedAddons([]);
                        }}
                        disabled={!isOpen}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Floating cart button */}
      {totalItems > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-30">
          <Button
            className="w-full py-6 text-base rounded-xl shadow-xl"
            onClick={() => navigate("/carrinho")}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Ver Carrinho ({totalItems})
          </Button>
        </div>
      )}

      {/* Addon selection dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>
          {addons.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              <p className="text-sm text-muted-foreground font-medium">Adicionais:</p>
              {addons.map((addon) => (
                <label
                  key={addon.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
                >
                  <Checkbox
                    checked={selectedAddons.includes(addon.id)}
                    onCheckedChange={() => toggleAddon(addon.id)}
                  />
                  <span className="flex-1 text-sm">{addon.name}</span>
                  <span className="text-sm text-primary font-medium">
                    +R$ {Number(addon.price).toFixed(2).replace(".", ",")}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum adicional disponível.</p>
          )}
          <DialogFooter>
            <Button className="w-full" onClick={handleAddToCart}>
              Adicionar ao carrinho
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Menu;

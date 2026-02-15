import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { LogOut, Plus, Pencil, Trash2, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface Category { id: string; name: string; sort_order: number; }
interface Product { id: string; category_id: string; name: string; description: string; price: number; image_url: string; active: boolean; sort_order: number; }
interface AddonItem { id: string; name: string; price: number; active: boolean; }
interface Settings { id: string; store_name: string; store_address: string; is_open: boolean; delivery_time: string; delivery_fee: number; whatsapp_number: string; }

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading, isAdmin, signOut } = useAuth();
  const queryClient = useQueryClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [addons, setAddons] = useState<AddonItem[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  // Dialog states
  const [catDialog, setCatDialog] = useState<{ open: boolean; item?: Category }>({ open: false });
  const [prodDialog, setProdDialog] = useState<{ open: boolean; item?: Product }>({ open: false });
  const [addonDialog, setAddonDialog] = useState<{ open: boolean; item?: AddonItem }>({ open: false });
  const [catForm, setCatForm] = useState({ name: "", sort_order: 0 });
  const [prodForm, setProdForm] = useState({ name: "", description: "", price: 0, category_id: "", image_url: "", active: true, sort_order: 0 });
  const [addonForm, setAddonForm] = useState({ name: "", price: 0, active: true });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admin/login");
    }
  }, [loading, user, isAdmin, navigate]);

  useEffect(() => {
    if (user && isAdmin) loadAll();
  }, [user, isAdmin]);

  const loadAll = async () => {
    const [c, p, a, s] = await Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("products").select("*").order("sort_order"),
      supabase.from("addons").select("*").order("name"),
      supabase.from("store_settings").select("*").limit(1).single(),
    ]);
    if (c.data) setCategories(c.data as Category[]);
    if (p.data) setProducts(p.data as Product[]);
    if (a.data) setAddons(a.data as AddonItem[]);
    if (s.data) setSettings(s.data as Settings);
  };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["addons"] });
    queryClient.invalidateQueries({ queryKey: ["store-settings"] });
  };

  // ---- CATEGORIES ----
  const openCatDialog = (item?: Category) => {
    setCatForm(item ? { name: item.name, sort_order: item.sort_order } : { name: "", sort_order: 0 });
    setCatDialog({ open: true, item });
  };
  const saveCat = async () => {
    setSaving(true);
    if (catDialog.item) {
      await supabase.from("categories").update(catForm).eq("id", catDialog.item.id);
    } else {
      await supabase.from("categories").insert(catForm);
    }
    setCatDialog({ open: false });
    await loadAll(); invalidate(); setSaving(false);
    toast({ title: "Categoria salva!" });
  };
  const deleteCat = async (id: string) => {
    await supabase.from("categories").delete().eq("id", id);
    await loadAll(); invalidate();
    toast({ title: "Categoria excluída" });
  };

  // ---- PRODUCTS ----
  const openProdDialog = (item?: Product) => {
    setProdForm(item
      ? { name: item.name, description: item.description, price: Number(item.price), category_id: item.category_id, image_url: item.image_url, active: item.active, sort_order: item.sort_order }
      : { name: "", description: "", price: 0, category_id: categories[0]?.id || "", image_url: "", active: true, sort_order: 0 }
    );
    setImageFile(null);
    setProdDialog({ open: true, item });
  };
  const saveProd = async () => {
    setSaving(true);
    let imageUrl = prodForm.image_url;

    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("product-images").upload(path, imageFile);
      if (upErr) {
        toast({ title: "Erro no upload", description: upErr.message, variant: "destructive" });
        setSaving(false); return;
      }
      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }

    const payload = { ...prodForm, price: Number(prodForm.price), image_url: imageUrl };

    if (prodDialog.item) {
      await supabase.from("products").update(payload).eq("id", prodDialog.item.id);
    } else {
      await supabase.from("products").insert(payload);
    }
    setProdDialog({ open: false });
    await loadAll(); invalidate(); setSaving(false);
    toast({ title: "Produto salvo!" });
  };
  const deleteProd = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    await loadAll(); invalidate();
    toast({ title: "Produto excluído" });
  };

  // ---- ADDONS ----
  const openAddonDialog = (item?: AddonItem) => {
    setAddonForm(item ? { name: item.name, price: Number(item.price), active: item.active } : { name: "", price: 0, active: true });
    setAddonDialog({ open: true, item });
  };
  const saveAddon = async () => {
    setSaving(true);
    const payload = { ...addonForm, price: Number(addonForm.price) };
    if (addonDialog.item) {
      await supabase.from("addons").update(payload).eq("id", addonDialog.item.id);
    } else {
      await supabase.from("addons").insert(payload);
    }
    setAddonDialog({ open: false });
    await loadAll(); invalidate(); setSaving(false);
    toast({ title: "Adicional salvo!" });
  };
  const deleteAddon = async (id: string) => {
    await supabase.from("addons").delete().eq("id", id);
    await loadAll(); invalidate();
    toast({ title: "Adicional excluído" });
  };

  // ---- SETTINGS ----
  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    await supabase.from("store_settings").update({
      store_name: settings.store_name,
      store_address: settings.store_address,
      is_open: settings.is_open,
      delivery_time: settings.delivery_time,
      delivery_fee: Number(settings.delivery_fee),
      whatsapp_number: settings.whatsapp_number,
    }).eq("id", settings.id);
    invalidate(); setSaving(false);
    toast({ title: "Configurações salvas!" });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><span className="text-primary">Carregando...</span></div>;
  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 py-4 flex items-center justify-between sticky top-0 z-20">
        <h1 className="text-lg font-bold">Painel Admin</h1>
        <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => { signOut(); navigate("/admin/login"); }}>
          <LogOut className="w-4 h-4 mr-1" /> Sair
        </Button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        <Tabs defaultValue="products">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="addons">Adicionais</TabsTrigger>
            <TabsTrigger value="settings">Config</TabsTrigger>
          </TabsList>

          {/* PRODUCTS TAB */}
          <TabsContent value="products" className="space-y-3">
            <Button size="sm" onClick={() => openProdDialog()}>
              <Plus className="w-4 h-4 mr-1" /> Novo Produto
            </Button>
            {products.map((p) => (
              <div key={p.id} className="bg-card border border-border rounded-lg p-3 flex items-center gap-3">
                {p.image_url && <img src={p.image_url} className="w-12 h-12 rounded object-cover" alt="" />}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">R$ {Number(p.price).toFixed(2).replace(".", ",")}</p>
                </div>
                <button onClick={() => openProdDialog(p)} className="text-primary p-1"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => deleteProd(p.id)} className="text-destructive p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </TabsContent>

          {/* CATEGORIES TAB */}
          <TabsContent value="categories" className="space-y-3">
            <Button size="sm" onClick={() => openCatDialog()}>
              <Plus className="w-4 h-4 mr-1" /> Nova Categoria
            </Button>
            {categories.map((c) => (
              <div key={c.id} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between">
                <span className="font-semibold text-sm">{c.name}</span>
                <div className="flex gap-1">
                  <button onClick={() => openCatDialog(c)} className="text-primary p-1"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => deleteCat(c.id)} className="text-destructive p-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* ADDONS TAB */}
          <TabsContent value="addons" className="space-y-3">
            <Button size="sm" onClick={() => openAddonDialog()}>
              <Plus className="w-4 h-4 mr-1" /> Novo Adicional
            </Button>
            {addons.map((a) => (
              <div key={a.id} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-sm">{a.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">R$ {Number(a.price).toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openAddonDialog(a)} className="text-primary p-1"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => deleteAddon(a.id)} className="text-destructive p-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* SETTINGS TAB */}
          <TabsContent value="settings" className="space-y-4">
            {settings && (
              <>
                <div className="flex items-center justify-between bg-card border border-border rounded-lg p-4">
                  <div>
                    <p className="font-semibold text-sm">Loja {settings.is_open ? "Aberta" : "Fechada"}</p>
                    <p className="text-xs text-muted-foreground">Alternar status da loja</p>
                  </div>
                  <Switch checked={settings.is_open} onCheckedChange={(v) => setSettings({ ...settings, is_open: v })} />
                </div>
                <div className="space-y-2">
                  <Label>Nome da loja</Label>
                  <Input value={settings.store_name} onChange={(e) => setSettings({ ...settings, store_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Endereço</Label>
                  <Input value={settings.store_address} onChange={(e) => setSettings({ ...settings, store_address: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Tempo de entrega</Label>
                  <Input value={settings.delivery_time} onChange={(e) => setSettings({ ...settings, delivery_time: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Taxa de entrega (R$)</Label>
                  <Input type="number" step="0.01" value={settings.delivery_fee} onChange={(e) => setSettings({ ...settings, delivery_fee: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp (com DDD e país)</Label>
                  <Input value={settings.whatsapp_number} onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })} />
                </div>
                <Button onClick={saveSettings} disabled={saving} className="w-full">
                  <Save className="w-4 h-4 mr-1" /> Salvar Configurações
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Category dialog */}
      <Dialog open={catDialog.open} onOpenChange={(o) => setCatDialog({ open: o })}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{catDialog.item ? "Editar" : "Nova"} Categoria</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Nome</Label><Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} /></div>
            <div className="space-y-1"><Label>Ordem</Label><Input type="number" value={catForm.sort_order} onChange={(e) => setCatForm({ ...catForm, sort_order: Number(e.target.value) })} /></div>
          </div>
          <DialogFooter><Button onClick={saveCat} disabled={saving}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product dialog */}
      <Dialog open={prodDialog.open} onOpenChange={(o) => setProdDialog({ open: o })}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{prodDialog.item ? "Editar" : "Novo"} Produto</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Nome</Label><Input value={prodForm.name} onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })} /></div>
            <div className="space-y-1"><Label>Descrição</Label><Input value={prodForm.description} onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })} /></div>
            <div className="space-y-1"><Label>Preço (R$)</Label><Input type="number" step="0.01" value={prodForm.price} onChange={(e) => setProdForm({ ...prodForm, price: Number(e.target.value) })} /></div>
            <div className="space-y-1">
              <Label>Categoria</Label>
              <select className="w-full border border-input rounded-md px-3 py-2 bg-background text-sm" value={prodForm.category_id} onChange={(e) => setProdForm({ ...prodForm, category_id: e.target.value })}>
                <option value="">Selecione</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Imagem</Label>
              <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
              {prodForm.image_url && !imageFile && <img src={prodForm.image_url} className="w-20 h-20 rounded object-cover mt-1" alt="" />}
            </div>
            <div className="space-y-1"><Label>Ordem</Label><Input type="number" value={prodForm.sort_order} onChange={(e) => setProdForm({ ...prodForm, sort_order: Number(e.target.value) })} /></div>
            <div className="flex items-center gap-2">
              <Switch checked={prodForm.active} onCheckedChange={(v) => setProdForm({ ...prodForm, active: v })} />
              <Label>Ativo</Label>
            </div>
          </div>
          <DialogFooter><Button onClick={saveProd} disabled={saving}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Addon dialog */}
      <Dialog open={addonDialog.open} onOpenChange={(o) => setAddonDialog({ open: o })}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{addonDialog.item ? "Editar" : "Novo"} Adicional</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Nome</Label><Input value={addonForm.name} onChange={(e) => setAddonForm({ ...addonForm, name: e.target.value })} /></div>
            <div className="space-y-1"><Label>Preço (R$)</Label><Input type="number" step="0.01" value={addonForm.price} onChange={(e) => setAddonForm({ ...addonForm, price: Number(e.target.value) })} /></div>
            <div className="flex items-center gap-2">
              <Switch checked={addonForm.active} onCheckedChange={(v) => setAddonForm({ ...addonForm, active: v })} />
              <Label>Ativo</Label>
            </div>
          </div>
          <DialogFooter><Button onClick={saveAddon} disabled={saving}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;

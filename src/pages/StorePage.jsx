import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, Building2 } from "lucide-react";
import InventoryItem from "@/components/InventoryItem";
import AddInventoryDialog from "@/components/AddInventoryDialog";
import StoreStats from "@/components/StoreStats";
import { getStores, getInventoryByStore, addInventoryItem, updateInventoryItem, deleteInventoryItem } from "@/lib/data";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const StorePage = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [store, setStore] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const storesData = await getStores();
      const currentStore = storesData.find(s => s.id === storeId);
      
      if (!currentStore) {
        toast({
          title: "Error",
          description: "Store not found",
          variant: "destructive"
        });
        navigate("/");
        setLoading(false);
        return;
      }
      
      setStore(currentStore);
      
      const storeInventory = await getInventoryByStore(storeId);
      setInventory(storeInventory);
      setLoading(false);
    };
    fetchData();
  }, [storeId, navigate, toast]);

  const handleSaveItem = async (itemData) => {
    setLoading(true);
    let savedItem;
    if (editItem) {
      savedItem = await updateInventoryItem(editItem.id, itemData);
    } else {
      savedItem = await addInventoryItem({ ...itemData, store_id: storeId });
    }

    if (savedItem) {
      const storeInventory = await getInventoryByStore(storeId);
      setInventory(storeInventory);
      toast({
        title: "Success",
        description: `Item ${editItem ? 'updated' : 'added'} successfully`
      });
    } else {
      toast({
        title: "Error",
        description: `Failed to ${editItem ? 'update' : 'add'} item. Please try again.`,
        variant: "destructive"
      });
    }
    setEditItem(null);
    setDialogOpen(false);
    setLoading(false);
  };

  const handleEditItem = (item) => {
    setEditItem(item);
    setDialogOpen(true);
  };

  const handleDeleteItem = async (itemId) => {
    setLoading(true);
    const success = await deleteInventoryItem(itemId);
    if (success) {
      setInventory(prev => prev.filter(item => item.id !== itemId));
      toast({
        title: "Success",
        description: "Item deleted successfully"
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const filteredInventory = activeTab === "all" 
    ? inventory 
    : inventory.filter(item => item.category === activeTab);

  const categories = [...new Set(inventory.map(item => item.category))].sort();

  if (loading && !store) { // Show full page loader only if store is not yet loaded
    return (
      <div className="container py-8 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!store) return null; // Should be handled by redirect, but as a fallback

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button 
          variant="outline" 
          className="mb-6" 
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Stores
        </Button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center">
            <div className="mr-4 p-2 rounded-full bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{store.name}</h1>
              <p className="text-muted-foreground">{store.location}</p>
            </div>
          </div>
          <Button onClick={() => {
            setEditItem(null);
            setDialogOpen(true);
          }} disabled={loading}>
            {loading && editItem === null && !dialogOpen ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-foreground mr-2"></div> : <Plus className="mr-2 h-4 w-4" />}
             Add Inventory Item
          </Button>
        </div>

        <div className="mb-8">
          <StoreStats inventory={inventory} />
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All Items</TabsTrigger>
            {categories.map(category => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            {loading && inventory.length === 0 ? (
               <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="text-center py-12">
                <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">No items found</h2>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  {activeTab === "all" 
                    ? "Add your first inventory item to start tracking your stock."
                    : `No items found in the ${activeTab} category.`}
                </p>
                <Button onClick={() => {
                  setEditItem(null);
                  setDialogOpen(true);
                }} disabled={loading}>
                  <Plus className="mr-2 h-4 w-4" /> Add Inventory Item
                </Button>
              </div>
            ) : (
              <div className="inventory-grid">
                {filteredInventory.map((item) => (
                  <InventoryItem 
                    key={item.id} 
                    item={item} 
                    onEdit={() => handleEditItem(item)}
                    onDelete={() => handleDeleteItem(item.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      <AddInventoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveItem}
        storeId={storeId}
        editItem={editItem}
      />
    </div>
  );
};

export default StorePage;
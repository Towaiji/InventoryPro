import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Plus } from "lucide-react";
import InventoryItem from "@/components/InventoryItem";
import AddInventoryDialog from "@/components/AddInventoryDialog";
import { getAllInventory, getStores, addInventoryItem, updateInventoryItem, deleteInventoryItem } from "@/lib/data";
import { useToast } from "@/components/ui/use-toast";

const InventoryPage = () => {
  const { toast } = useToast();
  const [inventory, setInventory] = useState([]);
  const [stores, setStores] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [selectedStore, setSelectedStore] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [invData, storesData] = await Promise.all([
        getAllInventory(),
        getStores()
      ]);
      setInventory(invData);
      setStores(storesData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSaveItem = async (itemData) => {
    setLoading(true);
    let savedItem;
    if (editItem) {
      savedItem = await updateInventoryItem(editItem.id, itemData);
    } else {
      savedItem = await addInventoryItem(itemData);
    }

    if (savedItem) {
      const invData = await getAllInventory();
      setInventory(invData);
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

  const filteredInventory = inventory
    .filter(item => selectedStore === "all" || item.store_id === selectedStore)
    .filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (loading && stores.length === 0 && inventory.length === 0) {
     return (
      <div className="container py-8 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Inventory</h1>
          <p className="text-muted-foreground mt-1">
            View and manage inventory across all your stores
          </p>
        </div>
        <Button 
          onClick={() => {
            if (stores.length === 0) {
              toast({
                title: "No Stores Available",
                description: "Please add a store first before adding inventory items.",
                variant: "destructive"
              });
              return;
            }
            setEditItem(null);
            setDialogOpen(true);
          }} 
          disabled={loading || stores.length === 0}
        >
          {loading && editItem === null && !dialogOpen && stores.length > 0 ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-foreground mr-2"></div> : <Plus className="mr-2 h-4 w-4" />}
          Add Inventory Item
        </Button>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, SKU, or category..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={selectedStore} onValueChange={setSelectedStore} disabled={loading || stores.length === 0}>
            <SelectTrigger>
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by store" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stores</SelectItem>
              {stores.map(store => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {loading && inventory.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredInventory.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No items found</h2>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            {inventory.length === 0 
              ? "Add your first inventory item to start tracking your stock."
              : "No items match your current filters."}
          </p>
          {inventory.length === 0 && stores.length > 0 && (
            <Button onClick={() => {
              setEditItem(null);
              setDialogOpen(true);
            }} disabled={loading}>
              <Plus className="mr-2 h-4 w-4" /> Add Inventory Item
            </Button>
          )}
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

      {dialogOpen && (
        <AddInventoryDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={handleSaveItem}
          storeId={editItem ? editItem.store_id : (stores.length > 0 ? stores[0].id : "")}
          editItem={editItem}
        />
      )}
    </div>
  );
};

export default InventoryPage;
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import StoreCard from "@/components/StoreCard";
import AddStoreDialog from "@/components/AddStoreDialog";
import { getStores, addStore } from "@/lib/data";
import { useToast } from "@/components/ui/use-toast";

const HomePage = () => {
  const [stores, setStores] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      const fetchedStores = await getStores();
      setStores(fetchedStores);
      setLoading(false);
    };
    fetchStores();
  }, []);

  const handleAddStore = async (newStoreData) => {
    const addedStore = await addStore(newStoreData);
    if (addedStore) {
      setStores((prevStores) => [addedStore, ...prevStores]);
      toast({
        title: "Success",
        description: "Store added successfully"
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to add store. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
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
          <h1 className="text-3xl font-bold tracking-tight">Your Stores</h1>
          <p className="text-muted-foreground mt-1">
            Manage inventory across all your store locations
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Store
        </Button>
      </motion.div>

      {stores.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center py-12"
        >
          <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Plus className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No stores yet</h2>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Add your first store to start managing your inventory across multiple locations.
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Your First Store
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      )}

      <AddStoreDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleAddStore}
      />
    </div>
  );
};

export default HomePage;
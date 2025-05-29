import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { getCategories } from "@/lib/data"; 

const AddInventoryDialog = ({ open, onOpenChange, onSave, storeId, editItem = null }) => {
  const { toast } = useToast();
  const [item, setItem] = useState({
    name: "",
    category: "",
    quantity: "",
    price: "",
    sku: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [existingCategories, setExistingCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);


  useEffect(() => {
    const fetchCategoriesData = async () => {
      setLoadingCategories(true);
      const fetchedCategories = await getCategories();
      setExistingCategories(fetchedCategories);
      setLoadingCategories(false);
    };
    if(open) {
      fetchCategoriesData();
    }
  }, [open]);

  useEffect(() => {
    if (editItem) {
      setItem({
        id: editItem.id,
        name: editItem.name,
        category: editItem.category || "", 
        quantity: editItem.quantity.toString(),
        price: editItem.price.toString(),
        sku: editItem.sku,
        store_id: editItem.store_id,
        category_id: editItem.category_id, 
        last_updated: editItem.last_updated,
        categories: editItem.categories 
      });
    } else {
      setItem({
        name: "",
        category: "",
        quantity: "",
        price: "",
        sku: "",
        store_id: storeId
      });
    }
  }, [editItem, storeId, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    if (!item.name || !item.category || !item.quantity || !item.price || !item.sku) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive"
      });
      setIsSaving(false);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    
    const itemPayload = {
      ...item,
      quantity: Number(item.quantity),
      price: Number(item.price),
      last_updated: today,
      store_id: item.store_id || storeId, 
    };
    
    if (!editItem) {
      delete itemPayload.id; 
    }


    try {
      await onSave(itemPayload);
      if (!editItem) {
        setItem({
          name: "",
          category: "",
          quantity: "",
          price: "",
          sku: "",
          store_id: storeId
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save item:", error);
      toast({
        title: "Save Error",
        description: "Failed to save item. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        setItem({ name: "", category: "", quantity: "", price: "", sku: "", store_id: storeId });
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editItem ? "Edit Inventory Item" : "Add Inventory Item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={item.name}
                onChange={handleChange}
                className="col-span-3"
                required
                disabled={isSaving}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Input
                id="category"
                name="category"
                value={item.category}
                onChange={handleChange}
                className="col-span-3"
                placeholder="e.g., Electronics, Books"
                list="category-suggestions"
                required
                disabled={isSaving}
              />
              {!loadingCategories && existingCategories.length > 0 && (
                <datalist id="category-suggestions">
                  {existingCategories.map((catName) => (
                    <option key={catName} value={catName} />
                  ))}
                </datalist>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                value={item.quantity}
                onChange={handleChange}
                className="col-span-3"
                required
                disabled={isSaving}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price ($)
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={item.price}
                onChange={handleChange}
                className="col-span-3"
                required
                disabled={isSaving}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sku" className="text-right">
                SKU
              </Label>
              <Input
                id="sku"
                name="sku"
                value={item.sku}
                onChange={handleChange}
                className="col-span-3"
                required
                disabled={isSaving}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-foreground mr-2"></div> : null}
              {editItem ? "Update Item" : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddInventoryDialog;
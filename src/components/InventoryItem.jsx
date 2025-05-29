
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

const InventoryItem = ({ item, onEdit, onDelete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="h-full border-none shadow-md hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold">{item.name}</CardTitle>
          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary">
            {item.category}
          </span>
        </CardHeader>
        <CardContent className="space-y-2 pb-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">SKU:</span>
            <span className="text-sm font-medium">{item.sku}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Quantity:</span>
            <span className="text-sm font-medium">{item.quantity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Price:</span>
            <span className="text-sm font-medium">${item.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Last Updated:</span>
            <span className="text-sm font-medium">{item.lastUpdated}</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(item.id)}>
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default InventoryItem;

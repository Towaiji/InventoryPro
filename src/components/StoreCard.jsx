
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, User, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StoreCard = ({ store }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Card className="store-card overflow-hidden border-none shadow-lg">
        <div className="h-32 overflow-hidden">
          <img  
            className="w-full h-full object-cover" 
            alt={`${store.name} storefront`}
           src="https://images.unsplash.com/photo-1637666495020-0740caec198a" />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold">{store.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pb-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4" />
            <span>{store.location}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="mr-2 h-4 w-4" />
            <span>{store.manager}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Phone className="mr-2 h-4 w-4" />
            <span>{store.contact}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={() => navigate(`/store/${store.id}`)}
          >
            <Building2 className="mr-2 h-4 w-4" /> Manage Inventory
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default StoreCard;

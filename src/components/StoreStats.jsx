
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, BarChart3, ShoppingCart } from "lucide-react";

const StoreStats = ({ inventory }) => {
  // Calculate statistics
  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const uniqueItems = inventory.length;
  const lowStock = inventory.filter(item => item.quantity < 5).length;

  const stats = [
    {
      title: "Total Items",
      value: totalItems,
      icon: <Package className="h-6 w-6" />,
      color: "bg-blue-500"
    },
    {
      title: "Total Value",
      value: `$${totalValue.toFixed(2)}`,
      icon: <DollarSign className="h-6 w-6" />,
      color: "bg-green-500"
    },
    {
      title: "Unique Products",
      value: uniqueItems,
      icon: <BarChart3 className="h-6 w-6" />,
      color: "bg-purple-500"
    },
    {
      title: "Low Stock Items",
      value: lowStock,
      icon: <ShoppingCart className="h-6 w-6" />,
      color: "bg-red-500"
    }
  ];

  return (
    <div className="dashboard-stats">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="stat-card h-full border-none shadow-md">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`${stat.color} p-2 rounded-full text-white`}>
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default StoreStats;

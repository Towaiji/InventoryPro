import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getAllInventory, getStores } from "@/lib/data";
import { Package, DollarSign, TrendingUp, AlertTriangle, BarChart3, PieChart, Building2 } from "lucide-react";

const DashboardPage = () => {
  const [inventory, setInventory] = useState([]);
  const [stores, setStores] = useState([]);
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

  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const uniqueCategories = [...new Set(inventory.map(item => item.category))];
  const lowStockItems = inventory.filter(item => item.quantity < 5);

  const storeStats = stores.map(store => {
    const storeInventory = inventory.filter(item => item.store_id === store.id);
    const storeTotalItems = storeInventory.reduce((sum, item) => sum + item.quantity, 0);
    const storeTotalValue = storeInventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return {
      id: store.id,
      name: store.name,
      totalItems: storeTotalItems,
      totalValue: storeTotalValue,
      uniqueProducts: storeInventory.length
    };
  });

  const categoryStats = uniqueCategories.map(category => {
    const categoryItems = inventory.filter(item => item.category === category);
    const categoryTotalItems = categoryItems.reduce((sum, item) => sum + item.quantity, 0);
    const categoryTotalValue = categoryItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return {
      category,
      totalItems: categoryTotalItems,
      totalValue: categoryTotalValue,
      percentage: totalItems > 0 ? Math.round((categoryTotalItems / totalItems) * 100) : 0
    };
  }).sort((a, b) => b.totalItems - a.totalItems);

  const globalStats = [
    {
      title: "Total Inventory",
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
      title: "Categories",
      value: uniqueCategories.length,
      icon: <PieChart className="h-6 w-6" />,
      color: "bg-purple-500"
    },
    {
      title: "Low Stock Items",
      value: lowStockItems.length,
      icon: <AlertTriangle className="h-6 w-6" />,
      color: "bg-red-500"
    }
  ];

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
      >
        <h1 className="text-3xl font-bold tracking-tight mb-8">Dashboard</h1>

        <div className="dashboard-stats mb-8">
          {globalStats.map((stat, index) => (
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

        <Tabs defaultValue="stores" className="mb-8">
          <TabsList>
            <TabsTrigger value="stores">Stores</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="lowStock">Low Stock</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stores" className="mt-6">
            {stores.length === 0 ? (
              <Card className="border-none shadow-md">
                <CardContent className="pt-6 text-center">
                   <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Stores Found</h3>
                  <p className="text-muted-foreground">
                    Add a store to see its statistics here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {storeStats.map((store, index) => (
                  <motion.div
                    key={store.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="border-none shadow-md">
                      <CardHeader>
                        <CardTitle>{store.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center space-x-2">
                            <Package className="h-5 w-5 text-blue-500" />
                            <div>
                              <p className="text-sm text-muted-foreground">Total Items</p>
                              <p className="text-xl font-bold">{store.totalItems}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-5 w-5 text-green-500" />
                            <div>
                              <p className="text-sm text-muted-foreground">Total Value</p>
                              <p className="text-xl font-bold">${store.totalValue.toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <BarChart3 className="h-5 w-5 text-purple-500" />
                            <div>
                              <p className="text-sm text-muted-foreground">Unique Products</p>
                              <p className="text-xl font-bold">{store.uniqueProducts}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="categories" className="mt-6">
            {categoryStats.length === 0 ? (
               <Card className="border-none shadow-md">
                <CardContent className="pt-6 text-center">
                   <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Categories Found</h3>
                  <p className="text-muted-foreground">
                    Add inventory items with categories to see statistics here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {categoryStats.map((category, index) => (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="border-none shadow-md">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex justify-between items-center">
                          <span>{category.category}</span>
                          <span className="text-sm font-normal bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {category.percentage}%
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="w-full bg-secondary h-2 rounded-full mb-4">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${category.percentage}%` }}
                          ></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <Package className="h-5 w-5 text-blue-500" />
                            <div>
                              <p className="text-sm text-muted-foreground">Total Items</p>
                              <p className="text-xl font-bold">{category.totalItems}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-5 w-5 text-green-500" />
                            <div>
                              <p className="text-sm text-muted-foreground">Total Value</p>
                              <p className="text-xl font-bold">${category.totalValue.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="lowStock" className="mt-6">
            {lowStockItems.length === 0 ? (
              <Card className="border-none shadow-md">
                <CardContent className="pt-6 text-center">
                  <div className="rounded-full bg-green-100 p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">All stocked up!</h3>
                  <p className="text-muted-foreground">
                    You don't have any items that are running low on stock.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {lowStockItems.map((item, index) => {
                  const store = stores.find(s => s.id === item.store_id);
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="border-none shadow-md">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex justify-between items-center">
                            <span>{item.name}</span>
                            <span className="text-sm font-normal bg-red-100 text-red-600 px-2 py-1 rounded-full">
                              {item.quantity} left
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center space-x-2">
                              <Package className="h-5 w-5 text-blue-500" />
                              <div>
                                <p className="text-sm text-muted-foreground">SKU</p>
                                <p className="text-lg font-medium">{item.sku}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <BarChart3 className="h-5 w-5 text-purple-500" />
                              <div>
                                <p className="text-sm text-muted-foreground">Category</p>
                                <p className="text-lg font-medium">{item.category}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Building2 className="h-5 w-5 text-green-500" />
                              <div>
                                <p className="text-sm text-muted-foreground">Store</p>
                                <p className="text-lg font-medium">{store?.name || "Unknown"}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
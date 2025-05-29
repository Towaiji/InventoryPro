import React from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Package, BarChart2, LogIn, UserPlus, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();

  const navItems = [
    { path: "/", label: "Home", icon: <Home className="h-4 w-4 mr-2" />, authRequired: true },
    { path: "/inventory", label: "Inventory", icon: <Package className="h-4 w-4 mr-2" />, authRequired: true },
    { path: "/dashboard", label: "Dashboard", icon: <BarChart2 className="h-4 w-4 mr-2" />, authRequired: true },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({ title: "Signed Out", description: "You have been successfully signed out." });
      navigate('/login');
    } catch (error) {
      toast({ title: "Sign Out Error", description: error.message, variant: "destructive" });
    }
  };
  
  const displayedNavItems = user ? navItems.filter(item => item.authRequired) : [];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2 mr-6">
            <Package className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">InventoryPro</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {displayedNavItems.map((item) => (
              <Button
                key={item.path}
                asChild
                variant={location.pathname === item.path ? "default" : "ghost"}
                className="text-sm font-medium transition-colors"
              >
                <Link to={item.path}>
                  {item.icon}
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center space-x-2">
          {loading ? (
             <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
          ) : user ? (
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          ) : (
            <>
              <Button asChild variant={location.pathname === "/login" ? "default" : "ghost"}>
                <Link to="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
              <Button asChild variant={location.pathname === "/signup" ? "default" : "secondary"}>
                <Link to="/signup">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
       <nav className="md:hidden flex items-center justify-around space-x-1 p-2 border-t bg-background/95">
            {displayedNavItems.map((item) => (
              <Button
                key={item.path + "-mobile"}
                asChild
                variant={location.pathname === item.path ? "secondary" : "ghost"}
                size="sm"
                className="flex-1 text-xs"
              >
                <Link to={item.path} className="flex flex-col items-center h-auto py-1">
                  {React.cloneElement(item.icon, {className: "h-4 w-4 mb-0.5"})}
                  {item.label}
                </Link>
              </Button>
            ))}
      </nav>
    </motion.header>
  );
};

export default Navbar;
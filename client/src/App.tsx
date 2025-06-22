import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Menu from "@/pages/menu";
import FoodDetail from "@/pages/food-detail";
import Profile from "@/pages/profile";
import About from "@/pages/about";
import Help from "@/pages/help";
import Checkout from "@/pages/checkout";
import AdminDashboard from "@/pages/admin/dashboard";
import DriverDashboard from "@/pages/driver/dashboard";
import RestaurantDashboard from "@/pages/restaurant/dashboard";
import DriverLogin from "@/pages/driver/login";
import RestaurantLogin from "@/pages/restaurant/login";
import CustomerLogin from "@/pages/customer/login";
import CustomerSignIn from "@/pages/customer/signin";
import DriverSignIn from "@/pages/driver/signin";
import DriverRegister from "@/pages/driver/register";
import RestaurantSignIn from "@/pages/restaurant/signin";
import RestaurantRegister from "@/pages/restaurant/register";
import CustomerDashboard from "@/pages/customer/dashboard";
import RoleSelector from "@/components/role-selector";
import Header from "@/components/header";
import Footer from "@/components/footer";
import CartSidebar from "@/components/cart-sidebar";
import MobileNav from "@/components/mobile-nav";
import { CartProvider } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/menu" component={Menu} />
      <Route path="/menu/:category" component={Menu} />
      <Route path="/food/:id" component={FoodDetail} />
      <Route path="/profile" component={Profile} />
      <Route path="/about" component={About} />
      <Route path="/help" component={Help} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/select-role" component={RoleSelector} />
      
      {/* Admin Routes */}
      <Route path="/admin" component={AdminDashboard} />
      
      {/* Customer Routes */}
      <Route path="/customer/login" component={CustomerLogin} />
      <Route path="/customer/signin" component={CustomerSignIn} />
      <Route path="/customer" component={() => {
        if (!isAuthenticated) {
          window.location.href = '/customer/login';
          return null;
        }
        if (user?.role !== 'customer') {
          window.location.href = '/';
          return null;
        }
        return <CustomerDashboard />;
      }} />
      
      {/* Driver Routes */}
      <Route path="/driver/login" component={DriverSignIn} />
      <Route path="/driver/signin" component={DriverRegister} />
      <Route path="/driver/register" component={DriverRegister} />
      <Route path="/driver/dashboard" component={DriverDashboard} />
      <Route path="/driver" component={DriverDashboard} />
      
      {/* Restaurant Routes */}
      <Route path="/restaurant/login" component={RestaurantSignIn} />
      <Route path="/restaurant/signin" component={RestaurantRegister} />
      <Route path="/restaurant/register" component={RestaurantRegister} />
      <Route path="/restaurant/dashboard" component={RestaurantDashboard} />
      <Route path="/restaurant" component={() => {
        // Redirect to dashboard if authenticated
        if (isAuthenticated && user?.role === 'restaurant') {
          window.location.href = '/restaurant/dashboard';
          return null;
        }
        // Redirect to login if not authenticated
        window.location.href = '/restaurant/login';
        return null;
      }} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Check if current page should show header/footer
  const shouldShowNavigation = () => {
    const currentPath = window.location.pathname;
    
    // Hide navigation for landing page, select-role page, login pages, and ALL dashboard pages
    const noNavPaths = ['/', '/select-role', '/customer/login', '/driver/login', '/restaurant/login', '/customer', '/driver', '/restaurant', '/admin'];
    if (noNavPaths.some(path => currentPath.startsWith(path))) return false;
    
    return true;
  };

  const showNav = shouldShowNavigation();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <div className={`min-h-screen bg-gray-50 flex flex-col ${showNav ? 'pb-20 md:pb-0' : ''}`}>
            {showNav && <Header onCartToggle={() => setIsCartOpen(!isCartOpen)} />}
            <main className="flex-1">
              <Router />
            </main>
            {showNav && <Footer />}
            {showNav && <MobileNav onCartToggle={() => setIsCartOpen(!isCartOpen)} />}
            {showNav && <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />}
          </div>
          <Toaster />
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

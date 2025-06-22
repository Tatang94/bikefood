import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Home,
  ShoppingBag,
  UtensilsCrossed,
  User,
  DollarSign,
  Clock,
  Package,
  TrendingUp,
  Star,
  Bell,
  Plus,
  Edit,
  Eye,
  Phone,
  Mail,
  MapPin,
  Store,
  CreditCard,
  Wallet,
  LogOut,
  Filter,
  AlertCircle,
  CheckCircle
} from "lucide-react";

export default function RestaurantDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Redirect if not authenticated or wrong role
  useEffect(() => {
    if (!user) return;
    
    if (user.role !== 'restaurant') {
      toast({
        title: "Akses Ditolak",
        description: "Halaman ini khusus untuk restoran",
        variant: "destructive",
      });
      window.location.href = '/restaurant/login';
    }
  }, [user, toast]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat dashboard restaurant...</p>
        </div>
      </div>
    );
  }

  // Fetch restaurant data
  const { data: restaurantData } = useQuery({
    queryKey: ["/api/restaurants/profile", user?.id],
    queryFn: () => fetch(`/api/restaurants/profile?userId=${user?.id}`).then(res => res.json()),
    enabled: !!user?.id
  });

  // Fetch orders data
  const { data: ordersData = [] } = useQuery({
    queryKey: ["/api/orders/restaurant", restaurantData?.id],
    queryFn: () => fetch(`/api/orders/restaurant?restaurantId=${restaurantData?.id}`).then(res => res.json()),
    enabled: !!restaurantData?.id
  });

  // Fetch menu items
  const { data: menuData = [] } = useQuery({
    queryKey: ["/api/food-items/restaurant", restaurantData?.id],
    queryFn: () => fetch(`/api/food-items/restaurant/${restaurantData?.id}`).then(res => res.json()),
    enabled: !!restaurantData?.id
  });



  // Calculate real dashboard stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayOrders = ordersData.filter(order => 
    new Date(order.createdAt) >= today
  );
  
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  
  const orderStats = {
    pending: ordersData.filter(o => o.status === 'pending').length,
    preparing: ordersData.filter(o => o.status === 'preparing').length,
    ready: ordersData.filter(o => o.status === 'ready').length,
    delivered: ordersData.filter(o => o.status === 'delivered').length
  };

  const totalRevenue = ordersData.reduce((sum, order) => sum + order.totalAmount, 0);
  const avgOrderValue = ordersData.length > 0 ? totalRevenue / ordersData.length : 0;

  // Format recent orders from real data
  const recentOrders = ordersData
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
    .map(order => ({
      id: order.id,
      orderId: `#ORD${order.id.toString().padStart(3, '0')}`,
      total: order.totalAmount,
      status: order.status,
      time: new Date(order.createdAt).toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      items: order.items?.map(item => `${item.quantity}x ${item.name}`).join(', ') || 'N/A',
      customerAddress: order.deliveryAddress || 'Alamat tidak tersedia'
    }));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'preparing': return 'Diproses';
      case 'ready': return 'Siap';
      default: return status;
    }
  };

  const renderOverviewContent = () => (
    <div className="space-y-4">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-orange-700 uppercase tracking-wide">PENDAPATAN HARI INI</p>
                <p className="text-xl font-bold text-orange-800 mt-1">{formatCurrency(todayRevenue)}</p>
                <p className="text-xs text-orange-600 mt-1">{todayOrders.length} pesanan</p>
              </div>
              <div className="bg-orange-500 p-2.5 rounded-xl">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-amber-700 uppercase tracking-wide">TOTAL PESANAN</p>
                <p className="text-xl font-bold text-amber-800 mt-1">{ordersData.length}</p>
                <p className="text-xs text-amber-600 mt-1">Semua waktu</p>
              </div>
              <div className="bg-amber-500 p-2.5 rounded-xl">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-yellow-700 uppercase tracking-wide">RATING RESTORAN</p>
                <div className="flex items-center mt-1">
                  <p className="text-xl font-bold text-yellow-800">{restaurantData?.rating || 5.0}</p>
                  <Star className="w-4 h-4 text-yellow-500 ml-1 fill-current" />
                </div>
                <p className="text-xs text-yellow-600 mt-1">{restaurantData?.totalOrders || 0} ulasan</p>
              </div>
              <div className="bg-yellow-500 p-2.5 rounded-xl">
                <Star className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-orange-700 uppercase tracking-wide">RATA-RATA ORDER</p>
                <p className="text-xl font-bold text-orange-800 mt-1">{formatCurrency(avgOrderValue)}</p>
                <p className="text-xs text-orange-600 mt-1">Per pesanan</p>
              </div>
              <div className="bg-orange-500 p-2.5 rounded-xl">
                <Clock className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Keuangan Card */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-orange-300 to-amber-300 border border-orange-200">
        <CardContent className="p-4">
          <div className="text-center text-white">
            <p className="text-sm font-medium opacity-90 uppercase tracking-wide">TOTAL PENDAPATAN</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs opacity-80 mt-1">Saldo dapat dicairkan</p>
            <div className="flex items-center justify-center mt-2">
              <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
              <span className="text-xs font-medium">Aktif</span>
            </div>
          </div>
          <Button className="w-full mt-4 bg-white text-orange-600 hover:bg-orange-50 font-semibold">
            <CreditCard className="w-4 h-4 mr-2" />
            Tarik Saldo
          </Button>
        </CardContent>
      </Card>

      {/* Status Pesanan */}
      <Card className="border-0 shadow-sm bg-white/95 backdrop-blur-sm border border-orange-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center text-gray-700">
            <Package className="w-4 h-4 mr-2 text-orange-600" />
            Status Pesanan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-orange-50 border border-orange-100 rounded-lg">
              <p className="text-xl font-bold text-orange-600">{orderStats.pending}</p>
              <p className="text-xs text-orange-700 font-medium">Menunggu</p>
            </div>
            <div className="text-center p-3 bg-amber-50 border border-amber-100 rounded-lg">
              <p className="text-xl font-bold text-amber-600">{orderStats.preparing}</p>
              <p className="text-xs text-amber-700 font-medium">Diproses</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
              <p className="text-xl font-bold text-yellow-600">{orderStats.ready}</p>
              <p className="text-xs text-yellow-700 font-medium">Siap</p>
            </div>
            <div className="text-center p-3 bg-green-50 border border-green-100 rounded-lg">
              <p className="text-xl font-bold text-green-600">{orderStats.delivered}</p>
              <p className="text-xs text-green-700 font-medium">Selesai</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderOrdersContent = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Pesanan Terbaru</h2>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>
      
      {recentOrders.length === 0 ? (
        <Card className="border-0 shadow-sm border border-orange-100">
          <CardContent className="p-8 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Belum ada pesanan</p>
            <p className="text-sm text-gray-500">Pesanan akan muncul di sini ketika pelanggan memesan</p>
          </CardContent>
        </Card>
      ) : (
        recentOrders.map((order) => (
          <Card key={order.id} className="border-0 shadow-sm border border-orange-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{order.orderId}</p>
                  <p className="text-sm text-gray-600">{order.customerAddress}</p>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {getStatusText(order.status)}
                </Badge>
              </div>
              <p className="text-sm text-gray-700 mb-2 line-clamp-2">{order.items}</p>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-orange-600">{formatCurrency(order.total)}</span>
                <span className="text-sm text-gray-500">{order.time}</span>
              </div>
              {(order.status === 'pending' || order.status === 'preparing') && (
                <div className="mt-3 flex gap-2">
                  {order.status === 'pending' && (
                    <Button size="sm" className="flex-1 bg-orange-500 hover:bg-orange-600">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Terima
                    </Button>
                  )}
                  {order.status === 'preparing' && (
                    <Button size="sm" className="flex-1 bg-green-500 hover:bg-green-600">
                      <Package className="w-4 h-4 mr-2" />
                      Siap
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderMenuContent = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">Menu Makanan</h2>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Menu
        </Button>
      </div>
      
      {menuData.length === 0 ? (
        <Card className="border-0 shadow-sm border border-orange-100">
          <CardContent className="p-8 text-center">
            <UtensilsCrossed className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Belum ada menu makanan</p>
            <p className="text-sm text-gray-500">Tambah menu pertama Anda untuk mulai menerima pesanan</p>
            <Button className="mt-4 bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Menu Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        menuData.map((item) => (
          <Card key={item.id} className="border-0 shadow-sm border border-orange-100">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <UtensilsCrossed className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <p className="text-lg font-bold text-orange-600">{formatCurrency(item.price)}</p>
                </div>
                <div className="text-right">
                  <Badge 
                    className={`mb-2 ${item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                  >
                    {item.isAvailable ? 'Tersedia' : 'Habis'}
                  </Badge>
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm" className="border-orange-200 text-orange-600">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="border-orange-200 text-orange-600">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderProfileContent = () => (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Store className="w-5 h-5 mr-2 text-blue-600" />
            Informasi Restoran
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-orange-100 text-orange-600 text-xl">
                {currentUser.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-semibold">{currentUser.name}</h3>
              <p className="text-gray-600">{currentUser.email}</p>
              <div className="flex items-center mt-1">
                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-sm">{dashboardData.performance.rating} ({dashboardData.performance.reviews} ulasan)</span>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <span>+62 812-3456-7890</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <span>{currentUser.email}</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span>Jl. Sudirman No. 123, Jakarta Pusat</span>
            </div>
          </div>
          
          <Button variant="outline" className="w-full">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profil
          </Button>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <Button 
            variant="outline" 
            className="w-full text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => {
              if (logout) logout();
              window.location.href = '/restaurant/login';
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Keluar
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const TabButton = ({ id, icon: Icon, label, isActive, onClick, badge }: {
    id: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    isActive: boolean;
    onClick: (id: string) => void;
    badge?: number;
  }) => (
    <button
      onClick={() => onClick(id)}
      className={`relative flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-orange-50 text-orange-600 border border-orange-200' 
          : 'text-gray-500 hover:text-gray-700 hover:bg-orange-50'
      }`}
    >
      <div className="relative">
        <Icon className="w-5 h-5 mb-1" />
        {badge && badge > 0 && (
          <span className="absolute -top-2 -right-2 w-4 h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-orange-200 px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Dashboard Mitra</h1>
            <p className="text-sm text-orange-600 font-medium">{restaurantData?.name || user?.name}</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="p-2 relative hover:bg-orange-50">
              <Bell className="w-5 h-5 text-gray-600" />
              {orderStats.pending > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                  {orderStats.pending}
                </span>
              )}
            </Button>
            <Avatar className="w-8 h-8 border-2 border-orange-200">
              <AvatarFallback className="bg-orange-100 text-orange-600 font-semibold">
                {(restaurantData?.name || user?.name || 'R').charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 pb-24">
        {activeTab === "overview" && renderOverviewContent()}
        {activeTab === "orders" && renderOrdersContent()}
        {activeTab === "menu" && renderMenuContent()}
        {activeTab === "profile" && renderProfileContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-orange-200 px-4 py-2 z-20 shadow-lg">
        <div className="grid grid-cols-4 gap-1">
          <TabButton 
            id="overview" 
            icon={Home} 
            label="Beranda" 
            isActive={activeTab === "overview"}
            onClick={setActiveTab}
          />
          <TabButton 
            id="orders" 
            icon={ShoppingBag} 
            label="Pesanan" 
            isActive={activeTab === "orders"}
            onClick={setActiveTab}
            badge={orderStats.pending + orderStats.preparing}
          />
          <TabButton 
            id="menu" 
            icon={UtensilsCrossed} 
            label="Menu" 
            isActive={activeTab === "menu"}
            onClick={setActiveTab}
          />
          <TabButton 
            id="profile" 
            icon={User} 
            label="Profil" 
            isActive={activeTab === "profile"}
            onClick={setActiveTab}
          />
        </div>
      </div>
    </div>
  );
}
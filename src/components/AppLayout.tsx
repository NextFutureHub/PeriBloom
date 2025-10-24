import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Bot,
  BookHeart,
  GraduationCap,
  MessageSquare,
  Thermometer,
  Settings,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppData } from '@/hooks/use-app-data';
import { Skeleton } from '@/components/ui/skeleton';
import { LanguageSwitcher } from '@/components/language-switcher';

const navItems = [
  { href: '/app/dashboard', icon: LayoutDashboard, label: 'Дашборд' },
  { href: '/app/ai-health', icon: Bot, label: 'AI Медпомощник' },
  { href: '/app/symptom-journal', icon: BookHeart, label: 'Журнал симптомов' },
  { href: '/app/education', icon: GraduationCap, label: 'Обучение' },
  { href: '/app/contacts', icon: MessageSquare, label: 'Контакты' },
  { href: '/app/iot-monitor', icon: Thermometer, label: 'IoT Монитор' },
];

export default function AppLayout() {
  const { userData, resetAllData, isInitialized } = useAppData();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isInitialized && !userData) {
      navigate('/');
    }
  }, [isInitialized, userData, navigate]);

  const handleLogout = () => {
    resetAllData();
    navigate('/');
  };

  if (!isInitialized || !userData) {
    return (
      <div className="flex h-screen w-full">
        <Skeleton className="hidden md:block h-full w-64" />
        <div className="flex-1 p-4">
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b border-slate-200/50 bg-gradient-to-r from-slate-50/95 to-white/95 backdrop-blur-xl">
          <div className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="size-5 text-white" />
            </div>
            <h2 className="text-xl font-headline font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent group-data-[collapsible=icon]:hidden">
              PeriBloom
            </h2>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu className="space-y-1">
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link to={item.href}>
                  <SidebarMenuButton
                    isActive={location.pathname === item.href}
                    tooltip={{ children: item.label, side: 'right' }}
                    className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-slate-100/95 hover:to-gray-100/95 hover:shadow-lg data-[active=true]:bg-gradient-to-r data-[active=true]:from-indigo-100/95 data-[active=true]:to-purple-100/95 data-[active=true]:shadow-lg data-[active=true]:border data-[active=true]:border-indigo-200/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-gradient-to-r group-hover:from-indigo-500 group-hover:to-purple-500 group-data-[active=true]:bg-gradient-to-r group-data-[active=true]:from-indigo-500 group-data-[active=true]:to-purple-500 flex items-center justify-center transition-all duration-300">
                        <item.icon className="w-4 h-4 text-slate-600 group-hover:text-white group-data-[active=true]:text-white transition-colors duration-300" />
                      </div>
                      <span className="font-medium text-slate-700 group-hover:text-slate-800 group-data-[active=true]:text-indigo-700 transition-colors duration-300">{item.label}</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t border-slate-200/50 bg-gradient-to-r from-slate-50/95 to-white/95 backdrop-blur-xl">
          <SidebarMenu className="p-2 space-y-1">
            <SidebarMenuItem>
              <Link to="/app/settings">
                <SidebarMenuButton 
                  isActive={location.pathname === '/app/settings'}
                  tooltip={{ children: 'Настройки', side: 'right' }}
                  className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-slate-100/95 hover:to-gray-100/95 hover:shadow-lg data-[active=true]:bg-gradient-to-r data-[active=true]:from-indigo-100/95 data-[active=true]:to-purple-100/95 data-[active=true]:shadow-lg data-[active=true]:border data-[active=true]:border-indigo-200/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-gradient-to-r group-hover:from-indigo-500 group-hover:to-purple-500 group-data-[active=true]:bg-gradient-to-r group-data-[active=true]:from-indigo-500 group-data-[active=true]:to-purple-500 flex items-center justify-center transition-all duration-300">
                      <Settings className="w-4 h-4 text-slate-600 group-hover:text-white group-data-[active=true]:text-white transition-colors duration-300" />
                    </div>
                    <span className="font-medium text-slate-700 group-hover:text-slate-800 group-data-[active=true]:text-indigo-700 transition-colors duration-300">Настройки</span>
                  </div>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={handleLogout} 
                tooltip={{ children: 'Выйти', side: 'right' }}
                className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-red-100/95 hover:to-pink-100/95 hover:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-gradient-to-r group-hover:from-red-500 group-hover:to-pink-500 flex items-center justify-center transition-all duration-300">
                    <LogOut className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="font-medium text-slate-700 group-hover:text-red-700 transition-colors duration-300">Выйти</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="p-3 border-t border-slate-200/50">
            <LanguageSwitcher />
          </div>
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-slate-100/95 to-gray-100/95 rounded-2xl m-2 shadow-lg">
            <Avatar className="w-10 h-10 ring-2 ring-white shadow-md">
              <AvatarImage src={userData.avatar || `https://i.pravatar.cc/150?u=${userData.name}`} alt={userData.name} />
              <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold">{userData.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-bold text-slate-800">{userData.name}</span>
              <span className="text-xs text-slate-600 font-medium">{userData.lifecycleStage}</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="md:hidden">
          <header className="flex h-14 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
            </div>
          </header>
        </div>
        <main className="flex-1 overflow-auto bg-transparent">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

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
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-2 p-2">
            <Sparkles className="size-8 text-primary" />
            <h2 className="text-xl font-headline font-semibold group-data-[collapsible=icon]:hidden">
              PeriBloom
            </h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link to={item.href}>
                  <SidebarMenuButton
                    isActive={location.pathname === item.href}
                    tooltip={{ children: item.label, side: 'right' }}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <Link to="/app/settings">
                <SidebarMenuButton 
                  isActive={location.pathname === '/app/settings'}
                  tooltip={{ children: 'Настройки', side: 'right' }}>
                  <Settings />
                  <span>Настройки</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip={{ children: 'Выйти', side: 'right' }}>
                <LogOut />
                <span>Выйти</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="flex items-center gap-2 p-3">
            <Avatar>
              <AvatarImage src={`https://i.pravatar.cc/150?u=${userData.name}`} alt={userData.name} />
              <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-semibold">{userData.name}</span>
              <span className="text-xs text-muted-foreground">{userData.lifecycleStage}</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:pl-0">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-xl font-semibold font-headline">
              {navItems.find(item => item.href === location.pathname)?.label || 'PeriBloom'}
            </h1>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-transparent">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

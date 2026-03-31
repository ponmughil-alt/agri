'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Header } from './Header';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import type { Role } from '@/lib/types';
import { 
  Sprout, Package, Handshake, ShoppingBag, 
  Users, ListFilter, Factory, ClipboardList, Leaf, MoreHorizontal,
  PlusSquare, Store, Home, Settings, HelpCircle, TrendingUp, QrCode, Menu, X
} from 'lucide-react';

const farmerLinks = [
  { href: '/farmer/dashboard', label: 'Overview', icon: Home, mobile: true },
  { href: '/farmer/add-crop', label: 'New Listing', icon: PlusSquare, mobile: true },
  { href: '/farmer/my-crops', label: 'Inventory', icon: Package, mobile: false },
  { href: '/farmer/offers', label: 'Offer Book', icon: Handshake, mobile: true },
  { href: '/farmer/orders', label: 'Orders', icon: ClipboardList, mobile: false },
  { href: '/scan', label: 'Scan Tag', icon: QrCode, mobile: true },
];
const buyerLinks = [
  { href: '/buyer/dashboard', label: 'Overview', icon: Home, mobile: true },
  { href: '/buyer/marketplace', label: 'Market', icon: Store, mobile: true },
  { href: '/buyer/offers', label: 'My Bids', icon: Handshake, mobile: true },
  { href: '/buyer/orders', label: 'Orders', icon: ShoppingBag, mobile: false },
  { href: '/scan', label: 'Scan Tag', icon: QrCode, mobile: true },
];
const processorLinks = [
  { href: '/processor/dashboard', label: 'Hub', icon: Home, mobile: true },
  { href: '/processor/browse-crops', label: 'Sourcing', icon: Leaf, mobile: true },
  { href: '/processor/requests', label: 'Requests', icon: Factory, mobile: true },
  { href: '/processor/orders', label: 'Process', icon: ClipboardList, mobile: false },
  { href: '/scan', label: 'Scan Tag', icon: QrCode, mobile: true },
];
const adminLinks = [
  { href: '/admin/dashboard', label: 'Control Panel', icon: Home, mobile: true },
  { href: '/admin/users', label: 'Users', icon: Users, mobile: true },
  { href: '/admin/listings', label: 'Listings', icon: ListFilter, mobile: true },
  { href: '/admin/orders', label: 'Transactions', icon: Package, mobile: false },
  { href: '/scan', label: 'Scan Tag', icon: QrCode, mobile: true },
];

const roleLinks: Record<string, typeof farmerLinks> = {
  farmer: farmerLinks, buyer: buyerLinks, processor: processorLinks, admin: adminLinks,
};

interface DashboardLayoutProps {
  children: ReactNode;
  allowedRoles?: Role[];
}

export default function DashboardLayout({ children, allowedRoles }: DashboardLayoutProps) {
  const { user, profile, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
        return;
      }
      if (profile && allowedRoles && !allowedRoles.includes(profile.role)) {
        router.push(`/${profile.role}/dashboard`);
      }
    }
  }, [user, profile, loading, allowedRoles, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="spinner" />
    </div>
  );

  const role = profile?.role ?? 'buyer';
  const links = roleLinks[role] ?? buyerLinks;
  const mobileLinks = links.filter(l => l.mobile);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop Sidebar (Left) */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-sidebar-background pt-5 px-4 fixed left-0 top-0 bottom-0 z-40">
        
        {/* Sidebar Logo */}
        <Link href="/" className="flex items-center gap-2.5 px-2 mb-8 group">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center shrink-0 shadow-sm">
            <TrendingUp size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-sidebar-foreground tracking-tight leading-none">AgriOx</span>
          </div>
        </Link>

        {/* Dynamic Navigation */}
        <div className="mb-2 px-3">
           <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workspace</p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto pb-4">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link key={href} href={href}>
                <div className={`sidebar-link group ${isActive ? 'active' : ''}`}>
                  <Icon size={18} className={isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'} />
                  <span>{label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Global/Bottom Nav */}
        <div className="mt-auto mb-6 space-y-1">
          <div className="mb-2 px-3 mt-4">
             <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">System</p>
          </div>
          <Link href={`/${role}/dashboard`}>
            <div className="sidebar-link group">
              <Settings size={18} className="text-muted-foreground group-hover:text-foreground" />
              <span>Settings</span>
            </div>
          </Link>
          <Link href="#">
            <div className="sidebar-link group">
              <HelpCircle size={18} className="text-muted-foreground group-hover:text-foreground" />
              <span>Help & Support</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen relative">
        <Header />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.15 }}
              className="max-w-6xl mx-auto w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation (Fixed Bottom) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white/95 backdrop-blur-md px-2 py-2 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around">
          {mobileLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link key={href} href={href} className="flex flex-col items-center gap-1 group w-14">
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'text-muted-foreground group-hover:bg-secondary'}`}>
                  <Icon size={18} />
                </div>
                <span className={`text-[10px] font-bold tracking-tight ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
              </Link>
            );
          })}
          
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center gap-1 group w-14 text-muted-foreground hover:text-foreground"
          >
            <div className="p-1.5 rounded-xl transition-all group-hover:bg-secondary">
              <MoreHorizontal size={18} />
            </div>
            <span className="text-[10px] font-bold tracking-tight">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50 pt-20"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 pb-12 pt-8 px-6 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-foreground tracking-tight">System Navigation</h3>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-full bg-secondary text-muted-foreground">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 h-[50vh] overflow-y-auto pb-10">
                {links.map(({ href, label, icon: Icon }) => (
                  <Link 
                    key={href} 
                    href={href} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl border border-border bg-secondary/20 hover:bg-white hover:border-primary/50 transition-all transition-all"
                  >
                    <Icon size={24} className="text-primary mb-3" />
                    <span className="text-xs font-bold text-foreground text-center">{label}</span>
                  </Link>
                ))}
                
                <div className="col-span-2 h-px bg-border my-2" />
                
                <Link href={`/${role}/dashboard`} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/40">
                  <Settings size={20} className="text-muted-foreground" />
                  <span className="text-sm font-bold text-foreground">Settings</span>
                </Link>
                <Link href="#" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/40">
                  <HelpCircle size={20} className="text-muted-foreground" />
                  <span className="text-sm font-bold text-foreground">Help Center</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * ==============================================================================
 * CREATOR MARKETPLACE PLATFORM - ENTERPRISE WEB APP ARCHITECTURE
 * Next.js 15 | TypeScript | Tailwind CSS v4 | Zustand | Prisma PostgreSQL
 * ==============================================================================
 * * ==============================================================================
 * FILE: prisma/schema.prisma (DATABASE ARCHITECTURE)
 * ==============================================================================
 * generator client {
 * provider = "prisma-client-js"
 * }
 * datasource db {
 * provider = "postgresql"
 * url      = env("DATABASE_URL")
 * }
 * * enum Role { GUEST, USER, PREMIUM, VIP, ADMIN }
 * enum OrderStatus { PENDING, SUCCESS, FAILED, REFUNDED }
 * * model User {
 * id            String    @id @default(cuid())
 * email         String    @unique
 * password      String?
 * name          String
 * role          Role      @default(USER)
 * orders        Order[]
 * wishlist      Product[] @relation("UserWishlist")
 * createdAt     DateTime  @default(now())
 * }
 * * model Product {
 * id            String    @id @default(cuid())
 * title         String
 * slug          String    @unique
 * category      Category  @relation(fields: [categoryId], references: [id])
 * categoryId    String
 * price         Decimal
 * discount      Int?      @default(0)
 * rating        Float     @default(0)
 * sales         Int       @default(0)
 * isBestseller  Boolean   @default(false)
 * contentUrl    String    // AWS S3 / Cloudflare R2
 * wishlistedBy  User[]    @relation("UserWishlist")
 * orders        OrderItem[]
 * }
 * * model Order {
 * id            String      @id @default(cuid())
 * user          User        @relation(fields: [userId], references: [id])
 * userId        String
 * status        OrderStatus @default(PENDING)
 * totalAmount   Decimal
 * paymentMethod String      // MIDTRANS_QRIS, STRIPE, dll
 * items         OrderItem[]
 * createdAt     DateTime    @default(now())
 * }
 * ==============================================================================
 */

import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Search, ShoppingCart, MessageCircle, ChevronDown, 
  Star, Download, ShieldCheck, Bot, Layout, Workflow, BookOpen, 
  Video, Crown, CreditCard, ArrowRight, Sun, Moon, Heart, 
  Check, Zap, TrendingUp, Sparkles, User, Settings, BarChart, 
  FileText, LogOut, Globe, Send, History, Package, Lock, Filter,
  PlayCircle, ThumbsUp, Tag, ArrowUpRight
} from 'lucide-react';

// ==============================================================================
// FILE: src/types/index.ts
// ==============================================================================
type Theme = 'dark' | 'light';
type ViewState = 'landing' | 'checkout' | 'dashboard_user' | 'dashboard_admin';
type Role = 'guest' | 'user' | 'premium' | 'admin';

interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  oldPrice: number;
  rating: number;
  sales: number;
  image: string;
  isBestseller?: boolean;
  isNew?: boolean;
  isTrending?: boolean;
  discount?: number;
  description: string;
  features: string[];
  reviews: number;
}

// ==============================================================================
// MOCK DATABASE (Simulating Prisma/PostgreSQL responses)
// ==============================================================================
const DB_CATEGORIES = ['Semua', 'AI Prompt', 'SaaS Code', 'Automation', 'E-book', 'Course'];
const DB_PRODUCTS: Product[] = [
  { 
    id: 'p1', title: 'Fullstack Next.js SaaS Boilerplate (Enterprise)', category: 'SaaS Code', price: 450000, oldPrice: 1500000, 
    rating: 5.0, sales: 1250, isBestseller: true, discount: 70, reviews: 342,
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    description: 'Boilerplate SaaS paling komprehensif. Next.js 15, Prisma, PostgreSQL, Stripe, Midtrans, & NextAuth siap pakai.',
    features: ['Multi-tenant Architecture', 'Stripe & Midtrans Integration', 'Admin Dashboard Included', 'Lifetime Updates']
  },
  { 
    id: 'p2', title: 'Auto-Posting N8N Script (Multi-Platform)', category: 'Automation', price: 159000, oldPrice: 450000, 
    rating: 4.9, sales: 840, isTrending: true, discount: 64, reviews: 156,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    description: 'Otomatisasi sosmed tanpa batas. Posting ke IG, Twitter, FB, LinkedIn dalam 1 klik menggunakan n8n (Self-hosted).',
    features: ['5+ Platform Support', 'Error Handling & Retry', 'Video Tutorial Setup', 'JSON Blueprint']
  },
  { 
    id: 'p3', title: 'Mastering ChatGPT Prompts (10k+ Database)', category: 'AI Prompt', price: 99000, oldPrice: 299000, 
    rating: 4.8, sales: 3200, isBestseller: true, discount: 66, reviews: 890,
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80',
    description: 'Database prompt terbesar di Indonesia. Cocok untuk Copywriter, Programmer, dan Marketer.',
    features: ['Notion Database', '10,000+ Categorized Prompts', 'Prompt Engineering Guide', 'Monthly Updates']
  },
  { 
    id: 'p4', title: 'UI/UX Masterclass E-book (2026 Edition)', category: 'E-book', price: 75000, oldPrice: 199000, 
    rating: 4.7, sales: 2100, isNew: true, discount: 62, reviews: 412,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    description: 'Pelajari rahasia UI/UX dari senior designer. Dari fundamental hingga advanced prototyping di Figma.',
    features: ['300+ Pages PDF', 'Figma Source Files', 'Interview Cheatsheet', 'Certificate of Completion']
  },
  { 
    id: 'p5', title: 'Build AI SaaS with Python & React', category: 'Course', price: 299000, oldPrice: 899000, 
    rating: 5.0, sales: 540, isNew: true, discount: 66, reviews: 89,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    description: 'Video course 20 jam membangun startup AI menggunakan OpenAI API, FastAPI, dan React.js.',
    features: ['20 Hours 4K Video', 'Source Code Full', 'Private Discord Access', '1-on-1 Mentoring']
  }
];

// ==============================================================================
// FILE: src/store/index.ts (Simulating Zustand Stores via Context for preview)
// ==============================================================================
const AppContext = createContext<any>(null);

function AppProvider({ children }: { children: React.ReactNode }) {
  // 1. UI Store (Theme, View, Modals)
  const [theme, setTheme] = useState<Theme>('dark');
  const [view, setView] = useState<ViewState>('landing');
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 2. Auth Store (Role, Memberships)
  const [role, setRole] = useState<Role>('guest');

  // 3. Cart Store
  const [cart, setCart] = useState<string[]>([]);
  const addToCart = (id: string) => !cart.includes(id) && setCart([...cart, id]);
  const removeFromCart = (id: string) => setCart(cart.filter(item => item !== id));

  // 4. Wishlist Store
  const [wishlist, setWishlist] = useState<string[]>([]);
  const toggleWishlist = (id: string) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const store = {
    // UI
    theme, toggleTheme: () => setTheme(t => t === 'dark' ? 'light' : 'dark'),
    view, setView, isAIChatOpen, setIsAIChatOpen, searchQuery, setSearchQuery,
    // Auth
    role, setRole,
    // Cart & Wishlist
    cart, addToCart, removeFromCart,
    wishlist, toggleWishlist
  };

  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
}
const useAppStore = () => useContext(AppContext);

// ==============================================================================
// FILE: src/app/layout.tsx & page.tsx (Main Entry)
// ==============================================================================
export default function CreatorMarketplacePlatform() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

function AppContent() {
  const store = useAppStore();
  const isDark = store.theme === 'dark';

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans selection:bg-[#2563EB] selection:text-white ${isDark ? 'bg-[#0F172A] text-white' : 'bg-[#F8FAFC] text-slate-900'}`}>
      
      {/* SEO Metadata Simulation (Next.js Metadata API output) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Creator Marketplace Platform",
          "description": "Enterprise digital product marketplace for courses, SaaS, and templates.",
          "url": "https://marketplace.example.com"
        })
      }} />

      <Header />
      
      <main className="pt-24 pb-20 md:pb-0 min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          {store.view === 'landing' && <LandingPage key="landing" />}
          {store.view === 'checkout' && <CheckoutPage key="checkout" />}
          {store.view === 'dashboard_user' && <UserDashboardPage key="dash_user" />}
          {store.view === 'dashboard_admin' && <AdminDashboardPage key="dash_admin" />}
        </AnimatePresence>
      </main>

      {store.view === 'landing' && <Footer />}
      <AIAssistant />
      <FloatingMobileNav />
    </div>
  );
}

// ==============================================================================
// FILE: src/components/layout/Header.tsx
// ==============================================================================
function Header() {
  const store = useAppStore();
  const isDark = store.theme === 'dark';
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-xl border-b ${isScrolled ? (isDark ? 'bg-[#0F172A]/90 border-slate-800 py-3' : 'bg-white/90 border-slate-200 py-3') : 'bg-transparent border-transparent py-5'}`}>
      <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => store.setView('landing')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center font-bold text-white text-xl shadow-[0_0_20px_rgba(37,99,235,0.4)]">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight hidden sm:block">Creator<span className="text-[#06B6D4]">Market</span></span>
        </div>

        {/* Mega Menu Desktop (Enterprise Pattern) */}
        <nav className="hidden lg:flex items-center gap-8 font-bold text-sm">
          <div className="group relative cursor-pointer py-2">
            <span className="flex items-center gap-1 hover:text-[#06B6D4] transition-colors">Produk <ChevronDown className="w-4 h-4" /></span>
            <div className={`absolute top-full -left-20 w-[600px] p-6 rounded-3xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 border ${isDark ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">Kategori Spesial</h4>
                  <ul className="space-y-4">
                    {DB_CATEGORIES.slice(1, 5).map(cat => (
                      <li key={cat} className="flex items-center gap-3 hover:text-[#2563EB] transition-colors"><Layout className="w-4 h-4" /> {cat}</li>
                    ))}
                  </ul>
                </div>
                <div className={`p-5 rounded-2xl ${isDark ? 'bg-[#0F172A]' : 'bg-slate-50'}`}>
                  <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-full mb-2 inline-block">HOT SALE</span>
                  <h4 className="font-bold mb-2">SaaS Boilerplate Bundles</h4>
                  <img src={DB_PRODUCTS[0].image} className="w-full h-24 object-cover rounded-xl mb-4" />
                  <button className="w-full bg-[#2563EB] text-white py-2 rounded-xl text-xs font-bold">Lihat Bundle</button>
                </div>
              </div>
            </div>
          </div>
          <a href="#" className="hover:text-[#06B6D4] transition-colors">Membership VIP</a>
          <a href="#" className="hover:text-[#06B6D4] transition-colors">Top Authors</a>
        </nav>

        {/* Search Bar (Desktop) */}
        <div className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full border transition-all w-64 focus-within:w-80 ${isDark ? 'bg-[#1E293B] border-slate-700 focus-within:border-[#2563EB]' : 'bg-slate-100 border-slate-200 focus-within:border-[#2563EB]'}`}>
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input 
            type="text" 
            placeholder="Cari script, template..." 
            className="bg-transparent border-none outline-none text-sm w-full"
            value={store.searchQuery}
            onChange={(e) => store.setSearchQuery(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          <button onClick={store.toggleTheme} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* Cart Notification */}
          <button onClick={() => store.setView('checkout')} className="relative p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors group">
            <ShoppingCart className="w-5 h-5" />
            {store.cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-[#0F172A]">
                {store.cart.length}
              </span>
            )}
          </button>

          <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 hidden md:block"></div>

          {/* Role Access Simulation */}
          {store.role === 'guest' ? (
            <div className="flex items-center gap-2">
              <button onClick={() => store.setRole('user')} className="text-sm font-bold hover:text-[#06B6D4] hidden md:block">Masuk</button>
              <button onClick={() => store.setView('checkout')} className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg hover:shadow-xl transition-shadow">
                Checkout
              </button>
            </div>
          ) : (
             <button 
                onClick={() => store.setView(store.role === 'admin' ? 'dashboard_admin' : 'dashboard_user')} 
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white shadow-lg transition-all ${store.role === 'admin' ? 'bg-gradient-to-r from-rose-500 to-orange-500 shadow-rose-500/30' : 'bg-[#1E293B] border border-[#2563EB]'}`}
              >
               <User className="w-4 h-4" /> {store.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
             </button>
          )}

          {/* Dev Mock Tools */}
          <select 
            className="text-[10px] bg-slate-200 dark:bg-slate-800 rounded outline-none p-1 hidden lg:block"
            value={store.role}
            onChange={(e) => { store.setRole(e.target.value as Role); if(e.target.value === 'guest') store.setView('landing'); }}
          >
            <option value="guest">Dev: Guest</option>
            <option value="user">Dev: User</option>
            <option value="premium">Dev: Premium</option>
            <option value="admin">Dev: Admin</option>
          </select>
        </div>
      </div>
    </header>
  );
}

// ==============================================================================
// FILE: src/app/page.tsx (Landing Page)
// ==============================================================================
function LandingPage() {
  const store = useAppStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <HeroSection />
      <FilterAndProductSection store={store} onQuickView={setSelectedProduct} />
      
      {/* Modals */}
      <AnimatePresence>
        {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} store={store} />}
      </AnimatePresence>
    </motion.div>
  );
}

// ==============================================================================
// FILE: src/components/hero/Hero.tsx
// ==============================================================================
function HeroSection() {
  const store = useAppStore();
  const isDark = store.theme === 'dark';
  
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
      {/* Animated Particles & Advanced Gradient Simulation */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -50, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute -top-[10%] -left-[10%] w-[800px] h-[800px] bg-[#2563EB] rounded-full blur-[150px] opacity-20 mix-blend-screen" />
        <motion.div animate={{ scale: [1, 1.3, 1], x: [0, -50, 0], y: [0, 50, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute top-[20%] -right-[10%] w-[600px] h-[600px] bg-[#7C3AED] rounded-full blur-[150px] opacity-20 mix-blend-screen" />
        {/* Particle Dots Simulation */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMTQ4LCAxNjMsIDE4NCwgMC4xKSIvPjwvc3ZnPg==')] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full border mb-8 backdrop-blur-xl shadow-lg ${isDark ? 'bg-[#1E293B]/60 border-slate-700 text-[#06B6D4]' : 'bg-white/60 border-blue-200 text-[#2563EB]'}`}>
             <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
             <span className="text-sm font-black tracking-wide uppercase">High Conversion Marketplace 2026</span>
          </div>
        </motion.div>
        
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[1.05]">
          Akselerasi Startup Anda dengan <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#06B6D4] animate-gradient-x">
            Produk Digital Premium
          </span>
        </motion.h1>
        
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`text-lg md:text-2xl max-w-3xl mx-auto mb-12 font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Ribuan Source Code SaaS, AI Prompts, dan Course berkualitas tinggi. Download instan, lisensi komersial, siap dikembangkan menjadi bisnis miliaran rupiah.
        </motion.p>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <button className="w-full sm:w-auto px-10 py-5 bg-[#2563EB] text-white rounded-2xl font-black text-lg hover:bg-blue-600 transition-all shadow-[0_20px_50px_rgba(37,99,235,0.4)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.6)] hover:-translate-y-1 flex items-center justify-center gap-3">
            Eksplorasi Produk <ArrowRight className="w-5 h-5" />
          </button>
          <button className={`w-full sm:w-auto px-10 py-5 rounded-2xl font-black text-lg border transition-all hover:-translate-y-1 flex items-center justify-center gap-3 ${isDark ? 'bg-[#1E293B] border-slate-700 hover:border-[#06B6D4] text-white' : 'bg-white border-slate-300 hover:border-[#2563EB] text-slate-900'}`}>
            <Crown className="w-5 h-5 text-amber-500" /> Gabung Membership VIP
          </button>
        </motion.div>

        {/* Stats / Counters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-8 rounded-3xl border backdrop-blur-xl ${isDark ? 'bg-[#1E293B]/50 border-slate-700' : 'bg-white/60 border-slate-200 shadow-xl'}`}>
           {[
             { label: 'Happy Customers', value: '10.000+' },
             { label: 'Digital Downloads', value: '50.000+' },
             { label: 'Average Rating', value: '4.9/5' },
             { label: 'Satisfaction Rate', value: '99%' }
           ].map((stat, i) => (
             <div key={i} className="flex flex-col items-center">
               <h3 className="text-3xl md:text-4xl font-black mb-1">{stat.value}</h3>
               <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
             </div>
           ))}
        </motion.div>
      </div>
    </section>
  );
}

// ==============================================================================
// FILE: src/components/products/FilterAndProductSection.tsx
// ==============================================================================
function FilterAndProductSection({ store, onQuickView }: { store: any, onQuickView: (p: Product) => void }) {
  const isDark = store.theme === 'dark';
  const [activeCat, setActiveCat] = useState('Semua');
  const [sortBy, setSortBy] = useState('popular');

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = DB_PRODUCTS;
    if (activeCat !== 'Semua') result = result.filter(p => p.category === activeCat);
    if (store.searchQuery) result = result.filter(p => p.title.toLowerCase().includes(store.searchQuery.toLowerCase()));
    
    if (sortBy === 'lowest') result = [...result].sort((a,b) => a.price - b.price);
    if (sortBy === 'highest') result = [...result].sort((a,b) => b.price - a.price);
    if (sortBy === 'rating') result = [...result].sort((a,b) => b.rating - a.rating);
    return result;
  }, [activeCat, store.searchQuery, sortBy]);

  return (
    <section className={`py-24 ${isDark ? 'bg-[#0B1120]' : 'bg-slate-50'}`}>
      <div className="container mx-auto px-4">
        
        {/* Section Header & Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-black mb-4 flex items-center gap-3">Katalog Produk Premium</h2>
            <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Pilih dari koleksi produk digital terbaik yang siap scale-up bisnis Anda.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${isDark ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-200'}`}>
               <Filter className="w-4 h-4 text-slate-500" />
               <select className="bg-transparent outline-none text-sm font-bold cursor-pointer" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                 <option value="popular">Paling Populer</option>
                 <option value="rating">Rating Tertinggi</option>
                 <option value="lowest">Harga Terendah</option>
                 <option value="highest">Harga Tertinggi</option>
               </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide mb-6">
          {DB_CATEGORIES.map(cat => (
            <button 
              key={cat} onClick={() => setActiveCat(cat)}
              className={`whitespace-nowrap px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeCat === cat ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-500/30' : (isDark ? 'bg-[#1E293B] text-slate-300 hover:bg-slate-800 border border-slate-700' : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200')}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} store={store} onQuickView={onQuickView} index={index} />
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-20 text-slate-500 font-bold">Produk tidak ditemukan.</div>
        )}
      </div>
    </section>
  );
}

// ==============================================================================
// FILE: src/components/products/ProductCard.tsx
// ==============================================================================
function ProductCard({ product, store, onQuickView, index }: { product: Product, store: any, onQuickView: (p: Product) => void, index: number }) {
  const isDark = store.theme === 'dark';
  const isWishlisted = store.wishlist.includes(product.id);
  const inCart = store.cart.includes(product.id);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }}
      className={`group flex flex-col rounded-3xl overflow-hidden border transition-all duration-300 hover:-translate-y-2 ${isDark ? 'bg-[#1E293B] border-slate-700 hover:border-[#2563EB] hover:shadow-[0_15px_40px_rgba(37,99,235,0.2)]' : 'bg-white border-slate-200 hover:border-[#2563EB] hover:shadow-2xl'}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden cursor-pointer" onClick={() => onQuickView(product)}>
        <img src={product.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          {product.discount && <span className="bg-rose-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-lg">SAVE {product.discount}%</span>}
          {product.isBestseller && <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1"><Zap className="w-3 h-3" /> BESTSELLER</span>}
          {product.isTrending && <span className="bg-purple-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1"><TrendingUp className="w-3 h-3" /> TRENDING</span>}
        </div>

        {/* Wishlist */}
        <button 
          onClick={(e) => { e.stopPropagation(); store.toggleWishlist(product.id); }}
          className={`absolute top-4 right-4 z-20 p-2.5 rounded-full backdrop-blur-md transition-all ${isWishlisted ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40' : 'bg-black/30 text-white hover:bg-rose-500'}`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="bg-white/20 backdrop-blur-md text-white font-bold px-6 py-3 rounded-full flex items-center gap-2 border border-white/30 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
             Quick Preview
          </span>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-3">
           <div className="text-[10px] font-black text-[#06B6D4] uppercase tracking-wider">{product.category}</div>
           <div className="flex items-center gap-1 text-amber-500 text-xs font-bold"><Star className="w-3 h-3 fill-current"/> {product.rating}</div>
        </div>
        
        <h3 className="font-bold text-lg mb-2 line-clamp-2 leading-tight cursor-pointer hover:text-[#2563EB] transition-colors" onClick={() => onQuickView(product)}>
          {product.title}
        </h3>
        
        <p className={`text-sm mb-6 line-clamp-2 flex-grow ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{product.description}</p>
        
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
           <Tag className="w-3 h-3" /> {product.sales.toLocaleString()} Terjual • {product.reviews} Ulasan
        </div>

        <div className={`border-t pt-4 flex items-center justify-between ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <div>
            <div className="text-xs text-slate-500 line-through mb-0.5">Rp {product.oldPrice.toLocaleString()}</div>
            <div className="text-xl font-black text-emerald-500">Rp {product.price.toLocaleString()}</div>
          </div>
          
          <button 
            onClick={() => store.addToCart(product.id)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${inCart ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-[#2563EB]/10 text-[#2563EB] hover:bg-[#2563EB] hover:text-white'}`}
          >
            {inCart ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ==============================================================================
// FILE: src/components/products/ProductModal.tsx
// ==============================================================================
function ProductModal({ product, onClose, store }: { product: Product, onClose: () => void, store: any }) {
  const isDark = store.theme === 'dark';
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className={`relative w-full max-w-6xl max-h-[95vh] overflow-y-auto rounded-[2rem] shadow-2xl flex flex-col lg:flex-row border ${isDark ? 'bg-[#0F172A] border-slate-700' : 'bg-white border-slate-200'}`}
      >
        <button onClick={onClose} className="absolute top-6 right-6 z-50 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-rose-500 transition-colors backdrop-blur-md">
          <X className="w-5 h-5" />
        </button>

        {/* Gallery / Video Preview */}
        <div className="w-full lg:w-1/2 relative bg-slate-900 min-h-[300px] lg:min-h-full">
          <img src={product.image} className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 flex items-center justify-center">
             <button className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:scale-110 transition-transform group border border-white/30">
               <PlayCircle className="w-10 h-10 text-white group-hover:text-[#06B6D4] transition-colors" />
             </button>
          </div>
          <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black to-transparent">
             <div className="flex gap-3">
                <div className="w-16 h-16 rounded-xl border-2 border-[#2563EB] overflow-hidden"><img src={product.image} className="w-full h-full object-cover"/></div>
                <div className="w-16 h-16 rounded-xl border-2 border-transparent bg-white/10 flex items-center justify-center backdrop-blur-sm cursor-pointer hover:bg-white/20"><Layout className="w-6 h-6 text-white"/></div>
             </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-[10px] font-black text-[#06B6D4] uppercase tracking-wider px-3 py-1 bg-[#06B6D4]/10 rounded-full">{product.category}</span>
            {product.isBestseller && <span className="bg-amber-400 text-amber-950 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1"><Zap className="w-3 h-3"/> BESTSELLER</span>}
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-black mb-4 leading-tight">{product.title}</h2>
          
          <div className="flex items-center gap-6 text-sm mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1 text-amber-500 font-bold text-lg"><Star className="w-5 h-5 fill-current"/> {product.rating}</div>
            <div className="flex items-center gap-2 text-slate-500 font-bold"><ThumbsUp className="w-4 h-4"/> {product.reviews} Reviews</div>
            <div className="flex items-center gap-2 text-slate-500 font-bold"><Download className="w-4 h-4"/> {product.sales.toLocaleString()} Terjual</div>
          </div>

          <p className={`text-base mb-8 leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {product.description}
          </p>

          <div className="mb-10">
            <h4 className="font-black text-lg mb-4">Fitur Utama:</h4>
            <ul className="space-y-4">
              {product.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={`mt-auto p-6 rounded-3xl border ${isDark ? 'bg-[#1E293B] border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-end justify-between mb-6">
              <div>
                <div className="text-sm text-slate-500 line-through mb-1 font-bold">Harga Normal: Rp {product.oldPrice.toLocaleString()}</div>
                <div className="text-4xl font-black text-emerald-500">Rp {product.price.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="flex gap-4">
               <button 
                  onClick={() => { store.addToCart(product.id); onClose(); store.setView('checkout'); }}
                  className="flex-1 bg-[#2563EB] text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-600 shadow-[0_10px_25px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2 hover:-translate-y-1"
                >
                  <Lock className="w-5 h-5" /> Beli Akses Instan
               </button>
            </div>
            <p className="text-center text-xs font-bold text-slate-500 mt-4"><ShieldCheck className="w-4 h-4 inline mr-1"/> Pembayaran Aman & File Langsung Dikirim</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ==============================================================================
// FILE: src/app/checkout/page.tsx (Checkout System - Guest/User Support)
// ==============================================================================
function CheckoutPage() {
  const store = useAppStore();
  const isDark = store.theme === 'dark';
  const cartItems = DB_PRODUCTS.filter(p => store.cart.includes(p.id));
  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * 0.11; // PPN 11%
  const total = subtotal + tax;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Formulir Checkout */}
        <div className="lg:col-span-7 space-y-8">
          <div>
            <h1 className="text-4xl font-black mb-2">Checkout Aman</h1>
            <p className="text-slate-500 font-bold">Tidak perlu akun. File akan langsung dikirimkan ke email Anda.</p>
          </div>

          <div className={`p-8 rounded-3xl border ${isDark ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-200 shadow-xl'}`}>
            <h2 className="text-2xl font-black mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">1. Detail Pengiriman Digital</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black text-slate-500 mb-2 uppercase">Nama Depan</label>
                  <input type="text" className={`w-full p-4 rounded-2xl border outline-none focus:border-[#2563EB] font-bold ${isDark ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-50 border-slate-200'}`} placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-500 mb-2 uppercase">Nama Belakang</label>
                  <input type="text" className={`w-full p-4 rounded-2xl border outline-none focus:border-[#2563EB] font-bold ${isDark ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-50 border-slate-200'}`} placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-black text-slate-500 mb-2 uppercase">Alamat Email Aktif <span className="text-rose-500">*</span></label>
                <input type="email" className={`w-full p-4 rounded-2xl border outline-none focus:border-[#2563EB] font-bold ${isDark ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-50 border-slate-200'}`} placeholder="john@example.com" />
                <p className="text-xs font-bold text-emerald-500 mt-2 flex items-center gap-1"><Check className="w-3 h-3"/> File download dan invoice akan dikirim ke email ini.</p>
              </div>
            </div>
          </div>

          <div className={`p-8 rounded-3xl border ${isDark ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-200 shadow-xl'}`}>
            <h2 className="text-2xl font-black mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">2. Metode Pembayaran (Midtrans/Stripe)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'QRIS Auto-Confirm', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                { name: 'Credit Card (Stripe)', icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { name: 'BCA Virtual Account', icon: Layout, color: 'text-[#0066AE]', bg: 'bg-[#0066AE]/10' },
                { name: 'GoPay / OVO', icon: Heart, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
              ].map((method, i) => (
                <label key={i} className={`flex items-center gap-4 p-5 rounded-2xl border cursor-pointer transition-all ${i === 0 ? 'border-[#2563EB] bg-[#2563EB]/5 shadow-md' : (isDark ? 'border-slate-700 hover:border-slate-500' : 'border-slate-200 hover:border-slate-400')}`}>
                  <input type="radio" name="payment" defaultChecked={i === 0} className="w-5 h-5 accent-[#2563EB]" />
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${method.bg}`}>
                     <method.icon className={`w-5 h-5 ${method.color}`} />
                  </div>
                  <span className="font-black text-sm">{method.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Ringkasan Keranjang */}
        <div className="lg:col-span-5">
          <div className={`p-8 rounded-3xl border sticky top-28 ${isDark ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-200 shadow-2xl'}`}>
            <h2 className="text-2xl font-black mb-6">Ringkasan Pesanan</h2>
            
            {cartItems.length === 0 ? (
              <div className="text-center py-10 font-bold text-slate-500">Keranjang Anda Kosong.</div>
            ) : (
              <div className="space-y-6 mb-8">
                {cartItems.map(item => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <img src={item.image} className="w-20 h-20 rounded-2xl object-cover shadow-md" />
                    <div className="flex-1">
                      <h4 className="font-black text-sm line-clamp-2 leading-tight mb-1">{item.title}</h4>
                      <div className="text-emerald-500 font-black text-sm">Rp {item.price.toLocaleString()}</div>
                    </div>
                    <button onClick={() => store.removeFromCart(item.id)} className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"><X className="w-4 h-4"/></button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-slate-200 dark:border-slate-700 pt-6 space-y-4 mb-8">
              <div className="flex justify-between font-bold text-slate-500">
                <span>Subtotal ({cartItems.length} Produk)</span>
                <span>Rp {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-500">
                <span>PPN (11%)</span>
                <span>Rp {tax.toLocaleString()}</span>
              </div>
              
              {/* Fake Coupon Input */}
              <div className="flex gap-2 pt-2">
                 <input type="text" placeholder="Kode Diskon" className={`flex-1 px-4 py-2 rounded-xl border text-sm font-bold uppercase outline-none ${isDark ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-50 border-slate-200'}`} />
                 <button className="bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-sm">Terapkan</button>
              </div>

              <div className="flex justify-between text-2xl font-black pt-4 border-t border-slate-200 dark:border-slate-700">
                <span>Total</span>
                <span className="text-[#2563EB]">Rp {total.toLocaleString()}</span>
              </div>
            </div>

            <button 
              disabled={cartItems.length === 0}
              onClick={() => { alert('Memanggil Midtrans/Stripe API...'); store.setRole('user'); store.setView('dashboard_user'); }}
              className="w-full bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white py-5 rounded-2xl font-black text-lg hover:shadow-[0_15px_30px_rgba(37,99,235,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:-translate-y-1"
            >
              <Lock className="w-5 h-5" /> Bayar & Dapatkan Akses
            </button>
            <p className="text-center text-xs font-bold text-slate-500 mt-6"><ShieldCheck className="w-4 h-4 inline mr-1 text-emerald-500"/> Transaksi ini dienkripsi dengan standar bank 256-bit SSL.</p>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

// ==============================================================================
// FILE: src/app/dashboard/page.tsx (User Area - Downloads & Membership)
// ==============================================================================
function UserDashboardPage() {
  const store = useAppStore();
  const isDark = store.theme === 'dark';
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-2">
          <div className={`p-8 rounded-3xl border mb-6 flex flex-col items-center text-center shadow-lg ${isDark ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2563EB] to-[#7C3AED] flex items-center justify-center text-white text-3xl font-black mb-4 shadow-xl border-4 border-white dark:border-slate-800">JS</div>
            <h3 className="font-black text-xl">John Smith</h3>
            <p className="text-sm font-bold text-slate-500">john@example.com</p>
            {store.role === 'premium' ? (
              <div className="mt-4 px-4 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-black rounded-full shadow-md flex items-center gap-1"><Crown className="w-3 h-3"/> VIP MEMBER</div>
            ) : (
              <button onClick={() => store.setRole('premium')} className="mt-4 text-xs font-bold text-[#2563EB] bg-[#2563EB]/10 px-4 py-2 rounded-full hover:bg-[#2563EB] hover:text-white transition-colors">Upgrade to VIP</button>
            )}
          </div>
          
          {[
            { icon: Package, label: 'Library Produk', active: true },
            { icon: Crown, label: 'Membership Area' },
            { icon: History, label: 'Riwayat Order' },
            { icon: Settings, label: 'Pengaturan Akun' },
          ].map((menu, i) => (
            <button key={i} className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-black transition-all ${menu.active ? (isDark ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-500/20' : 'bg-[#2563EB] text-white shadow-lg') : (isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100')}`}>
              <menu.icon className="w-5 h-5" /> {menu.label}
            </button>
          ))}
          <button onClick={() => {store.setRole('guest'); store.setView('landing')}} className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-black text-rose-500 hover:bg-rose-500/10 mt-6">
            <LogOut className="w-5 h-5" /> Keluar
          </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-8">
          <div>
            <h1 className="text-4xl font-black mb-2">Library Produk Anda</h1>
            <p className="text-lg font-bold text-slate-500">Akses semua file, source code, dan kursus yang telah Anda beli.</p>
          </div>

          {store.role === 'premium' && (
             <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
               <div>
                  <h3 className="font-black text-2xl flex items-center gap-2"><Crown className="w-6 h-6"/> VIP Access Active</h3>
                  <p className="font-bold text-orange-100 mt-2">Anda dapat mengunduh seluruh produk E-book dan UI Kit secara gratis bulan ini.</p>
               </div>
               <button className="px-6 py-3 bg-white text-orange-500 font-black rounded-xl shrink-0 hover:scale-105 transition-transform">Browse VIP Catalog</button>
             </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DB_PRODUCTS.slice(0, 3).map((item) => (
              <div key={item.id} className={`p-5 rounded-3xl border flex flex-col gap-4 shadow-sm ${isDark ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="relative aspect-video rounded-2xl overflow-hidden">
                   <img src={item.image} className="w-full h-full object-cover" />
                   <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-black text-white">{item.category}</div>
                </div>
                <div>
                  <h4 className="font-black text-lg mb-4 line-clamp-1">{item.title}</h4>
                  <div className="flex gap-3">
                    <button className="flex-1 bg-[#2563EB] text-white font-black py-3 rounded-xl hover:bg-blue-600 shadow-md flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" /> Download ZIP
                    </button>
                    <button className={`w-12 h-12 rounded-xl flex items-center justify-center border font-bold ${isDark ? 'border-slate-600 hover:bg-slate-700 text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'}`}>
                      <ArrowUpRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ==============================================================================
// FILE: src/app/admin/page.tsx (Admin Analytics & CMS)
// ==============================================================================
function AdminDashboardPage() {
  const store = useAppStore();
  const isDark = store.theme === 'dark';
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mx-auto px-4 py-8 max-w-[1600px]">
      <div className="flex flex-col xl:flex-row gap-10">
        
        {/* Admin Sidebar */}
        <div className="w-full xl:w-72 shrink-0 space-y-3">
          <div className="mb-10 px-4">
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">AdminPanel</h2>
            <p className="font-bold text-slate-500 text-sm mt-1">v2.0 Enterprise</p>
          </div>
          {[
            { icon: BarChart, label: 'Analytics & Revenue', active: true },
            { icon: Package, label: 'Product Manager' },
            { icon: User, label: 'Customer Database' },
            { icon: CreditCard, label: 'Transactions' },
            { icon: Settings, label: 'Platform Settings' },
          ].map((menu, i) => (
            <button key={i} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black transition-all ${menu.active ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/20' : (isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100')}`}>
              <menu.icon className="w-5 h-5" /> {menu.label}
            </button>
          ))}
          <button onClick={() => {store.setRole('guest'); store.setView('landing')}} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black text-rose-500 hover:bg-rose-500/10 mt-10">
            <LogOut className="w-5 h-5" /> Exit Admin
          </button>
        </div>

        {/* Main Admin Area */}
        <div className="flex-1 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-black">Platform Overview</h1>
              <p className="font-bold text-slate-500 mt-1">Metrik penjualan hari ini (Live)</p>
            </div>
            <button className="bg-[#1E293B] border border-slate-700 text-white px-6 py-3 rounded-xl text-sm font-black flex items-center gap-2 hover:bg-slate-800 shadow-lg">
              <Download className="w-4 h-4" /> Export Financial Report
            </button>
          </div>

          {/* Revenue Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Gross Revenue (Monthly)', value: 'Rp 450.5M', up: true, diff: '+24.5%' },
              { label: 'Total Sales', value: '1,245 Items', up: true, diff: '+12.4%' },
              { label: 'New Members', value: '+342 Users', up: true, diff: '+5.2%' },
              { label: 'Refund Rate', value: '1.2%', up: false, diff: '-0.4%' }
            ].map((stat, i) => (
              <div key={i} className={`p-8 rounded-3xl border shadow-sm ${isDark ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="text-sm font-black text-slate-500 mb-3">{stat.label}</div>
                <div className="text-3xl font-black mb-3">{stat.value}</div>
                <div className={`text-sm font-black flex items-center gap-1 ${stat.up ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {stat.up ? <TrendingUp className="w-4 h-4"/> : <TrendingUp className="w-4 h-4 rotate-180"/>} 
                  {stat.diff} vs last month
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart Simulation */}
            <div className={`lg:col-span-2 p-8 rounded-3xl border shadow-sm ${isDark ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-200'}`}>
              <h3 className="font-black text-xl mb-8">Revenue Chart</h3>
              <div className="h-72 flex items-end justify-between gap-4 border-b border-l border-slate-700 pb-2 pl-2">
                {[40, 60, 30, 80, 50, 90, 100].map((h, i) => (
                  <div key={i} className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg relative group transition-all hover:opacity-80" style={{ height: `${h}%` }}>
                     <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100">Rp {h}M</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-sm font-black text-slate-500">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>

            {/* Recent Orders */}
            <div className={`p-8 rounded-3xl border shadow-sm ${isDark ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-200'}`}>
              <h3 className="font-black text-xl mb-6">Live Transactions</h3>
              <div className="space-y-6">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="flex justify-between items-center text-sm border-b border-slate-200 dark:border-slate-700 pb-4 last:border-0 last:pb-0">
                    <div>
                      <div className="font-black text-base">ORD-998{i}</div>
                      <div className="text-xs font-bold text-slate-500 mt-1">user{i}@gmail.com</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-emerald-500 text-base">Rp 450k</div>
                      <div className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-md font-black uppercase mt-1 inline-block">Success</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ==============================================================================
// FILE: src/components/layout/Footer.tsx
// ==============================================================================
function Footer() {
  const store = useAppStore();
  const isDark = store.theme === 'dark';
  return (
    <footer className={`pt-24 pb-12 border-t ${isDark ? 'bg-[#0B1120] border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="container mx-auto px-4">
         <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-black mb-6">Siap Scale Up Bisnis Anda?</h2>
            <p className={`font-bold mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Bergabung dengan 10,000+ kreator yang telah menggunakan produk kami untuk mempercepat pengembangan aplikasi dan bisnis mereka.</p>
            <div className="flex bg-[#1E293B] p-2 rounded-2xl max-w-md mx-auto shadow-xl border border-slate-700">
               <input type="email" placeholder="Email Address..." className="flex-1 bg-transparent px-4 font-bold text-white outline-none" />
               <button className="bg-[#2563EB] text-white px-6 py-3 rounded-xl font-black">Subscribe</button>
            </div>
         </div>
         <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between font-bold text-sm text-slate-500">
            <p>&copy; 2026 Creator Marketplace Platform (Enterprise Edition). All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
               <a href="#" className="hover:text-[#2563EB]">Privacy Policy</a>
               <a href="#" className="hover:text-[#2563EB]">Terms of Service</a>
            </div>
         </div>
      </div>
    </footer>
  );
}

// ==============================================================================
// FILE: src/components/layout/AIAssistant.tsx & FloatingMobileNav.tsx
// ==============================================================================
function AIAssistant() {
  const store = useAppStore();
  const isDark = store.theme === 'dark';
  return (
    <>
      <button onClick={() => store.setIsAIChatOpen(true)} className="fixed bottom-24 md:bottom-8 right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform bg-[#1E293B] border border-slate-700 text-[#06B6D4]">
        <Sparkles className="w-7 h-7 animate-pulse" />
      </button>
      <AnimatePresence>
        {store.isAIChatOpen && (
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.9 }} className={`fixed bottom-24 right-6 z-50 w-[350px] h-[500px] rounded-3xl shadow-2xl flex flex-col overflow-hidden border ${isDark ? 'bg-[#0F172A] border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="p-4 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white flex justify-between items-center">
              <div className="flex items-center gap-2 font-black"><Bot className="w-5 h-5" /> AI Product Expert</div>
              <button onClick={() => store.setIsAIChatOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className={`flex-1 p-5 overflow-y-auto flex flex-col gap-5 ${isDark ? 'bg-[#0B1120]' : 'bg-slate-50'}`}>
              <div className="flex gap-3"><div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-white"/></div><div className={`p-4 rounded-2xl rounded-tl-none text-sm font-bold shadow-sm ${isDark ? 'bg-[#1E293B] text-slate-300' : 'bg-white text-slate-700'}`}>Halo! Mau cari script n8n atau Next.js boilerplate hari ini?</div></div>
            </div>
            <div className={`p-4 border-t ${isDark ? 'bg-[#1E293B] border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className={`flex items-center px-4 py-3 rounded-xl border ${isDark ? 'bg-[#0F172A] border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                <input type="text" placeholder="Tanya sesuatu..." className="flex-1 bg-transparent outline-none text-sm font-bold" />
                <button className="text-[#2563EB]"><Send className="w-4 h-4" /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function FloatingMobileNav() {
  const store = useAppStore();
  const isDark = store.theme === 'dark';
  return (
    <div className={`md:hidden fixed bottom-0 w-full z-40 border-t pb-safe ${isDark ? 'bg-[#0F172A]/90 border-slate-800' : 'bg-white/90 border-slate-200'} backdrop-blur-xl`}>
      <div className="flex justify-around items-center h-16">
        <button onClick={() => store.setView('landing')} className={`flex flex-col items-center justify-center w-full h-full ${store.view === 'landing' ? 'text-[#2563EB]' : 'text-slate-500'}`}><Layout className="w-5 h-5 mb-1" /><span className="text-[10px] font-black">Home</span></button>
        <button className="flex flex-col items-center justify-center w-full h-full text-slate-500 relative"><Heart className="w-5 h-5 mb-1" /><span className="text-[10px] font-black">Wishlist</span>{store.wishlist.length > 0 && <span className="absolute top-2 right-6 w-2 h-2 bg-rose-500 rounded-full"></span>}</button>
        <button onClick={() => store.setView(store.role === 'admin' ? 'dashboard_admin' : (store.role === 'guest' ? 'checkout' : 'dashboard_user'))} className={`flex flex-col items-center justify-center w-full h-full ${store.view.includes('dashboard') ? 'text-[#2563EB]' : 'text-slate-500'}`}><User className="w-5 h-5 mb-1" /><span className="text-[10px] font-black">Akun</span></button>
      </div>
    </div>
  );
}
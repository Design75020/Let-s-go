import React from 'react';
import { motion } from 'motion/react';
import { 
  Rocket, 
  ShoppingBag, 
  Truck, 
  Store, 
  Terminal, 
  Users, 
  ShieldAlert,
  ArrowRight,
  ChevronRight,
  Database,
  Cloud,
  Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { navigateToDomain } from '../lib/domains';

const MODULES = [
  {
    id: 'landing',
    title: 'Acquisition',
    subtitle: 'Marketing & SEO',
    description: 'Landing page haute performance pour la conversion client et acquisition de partenaires.',
    icon: Rocket,
    color: 'emerald',
    tag: 'Marketing'
  },
  {
    id: 'app',
    title: 'Client Plateforme',
    subtitle: 'Live Order Experience',
    description: 'L\'interface client pour commander, explorer les menus et suivre les livraisons en temps réel.',
    icon: ShoppingBag,
    color: 'blue',
    tag: 'Product'
  },
  {
    id: 'merchant',
    title: 'Merchant Interface',
    subtitle: 'Operations B2B',
    description: 'Gestion des commandes, menus et stocks pour les restaurateurs partenaires.',
    icon: Store,
    color: 'amber',
    tag: 'Merchant'
  },
  {
    id: 'driver',
    title: 'Driver Dispatch',
    subtitle: 'Logistics Edge',
    description: 'Dashboard pour les livreurs avec tracking GPS et flux de commandes temps réel.',
    icon: Truck,
    color: 'purple',
    tag: 'Logistics'
  },
  {
    id: 'saas',
    title: 'SaaS Control Tower',
    subtitle: 'Infrastructure Central',
    description: 'Surveillance globale du réseau, monitoring des KPI et gestion multi-villes.',
    icon: Terminal,
    color: 'rose',
    tag: 'Infrastructure'
  },
  {
    id: 'crm',
    title: 'CRM & Sales',
    subtitle: 'Revenue Engine',
    description: 'Gestion des leads, pipeline de vente et support client intégré.',
    icon: Users,
    color: 'indigo',
    tag: 'Growth'
  },
  {
    id: 'admin',
    title: 'Supervision Kernel',
    subtitle: 'System Root',
    description: 'Accès privilégié pour la configuration système et gestion des utilisateurs.',
    icon: ShieldAlert,
    color: 'red',
    tag: 'Admin'
  }
];

export default function DevLaunchpad() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#08090a] text-white p-8 md:p-16 selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <Database className="w-3 h-3" /> Dev Environment
            </div>
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none">
              LETSGOFOOD <span className="text-emerald-500 underline decoration-1 underline-offset-8">ECOSYSTEM</span>
            </h1>
            <p className="text-white/40 max-w-xl text-lg font-medium">
              Plateforme multi-tenant de livraison food premium. Accédez aux différents modules pour tester les flux opérationnels.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
               <div className="text-[10px] font-black uppercase text-white/20 tracking-widest">Stack</div>
               <div className="text-xs font-bold text-white/60">Express + Vite + Socket.io</div>
             </div>
             <div className="w-px h-10 bg-white/5" />
             <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
               <Cloud className="w-5 h-5 text-emerald-500" />
               <span className="text-sm font-bold">Cloud Run Dev</span>
             </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODULES.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigateToDomain(module.id as any, navigate)}
              className="group relative cursor-pointer"
            >
              <div className="h-full bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className={`p-4 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform duration-500`}>
                      <module.icon className="w-6 h-6 text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20 px-3 py-1 border border-white/5 rounded-full">
                      {module.tag}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black italic tracking-tight uppercase group-hover:text-emerald-500 transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-white/40 text-sm leading-relaxed">
                      {module.description}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between pt-6 border-t border-white/5">
                   <span className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">
                     {module.subtitle}
                   </span>
                   <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500 transition-all">
                     <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                   </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Quick Stats / Info Card */}
          <div className="lg:col-span-1 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-white/5 rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Layers className="w-32 h-32 rotate-12" />
            </div>
            <div className="space-y-4 relative z-10">
              <h3 className="text-xl font-black italic tracking-tighter uppercase">Intégration Temps Réel</h3>
              <p className="text-white/60 text-sm">
                Le système utilise des WebSockets pour le dispatch des commandes et le tracking GPS des livreurs. Testez le flux complet en ouvrant le module Client et Livreur en parallèle.
              </p>
            </div>
            <div className="relative z-10 pt-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Socket Pipeline: Active</span>
              </div>
              <button 
                onClick={() => navigateToDomain('app', navigate)}
                className="w-full py-4 bg-white text-black font-black uppercase italic tracking-tighter text-sm rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Start Testing Flow <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Footer info */}
        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">
            LetsGoFood Infrastructure Layer v2.4.0-DEV
          </p>
          <div className="flex items-center gap-6">
            <a href="https://github.com" className="text-white/20 hover:text-white transition-colors"><Layers className="w-5 h-5" /></a>
            <div className="w-px h-4 bg-white/10" />
            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] font-bold text-white/40 uppercase tracking-widest">
               Port 3000 Open
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

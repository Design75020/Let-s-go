
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

const chartData = [
  { day: 'Lun', sales: 400 },
  { day: 'Mar', sales: 700 },
  { day: 'Mer', sales: 450 },
  { day: 'Jeu', sales: 900 },
  { day: 'Ven', sales: 650 },
  { day: 'Sam', sales: 800 },
  { day: 'Dim', sales: 1000 },
];

export default function MerchantDashboard() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
       <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm min-h-[400px]">
          <h3 className="text-lg font-black mb-10 italic uppercase tracking-widest text-[#ff385c]">Performance (Ventes)</h3>
          <div className="h-80 w-full anonymous-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff385c" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ff385c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(0,0,0,0.2)' }} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 25px 50px rgba(0,0,0,0.08)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: '900', color: '#0f172a' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#ff385c" 
                  strokeWidth={5} 
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
       </div>
       <div className="bg-slate-900 p-10 rounded-[3rem] text-white flex flex-col justify-between shadow-xl">
          <div>
            <Sparkles className="w-8 h-8 text-[#ff385c] mb-6" />
            <h3 className="text-xl font-black italic mb-6 uppercase tracking-widest">Optimisation IA</h3>
            <p className="text-white/40 text-[13px] leading-relaxed mb-8 uppercase italic tracking-tight">
              Vos ventes de "Burgers" ont augmenté de 15% ce weekend. Suggérez un menu groupé pour optimiser votre rentabilité.
            </p>
          </div>
          <button className="w-full py-5 bg-white text-slate-900 font-black italic rounded-2xl text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10 uppercase tracking-widest">
            ANALYSES_PRO
          </button>
       </div>
    </motion.div>
  );
}


import React from 'react';
import { ShieldCheck, FileText, FileCheck, CreditCard } from 'lucide-react';

export default function KYCManager({ user }: { user: any }) {
  return (
    <div className="space-y-10">
      <div className="bg-white p-12 rounded-[3rem] border border-slate-100 mb-10">
         <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2">KYC Hub</h2>
         <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest italic">Legal & Compliance Orchestrator</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {[
          { label: 'ID Card', icon: ShieldCheck, status: 'Verified' },
          { label: 'Bank Info', icon: CreditCard, status: 'Pending' },
        ].map((doc, idx) => (
          <div key={idx} className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm flex flex-col justify-between">
             <doc.icon className="w-10 h-10 text-[#ff385c] mb-8" />
             <h3 className="text-xl font-black italic uppercase tracking-tight">{doc.label}</h3>
             <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest mt-4">Status: {doc.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

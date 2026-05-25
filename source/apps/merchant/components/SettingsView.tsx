
import React from 'react';
import { Button } from '../../../shared/ui';

export default function SettingsView({ restoData, user }: { restoData: any, user: any }) {
  return (
    <div className="bg-white p-12 rounded-[3rem] border border-slate-100 max-w-2xl">
      <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-10">Restaurant Profile</h2>
      <div className="space-y-8">
         <div>
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">Display Name</label>
            <p className="text-xl font-black italic text-slate-900 uppercase tracking-tight">{restoData?.name}</p>
         </div>
         <div>
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest block mb-1">Operator Email</label>
            <p className="text-xl font-black italic text-slate-900 uppercase tracking-tight">{user?.email}</p>
         </div>
         <Button className="w-full">Update Info</Button>
      </div>
    </div>
  );
}

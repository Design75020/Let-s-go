import React, { useState } from 'react';
import { ShieldCheck, Upload, AlertCircle } from 'lucide-react';

export default function KYCManager() {
  const [status, setStatus] = useState('pending');

  return (
    <div className="p-8 bg-white border border-slate-200 rounded-[2rem]">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-500/10 rounded-xl">
          <ShieldCheck className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Vérification KYC</h3>
          <p className="text-slate-400 text-sm">Conformité réglementaire européenne</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center">
          <Upload className="w-8 h-8 text-slate-300 mb-4" />
          <p className="text-sm font-bold mb-1">Pièce d'identité (Recto/Verso)</p>
          <p className="text-[10px] text-slate-400">PDF, JPG, PNG (Max 5MB)</p>
          <button className="mt-6 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">CHOISIR UN FICHIER</button>
        </div>

        <div className="p-6 bg-slate-50 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-black uppercase text-orange-500">Statut: En attente</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Vos documents sont en cours d'analyse par le service de conformité. Ce processus prend généralement 24 à 48h.
          </p>
        </div>
      </div>
    </div>
  );
}

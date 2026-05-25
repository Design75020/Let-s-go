
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, handleFirestoreError } from '../../../lib/firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Plus, Edit2, Trash2, Sparkles, Loader2, XCircle } from 'lucide-react';
import { optimizeMenuPrices } from '../../../services/aiService';

export default function MenuManager({ restaurantId }: { restaurantId?: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState('');
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    if (!restaurantId) return;
    const q = query(collection(db, 'restaurants', restaurantId, 'menuItems'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [restaurantId]);

  const getAiAdvice = async () => {
    if (!restaurantId || items.length === 0) {
      setAiError("Menu empty.");
      return;
    }
    setAiLoading(true);
    try {
      const advice = await optimizeMenuPrices(items.map(item => ({
        name: item.name,
        price: item.price,
        category: item.category
      })));
      setAiAdvice(advice);
      await updateDoc(doc(db, 'restaurants', restaurantId), { aiMenuAdvice: advice });
    } catch (e: any) {
      setAiError(e.message);
    } finally {
      setAiLoading(false);
    }
  };

  const addItem = async () => {
    if (!restaurantId) return;
    const name = prompt("Nom?") || 'Produit';
    const price = parseFloat(prompt("Prix?") || "10");
    await addDoc(collection(db, 'restaurants', restaurantId, 'menuItems'), {
      name, price, category: 'Menu', available: true, createdAt: serverTimestamp()
    });
  };

  const deleteItem = async (id: string) => {
    if (confirm("Delete?") && restaurantId) {
      await deleteDoc(doc(db, 'restaurants', restaurantId, 'menuItems', id));
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
      <div className="flex justify-between items-center bg-white p-10 rounded-[3rem] border border-slate-100">
         <h2 className="text-xl font-black italic uppercase tracking-tighter">Menu Management</h2>
         <div className="flex gap-4">
            <button onClick={getAiAdvice} className="flex items-center gap-2 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl">
               {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#ff385c]" />}
               <span className="text-xs font-bold uppercase italic tracking-widest">AI Audit</span>
            </button>
            <button onClick={addItem} className="px-6 py-4 bg-[#ff385c] text-white rounded-2xl">
               <Plus className="w-4 h-4" />
            </button>
         </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {items.map(item => (
          <div key={item.id} className="p-6 bg-white border border-slate-50 rounded-3xl flex justify-between items-center group shadow-sm hover:shadow-md transition-all">
             <div>
                <h4 className="font-black italic text-lg uppercase">{item.name}</h4>
                <p className="text-[#ff385c] font-black italic text-sm">€{item.price?.toFixed(2)}</p>
             </div>
             <button onClick={() => deleteItem(item.id)} className="p-3 bg-red-50 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-4 h-4" />
             </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

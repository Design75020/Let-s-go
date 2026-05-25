
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db, handleFirestoreError } from '../../../lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ClipboardList, CheckCircle } from 'lucide-react';

export default function OrderMonitor({ restaurantId }: { restaurantId?: string }) {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!restaurantId) return;
    const q = query(collection(db, 'orders'), where('restaurantId', '==', restaurantId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [restaurantId]);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const endpoint = status === 'accepted' ? `/api/orders/${orderId}/accept` : `/api/orders/${orderId}/ready`;
      const method = 'PATCH';

      await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (err) {
      console.error('Failed to update status canonical state', err);
    }
  };

  return (
    <div className="space-y-10">
      <h2 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 border-b border-slate-100 pb-6">Live Orders</h2>
      <div className="grid grid-cols-1 gap-6">
        {orders.map(order => {
          const rawStatus = order.status || '';
          const statusLower = rawStatus.toLowerCase();
          const isPending = statusLower === 'pending';
          const isAccepted = statusLower === 'accepted';
          
          return (
            <div key={order.id} className={`p-10 rounded-[3rem] border transition-all h-full ${isPending ? 'bg-[#ff385c]/5 border-[#ff385c]/20' : 'bg-white border-slate-50 shadow-sm'}`}>
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-black italic tracking-tighter uppercase">#{order.id.slice(-6)}</h3>
                 <span className="px-5 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">{rawStatus}</span>
              </div>
              <div className="mb-10 text-xs font-medium space-y-2 border-y border-slate-50 py-6">
                 {order.items?.map((it: any, i: number) => (
                   <div key={i} className="flex justify-between uppercase italic font-black">
                      <span className="text-slate-400">1x {it.name || it.id}</span>
                      <span className="text-slate-900">€{it.price ? Number(it.price).toFixed(2) : '0.00'}</span>
                   </div>
                 ))}
              </div>
              <div className="flex gap-4">
                 {isPending && (
                   <button onClick={() => updateStatus(order.id, 'accepted')} className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs">Accept</button>
                 )}
                 {isAccepted && (
                   <button onClick={() => updateStatus(order.id, 'ready')} className="flex-1 py-5 bg-emerald-500 text-white rounded-2xl font-black uppercase text-xs">Ready for pickup</button>
                 )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

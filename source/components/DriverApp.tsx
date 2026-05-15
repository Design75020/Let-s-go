import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Truck, MapPin, Navigation, CheckCircle, Package, Clock, LogOut, 
  Loader2, ShieldCheck, FileText, FileCheck, CreditCard, AlertTriangle,
  User, Wallet, Camera, ChevronRight 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError } from '../lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export default function DriverApp({ isEmbedded = false }: { isEmbedded?: boolean }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('missions');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Orders ready for pickup or already assigned to this driver
    const q = query(collection(db, 'orders'), where('status', 'in', ['ready', 'picked_up']));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });
    return () => unsubscribe();
  }, []);

  const acceptOrder = async (orderId: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'orders', orderId), {
      status: 'picked_up',
      driverId: user.uid,
      driverName: user.name,
      updatedAt: serverTimestamp()
    });
  };

  const deliverOrder = async (orderId: string) => {
    await updateDoc(doc(db, 'orders', orderId), {
      status: 'delivered',
      updatedAt: serverTimestamp()
    });
  };

  // Simulate Location Updates
  useEffect(() => {
    if (!user?.uid) return;
    const activeOrders = orders.filter(o => o.status === 'picked_up' && o.driverId === user.uid);
    if (activeOrders.length === 0) return;

    const interval = setInterval(async () => {
      const lat = 48.8566 + (Math.random() - 0.5) * 0.01;
      const lng = 2.3522 + (Math.random() - 0.5) * 0.01;

      for (const order of activeOrders) {
        await updateDoc(doc(db, 'orders', order.id), {
          driverLocation: { lat, lng }
        });
      }
      
      // Also update driver's current location in their profile for the heatmap
      await updateDoc(doc(db, 'users', user.uid), {
        'location.lat': lat,
        'location.lng': lng,
        'location.updatedAt': serverTimestamp()
      });

    }, 5000);

    return () => clearInterval(interval);
  }, [orders, user?.uid]);

  return (
    <div className={`min-h-screen ${isEmbedded ? 'bg-transparent' : 'bg-slate-50'} text-slate-900`}>
      {/* Mobile Top Bar */}
      {!isEmbedded && (
        <header className="fixed top-0 w-full z-40 bg-white/90 backdrop-blur-xl border-b border-slate-100 h-24 px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-black italic text-xl tracking-tighter uppercase leading-none">DRIVER_PORTAL</h1>
              <p className="text-[9px] font-black tracking-widest text-slate-300 mt-1 uppercase italic leading-none">LOGISTICS_KERNEL_v2.5</p>
            </div>
          </div>
          <button onClick={logout} className="p-4 bg-slate-50 rounded-2xl text-slate-400 hover:text-red-500 transition-all shadow-sm">
            <LogOut className="w-5 h-5" />
          </button>
        </header>
      )}

      {/* Bottom Nav */}
      {!isEmbedded && (
        <nav className="fixed bottom-6 left-6 right-6 z-50 bg-white/90 backdrop-blur-xl border border-slate-200 px-6 py-4 flex items-center justify-between rounded-[2rem] shadow-2xl">
          {[
            { id: 'missions', icon: Truck, label: 'Missions' },
            { id: 'wallet', icon: Wallet, label: 'Gains' },
            { id: 'kyc', icon: ShieldCheck, label: 'Documents' },
            { id: 'profile', icon: User, label: 'Profil' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`p-3 rounded-xl transition-all ${
                activeTab === item.id ? 'bg-[#ff385c] text-white' : 'text-slate-400'
              }`}
            >
              <item.icon className="w-6 h-6" />
            </button>
          ))}
        </nav>
      )}

      <main className={`${!isEmbedded ? 'pt-32' : ''} pb-32 px-6`}>
        <div className="max-w-md mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'missions' && (
              <motion.div key="missions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                {/* Status Card */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-emerald-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Navigation className="w-16 h-16 text-emerald-500" />
                  </div>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                      <span className="text-emerald-600 text-[10px] font-black tracking-widest uppercase italic">STATUT_LIVE</span>
                      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[9px] font-black text-emerald-600 uppercase">EN LIGNE</span>
                      </div>
                  </div>
                  <p className="text-xs text-slate-400 font-black italic uppercase leading-relaxed relative z-10">Recherche de missions à proximité...</p>
                </div>

                <div className="space-y-6">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-200">
                      <Loader2 className="w-10 h-10 animate-spin mb-6" />
                      <p className="text-[10px] font-black italic tracking-widest uppercase">Initialisation Dispatch...</p>
                    </div>
                  ) : (
                    <>
                      {orders.filter(o => o.status === 'ready').map((order) => (
                        <motion.div 
                          key={order.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden"
                        >
                          <div className="flex justify-between items-start mb-8">
                            <div>
                              <p className="text-[10px] font-black text-[#ff385c] tracking-widest mb-2 uppercase italic leading-none">NOUVELLE_MISSION</p>
                              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">{order.restaurantName}</h3>
                            </div>
                            <div className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
                              <p className="text-xl font-black italic text-slate-900 leading-none">€12.50</p>
                            </div>
                          </div>
                          <div className="space-y-4 mb-10">
                            <div className="flex items-start gap-4">
                              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-100 mt-1">
                                <MapPin className="w-4 h-4 text-[#ff385c]" />
                              </div>
                              <div>
                                <p className="text-[9px] font-black text-slate-300 uppercase leading-none mb-1">Pick up</p>
                                <span className="text-sm font-black italic text-slate-900 uppercase tracking-tight">{order.restaurantName}</span>
                              </div>
                            </div>
                            <div className="flex items-start gap-4">
                              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0 border border-slate-100 mt-1">
                                <Navigation className="w-4 h-4 text-slate-900" />
                              </div>
                              <div>
                                <p className="text-[9px] font-black text-slate-300 uppercase leading-none mb-1">Livraison</p>
                                <span className="text-sm font-black italic text-slate-900 uppercase tracking-tight">{order.clientName}</span>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => acceptOrder(order.id)}
                            className="w-full py-5 bg-slate-900 text-white font-black italic rounded-[1.5rem] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/10 uppercase text-xs tracking-widest"
                          >
                            ACCEPTER
                          </button>
                        </motion.div>
                      ))}

                      {orders.filter(o => o.status === 'picked_up' && o.driverId === user?.uid).map((order) => (
                        <motion.div 
                          key={order.id}
                          className="bg-emerald-50 p-10 rounded-[3rem] border border-emerald-200 relative overflow-hidden shadow-sm"
                        >
                          <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Package className="w-20 h-20 text-emerald-500 rotate-12" />
                          </div>
                          <p className="text-[10px] font-black text-emerald-600 tracking-widest mb-3 uppercase italic leading-none">ACTION_REQUISE</p>
                          <h3 className="text-2xl font-black italic uppercase text-emerald-900 tracking-tighter mb-8 leading-tight">Livraison vers {order.clientName}</h3>
                          
                          <button 
                            onClick={() => deliverOrder(order.id)}
                            className="w-full py-5 bg-emerald-600 text-white font-black italic rounded-[1.5rem] flex items-center justify-center gap-3 shadow-xl shadow-emerald-600/20 active:scale-95 transition-all uppercase text-xs tracking-widest"
                          >
                            <CheckCircle className="w-5 h-5" /> TERMINER_MISSION
                          </button>
                        </motion.div>
                      ))}

                      {orders.filter(o => o.status === 'ready' || (o.status === 'picked_up' && o.driverId === user?.uid)).length === 0 && (
                        <div className="p-24 text-center border-4 border-dashed border-slate-100 rounded-[3.5rem] bg-white/50">
                          <Package className="w-16 h-16 text-slate-100 mx-auto mb-8" />
                          <p className="text-slate-300 font-black italic uppercase text-[10px] tracking-widest leading-relaxed">Aucune mission disponible.</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'wallet' && <WalletView />}
            {activeTab === 'kyc' && <DriverKYC user={user} />}
            {activeTab === 'profile' && <ProfileView user={user} />}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function WalletView() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="p-10 bg-slate-900 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <Wallet className="w-32 h-32" />
        </div>
        <p className="text-[10px] font-black text-[#ff385c] tracking-widest uppercase mb-4 italic leading-none">WALLET_BALANCE</p>
        <h3 className="text-5xl font-black italic tracking-tighter mb-10 leading-none">€842.50</h3>
        <div className="flex gap-4">
          <button className="flex-1 py-4 bg-white text-slate-900 rounded-2xl font-black italic text-[10px] uppercase tracking-widest active:scale-95 transition-all">VIRER LES GAINS</button>
        </div>
      </div>
      <div className="space-y-4">
         <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-4 italic">Historique récent</h4>
         {[
           { date: '15 Mai', amount: '+€24.50', status: 'Payé' },
           { date: '14 Mai', amount: '+€18.20', status: 'Payé' },
           { date: '14 Mai', amount: '+€15.80', status: 'Payé' },
         ].map((tx, i) => (
           <div key={i} className="flex justify-between items-center p-6 bg-white border border-slate-100 rounded-3xl shadow-sm">
             <div>
               <p className="font-black italic text-slate-900 uppercase text-sm leading-none mb-1">{tx.date}</p>
               <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">{tx.status}</p>
             </div>
             <span className="text-lg font-black italic text-emerald-500">{tx.amount}</span>
           </div>
         ))}
      </div>
    </motion.div>
  );
}

function DriverKYC({ user }: { user: any }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      setProfile(snapshot.data());
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const updateKYC = async (field: string) => {
    const url = prompt(`URL pour ${field} ? (Simulé)`) || 'https://images.unsplash.com/photo-1554224155-169641357599?auto=format&fit=crop&q=80&w=200';
    if (!user?.uid) return;
    await updateDoc(doc(db, 'users', user.uid), {
      [`kyc.${field}`]: url,
      'kyc.status': 'pending',
      updatedAt: serverTimestamp()
    });
  };

  const docs = [
    { key: 'idCardUrl', label: 'Pièce d\'identité', icon: ShieldCheck },
    { key: 'driverLicenseUrl', label: 'Permis de conduire', icon: FileText },
    { key: 'registrationUrl', label: 'Carte Grise (Véhicule)', icon: FileCheck },
    { key: 'insuranceUrl', label: 'Assurance Professionnelle', icon: FileCheck },
    { key: 'selfieUrl', label: 'Selfie de Validation', icon: Camera },
  ];

  if (loading) return <div>Chargement...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex justify-between items-center border-b border-slate-100 pb-8">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">CONFORMITÉ</h2>
        <div className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${
          profile?.kyc?.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
        }`}>
          {profile?.kyc?.status || 'NON SOUMIS'}
        </div>
      </div>
      <div className="space-y-4">
        {docs.map((doc) => (
          <div key={doc.key} className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex items-center justify-between group h-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-[#ff385c]/10 transition-colors">
                <doc.icon className="w-5 h-5 text-slate-400 group-hover:text-[#ff385c] transition-colors" />
              </div>
              <div>
                <h3 className="text-sm font-black italic uppercase tracking-tight text-slate-900 leading-none mb-1">{doc.label}</h3>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">{profile?.kyc?.[doc.key] ? 'Document présent' : 'Document manquant'}</p>
              </div>
            </div>
            <button 
              onClick={() => updateKYC(doc.key)}
              className={`p-3 rounded-xl transition-all ${profile?.kyc?.[doc.key] ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-200 hover:bg-slate-50'}`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ProfileView({ user }: { user: any }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm text-center">
        <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-full mx-auto mb-6 flex items-center justify-center text-slate-200 text-3xl font-black italic">
          {user?.name?.[0] || 'D'}
        </div>
        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 mb-1">{user?.name}</h3>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">{user?.email}</p>
      </div>
      <div className="space-y-4">
        <button className="w-full p-6 bg-white border border-slate-100 rounded-3xl text-left flex items-center justify-between group">
           <span className="font-black italic text-slate-900 uppercase text-xs tracking-tight">Paramètres du compte</span>
           <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-slate-900" />
        </button>
        <button className="w-full p-6 bg-white border border-slate-100 rounded-3xl text-left flex items-center justify-between group">
           <span className="font-black italic text-slate-900 uppercase text-xs tracking-tight">Assistance 24/7</span>
           <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-slate-900" />
        </button>
      </div>
    </motion.div>
  );
}

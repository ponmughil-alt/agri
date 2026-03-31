'use client';

import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { offerService } from '@/services/offers';
import { orderService } from '@/services/orders';
import { motion, AnimatePresence } from 'framer-motion';
import { Handshake, Check, X, User, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FarmerOffersPage() {
  const { profile } = useAuth();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile) return;
    try {
      const data = await offerService.getForFarmer(profile.id);
      setOffers(data || []);
    } catch {
      toast.error('Failed to load offers');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (offer: any, action: 'accepted' | 'rejected') => {
    setProcessing(offer.id);
    try {
      await offerService.updateStatus(offer.id, action);
      if (action === 'accepted') {
        await orderService.createFromOffer(offer);
        toast.success('Offer accepted! Order created.');
      } else {
        toast.success('Offer rejected');
      }
      load();
    } catch (err: any) {
      toast.error(err.message ?? 'Action failed');
    } finally {
      setProcessing(null);
    }
  };

  const pending = offers.filter(o => o.status === 'pending');
  const decided = offers.filter(o => o.status !== 'pending');

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">Accepted</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-red-100 text-red-800 border border-red-200">Rejected</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-secondary text-muted-foreground border border-border">{status}</span>;
    }
  };

  return (
    <DashboardLayout allowedRoles={['farmer']}>
      <PageHeader
        title="Incoming Offers"
        subtitle={`${pending.length} pending, ${decided.length} decided`}
      />

      <div className="max-w-5xl">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : offers.length === 0 ? (
          <div className="premium-card rounded-xl p-16 text-center border-dashed border-2 bg-secondary/20">
            <Handshake size={48} className="text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Offers Yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">When buyers make offers on your crops, they will appear here for your review.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {pending.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={16} className="text-orange-600" />
                  <h2 className="text-sm font-semibold text-foreground">Action Required</h2>
                </div>
                <div className="space-y-3">
                  <AnimatePresence>
                    {pending.map((offer, i) => {
                      const clientName = offer.buyer?.full_name ?? offer.processor?.full_name ?? 'Unknown Client';
                      const clientType = offer.buyer_id ? 'Buyer' : 'Processor';
                      const isAboveAsking = offer.crop?.price_per_unit && offer.offer_price >= offer.crop.price_per_unit;
                      const priceDiffPercent = offer.crop?.price_per_unit 
                        ? Math.abs(Math.round((offer.offer_price - offer.crop.price_per_unit) / offer.crop.price_per_unit * 100))
                        : 0;

                      return (
                        <motion.div
                          key={offer.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ delay: i * 0.05 }}
                          className="premium-card bg-white border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 mt-1">
                                <User size={18} className="text-orange-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-foreground text-sm flex items-center gap-2">
                                    {clientName}
                                  </h3>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-medium border border-border">
                                    {clientType}
                                  </span>
                                </div>
                                
                                <p className="text-sm text-muted-foreground mb-2">
                                  Requested <span className="font-medium text-foreground">{offer.quantity} kg</span> of <span className="font-medium text-primary">{offer.crop?.name}</span>
                                </p>
                                
                                {offer.message && (
                                  <div className="bg-secondary/50 border border-border rounded-md p-3 text-sm text-muted-foreground/90 italic mb-3">
                                    "{offer.message}"
                                  </div>
                                )}
                                
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                                  <Clock size={12} /> Received {new Date(offer.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col sm:items-end gap-4 shrink-0 px-2 sm:px-0 border-t sm:border-0 border-border pt-4 sm:pt-0">
                              <div className="sm:text-right pt-4 sm:pt-0">
                                <p className="font-bold text-foreground text-xl sm:text-lg">₹{offer.offer_price}<span className="text-sm font-medium text-muted-foreground">/kg</span></p>
                                <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                                  Total: ₹{(offer.offer_price * offer.quantity).toLocaleString('en-IN')}
                                </p>
                                
                                {offer.crop?.price_per_unit && (
                                  <div className={`mt-2 inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-sm ${
                                    isAboveAsking ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                  }`}>
                                    {isAboveAsking ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    {priceDiffPercent}% {isAboveAsking ? 'above' : 'below'} asking price (₹{offer.crop.price_per_unit})
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex flex-col sm:flex-row items-center gap-2 mt-2 w-full sm:w-auto">
                                <button
                                  onClick={() => handleAction(offer, 'rejected')}
                                  disabled={processing === offer.id}
                                  className="w-full sm:w-none px-4 py-3 sm:py-2 border border-border bg-white text-muted-foreground rounded-xl sm:rounded-lg text-sm font-medium flex items-center justify-center gap-1.5"
                                >
                                  <X size={16} /> Reject
                                </button>
                                <button
                                  onClick={() => handleAction(offer, 'accepted')}
                                  disabled={processing === offer.id}
                                  className="w-full sm:w-none px-6 py-3 sm:py-2 bg-primary text-white rounded-xl sm:rounded-lg text-sm font-bold sm:font-semibold flex items-center justify-center gap-1.5"
                                >
                                  <Check size={16} /> Accept Offer
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </section>
            )}

            {decided.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">Archive</h2>
                <div className="bg-white border border-border shadow-sm rounded-xl overflow-hidden">
                    <ul className="divide-y divide-border">
                        {decided.map(offer => (
                            <li key={offer.id} className="p-4 hover:bg-secondary/30 transition-colors flex items-center justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-semibold text-foreground truncate">
                                            {offer.buyer?.full_name ?? offer.processor?.full_name}
                                        </p>
                                        <span className="text-xs text-muted-foreground">— {offer.crop?.name}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        <span className="font-medium text-foreground">{offer.quantity} kg</span> @ ₹{offer.offer_price}/kg 
                                        · Total: <span className="font-medium">₹{(offer.offer_price * offer.quantity).toLocaleString('en-IN')}</span>
                                    </p>
                                </div>
                                <div className="shrink-0 flex flex-col items-end gap-1.5">
                                    {getStatusBadge(offer.status)}
                                    <span className="text-[10px] text-muted-foreground/70">{new Date(offer.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

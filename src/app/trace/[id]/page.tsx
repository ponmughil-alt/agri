'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, CheckCircle, MapPin, Calendar, User, Factory, ShoppingBag, Printer, Link2 } from 'lucide-react';

const eventIcons: Record<string, React.ReactNode> = {
  CROP_LISTED: <span className="text-primary">🌾</span>,
  PROCESSING_STARTED: <span className="text-orange-400">🏭</span>,
  SOLD: <span className="text-blue-400">🛒</span>,
  DELIVERED: <span className="text-purple-400">📦</span>,
};

export default function TracePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [trace, setTrace] = useState<any>(null);
  const [crop, setCrop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      // Try crop_id first
      let { data: traceData } = await supabase
        .from('traceability_logs')
        .select('*')
        .eq('crop_id', params.id)
        .single();

      // Fallback: try qr_code match
      if (!traceData) {
        const { data } = await supabase
          .from('traceability_logs')
          .select('*')
          .eq('qr_code', params.id)
          .single();
        traceData = data;
      }

      if (!traceData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setTrace(traceData);

      // Fetch crop details
      if (traceData.crop_id) {
        const { data: cropData } = await supabase
          .from('crops')
          .select('*, farmer:profiles!farmer_id(full_name, location, phone)')
          .eq('id', traceData.crop_id)
          .single();
        setCrop(cropData);
      }

      setLoading(false);
    }
    load();
  }, [params.id]);

  const qrUrl = typeof window !== 'undefined' ? `${window.location.origin}/trace/${params.id}` : `https://agriqport.app/trace/${params.id}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-center px-4">
        <div className="premium-card p-12 max-w-sm">
          <div className="text-6xl mb-6">🔍</div>
          <h1 className="text-2xl font-black text-foreground font-display mb-3">Trace Not Found</h1>
          <p className="text-muted-foreground/80 font-medium mb-8">No traceability data found for this organizational ID.</p>
          <Link href="/" className="btn-primary w-full inline-block">← Back to Terminal</Link>
        </div>
      </div>
    );
  }

  const events: any[] = trace?.events ?? [];

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(qrUrl);
    toast.success('Traceability link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden py-20 px-4 print:bg-white print:py-0 print:p-0">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none print:hidden" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-emerald-400/5 blur-[120px] rounded-full pointer-events-none print:hidden" />

      <div className="max-w-3xl mx-auto relative z-10 print:max-w-full">
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12 print:hidden relative px-4 sm:px-0">
          <button 
            onClick={() => router.back()}
            className="hidden sm:flex absolute left-0 top-0 mt-4 items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          <div className="sm:hidden flex items-center justify-between mb-8">
            <button onClick={() => router.back()} className="p-2 rounded-full bg-secondary text-foreground">
               <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
               <TrendingUp size={20} className="text-primary" />
               <span className="text-lg font-black tracking-tighter">AgriOx</span>
            </div>
            <div className="w-10" />
          </div>

          <Link href="/" className="hidden sm:inline-flex items-center gap-3 mb-8 group">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <TrendingUp size={24} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-black text-foreground font-display leading-none">AgriOx</h1>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Value Chain Logic</p>
            </div>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground font-display tracking-tight mb-3">Product Traceability</h1>
          <p className="text-muted-foreground/80 font-semibold uppercase tracking-widest text-[10px] sm:text-xs">Immutable Supply Chain Journey</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 print:block">
           {/* QR Code Label (Print Target) */}
           <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-1 flex flex-col gap-4 print:block">
             <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative print:border-black print:border-solid print:shadow-none print:m-0 print:p-8 print:w-full print:rounded-none">
                
                {/* Print-Only Header */}
                <div className="hidden print:block mb-6 text-center w-full border-b-2 border-black pb-4">
                   <h1 className="text-3xl font-black text-black uppercase tracking-tighter">AgriOx Cargo Tag</h1>
                   <p className="text-[12px] font-bold text-gray-600 uppercase tracking-widest mt-1">Verifiable Origin Scan</p>
                </div>

                <div className="p-4 bg-white rounded-3xl shadow-sm border border-gray-100 mb-4 print:border-0 print:shadow-none print:p-0">
                  <QRCodeSVG
                    value={qrUrl}
                    size={180}
                    bgColor="transparent"
                    fgColor="#000000"
                    level="H"
                  />
                </div>
                
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest print:text-gray-500">Digital Fingerprint</p>
                <p className="text-xs font-bold text-primary mt-1 break-all px-4 font-mono print:text-black">{trace.qr_code}</p>

                {/* Print-Only Data Appendix */}
                {crop && (
                   <div className="hidden print:block w-full mt-8 pt-6 border-t-2 border-dashed border-gray-300 text-left">
                     <div className="flex justify-between items-end mb-6">
                       <div>
                         <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Commodity Profile</p>
                         <p className="text-2xl font-black text-black leading-none">{crop.name} <span className="text-sm font-bold text-gray-500 inline-block ml-2 border border-black px-2 py-0.5 rounded uppercase">Grade {crop.quality}</span></p>
                       </div>
                       <div className="text-right">
                         <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Stock Volume</p>
                         <p className="text-xl font-black text-black leading-none">{crop.quantity} {crop.unit}</p>
                       </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Origin Producer</p>
                          <p className="text-sm font-black text-black uppercase tracking-widest leading-tight">{crop.farmer?.full_name}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Loading Location</p>
                           <p className="text-sm font-black text-black uppercase tracking-widest leading-tight">{crop.farmer?.location || crop.location}</p>
                        </div>
                     </div>
                   </div>
                )}
             </div>

             {/* Action Utilities */}
             <div className="grid grid-cols-2 gap-3 print:hidden mt-2">
               <button onClick={handlePrint} className="bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors font-bold rounded-xl text-sm py-3.5 flex items-center justify-center gap-2 border border-primary/20">
                 <Printer size={16} /> Print Label
               </button>
               <button onClick={handleShare} className="bg-white border border-border text-foreground hover:bg-secondary font-bold rounded-xl text-sm py-3.5 flex items-center justify-center gap-2 shadow-sm">
                 <Link2 size={16} /> Copy Link
               </button>
             </div>
           </motion.div>

           {/* Crop Info Card */}
           {crop && (
             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-2 premium-card p-8 bg-white/80 backdrop-blur-xl print:hidden">
               <div className="flex items-start justify-between mb-8">
                 <div>
                   <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest bg-secondary text-primary border border-primary/10 mb-4 inline-block`}>Verified Production</span>
                   <h2 className="text-4xl font-black text-foreground font-display tracking-tighter leading-none mb-2">{crop.name}</h2>
                   <p className="text-muted-foreground/80 font-bold text-sm">Quality Grade: <span className="text-primary">{crop.quality}</span></p>
                 </div>
                 <CheckCircle size={32} className="text-primary" strokeWidth={2.5} />
               </div>

               <div className="grid grid-cols-2 gap-8 pt-6 border-t border-border">
                 <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Production Origin</p>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-primary" />
                        <span className="text-sm font-bold">{crop.farmer?.location || crop.location}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Lead Producer</p>
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-primary" />
                        <span className="text-sm font-bold">{crop.farmer?.full_name}</span>
                      </div>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Stock Volume</p>
                      <div className="flex items-center gap-2">
                        <ShoppingBag size={14} className="text-primary" />
                        <span className="text-sm font-bold">{crop.quantity} {crop.unit}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Market Price</p>
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-black text-xl leading-none">₹{crop.price_per_unit}/{crop.unit}</span>
                      </div>
                    </div>
                 </div>
               </div>
             </motion.div>
           )}
        </div>

        {/* Timeline */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="premium-card p-10 bg-white/90 print:hidden">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-xl font-black text-foreground font-display tracking-tight flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              Event Horizon Timeline
            </h3>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary px-3 py-1 rounded-full border border-border">Secure Ledger</span>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12 bg-secondary/50 rounded-3xl border border-dashed border-border text-muted-foreground/80 font-bold uppercase tracking-widest text-xs">
              Waiting for supply chain events...
            </div>
          ) : (
            <div className="relative pl-8">
              <div className="absolute left-[19px] top-0 bottom-0 w-[2px] bg-secondary" />
              <div className="space-y-12">
                {events.map((event: any, i: number) => {
                  const isLast = i === events.length - 1;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="relative group"
                    >
                      {/* Event Dot */}
                      <div className={`absolute left-[-27px] top-0 w-10 h-10 rounded-2xl bg-white border-2 flex items-center justify-center z-10 transition-all shadow-sm ${isLast ? 'border-primary ring-4 ring-primary/10' : 'border-border group-hover:border-primary/50'}`}>
                        {eventIcons[event.type] ?? <MapPin size={16} className="text-primary" />}
                      </div>
                      
                      <div className="bg-white/50 p-6 rounded-3xl border border-transparent hover:border-border hover:bg-white hover:shadow-premium transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-black text-foreground tracking-tight">{event.description}</h4>
                          <time className="text-[10px] font-black text-muted-foreground bg-secondary px-2 py-0.5 rounded-md uppercase tracking-wider">{new Date(event.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</time>
                        </div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                           <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                           {event.type}
                        </p>
                        {event.metadata?.price && (
                          <p className="text-xs font-bold text-muted-foreground mt-3 pt-3 border-t border-border">Transaction Detail: <span className="text-foreground">₹{event.metadata.price}/kg</span></p>
                        )}
                        {event.metadata?.location && (
                          <p className="text-xs font-bold text-muted-foreground mt-1">Verification Node: <span className="text-foreground">{event.metadata.location}</span></p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}

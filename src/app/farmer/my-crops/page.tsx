'use client';

import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { cropService } from '@/services/crops';
import { motion } from 'framer-motion';
import { Sprout, Trash2, Plus, CalendarDays, MapPin, QrCode } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { Crop } from '@/lib/types';

export default function MyCropsPage() {
  const { profile } = useAuth();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile) return;
    try {
      const data = await cropService.getByFarmer(profile.id);
      setCrops((data || []) as Crop[]);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from your inventory?`)) return;
    try {
      await cropService.delete(id);
      toast.success(`${name} removed successfully`);
      load();
    } catch {
      toast.error('Failed to delete crop');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">Available</span>;
      case 'sold':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-600 border border-slate-200">Sold Out</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">{status}</span>;
    }
  };

  return (
    <DashboardLayout allowedRoles={['farmer']}>
      <PageHeader
        title="My Crops"
        subtitle="Manage your inventory and track active market listings"
        action={
          <Link href="/farmer/add-crop" className="btn-primary flex items-center gap-2 text-sm shadow-sm py-2 px-4 rounded-lg font-medium">
            <Plus size={16} /> Add Listing
          </Link>
        }
      />

      <div className="max-w-6xl">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : crops.length === 0 ? (
          <div className="premium-card rounded-xl p-16 text-center border-dashed border-2 bg-secondary/20">
            <Sprout size={48} className="text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No active listings</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">Your inventory is empty. Start by listing your fresh produce to reach potential buyers.</p>
            <Link href="/farmer/add-crop" className="btn-primary inline-flex items-center gap-2 text-sm py-2 px-4 rounded-md shadow-sm">
              <Plus size={16} /> Create First Listing
            </Link>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="premium-card bg-white border border-border rounded-xl shadow-sm overflow-hidden"
          >
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-secondary/40">
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Crop Details</th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Inventory</th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pricing</th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {crops.map((crop, i) => (
                    <tr key={crop.id} className="hover:bg-secondary/30 transition-colors group">
                      <td className="px-5 py-4 align-top">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100 shrink-0">
                            <Sprout size={18} className="text-emerald-700" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-foreground text-sm">{crop.name}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-medium border border-border">
                                {crop.quality}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
                              <span className="flex items-center gap-1"><MapPin size={12} /> {crop.location}</span>
                              {crop.harvest_date && (
                                <span className="flex items-center gap-1"><CalendarDays size={12} /> {new Date(crop.harvest_date).toLocaleDateString('en-IN')}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <div className="text-sm font-medium text-foreground">{crop.quantity.toLocaleString('en-IN')}</div>
                        <div className="text-xs text-muted-foreground">{crop.unit}s available</div>
                      </td>
                      <td className="px-5 py-4 align-top">
                        <div className="text-sm font-semibold text-foreground">₹{crop.price_per_unit}/<span className="text-xs font-normal text-muted-foreground">{crop.unit}</span></div>
                        <div className="text-xs font-medium text-muted-foreground mt-0.5">Est. Total: ₹{(crop.price_per_unit * crop.quantity).toLocaleString('en-IN')}</div>
                      </td>
                      <td className="px-5 py-4 align-top">
                        {getStatusBadge(crop.status)}
                      </td>
                      <td className="px-5 py-4 align-top">
                        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <Link
                                href={`/trace/${crop.id}`}
                                className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-md hover:bg-primary/5"
                                title="Print Cargo Tag"
                            >
                                <QrCode size={16} />
                            </Link>
                            <button
                                onClick={() => handleDelete(crop.id, crop.name)}
                                className="text-muted-foreground hover:text-red-600 transition-colors p-2 rounded-md hover:bg-red-50"
                                title="Delete Listing"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-border">
              {crops.map((crop) => (
                <div key={crop.id} className="p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shrink-0">
                        <Sprout size={18} className="text-emerald-700" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground leading-tight">{crop.name}</h4>
                        <p className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground mt-0.5">{crop.quality}</p>
                      </div>
                    </div>
                    {getStatusBadge(crop.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-4 gap-x-2 py-4 border-y border-border/50">
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Available</p>
                      <p className="text-sm font-bold text-foreground">{crop.quantity.toLocaleString('en-IN')} {crop.unit}s</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Unit Price</p>
                      <p className="text-sm font-bold text-foreground">₹{crop.price_per_unit}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Location</p>
                      <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><MapPin size={10} /> {crop.location}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Value</p>
                      <p className="text-sm font-black text-primary">₹{(crop.price_per_unit * crop.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/trace/${crop.id}`}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20"
                    >
                      <QrCode size={14} /> View Cargo Tag
                    </Link>
                    <button
                      onClick={() => handleDelete(crop.id, crop.name)}
                      className="w-12 h-11 flex items-center justify-center rounded-xl border border-border text-red-500 bg-red-50/50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="px-5 py-3 border-t border-border bg-secondary/20 flex items-center justify-between text-xs text-muted-foreground">
              <span>Showing {crops.length} listing{crops.length !== 1 && 's'}</span>
              <span>Need help? Contact support</span>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}

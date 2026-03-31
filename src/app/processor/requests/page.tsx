'use client';

import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { processingService } from '@/services/processing';
import { motion } from 'framer-motion';
import { Factory, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const statusFlow = ['pending', 'approved', 'completed'];
const statusColors: Record<string, string> = {
  pending: 'badge-pending',
  approved: 'badge-approved',
  rejected: 'badge-rejected',
  completed: 'badge-completed',
};

export default function ProcessorRequestsPage() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile) return;
    const data = await processingService.getByProcessor(profile.id);
    setRequests(data || []);
    setLoading(false);
  }, [profile]);

  useEffect(() => { load(); }, [load]);

  return (
    <DashboardLayout allowedRoles={['processor']}>
      <PageHeader title="My Requests" subtitle="Processing requests you've sent to farmers" />

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="spinner" /></div>
      ) : requests.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <Factory size={48} className="text-orange-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-white mb-2 font-display">No Requests Yet</h3>
          <p className="text-muted-foreground">Browse crops and send processing requests to farmers.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req, i) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 rounded-2xl"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-900/30 flex items-center justify-center text-2xl">🏭</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{req.processing_type}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[req.status]}`}>{req.status}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {req.crop?.name} · {req.quantity} kg · Farmer: {req.crop?.farmer?.full_name ?? 'Unknown'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Proposed: <span className="text-primary font-medium">₹{req.proposed_price}/kg</span>
                      {req.expected_output && ` · Output: ${req.expected_output}`}
                    </p>
                    {req.message && <p className="text-xs text-muted-foreground/80 italic mt-1">"{req.message}"</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-foreground font-bold">₹{(req.proposed_price * req.quantity).toLocaleString('en-IN')}</p>
                  <p className="text-xs text-muted-foreground/80">Total value</p>
                  <p className="text-xs text-muted-foreground/80 mt-1">{new Date(req.created_at).toLocaleDateString('en-IN')}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

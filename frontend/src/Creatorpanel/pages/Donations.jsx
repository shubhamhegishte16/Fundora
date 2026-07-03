import React, { useState, useEffect } from 'react';
import { Icon } from '../icons.jsx';
import Card from '../components/ui/Card.jsx';
import Pill from '../components/ui/Pill.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import { getMyDonations } from '../../../services/donationService.js';

const STATUS_TINT = { completed: 'emerald', pending: 'amber', refunded: 'rose' };
const STATUS_LABEL = { completed: 'Completed', pending: 'Pending', refunded: 'Refunded' };

export default function Donations() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [donations, setDonations] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await getMyDonations();
        if (isMounted) {
          setDonations(data.donations || []);
          setSummary(data.summary || null);
        }
      } catch (err) {
        if (isMounted) setError('Could not load donations. Please try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const filtered = statusFilter === 'all' ? donations : donations.filter((d) => d.status === statusFilter);

  const summaryCards = summary
    ? [
        { id: 'total', label: 'Total Received', value: `₹${summary.totalReceived.toLocaleString('en-IN')}`, icon: 'HeartHand' },
        { id: 'count', label: 'Total Donations', value: String(summary.totalDonations), icon: 'Coins' },
        { id: 'avg', label: 'Average Donation', value: `₹${summary.averageDonation.toLocaleString('en-IN')}`, icon: 'TrendingUp' },
      ]
    : [];

  return (
    <>
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {summaryCards.map((s) => {
            const SIcon = Icon[s.icon];
            return (
              <div key={s.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                  <SIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">{s.label}</p>
                  <p className="text-lg font-bold text-slate-900">{s.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Card padded={false}>
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-bold text-slate-900">All Donations</h2>
          <div className="flex gap-2">
            {['all', 'completed', 'pending', 'refunded'].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  statusFilter === f ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f === 'all' ? 'All' : STATUS_LABEL[f]}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <p className="border-t border-slate-100 px-5 py-10 text-center text-sm font-medium text-slate-500">Loading donations…</p>
        )}

        {!loading && error && (
          <p className="border-t border-slate-100 px-5 py-10 text-center text-sm font-medium text-rose-500">{error}</p>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="border-t border-slate-100 px-5 py-10 text-center text-sm font-medium text-slate-500">No donations in this category yet.</p>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="overflow-x-auto border-t border-slate-100">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-medium text-slate-500">
                  <th className="px-5 py-3">Donor</th>
                  <th className="px-5 py-3">Campaign</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={d.name} size="sm" />
                        <span className="font-medium text-slate-900">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{d.campaign}</td>
                    <td className="px-5 py-3 text-slate-500">{d.date}</td>
                    <td className="px-5 py-3"><Pill tint={STATUS_TINT[d.status]}>{STATUS_LABEL[d.status]}</Pill></td>
                    <td className="px-5 py-3 text-right font-semibold text-slate-900">₹{d.amount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

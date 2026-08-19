import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Pause, 
  Play, 
  Plus, 
  Sparkles,
  CreditCard,
  Calendar,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import { Subscription, CurrencyCode, SubscriptionCategory } from '../types';
import { formatCurrency, getMonthlyEquivalent } from '../utils/currency';
import { getDaysUntil, formatFriendlyDate } from '../utils/dateUtils';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  preferredCurrency: CurrencyCode;
  onEdit: (sub: Subscription) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (sub: Subscription) => void;
  onAddNew: () => void;
}

export const SubscriptionList: React.FC<SubscriptionListProps> = ({
  subscriptions,
  preferredCurrency,
  onEdit,
  onDelete,
  onToggleStatus,
  onAddNew,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'renewal' | 'cost' | 'name'>('renewal');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Unique categories in dataset
  const categories = useMemo(() => {
    const set = new Set<string>();
    subscriptions.forEach((s) => set.add(s.category));
    return ['All', ...Array.from(set)];
  }, [subscriptions]);

  // Filtered & Sorted Subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions
      .filter((sub) => {
        // Search filter
        const matchSearch =
          sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sub.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sub.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase());

        // Category filter
        const matchCategory = selectedCategory === 'All' || sub.category === selectedCategory;

        // Status filter
        const matchStatus =
          selectedStatus === 'All'
            ? true
            : selectedStatus === 'Trial'
            ? sub.isFreeTrial || sub.status === 'trial'
            : sub.status === selectedStatus.toLowerCase();

        return matchSearch && matchCategory && matchStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'renewal') {
          return getDaysUntil(a.nextRenewalDate) - getDaysUntil(b.nextRenewalDate);
        }
        if (sortBy === 'cost') {
          const costA = getMonthlyEquivalent(a.cost, a.billingCycle, a.currency, preferredCurrency);
          const costB = getMonthlyEquivalent(b.cost, b.billingCycle, b.currency, preferredCurrency);
          return costB - costA;
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [subscriptions, searchQuery, selectedCategory, selectedStatus, sortBy, preferredCurrency]);

  return (
    <div id="subscriptions-container" className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
      {/* Controls & Filter Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Subscriptions Engine</h2>
            <p className="text-xs text-slate-500">
              Managing {subscriptions.length} active and monitored services
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Table View"
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onAddNew}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Service</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3 items-center">
          {/* Search Box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-subscriptions"
              type="text"
              placeholder="Search by service name, payment method..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Status Tabs */}
          <div className="md:col-span-4 flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs overflow-x-auto scrollbar-none">
            {['All', 'Active', 'Trial', 'Paused'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 sm:px-3 py-1 rounded-md font-medium transition-colors shrink-0 ${
                  selectedStatus === st
                    ? 'bg-white text-blue-700 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Sort & Category Dropdowns */}
          <div className="md:col-span-3 flex items-center space-x-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-1/2 py-2 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-1/2 py-2 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="renewal">Next Renewal</option>
              <option value="cost">Highest Cost</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscriptions Content: Table or Grid */}
      {filteredSubscriptions.length === 0 ? (
        <div className="p-12 text-center text-slate-400 space-y-2">
          <p className="text-sm font-semibold text-slate-700">No subscriptions matching your filters.</p>
          <p className="text-xs text-slate-500">Try changing your search term or category selector.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View with responsive scrolling */
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[680px]">
            <thead className="bg-slate-50 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-4 sm:px-6 py-3.5 font-semibold">Service</th>
                <th className="px-4 sm:px-6 py-3.5 font-semibold">Category</th>
                <th className="px-4 sm:px-6 py-3.5 font-semibold">Cycle & Method</th>
                <th className="px-4 sm:px-6 py-3.5 font-semibold">Amount</th>
                <th className="px-4 sm:px-6 py-3.5 font-semibold">Next Renewal</th>
                <th className="px-4 sm:px-6 py-3.5 font-semibold">Status</th>
                <th className="px-4 sm:px-6 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredSubscriptions.map((sub) => {
                const daysLeft = getDaysUntil(sub.nextRenewalDate);
                const isUrgent = daysLeft <= 3 && daysLeft >= 0;
                const monthlyEq = getMonthlyEquivalent(
                  sub.cost,
                  sub.billingCycle,
                  sub.currency,
                  preferredCurrency
                );

                return (
                  <tr
                    key={sub.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onEdit(sub)}
                  >
                    {/* Brand / Name */}
                    <td className="px-4 sm:px-6 py-3.5 sm:py-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm text-white shrink-0 shadow-2xs"
                          style={{ backgroundColor: sub.color || '#3B82F6' }}
                        >
                          {sub.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-xs sm:text-sm flex items-center space-x-1.5">
                            <span>{sub.name}</span>
                            {sub.cancelUrl && (
                              <a
                                href={sub.cancelUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-slate-400 hover:text-blue-600 transition-colors"
                                title="Open cancellation page"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          {sub.notes && (
                            <p className="text-[11px] text-slate-400 truncate max-w-[140px] sm:max-w-[180px]">
                              {sub.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 sm:px-6 py-3.5 sm:py-4">
                      <span className="inline-block px-2 sm:px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/70">
                        {sub.category}
                      </span>
                    </td>

                    {/* Cycle & Payment Method */}
                    <td className="px-4 sm:px-6 py-3.5 sm:py-4">
                      <div className="text-slate-800 font-medium capitalize">{sub.billingCycle}</div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                        <CreditCard className="w-3 h-3" />
                        <span className="truncate max-w-[110px]">{sub.paymentMethod}</span>
                      </div>
                    </td>

                    {/* Cost & Monthly Equivalent */}
                    <td className="px-4 sm:px-6 py-3.5 sm:py-4">
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                        {formatCurrency(sub.cost, sub.currency)}
                      </div>
                      {sub.currency !== preferredCurrency && (
                        <div className="text-[11px] text-slate-500 font-normal">
                          ≈ {formatCurrency(monthlyEq, preferredCurrency)}/mo
                        </div>
                      )}
                    </td>

                    {/* Next Renewal */}
                    <td className="px-4 sm:px-6 py-3.5 sm:py-4">
                      <div className="text-slate-800 font-medium">
                        {formatFriendlyDate(sub.nextRenewalDate)}
                      </div>
                      <div
                        className={`text-[11px] font-semibold mt-0.5 ${
                          isUrgent ? 'text-amber-700' : 'text-slate-400'
                        }`}
                      >
                        {daysLeft < 0
                          ? `Overdue (${Math.abs(daysLeft)}d)`
                          : daysLeft === 0
                          ? 'Renews Today'
                          : daysLeft === 1
                          ? 'Renews Tomorrow'
                          : `In ${daysLeft} days`}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 sm:px-6 py-3.5 sm:py-4">
                      {sub.isFreeTrial || sub.status === 'trial' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Trial
                        </span>
                      ) : sub.status === 'active' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          Paused
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 sm:px-6 py-3.5 sm:py-4 text-right">
                      <div
                        className="flex items-center justify-end space-x-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => onToggleStatus(sub)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title={sub.status === 'paused' ? 'Resume service' : 'Pause service'}
                        >
                          {sub.status === 'paused' ? (
                            <Play className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Pause className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => onEdit(sub)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit subscription"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(sub.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete subscription"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid Card View */
        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredSubscriptions.map((sub) => {
            const daysLeft = getDaysUntil(sub.nextRenewalDate);
            const isUrgent = daysLeft <= 3 && daysLeft >= 0;

            return (
              <div
                key={sub.id}
                onClick={() => onEdit(sub)}
                className="bg-white border border-slate-200/90 rounded-xl p-4 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-2xs shrink-0 text-sm"
                        style={{ backgroundColor: sub.color || '#3B82F6' }}
                      >
                        {sub.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">{sub.name}</h4>
                        <span className="text-[11px] text-slate-500">{sub.category}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                        sub.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : sub.isFreeTrial || sub.status === 'trial'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {sub.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-lg sm:text-xl font-bold text-slate-900">
                        {formatCurrency(sub.cost, sub.currency)}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">/{sub.billingCycle}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-700 font-medium">
                        {formatFriendlyDate(sub.nextRenewalDate)}
                      </div>
                      <div
                        className={`text-[11px] font-semibold ${
                          isUrgent ? 'text-amber-700' : 'text-slate-400'
                        }`}
                      >
                        {daysLeft < 0 ? `Overdue (${Math.abs(daysLeft)}d)` : `In ${daysLeft} days`}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-xs text-slate-500 truncate max-w-[140px]">{sub.paymentMethod}</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onToggleStatus(sub)}
                      className="p-1.5 rounded text-slate-400 hover:text-slate-700"
                    >
                      {sub.status === 'paused' ? (
                        <Play className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Pause className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => onEdit(sub)}
                      className="p-1.5 rounded text-slate-400 hover:text-blue-600"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(sub.id)}
                      className="p-1.5 rounded text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Subscription, CurrencyCode } from '../types';
import { formatCurrency, convertCurrency } from '../utils/currency';
import { getDaysUntil, formatFriendlyDate } from '../utils/dateUtils';

interface RenewalCalendarProps {
  subscriptions: Subscription[];
  preferredCurrency: CurrencyCode;
  onEditSubscription: (sub: Subscription) => void;
}

export const RenewalCalendar: React.FC<RenewalCalendarProps> = ({
  subscriptions,
  preferredCurrency,
  onEditSubscription,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'timeline' | 'matrix'>('timeline');
  const [selectedDaySubs, setSelectedDaySubs] = useState<{ day: number; dateStr: string; subs: Subscription[] } | null>(null);

  // Filter active subs
  const activeSubs = subscriptions.filter((s) => s.status === 'active' || s.status === 'trial');

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDaySubs(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDaySubs(null);
  };

  // Sort upcoming renewals
  const sortedUpcoming = [...activeSubs].sort((a, b) => {
    return getDaysUntil(a.nextRenewalDate) - getDaysUntil(b.nextRenewalDate);
  });

  return (
    <div id="renewal-calendar-section" className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-900">Upcoming Renewal Schedule</h3>
            <p className="text-[11px] sm:text-xs text-slate-500">Automated 3-day notifications and billing timeline</p>
          </div>
        </div>

        {/* View mode toggle & month controls */}
        <div className="flex items-center justify-between sm:justify-end space-x-2 w-full sm:w-auto">
          <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'matrix'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Grid View
            </button>
          </div>

          {viewMode === 'matrix' && (
            <div className="flex items-center space-x-1">
              <button
                onClick={handlePrevMonth}
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-800 px-1 sm:px-2 whitespace-nowrap">
                {monthNames[month].slice(0, 3)} {year}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="space-y-3">
          {sortedUpcoming.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No upcoming renewals found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sortedUpcoming.map((sub) => {
                const daysLeft = getDaysUntil(sub.nextRenewalDate);
                const isUrgent = daysLeft <= 3 && daysLeft >= 0;
                const isPast = daysLeft < 0;
                const convertedCost = convertCurrency(sub.cost, sub.currency, preferredCurrency);

                return (
                  <div
                    key={sub.id}
                    onClick={() => onEditSubscription(sub)}
                    className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between hover:shadow-xs min-h-[100px] ${
                      isUrgent
                        ? 'bg-amber-50/70 border-amber-200 hover:border-amber-300'
                        : 'bg-slate-50/60 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate mr-1">{sub.name}</span>
                        <span
                          className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md shrink-0 ${
                            isUrgent
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : isPast
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-white text-slate-600 border border-slate-200'
                          }`}
                        >
                          {daysLeft < 0
                            ? `Overdue (${Math.abs(daysLeft)}d)`
                            : daysLeft === 0
                            ? 'Renews Today'
                            : daysLeft === 1
                            ? 'Tomorrow'
                            : `In ${daysLeft}d`}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5 text-[11px] sm:text-xs text-slate-500 mt-1">
                        <span>{formatFriendlyDate(sub.nextRenewalDate)}</span>
                        <span>•</span>
                        <span className="capitalize">{sub.billingCycle}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium truncate max-w-[120px]">{sub.paymentMethod}</span>
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {formatCurrency(convertedCost, preferredCurrency)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Calendar Matrix View */}
      {viewMode === 'matrix' && (
        <div className="space-y-3">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] sm:text-xs font-bold text-slate-400 py-1">
            <div><span className="sm:hidden">S</span><span className="hidden sm:inline">Sun</span></div>
            <div><span className="sm:hidden">M</span><span className="hidden sm:inline">Mon</span></div>
            <div><span className="sm:hidden">T</span><span className="hidden sm:inline">Tue</span></div>
            <div><span className="sm:hidden">W</span><span className="hidden sm:inline">Wed</span></div>
            <div><span className="sm:hidden">T</span><span className="hidden sm:inline">Thu</span></div>
            <div><span className="sm:hidden">F</span><span className="hidden sm:inline">Fri</span></div>
            <div><span className="sm:hidden">S</span><span className="hidden sm:inline">Sat</span></div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Blank offset days */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`blank-${i}`} className="h-12 sm:h-20 bg-slate-50/40 rounded-lg p-1 border border-transparent" />
            ))}

            {/* Active days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              
              const daySubs = activeSubs.filter((s) => {
                const subDate = new Date(s.nextRenewalDate);
                return subDate.getDate() === dayNum;
              });

              const isToday =
                new Date().getDate() === dayNum &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => {
                    if (daySubs.length > 0) {
                      setSelectedDaySubs({ day: dayNum, dateStr, subs: daySubs });
                    }
                  }}
                  className={`h-12 sm:h-20 rounded-lg p-1 sm:p-1.5 border transition-all flex flex-col justify-between overflow-hidden cursor-pointer ${
                    isToday
                      ? 'bg-blue-50/70 border-blue-300'
                      : daySubs.length > 0
                      ? 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                      : 'bg-white border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] sm:text-xs font-bold ${
                        isToday ? 'text-blue-600 bg-blue-100 px-1 py-0.5 rounded' : 'text-slate-500'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {daySubs.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 sm:hidden" />
                    )}
                  </div>

                  {/* Desktop view: Sub names inside cells */}
                  <div className="hidden sm:block space-y-1 overflow-y-auto max-h-12">
                    {daySubs.map((s) => (
                      <div
                        key={s.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditSubscription(s);
                        }}
                        className="text-[10px] bg-slate-100 hover:bg-blue-100 text-slate-800 hover:text-blue-800 px-1 py-0.5 rounded truncate font-medium border border-slate-200/60"
                        title={`${s.name} (${formatCurrency(s.cost, s.currency)})`}
                      >
                        {s.name}
                      </div>
                    ))}
                  </div>

                  {/* Mobile view: badge count */}
                  {daySubs.length > 0 && (
                    <div className="sm:hidden text-[9px] font-bold text-blue-700 bg-blue-50 rounded px-1 text-center truncate">
                      {daySubs.length} sub{daySubs.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected Day Popover (Useful on Mobile) */}
          {selectedDaySubs && (
            <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs font-bold text-blue-950">
                <span>Renewals on {monthNames[month]} {selectedDaySubs.day}:</span>
                <button
                  onClick={() => setSelectedDaySubs(null)}
                  className="text-blue-600 hover:text-blue-800 text-[11px]"
                >
                  Close
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedDaySubs.subs.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onEditSubscription(s)}
                    className="px-2.5 py-1 bg-white border border-blue-200 rounded-lg text-xs font-semibold text-slate-800 hover:bg-blue-100 flex items-center space-x-1.5 shadow-2xs"
                  >
                    <span>{s.name}</span>
                    <span className="text-slate-500 font-normal">({formatCurrency(s.cost, s.currency)})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

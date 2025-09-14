// src/components/pages/BookingPage.tsx
import React from 'react';
import { Calendar, Clock, MessageCircle, Plus, BarChart3 } from 'lucide-react';
import { darkTheme } from '../../lib/theme';
import { Booking } from '@lifex/shared';

interface BookingPageProps {
  bookings: Booking[];
  setBookings: (bookings: Booking[]) => void;
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  onNavigateToChat: () => void;
}

const BookingPage: React.FC<BookingPageProps> = ({
  bookings,
  setBookings,
  selectedFilter,
  setSelectedFilter,
  onNavigateToChat
}) => {
  
  const getFilteredBookings = () => {
    if (selectedFilter === 'All Bookings') return bookings;
    if (selectedFilter === 'Upcoming') return bookings.filter((b: any) => b.status === 'confirmed' || b.status === 'pending');
    if (selectedFilter === 'Completed') return bookings.filter((b: any) => b.status === 'confirmed');
    if (selectedFilter === 'Cancelled') return bookings.filter((b: any) => b.status === 'cancelled');
    return bookings;
  };

  const handleReminderToggle = (bookingId: number) => {
    setBookings(bookings.map((booking: any) => 
      booking.id === bookingId 
        ? { ...booking, reminder: !booking.reminder }
        : booking
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { bg: `${darkTheme.neon.green}20`, color: darkTheme.neon.green, border: `${darkTheme.neon.green}40` };
      case 'pending':
        return { bg: `${darkTheme.neon.yellow}20`, color: darkTheme.neon.yellow, border: `${darkTheme.neon.yellow}40` };
      case 'cancelled':
        return { bg: `${darkTheme.neon.red}20`, color: darkTheme.neon.red, border: `${darkTheme.neon.red}40` };
      default:
        return { bg: `${darkTheme.neon.blue}20`, color: darkTheme.neon.blue, border: `${darkTheme.neon.blue}40` };
    }
  };

  return (
    <div className="h-full overflow-y-auto" style={{ background: darkTheme.background.primary, WebkitOverflowScrolling: 'touch' }}>
      <div className="relative px-4 md:px-6 lg:px-8 pt-6 md:pt-8 pb-8 overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2" style={{ color: darkTheme.text.primary }}>
                My Bookings
              </h2>
              <p className="text-sm md:text-base" style={{ color: darkTheme.text.secondary }}>
                Manage your appointments and services
              </p>
            </div>
            <button 
              className="p-2 md:p-3 rounded-lg border"
              style={{
                background: darkTheme.background.card,
                borderColor: darkTheme.background.glass,
              }}
            >
              <Calendar size={16} className="md:w-5 md:h-5" style={{ color: darkTheme.neon.purple }} />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 md:gap-3 text-sm mb-6 md:mb-8 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {[
              { label: "All Bookings", active: selectedFilter === 'All Bookings' },
              { label: "Upcoming", active: selectedFilter === 'Upcoming' },
              { label: "Completed", active: selectedFilter === 'Completed' },
              { label: "Cancelled", active: selectedFilter === 'Cancelled' }
            ].map((tab: any, idx: any) => (
              <button
                key={idx}
                onClick={() => setSelectedFilter(tab.label)}
                className="px-3 md:px-4 py-2 rounded-full transition-all whitespace-nowrap flex-shrink-0 text-xs md:text-sm w-20 md:w-24"
                style={{
                  background: tab.active ? darkTheme.neon.purple : darkTheme.background.card,
                  borderColor: tab.active ? darkTheme.neon.purple : darkTheme.background.glass,
                  color: tab.active ? 'white' : darkTheme.text.primary,
                  border: '1px solid',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Bookings List */}
            <div className="lg:col-span-2">
              <div className="space-y-4 mb-6 md:mb-8">
                {getFilteredBookings().map((booking) => {
                  const statusStyle = getStatusColor(booking.status);
                  return (
                    <div 
                      key={booking.id}
                      className="p-4 md:p-5 rounded-xl border"
                      style={{
                        background: darkTheme.background.card,
                        borderColor: darkTheme.background.glass,
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm md:text-base mb-1 truncate" style={{ color: darkTheme.text.primary }}>
                            {booking.service}
                          </h4>
                          <p className="text-sm md:text-base mb-2" style={{ color: darkTheme.text.secondary }}>
                            {booking.provider}
                          </p>
                          <div className="flex items-center gap-4 text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>
                            <div className="flex items-center gap-1">
                              <Calendar size={12} className="md:w-4 md:h-4" />
                              <span>{new Date(booking.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={12} className="md:w-4 md:h-4" />
                              <span>{booking.time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <div 
                            className="px-2 md:px-3 py-1 rounded-full text-xs font-medium mb-2"
                            style={{
                              background: statusStyle.bg,
                              color: statusStyle.color,
                              border: `1px solid ${statusStyle.border}`
                            }}
                          >
                            {booking.status}
                          </div>
                          <p className="font-semibold text-sm md:text-base" style={{ color: darkTheme.text.primary }}>
                            {booking.price}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: darkTheme.background.glass }}>
                        <label className="flex items-center gap-2 text-xs md:text-sm">
                          <input 
                            type="checkbox" 
                            checked={booking.reminder}
                            onChange={() => handleReminderToggle(booking.id)}
                            className="rounded"
                            style={{ accentColor: darkTheme.neon.purple }}
                          />
                          <span style={{ color: darkTheme.text.muted }}>Remind me</span>
                        </label>
                        <div className="flex gap-2">
                          <button 
                            className="px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm font-medium transition-all"
                            style={{ background: darkTheme.neon.blue, color: 'white' }}
                          >
                            Reschedule
                          </button>
                          <button 
                            className="px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm font-medium transition-all"
                            style={{ 
                              background: 'transparent',
                              color: darkTheme.neon.red,
                              border: `1px solid ${darkTheme.neon.red}40`
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {getFilteredBookings().length === 0 && (
                  <div 
                    className="p-6 md:p-8 rounded-xl border text-center"
                    style={{
                      background: darkTheme.background.card,
                      borderColor: darkTheme.background.glass,
                    }}
                  >
                    <Calendar className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4" style={{ color: darkTheme.text.muted }} />
                    <h3 className="font-medium text-base md:text-lg mb-2" style={{ color: darkTheme.text.primary }}>
                      No bookings found
                    </h3>
                    <p className="text-sm md:text-base mb-4" style={{ color: darkTheme.text.secondary }}>
                      {selectedFilter === 'All Bookings' 
                        ? "You haven't made any bookings yet." 
                        : `No ${selectedFilter.toLowerCase()} bookings.`
                      }
                    </p>
                    <button 
                      onClick={onNavigateToChat}
                      className="px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-all text-sm md:text-base"
                      style={{ background: darkTheme.neon.purple, color: 'white' }}
                    >
                      Find Services
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Quick Actions */}
              <div className="grid grid-cols-1 gap-4 mb-6">
                <button 
                  onClick={onNavigateToChat}
                  className="p-4 md:p-5 rounded-xl border text-center transition-all hover:scale-105"
                  style={{
                    background: `${darkTheme.neon.purple}10`,
                    borderColor: `${darkTheme.neon.purple}30`,
                  }}
                >
                  <div 
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ background: darkTheme.neon.purple }}
                  >
                    <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h4 className="font-medium text-sm md:text-base mb-1" style={{ color: darkTheme.text.primary }}>
                    Find Services
                  </h4>
                  <p className="text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>
                    Ask LifeX AI
                  </p>
                </button>

                <button 
                  className="p-4 md:p-5 rounded-xl border text-center transition-all hover:scale-105"
                  style={{
                    background: `${darkTheme.neon.green}10`,
                    borderColor: `${darkTheme.neon.green}30`,
                  }}
                >
                  <div 
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ background: darkTheme.neon.green }}
                  >
                    <Plus className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h4 className="font-medium text-sm md:text-base mb-1" style={{ color: darkTheme.text.primary }}>
                    Quick Book
                  </h4>
                  <p className="text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>
                    Recent providers
                  </p>
                </button>
              </div>

              {/* Booking Insights */}
              <div 
                className="p-4 md:p-5 rounded-xl border"
                style={{
                  background: `${darkTheme.neon.cyan}10`,
                  borderColor: `${darkTheme.neon.cyan}30`,
                }}
              >
                <h4 className="font-semibold mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base" style={{ color: darkTheme.text.primary }}>
                  <BarChart3 size={16} className="md:w-5 md:h-5" style={{ color: darkTheme.neon.cyan }} />
                  This Month
                </h4>
                <div className="grid grid-cols-1 gap-3 md:gap-4 text-center">
                  <div>
                    <p className="text-xl md:text-2xl font-bold" style={{ color: darkTheme.text.primary }}>
                      {bookings.length}
                    </p>
                    <p className="text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>
                      Total Bookings
                    </p>
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-bold" style={{ color: darkTheme.text.primary }}>
                      $270
                    </p>
                    <p className="text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>
                      Total Spent
                    </p>
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-bold" style={{ color: darkTheme.neon.green }}>
                      $35
                    </p>
                    <p className="text-xs md:text-sm" style={{ color: darkTheme.text.muted }}>
                      Saved
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
// src/components/business/BusinessSpecials.tsx
import React, { useState } from 'react';
import { 
  Utensils, 
  Scissors, 
  Coffee, 
  Sparkles,
  Clock,
  Users,
  Plus,
  X,
  Edit3,
  Check,
  AlertTriangle,
  Info,
  Settings
} from 'lucide-react';

// Types
interface SpecialService {
  id: number;
  name: string;
  description: string;
  time: string;
  days: string[];
}

interface BusinessTypeConfig {
  restaurant: {
    tableCount: number;
    avgServiceTime: number;
    cuisineType: string;
    diningStyle: string;
  };
  spa: {
    roomCount: number;
    therapistCount: number;
    serviceTypes: string[];
    appointmentDuration: number;
  };
  salon: {
    stationCount: number;
    stylistCount: number;
    services: string[];
    avgServiceTime: number;
  };
}

interface NotificationItem {
  id: number;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

// Dark theme configuration
const darkTheme = {
  background: {
    primary: '#0a0a0a',
    secondary: '#1A1625',
    card: '#1A1625',
    glass: '#8B5CF620'
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#B794F6',
    muted: '#805AD5'
  },
  neon: {
    purple: '#8B5CF6',
    green: '#10B981',
    pink: '#EC4899'
  }
};

// Special Services Configuration
const SpecialServices: React.FC = () => {
  const [specialServices, setSpecialServices] = useState<SpecialService[]>([
    { id: 1, name: 'Happy Hour', description: '50% off beverages', time: '17:00-19:00', days: ['monday', 'tuesday', 'wednesday'] },
    { id: 2, name: 'Chef Special', description: 'Seasonal dish of the day', time: 'All day', days: ['friday', 'saturday'] }
  ]);

  const [newSpecial, setNewSpecial] = useState<{
    name: string;
    description: string;
    time: string;
    days: string[];
  }>({ 
    name: '', 
    description: '', 
    time: '', 
    days: [] 
  });

  const dayOptions = [
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' },
    { key: 'sunday', label: 'Sun' }
  ];

  const toggleDay = (day: string) => {
    const updatedDays = newSpecial.days.includes(day)
      ? newSpecial.days.filter((d: any) => d !== day)
      : [...newSpecial.days, day];
    setNewSpecial({ ...newSpecial, days: updatedDays });
  };

  const addSpecialService = () => {
    if (newSpecial.name && newSpecial.description) {
      setSpecialServices([...specialServices, { 
        id: Date.now(), 
        ...newSpecial 
      }]);
      setNewSpecial({ name: '', description: '', time: '', days: [] });
    }
  };

  const deleteSpecial = (id: number) => {
    setSpecialServices(specialServices.filter((s: any) => s.id !== id));
  };

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center" style={{ color: darkTheme.text.primary }}>
        <Sparkles className="mr-2" style={{ color: darkTheme.neon.pink }} /> 
        Special Services
      </h2>
      
      {/* Add New Special */}
      <div className="rounded-xl p-4 mb-6 border" style={{ 
        background: darkTheme.background.card, 
        borderColor: darkTheme.background.glass 
      }}>
        <h3 className="font-semibold mb-4" style={{ color: darkTheme.text.primary }}>Add Special Offer</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Special Name"
              value={newSpecial.name}
              onChange={(e) => setNewSpecial({...newSpecial, name: e.target.value})}
              className="border rounded-lg px-3 py-2 text-sm"
              style={{ 
                background: darkTheme.background.secondary, 
                borderColor: darkTheme.background.glass,
                color: darkTheme.text.primary
              }}
            />
            <input
              type="text"
              placeholder="Time (e.g., 17:00-19:00)"
              value={newSpecial.time}
              onChange={(e) => setNewSpecial({...newSpecial, time: e.target.value})}
              className="border rounded-lg px-3 py-2 text-sm"
              style={{ 
                background: darkTheme.background.secondary, 
                borderColor: darkTheme.background.glass,
                color: darkTheme.text.primary
              }}
            />
          </div>
          
          <textarea
            placeholder="Description"
            value={newSpecial.description}
            onChange={(e) => setNewSpecial({...newSpecial, description: e.target.value})}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            style={{ 
              background: darkTheme.background.secondary, 
              borderColor: darkTheme.background.glass,
              color: darkTheme.text.primary
            }}
            rows={2}
          />
          
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: darkTheme.text.secondary }}>
              Available Days
            </label>
            <div className="flex flex-wrap gap-2">
              {dayOptions.map((day) => (
                <button
                  key={day.key}
                  onClick={() => toggleDay(day.key)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all hover:scale-105 ${
                    newSpecial.days.includes(day.key) ? 'scale-105' : ''
                  }`}
                  style={{
                    background: newSpecial.days.includes(day.key) ? `${darkTheme.neon.purple}30` : darkTheme.background.secondary,
                    color: newSpecial.days.includes(day.key) ? darkTheme.neon.purple : darkTheme.text.muted,
                    border: `1px solid ${newSpecial.days.includes(day.key) ? darkTheme.neon.purple + '40' : darkTheme.background.glass}`
                  }}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
          
          <button 
            onClick={addSpecialService}
            className="w-full md:w-auto px-6 py-2 rounded-lg font-medium transition-all hover:scale-105 text-sm"
            style={{ 
              background: darkTheme.neon.pink, 
              color: darkTheme.text.primary 
            }}
          >
            <Plus className="inline mr-2" size={16} />
            Add Special
          </button>
        </div>
      </div>

      {/* Special Services List */}
      <div className="space-y-4">
        {specialServices.map((special) => (
          <div key={special.id} className="rounded-xl p-4 border" style={{
            background: darkTheme.background.card,
            borderColor: darkTheme.background.glass
          }}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold" style={{ color: darkTheme.text.primary }}>{special.name}</h4>
                <p className="text-sm mt-1" style={{ color: darkTheme.text.secondary }}>{special.description}</p>
                <div className="flex items-center mt-2 space-x-4">
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1" style={{ color: darkTheme.text.muted }} />
                    <span className="text-xs" style={{ color: darkTheme.text.muted }}>{special.time}</span>
                  </div>
                  <div className="flex gap-1">
                    {special.days.map((day: any) => (
                      <span 
                        key={day}
                        className="px-2 py-1 rounded text-xs"
                        style={{ 
                          background: `${darkTheme.neon.pink}20`,
                          color: darkTheme.neon.pink
                        }}
                      >
                        {day.slice(0, 3)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => deleteSpecial(special.id)}
                className="text-red-400 hover:text-red-300 p-1"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Business Type Specific Settings
const BusinessTypeSettings: React.FC = () => {
  const [businessType, setBusinessType] = useState<keyof BusinessTypeConfig>('restaurant');
  const [typeSpecificSettings, setTypeSpecificSettings] = useState<BusinessTypeConfig>({
    restaurant: {
      tableCount: 20,
      avgServiceTime: 60,
      cuisineType: 'international',
      diningStyle: 'casual'
    },
    spa: {
      roomCount: 5,
      therapistCount: 8,
      serviceTypes: ['massage', 'facial', 'wellness'],
      appointmentDuration: 90
    },
    salon: {
      stationCount: 6,
      stylistCount: 4,
      services: ['haircut', 'coloring', 'styling'],
      avgServiceTime: 45
    }
  });

  const businessTypes = [
    { id: 'restaurant' as const, name: 'Restaurant', icon: Utensils, color: darkTheme.neon.green },
    { id: 'spa' as const, name: 'Spa & Wellness', icon: Sparkles, color: darkTheme.neon.pink },
    { id: 'salon' as const, name: 'Beauty Salon', icon: Scissors, color: darkTheme.neon.purple }
  ];

  const currentSettings = typeSpecificSettings[businessType];
  const currentType = businessTypes.find((t: any) => t.id === businessType);

  // Type-safe update function for different business types
  const updateRestaurantSetting = (key: keyof BusinessTypeConfig['restaurant'], value: any) => {
    if (businessType === 'restaurant') {
      setTypeSpecificSettings({
        ...typeSpecificSettings,
        restaurant: {
          ...typeSpecificSettings.restaurant,
          [key]: value
        }
      });
    }
  };

  const updateSpaSetting = (key: keyof BusinessTypeConfig['spa'], value: any) => {
    if (businessType === 'spa') {
      setTypeSpecificSettings({
        ...typeSpecificSettings,
        spa: {
          ...typeSpecificSettings.spa,
          [key]: value
        }
      });
    }
  };

  const updateSalonSetting = (key: keyof BusinessTypeConfig['salon'], value: any) => {
    if (businessType === 'salon') {
      setTypeSpecificSettings({
        ...typeSpecificSettings,
        salon: {
          ...typeSpecificSettings.salon,
          [key]: value
        }
      });
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center" style={{ color: darkTheme.text.primary }}>
        <Settings className="mr-2" style={{ color: darkTheme.neon.purple }} /> 
        Business Configuration
      </h2>

      {/* Business Type Selector */}
      <div className="rounded-xl p-4 mb-6 border" style={{ 
        background: darkTheme.background.card, 
        borderColor: darkTheme.background.glass 
      }}>
        <h3 className="font-semibold mb-4" style={{ color: darkTheme.text.primary }}>Business Type</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {businessTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setBusinessType(type.id)}
                className={`p-3 rounded-lg border transition-all hover:scale-105 ${
                  businessType === type.id ? 'scale-105' : ''
                }`}
                style={{
                  background: businessType === type.id ? `${type.color}20` : darkTheme.background.secondary,
                  borderColor: businessType === type.id ? `${type.color}40` : darkTheme.background.glass,
                  color: businessType === type.id ? type.color : darkTheme.text.secondary
                }}
              >
                <Icon size={20} className="mx-auto mb-2" />
                <div className="text-xs font-medium text-center">{type.name}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Type-Specific Settings */}
      <div className="rounded-xl p-4 border" style={{ 
        background: darkTheme.background.card, 
        borderColor: darkTheme.background.glass 
      }}>
        <h3 className="font-semibold mb-4 flex items-center" style={{ color: darkTheme.text.primary }}>
          {currentType && <currentType.icon className="mr-2" size={18} style={{ color: currentType.color }} />}
          {currentType?.name} Settings
        </h3>

        {businessType === 'restaurant' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: darkTheme.text.secondary }}>
                  Table Count
                </label>
                <input
                  type="number"
                  value={typeSpecificSettings.restaurant.tableCount}
                  onChange={(e) => updateRestaurantSetting('tableCount', parseInt(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  style={{ 
                    background: darkTheme.background.secondary, 
                    borderColor: darkTheme.background.glass,
                    color: darkTheme.text.primary
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: darkTheme.text.secondary }}>
                  Avg Service Time (minutes)
                </label>
                <input
                  type="number"
                  value={typeSpecificSettings.restaurant.avgServiceTime}
                  onChange={(e) => updateRestaurantSetting('avgServiceTime', parseInt(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  style={{ 
                    background: darkTheme.background.secondary, 
                    borderColor: darkTheme.background.glass,
                    color: darkTheme.text.primary
                  }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: darkTheme.text.secondary }}>
                  Cuisine Type
                </label>
                <select
                  value={typeSpecificSettings.restaurant.cuisineType}
                  onChange={(e) => updateRestaurantSetting('cuisineType', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  style={{ 
                    background: darkTheme.background.secondary, 
                    borderColor: darkTheme.background.glass,
                    color: darkTheme.text.primary
                  }}
                >
                  <option value="international">International</option>
                  <option value="chinese">Chinese</option>
                  <option value="italian">Italian</option>
                  <option value="japanese">Japanese</option>
                  <option value="american">American</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: darkTheme.text.secondary }}>
                  Dining Style
                </label>
                <select
                  value={typeSpecificSettings.restaurant.diningStyle}
                  onChange={(e) => updateRestaurantSetting('diningStyle', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  style={{ 
                    background: darkTheme.background.secondary, 
                    borderColor: darkTheme.background.glass,
                    color: darkTheme.text.primary
                  }}
                >
                  <option value="casual">Casual Dining</option>
                  <option value="fine">Fine Dining</option>
                  <option value="fast">Fast Casual</option>
                  <option value="family">Family Style</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {businessType === 'spa' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: darkTheme.text.secondary }}>
                  Treatment Rooms
                </label>
                <input
                  type="number"
                  value={typeSpecificSettings.spa.roomCount}
                  onChange={(e) => updateSpaSetting('roomCount', parseInt(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  style={{ 
                    background: darkTheme.background.secondary, 
                    borderColor: darkTheme.background.glass,
                    color: darkTheme.text.primary
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: darkTheme.text.secondary }}>
                  Therapist Count
                </label>
                <input
                  type="number"
                  value={typeSpecificSettings.spa.therapistCount}
                  onChange={(e) => updateSpaSetting('therapistCount', parseInt(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  style={{ 
                    background: darkTheme.background.secondary, 
                    borderColor: darkTheme.background.glass,
                    color: darkTheme.text.primary
                  }}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: darkTheme.text.secondary }}>
                Default Appointment Duration (minutes)
              </label>
              <input
                type="number"
                value={typeSpecificSettings.spa.appointmentDuration}
                onChange={(e) => updateSpaSetting('appointmentDuration', parseInt(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                style={{ 
                  background: darkTheme.background.secondary, 
                  borderColor: darkTheme.background.glass,
                  color: darkTheme.text.primary
                }}
              />
            </div>
          </div>
        )}

        {businessType === 'salon' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: darkTheme.text.secondary }}>
                  Styling Stations
                </label>
                <input
                  type="number"
                  value={typeSpecificSettings.salon.stationCount}
                  onChange={(e) => updateSalonSetting('stationCount', parseInt(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  style={{ 
                    background: darkTheme.background.secondary, 
                    borderColor: darkTheme.background.glass,
                    color: darkTheme.text.primary
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: darkTheme.text.secondary }}>
                  Stylist Count
                </label>
                <input
                  type="number"
                  value={typeSpecificSettings.salon.stylistCount}
                  onChange={(e) => updateSalonSetting('stylistCount', parseInt(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  style={{ 
                    background: darkTheme.background.secondary, 
                    borderColor: darkTheme.background.glass,
                    color: darkTheme.text.primary
                  }}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: darkTheme.text.secondary }}>
                Average Service Time (minutes)
              </label>
              <input
                type="number"
                value={typeSpecificSettings.salon.avgServiceTime}
                onChange={(e) => updateSalonSetting('avgServiceTime', parseInt(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                style={{ 
                  background: darkTheme.background.secondary, 
                  borderColor: darkTheme.background.glass,
                  color: darkTheme.text.primary
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Notifications & Alerts Component
const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { 
      id: 1, 
      type: 'info', 
      title: 'Profile Update', 
      message: 'Your business profile has been updated successfully', 
      time: '2 hours ago',
      read: false 
    },
    { 
      id: 2, 
      type: 'warning', 
      title: 'Certificate Expiring', 
      message: 'Your food safety certificate expires in 30 days', 
      time: '1 day ago',
      read: false 
    },
    { 
      id: 3, 
      type: 'success', 
      title: 'New Review', 
      message: 'You received a 5-star review from Sarah M.', 
      time: '3 days ago',
      read: true 
    }
  ]);

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success': return <Check style={{ color: darkTheme.neon.green }} size={16} />;
      case 'warning': return <AlertTriangle style={{ color: '#F59E0B' }} size={16} />;
      case 'info': return <Info style={{ color: darkTheme.neon.purple }} size={16} />;
      case 'error': return <AlertTriangle style={{ color: '#EF4444' }} size={16} />;
      default: return <Info style={{ color: darkTheme.text.muted }} size={16} />;
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map((notif: any) => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((notif: any) => notif.id !== id));
  };

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center" style={{ color: darkTheme.text.primary }}>
        <AlertTriangle className="mr-2" style={{ color: '#F59E0B' }} /> 
        Notifications
      </h2>
      
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`rounded-xl p-4 border transition-all hover:scale-102 ${!notification.read ? 'ring-1 ring-opacity-40' : ''}`}
            style={{
              background: darkTheme.background.card,
              borderColor: darkTheme.background.glass,
              ...((!notification.read) && {
                '--tw-ring-color': darkTheme.neon.purple + '40'
              } as React.CSSProperties)
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm" style={{ color: darkTheme.text.primary }}>
                    {notification.title}
                  </h4>
                  <p className="text-xs mt-1" style={{ color: darkTheme.text.secondary }}>
                    {notification.message}
                  </p>
                  <p className="text-xs mt-2" style={{ color: darkTheme.text.muted }}>
                    {notification.time}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-2">
                {!notification.read && (
                  <button 
                    onClick={() => markAsRead(notification.id)}
                    className="p-1 rounded hover:scale-110 transition-all"
                    style={{ color: darkTheme.neon.green }}
                  >
                    <Check size={14} />
                  </button>
                )}
                <button 
                  onClick={() => deleteNotification(notification.id)}
                  className="p-1 rounded hover:scale-110 transition-all text-red-400"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Component with Tab Navigation
const BusinessSpecials: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'specials' | 'config' | 'notifications'>('specials');
  
  const tabs = [
    { id: 'specials' as const, label: 'Specials', icon: Sparkles, color: darkTheme.neon.pink, component: SpecialServices },
    { id: 'config' as const, label: 'Config', icon: Settings, color: darkTheme.neon.purple, component: BusinessTypeSettings },
    { id: 'notifications' as const, label: 'Alerts', icon: AlertTriangle, color: '#F59E0B', component: NotificationCenter }
  ];

  const ActiveComponent = tabs.find((t: any) => t.id === activeTab)?.component;

  return (
    <div className="min-h-screen" style={{ background: darkTheme.background.primary }}>
      {/* Tab Navigation */}
      <div className="border-b" style={{ 
        background: darkTheme.background.secondary, 
        borderColor: darkTheme.background.glass 
      }}>
        <div className="flex overflow-x-auto px-4 md:px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-4 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id ? 'transform scale-105' : 'hover:scale-102'
                }`}
                style={{
                  borderColor: activeTab === tab.id ? tab.color : 'transparent',
                  color: activeTab === tab.id ? tab.color : darkTheme.text.secondary
                }}
              >
                <Icon size={18} className="mr-2" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
};

export default BusinessSpecials;
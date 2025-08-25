// src/components/business/BusinessDashboard.tsx
import React, { useState } from 'react';
import { 
  Store, 
  Clock, 
  MapPin, 
  Settings, 
  CheckCircle, 
  Star, 
  User,
  Menu,
  X,
  Plus,
  Edit3,
  Trash2,
  Save
} from 'lucide-react';

// Types
interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string;
  category: 'main' | 'appetizer' | 'dessert' | 'beverage';
}

interface BusinessHour {
  open: string;
  close: string;
  closed: boolean;
}

interface BusinessHours {
  monday: BusinessHour;
  tuesday: BusinessHour;
  wednesday: BusinessHour;
  thursday: BusinessHour;
  friday: BusinessHour;
  saturday: BusinessHour;
  sunday: BusinessHour;
}

interface ComplianceItem {
  id: number;
  item: string;
  status: 'completed' | 'pending' | 'in-review' | 'overdue';
  date: string | null;
  priority: 'critical' | 'high' | 'medium';
  description: string;
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

// Menu/Service Management Component
const MenuManagement: React.FC<{
  items: MenuItem[];
  setItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
}> = ({ items, setItems }) => {
  const [newItem, setNewItem] = useState<{
    name: string;
    price: string;
    description: string;
    category: MenuItem['category'];
  }>({
    name: '',
    price: '',
    description: '',
    category: 'main'
  });

  const categories = [
    { id: 'main' as const, name: 'Main Items', color: darkTheme.neon.purple },
    { id: 'appetizer' as const, name: 'Appetizers', color: darkTheme.neon.green },
    { id: 'dessert' as const, name: 'Desserts', color: darkTheme.neon.pink },
    { id: 'beverage' as const, name: 'Beverages', color: '#F59E0B' }
  ];

  const addItem = () => {
    if (newItem.name && newItem.price) {
      setItems([...items, { 
        id: Date.now(), 
        name: newItem.name,
        description: newItem.description,
        category: newItem.category,
        price: parseFloat(newItem.price) 
      }]);
      setNewItem({ name: '', price: '', description: '', category: 'main' });
    }
  };

  const deleteItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center" style={{ color: darkTheme.text.primary }}>
        <Store className="mr-2" style={{ color: darkTheme.neon.purple }} /> 
        Menu & Services
      </h2>
      
      {/* Add New Item */}
      <div className="rounded-xl p-4 mb-6 border" style={{ 
        background: darkTheme.background.card, 
        borderColor: darkTheme.background.glass 
      }}>
        <h3 className="font-semibold mb-4" style={{ color: darkTheme.text.primary }}>Add New Item</h3>
        
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Item Name"
              value={newItem.name}
              onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              className="border rounded-lg px-3 py-2 text-sm"
              style={{ 
                background: darkTheme.background.secondary, 
                borderColor: darkTheme.background.glass,
                color: darkTheme.text.primary
              }}
            />
            <input
              type="number"
              placeholder="Price"
              value={newItem.price}
              onChange={(e) => setNewItem({...newItem, price: e.target.value})}
              className="border rounded-lg px-3 py-2 text-sm"
              style={{ 
                background: darkTheme.background.secondary, 
                borderColor: darkTheme.background.glass,
                color: darkTheme.text.primary
              }}
            />
          </div>
          
          <select
            value={newItem.category}
            onChange={(e) => setNewItem({...newItem, category: e.target.value as MenuItem['category']})}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            style={{ 
              background: darkTheme.background.secondary, 
              borderColor: darkTheme.background.glass,
              color: darkTheme.text.primary
            }}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          
          <textarea
            placeholder="Description (optional)"
            value={newItem.description}
            onChange={(e) => setNewItem({...newItem, description: e.target.value})}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            style={{ 
              background: darkTheme.background.secondary, 
              borderColor: darkTheme.background.glass,
              color: darkTheme.text.primary
            }}
            rows={2}
          />
          
          <button 
            onClick={addItem}
            className="w-full md:w-auto px-6 py-2 rounded-lg font-medium transition-all hover:scale-105 text-sm"
            style={{ 
              background: darkTheme.neon.purple, 
              color: darkTheme.text.primary 
            }}
          >
            <Plus className="inline mr-2" size={16} />
            Add Item
          </button>
        </div>
      </div>

      {/* Items by Category */}
      {categories.map(category => {
        const categoryItems = items.filter(item => item.category === category.id);
        if (categoryItems.length === 0) return null;
        
        return (
          <div key={category.id} className="mb-6">
            <h3 className="font-semibold mb-3 flex items-center" style={{ color: category.color }}>
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ background: category.color }}
              />
              {category.name}
            </h3>
            
            <div className="space-y-3">
              {categoryItems.map((item) => (
                <div key={item.id} className="rounded-lg p-4 border flex justify-between items-start" style={{
                  background: darkTheme.background.card,
                  borderColor: darkTheme.background.glass
                }}>
                  <div className="flex-1">
                    <h4 className="font-semibold" style={{ color: darkTheme.text.primary }}>{item.name}</h4>
                    {item.description && (
                      <p className="text-sm mt-1" style={{ color: darkTheme.text.muted }}>{item.description}</p>
                    )}
                    <p className="text-lg font-bold mt-2" style={{ color: darkTheme.neon.green }}>${item.price}</p>
                  </div>
                  <button 
                    onClick={() => deleteItem(item.id)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Business Hours Component
const BusinessHours: React.FC<{
  hours: BusinessHours;
  setHours: React.Dispatch<React.SetStateAction<BusinessHours>>;
}> = ({ hours, setHours }) => {
  const days = [
    { key: 'monday' as const, label: 'Mon' },
    { key: 'tuesday' as const, label: 'Tue' },
    { key: 'wednesday' as const, label: 'Wed' },
    { key: 'thursday' as const, label: 'Thu' },
    { key: 'friday' as const, label: 'Fri' },
    { key: 'saturday' as const, label: 'Sat' },
    { key: 'sunday' as const, label: 'Sun' }
  ];
  
  const updateHours = (day: keyof BusinessHours, field: keyof BusinessHour, value: string | boolean) => {
    setHours({
      ...hours,
      [day]: {
        ...hours[day],
        [field]: value
      }
    });
  };

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center" style={{ color: darkTheme.text.primary }}>
        <Clock className="mr-2" style={{ color: darkTheme.neon.green }} /> 
        Business Hours
      </h2>
      
      <div className="rounded-xl p-4 border" style={{ 
        background: darkTheme.background.card, 
        borderColor: darkTheme.background.glass 
      }}>
        <div className="space-y-4">
          {days.map((day) => {
            const dayData = hours[day.key];
            return (
              <div key={day.key} className="flex items-center justify-between py-3 border-b last:border-b-0" style={{ borderColor: darkTheme.background.glass }}>
                <span className="font-medium w-16 text-sm" style={{ color: darkTheme.text.primary }}>{day.label}</span>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={dayData.closed}
                      onChange={(e) => updateHours(day.key, 'closed', e.target.checked)}
                      className="mr-2 accent-purple-500"
                    />
                    <span style={{ color: darkTheme.text.secondary }}>Closed</span>
                  </label>
                  {!dayData.closed && (
                    <div className="flex items-center space-x-2 text-sm">
                      <input
                        type="time"
                        value={dayData.open}
                        onChange={(e) => updateHours(day.key, 'open', e.target.value)}
                        className="border rounded px-2 py-1 text-xs"
                        style={{ 
                          background: darkTheme.background.secondary, 
                          borderColor: darkTheme.background.glass,
                          color: darkTheme.text.primary
                        }}
                      />
                      <span style={{ color: darkTheme.text.muted }}>to</span>
                      <input
                        type="time"
                        value={dayData.close}
                        onChange={(e) => updateHours(day.key, 'close', e.target.value)}
                        className="border rounded px-2 py-1 text-xs"
                        style={{ 
                          background: darkTheme.background.secondary, 
                          borderColor: darkTheme.background.glass,
                          color: darkTheme.text.primary
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Service Areas Component
const ServiceAreas: React.FC<{
  areas: string[];
  setAreas: React.Dispatch<React.SetStateAction<string[]>>;
}> = ({ areas, setAreas }) => {
  const [newArea, setNewArea] = useState('');

  const addArea = () => {
    if (newArea.trim()) {
      setAreas([...areas, newArea.trim()]);
      setNewArea('');
    }
  };

  const removeArea = (index: number) => {
    setAreas(areas.filter((_, i) => i !== index));
  };

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center" style={{ color: darkTheme.text.primary }}>
        <MapPin className="mr-2" style={{ color: darkTheme.neon.pink }} /> 
        Service Areas
      </h2>
      
      <div className="rounded-xl p-4 border" style={{ 
        background: darkTheme.background.card, 
        borderColor: darkTheme.background.glass 
      }}>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Add service area"
            value={newArea}
            onChange={(e) => setNewArea(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
            style={{ 
              background: darkTheme.background.secondary, 
              borderColor: darkTheme.background.glass,
              color: darkTheme.text.primary
            }}
            onKeyPress={(e) => e.key === 'Enter' && addArea()}
          />
          <button 
            onClick={addArea}
            className="px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 text-sm"
            style={{ 
              background: darkTheme.neon.pink, 
              color: darkTheme.text.primary 
            }}
          >
            Add
          </button>
        </div>
        
        <div className="space-y-2">
          {areas.map((area, index) => (
            <div key={index} className="flex justify-between items-center p-3 rounded-lg" style={{ background: darkTheme.background.secondary }}>
              <span style={{ color: darkTheme.text.primary }}>{area}</span>
              <button 
                onClick={() => removeArea(index)}
                className="text-red-400 hover:text-red-300 p-1"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Compliance Center Component
const ComplianceCenterComponent: React.FC = () => {
  const [complianceItems] = useState<ComplianceItem[]>([
    { 
      id: 1, 
      item: 'NZBN Registration', 
      status: 'completed', 
      date: '2024-12-15',
      priority: 'critical',
      description: 'New Zealand Business Number - Required by law'
    },
    { 
      id: 2, 
      item: 'Food Business Registration', 
      status: 'pending', 
      date: null,
      priority: 'high',
      description: 'Required for food businesses under Food Act 2014'
    },
    { 
      id: 3, 
      item: 'Public Liability Insurance', 
      status: 'completed', 
      date: '2024-11-20',
      priority: 'high',
      description: 'Protects against customer injury claims'
    }
  ]);

  const getStatusColor = (status: ComplianceItem['status'], priority?: ComplianceItem['priority']) => {
    const baseColors: Record<ComplianceItem['status'], {bg: string, text: string}> = {
      'completed': { bg: `${darkTheme.neon.green}20`, text: darkTheme.neon.green },
      'pending': { bg: '#F59E0B20', text: '#F59E0B' },
      'in-review': { bg: `${darkTheme.neon.purple}20`, text: darkTheme.neon.purple },
      'overdue': { bg: '#EF444420', text: '#EF4444' }
    };
    
    if (status === 'pending' && priority === 'critical') {
      return { bg: '#EF444420', text: '#EF4444' };
    }
    
    return baseColors[status];
  };

  const getPriorityColor = (priority: ComplianceItem['priority']) => {
    const priorityColors: Record<ComplianceItem['priority'], string> = {
      'critical': '#EF4444',
      'high': '#F59E0B',
      'medium': darkTheme.neon.purple
    };
    return priorityColors[priority];
  };

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center" style={{ color: darkTheme.text.primary }}>
        <CheckCircle className="mr-2" style={{ color: darkTheme.neon.green }} /> 
        Compliance Center
      </h2>
      
      <div className="rounded-xl border" style={{ 
        background: darkTheme.background.card, 
        borderColor: darkTheme.background.glass 
      }}>
        <div className="p-4 border-b" style={{ borderColor: darkTheme.background.glass }}>
          <h3 className="font-semibold" style={{ color: darkTheme.text.primary }}>Compliance Checklist</h3>
        </div>
        
        <div className="divide-y" style={{ borderColor: darkTheme.background.glass }}>
          {complianceItems.map((item) => {
            const statusStyle = getStatusColor(item.status, item.priority);
            const priorityColor = getPriorityColor(item.priority);
            
            return (
              <div key={item.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <h4 className="font-medium text-sm" style={{ color: darkTheme.text.primary }}>
                        {item.item}
                      </h4>
                      <div 
                        className="w-2 h-2 rounded-full ml-2"
                        style={{ background: priorityColor }}
                        title={`${item.priority} priority`}
                      />
                    </div>
                    <p className="text-xs" style={{ color: darkTheme.text.muted }}>
                      {item.description}
                    </p>
                    {item.date && (
                      <p className="text-xs mt-1" style={{ color: darkTheme.text.muted }}>
                        Updated: {item.date}
                      </p>
                    )}
                  </div>
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-medium ml-3"
                    style={{ 
                      background: statusStyle.bg, 
                      color: statusStyle.text 
                    }}
                  >
                    {item.status.replace('-', ' ')}
                  </span>
                </div>
                
                {item.status === 'pending' && item.priority === 'critical' && (
                  <div className="mt-2 p-2 rounded text-xs" style={{ background: '#EF444410', color: '#EF4444' }}>
                    ⚠️ Action Required: This is legally required to operate your business
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Business Profile Component
const BusinessProfile: React.FC = () => {
  const [profile, setProfile] = useState({
    businessName: 'My Business',
    businessType: 'restaurant',
    description: 'Quality service provider',
    phone: '+64-9-123-4567',
    email: 'contact@mybusiness.co.nz',
    address: '123 Queen Street, Auckland'
  });

  const businessTypes = [
    { id: 'restaurant', name: 'Restaurant', icon: '🍽️' },
    { id: 'cafe', name: 'Cafe', icon: '☕' },
    { id: 'spa', name: 'Spa & Wellness', icon: '💆' },
    { id: 'salon', name: 'Beauty Salon', icon: '💄' },
    { id: 'hairdresser', name: 'Hairdresser', icon: '✂️' },
    { id: 'retail', name: 'Retail Store', icon: '🛍️' }
  ];

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center" style={{ color: darkTheme.text.primary }}>
        <User className="mr-2" style={{ color: darkTheme.neon.pink }} /> 
        Business Profile
      </h2>
      
      <div className="rounded-xl p-4 border" style={{ 
        background: darkTheme.background.card, 
        borderColor: darkTheme.background.glass 
      }}>
        <h3 className="font-semibold mb-4" style={{ color: darkTheme.text.primary }}>Basic Information</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: darkTheme.text.secondary }}>Business Name</label>
              <input
                type="text"
                value={profile.businessName}
                onChange={(e) => setProfile({...profile, businessName: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                style={{ 
                  background: darkTheme.background.secondary, 
                  borderColor: darkTheme.background.glass,
                  color: darkTheme.text.primary
                }}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: darkTheme.text.secondary }}>Business Type</label>
              <select
                value={profile.businessType}
                onChange={(e) => setProfile({...profile, businessType: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                style={{ 
                  background: darkTheme.background.secondary, 
                  borderColor: darkTheme.background.glass,
                  color: darkTheme.text.primary
                }}
              >
                {businessTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.icon} {type.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: darkTheme.text.secondary }}>Phone</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                style={{ 
                  background: darkTheme.background.secondary, 
                  borderColor: darkTheme.background.glass,
                  color: darkTheme.text.primary
                }}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: darkTheme.text.secondary }}>Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
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
            <label className="block text-xs font-medium mb-2" style={{ color: darkTheme.text.secondary }}>Address</label>
            <input
              type="text"
              value={profile.address}
              onChange={(e) => setProfile({...profile, address: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              style={{ 
                background: darkTheme.background.secondary, 
                borderColor: darkTheme.background.glass,
                color: darkTheme.text.primary
              }}
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: darkTheme.text.secondary }}>Description</label>
            <textarea
              value={profile.description}
              onChange={(e) => setProfile({...profile, description: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              style={{ 
                background: darkTheme.background.secondary, 
                borderColor: darkTheme.background.glass,
                color: darkTheme.text.primary
              }}
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const BusinessDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('menu');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // State with proper typing
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: 1, name: 'Classic Burger', price: 15, description: 'Beef patty with fresh vegetables', category: 'main' },
    { id: 2, name: 'Caesar Salad', price: 12, description: 'Fresh romaine with parmesan', category: 'appetizer' },
    { id: 3, name: 'Chocolate Cake', price: 8, description: 'Rich chocolate dessert', category: 'dessert' }
  ]);
  
  const [businessHours, setBusinessHours] = useState<BusinessHours>({
    monday: { open: '09:00', close: '22:00', closed: false },
    tuesday: { open: '09:00', close: '22:00', closed: false },
    wednesday: { open: '09:00', close: '22:00', closed: false },
    thursday: { open: '09:00', close: '22:00', closed: false },
    friday: { open: '09:00', close: '23:00', closed: false },
    saturday: { open: '10:00', close: '23:00', closed: false },
    sunday: { open: '10:00', close: '21:00', closed: false }
  });
  
  const [serviceAreas, setServiceAreas] = useState<string[]>(['Downtown', 'North District', 'East Side']);

  const tabs = [
    { id: 'menu', label: 'Menu', icon: Store, color: darkTheme.neon.purple },
    { id: 'hours', label: 'Hours', icon: Clock, color: darkTheme.neon.green },
    { id: 'areas', label: 'Areas', icon: MapPin, color: darkTheme.neon.pink },
    { id: 'compliance', label: 'Compliance', icon: CheckCircle, color: darkTheme.neon.green },
    { id: 'profile', label: 'Profile', icon: User, color: darkTheme.neon.purple }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'menu':
        return <MenuManagement items={menuItems} setItems={setMenuItems} />;
      case 'hours':
        return <BusinessHours hours={businessHours} setHours={setBusinessHours} />;
      case 'areas':
        return <ServiceAreas areas={serviceAreas} setAreas={setServiceAreas} />;
      case 'compliance':
        return <ComplianceCenterComponent />;
      case 'profile':
        return <BusinessProfile />;
      default:
        return <MenuManagement items={menuItems} setItems={setMenuItems} />;
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: darkTheme.background.primary }}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 border-r transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 ease-in-out`}
        style={{ 
          background: darkTheme.background.secondary, 
          borderColor: darkTheme.background.glass 
        }}
      >
        <div className="p-6 border-b" style={{ borderColor: darkTheme.background.glass }}>
          <h1 className="text-lg font-bold" style={{ color: darkTheme.text.primary }}>
            Business Dashboard
          </h1>
        </div>
        
        <nav className="p-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 mb-2 rounded-lg text-left transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'transform scale-105' 
                    : 'hover:scale-102'
                }`}
                style={{
                  background: activeTab === tab.id ? `${tab.color}20` : 'transparent',
                  color: activeTab === tab.id ? tab.color : darkTheme.text.secondary,
                  border: activeTab === tab.id ? `1px solid ${tab.color}30` : '1px solid transparent'
                }}
              >
                <Icon size={18} className="mr-3" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile header */}
        <div className="lg:hidden p-4 flex items-center border-b" style={{ 
          background: darkTheme.background.secondary, 
          borderColor: darkTheme.background.glass 
        }}>
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md transition-colors"
            style={{ color: darkTheme.text.primary }}
          >
            <Menu size={20} />
          </button>
          <h1 className="ml-4 text-lg font-semibold" style={{ color: darkTheme.text.primary }}>
            Business Dashboard
          </h1>
        </div>
        
        {/* Content Area */}
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
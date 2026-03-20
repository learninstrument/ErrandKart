import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBasket, ShoppingCart, PackageCheck, MapPin, Home } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { TextArea } from '../../components/UI/TextArea';

export const PostErrand: React.FC = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState('Purchase');

  const categories = [
    { id: 'Market', label: 'Market Run', icon: <ShoppingBasket size={16} /> },
    { id: 'Purchase', label: 'Purchase', icon: <ShoppingCart size={16} /> },
    { id: 'Service', label: 'Service', icon: <PackageCheck size={16} /> }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white w-full md:max-w-md md:mx-auto relative shadow-2xl">
      <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-20">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-400 hover:text-gray-800 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-black text-[#333333]">Post a New Errand</h2>
        <div className="w-8"></div>
      </div>

      <div className="p-6 overflow-y-auto pb-32">
        <p className="text-gray-500 text-sm mb-8">Describe what you need, set a price and get it done.</p>

        <h3 className="font-black text-[#333333] tracking-wide mb-4">ERRAND DETAILS</h3>
        <Input label="Title" placeholder="e.g., Pickup groceries from Shoprite" />
        <TextArea label="Description" placeholder="Provide details about items, special instructions..." rows={4} />

        <div className="mb-8">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-2 block">Category</label>
          <div className="flex gap-2">
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex-1 py-3 px-2 flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 transition-all ${category === cat.id ? 'border-[#FF6600] bg-[#FFF0E5] text-[#FF6600]' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
              >
                {cat.icon}
                <span className="text-xs font-bold">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        <h3 className="font-black text-[#333333] tracking-wide mb-4">LOCATIONS</h3>
        <Input label="Pickup Location" placeholder="Where should the runner go?" icon={<MapPin size={18} />} />
        <Input label="Delivery Location" placeholder="Enter delivery address" icon={<Home size={18} />} />
        
        <div className="flex items-center gap-2 mb-8 ml-1">
           <input type="checkbox" id="saveLoc" className="w-4 h-4 text-[#FF6600] rounded focus:ring-[#FF6600]" />
           <label htmlFor="saveLoc" className="text-sm text-gray-500">Must have a cooler bag / insulation</label>
        </div>

        <h3 className="font-black text-[#333333] tracking-wide mb-4">BUDGET (SERVICE FEE)</h3>
        <p className="text-xs text-gray-500 mb-2 ml-1">How much are you paying the runner for this trip?</p>
        
        <div className="relative mb-6">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl font-black text-[#333333]">₦</div>
          <input 
            type="number" 
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-10 pr-4 text-2xl font-black text-[#333333] focus:outline-none focus:border-[#FF6600] focus:ring-1 focus:ring-[#FF6600] transition-all"
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="fixed bottom-0 w-full md:max-w-md bg-white border-t border-gray-100 p-6 z-30">
        <Button fullWidth onClick={() => {}}>Post Errand Request</Button>
      </div>
    </div>
  );
};

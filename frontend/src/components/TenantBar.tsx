import React, { useState, useEffect } from 'react';
import { TenantSanctuary, UserRole } from '../types';
import {
  Globe,
  Crown,
  Eye,
  KeyRound,
  Plus,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  Lock,
  Unlock,
  Check,
  X,
  TrendingUp,
} from 'lucide-react';
import { tenantApi } from '../utils/tenantApi';

interface TenantBarProps {
  currentTenant: TenantSanctuary;
  currentRole: UserRole;
  onSwitchTenant: (slug: string) => void;
  onSwitchRole: (role: UserRole) => void;
  onOpenSubscribe: () => void;
  onUpdatePin: (newPin: string) => void;
  onOpenFlywheel?: () => void;
}

export const TenantBar: React.FC<TenantBarProps> = ({
  currentTenant,
  currentRole,
  onSwitchTenant,
  onSwitchRole,
  onOpenSubscribe,
  onUpdatePin,
  onOpenFlywheel,
}) => {
  const [tenantsList, setTenantsList] = useState<
    { slug: string; sanctuaryName: string; activeTheme: string; planType?: string }[]
  >([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);

  useEffect(() => {
    tenantApi.fetchTenantsList().then(setTenantsList);
  }, [currentTenant.slug]);

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length === 4) {
      onUpdatePin(newPin);
      setPinSuccess(true);
      setTimeout(() => {
        setPinSuccess(false);
        setShowPinModal(false);
        setNewPin('');
      }, 1200);
    }
  };

  return (
    <aside aria-label="Multi-Tenant Control Bar" className="bg-[#2D231C] text-[#F5ECE1] text-xs py-1.5 px-4 sm:px-6 border-b border-[#3D3228] relative z-40 transition-colors">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
        
        {/* Left: Active Slug and Tenant Switcher */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#3F3329] hover:bg-[#4D3F34] transition-colors border border-[#524438] text-white font-medium"
            >
              <Globe className="w-3.5 h-3.5 text-[#E68A6E]" />
              <span className="font-mono text-[11px] text-[#E68A6E]">@{currentTenant.slug}</span>
              <span className="hidden sm:inline text-white/80">· {currentTenant.sanctuaryName}</span>
              <ChevronDown className="w-3 h-3 text-[#A8988B]" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div
                className="absolute left-0 top-full mt-1.5 w-64 bg-white text-[#2D231C] rounded-2xl shadow-2xl border border-[#E8DFD3] p-2 space-y-1 z-50 animate-in fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8F7F72]">
                  Switch Family Sanctuary
                </div>

                {tenantsList.map((t) => {
                  const isActive = t.slug === currentTenant.slug;
                  return (
                    <button
                      key={t.slug}
                      onClick={() => {
                        onSwitchTenant(t.slug);
                        setShowDropdown(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-all flex items-center justify-between text-xs ${
                        isActive
                          ? 'bg-[#FAF2ED] border border-[#F2C8B5] font-semibold text-[#B84A2A]'
                          : 'hover:bg-[#FAF7F2] text-[#524438]'
                      }`}
                    >
                      <div className="truncate pr-1">
                        <span className="font-mono text-[11px] block">@{t.slug}</span>
                        <span className="text-[10px] text-[#736558] block truncate">{t.sanctuaryName}</span>
                      </div>
                      {isActive && <Check className="w-3.5 h-3.5 text-[#B84A2A] shrink-0" />}
                    </button>
                  );
                })}

                <div className="pt-2 mt-1 border-t border-[#E8DFD3]">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      onOpenSubscribe();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#B84A2A] hover:bg-[#A33F23] text-white rounded-xl text-xs font-semibold shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Spin Up New Sanctuary ($5/mo)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <span className="hidden md:inline text-[11px] text-[#A8988B]">
            Multi-Tenant Bio Engine
          </span>
        </div>

        {/* Right: Role Permission Split & Pin Manager */}
        <div className="flex items-center gap-2">
          
          {/* Owner Mode vs. Guest Mode Toggle */}
          <div className="flex items-center bg-[#3F3329] p-0.5 rounded-lg border border-[#524438]">
            <button
              onClick={() => onSwitchRole('guest')}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                currentRole === 'guest'
                  ? 'bg-white text-[#2D231C] font-semibold shadow-2xs'
                  : 'text-[#C7B7A9] hover:text-white'
              }`}
              title="Guest Mode: Clean read-only layout displaying recipes, verses, and albums"
            >
              <Eye className="w-3 h-3" />
              <span>Guest (Read-Only)</span>
            </button>

            <button
              onClick={() => onSwitchRole('owner')}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                currentRole === 'owner'
                  ? 'bg-[#B84A2A] text-white font-semibold shadow-2xs'
                  : 'text-[#C7B7A9] hover:text-white'
              }`}
              title="Owner Mode: Full editing, recipe uploads, scripture editing, and PIN management"
            >
              <Crown className="w-3 h-3 text-[#FDE68A]" />
              <span>Owner Mode</span>
            </button>
          </div>

          {/* Reset PIN in Owner Mode */}
          {currentRole === 'owner' && (
            <button
              onClick={() => setShowPinModal(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#3F3329] hover:bg-[#4D3F34] border border-[#524438] text-[11px] text-[#EADBCC] transition-colors"
              title="Change the 4-digit guest front porch PIN"
            >
              <KeyRound className="w-3 h-3 text-[#E68A6E]" />
              <span className="hidden sm:inline">Change PIN</span>
            </button>
          )}

          {/* Micro-Ad Flywheel Trigger Button */}
          {onOpenFlywheel && (
            <button
              onClick={onOpenFlywheel}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF2ED] hover:bg-[#FBE8DE] text-[#B84A2A] font-semibold text-[11px] shadow-2xs whitespace-nowrap transition-colors"
              title="The Micro-Ad Flywheel: Run targeted $10 test campaigns & reinvest cash flow"
            >
              <TrendingUp className="w-3 h-3" />
              <span className="hidden md:inline">Ad Flywheel ($10 Tests)</span>
              <span className="md:hidden">Flywheel</span>
            </button>
          )}

          {/* Spin Up Family Space CTA Button */}
          <button
            onClick={onOpenSubscribe}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#059669] hover:bg-[#047857] text-white font-semibold text-[11px] shadow-2xs whitespace-nowrap"
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">Spin Up Sanctuary ($5/mo or $40/yr)</span>
            <span className="sm:hidden">New Space</span>
          </button>
        </div>

      </div>

      {/* Change PIN Modal (Owner Only) */}
      {showPinModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowPinModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 text-[#2D231C] space-y-4 shadow-2xl border border-[#E8DFD3]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E8DFD3]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#FAF2ED] text-[#B84A2A]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold">Reset Guest PIN</h3>
                  <p className="text-[11px] text-[#736558]">@{currentTenant.slug} front porch gate</p>
                </div>
              </div>
              <button onClick={() => setShowPinModal(false)} className="text-[#8F7F72]">✕</button>
            </div>

            <form onSubmit={handleSaveNewPin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#736558] mb-1">
                  New 4-Digit PIN
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 5678"
                  className="w-full py-2.5 px-3 bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl text-center text-lg font-mono font-bold tracking-widest text-[#2D231C] focus:outline-none focus:ring-2 focus:ring-[#B84A2A]"
                  autoFocus
                  required
                />
                <p className="text-[11px] text-[#8F7F72] mt-1 text-center">
                  Will be encrypted with bcrypt and stored on the server.
                </p>
              </div>

              {pinSuccess && (
                <div className="p-2.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs text-[#059669] font-medium flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>PIN updated successfully!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="px-3 py-1.5 text-xs text-[#736558] hover:text-[#2D231C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={newPin.length !== 4}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#B84A2A] hover:bg-[#A33F23] rounded-xl transition-colors disabled:opacity-50"
                >
                  Save Encrypted PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};

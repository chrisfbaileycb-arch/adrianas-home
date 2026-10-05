import React from 'react';
import { TenantSanctuary, UserRole } from '../types';
import { KeyRound, Sparkles, Plus, TrendingUp, Lock } from 'lucide-react';

interface TenantBarProps {
  currentTenant: TenantSanctuary;
  currentRole: UserRole;
  onOpenSubscribe: () => void;
  onOpenFlywheel: () => void;
  onSwitchTenant: (slug: string) => void;
  onLockPorch: () => void;
  onChangePin: () => void;
}

export const TenantBar: React.FC<TenantBarProps> = ({
  currentTenant,
  currentRole,
  onOpenSubscribe,
  onOpenFlywheel,
  onSwitchTenant,
  onLockPorch,
  onChangePin,
}) => {
  if (currentRole !== 'owner') return null;

  return (
    <div className="bg-[#FAF2ED] border-b border-[#F2C8B5] text-[#2D231C] px-4 py-1.5 text-xs">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#B84A2A] flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#B84A2A] animate-pulse" />
            <span>/@{currentTenant.slug}</span>
          </span>
          <span className="text-[#8F7F72] hidden sm:inline">· Owner Control</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onChangePin}
            className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#FDF8F5] border border-[#F2C8B5] rounded-lg text-[11px] font-medium transition-colors"
          >
            <KeyRound className="w-3 h-3 text-[#B84A2A]" />
            <span>Change PIN</span>
          </button>

          <button
            onClick={onOpenFlywheel}
            className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#FDF8F5] border border-[#F2C8B5] rounded-lg text-[11px] font-medium transition-colors"
          >
            <TrendingUp className="w-3 h-3 text-[#B84A2A]" />
            <span>Ad Flywheel ($10 Tests)</span>
          </button>

          <button
            onClick={onOpenSubscribe}
            className="flex items-center gap-1 px-2.5 py-1 bg-[#B84A2A] text-white hover:bg-[#A33F23] rounded-lg text-[11px] font-medium transition-colors shadow-2xs"
          >
            <Plus className="w-3 h-3" />
            <span>Spin Up Sanctuary ($5/mo or $40/yr)</span>
          </button>

          {/* Quick Demo Switcher */}
          <div className="flex items-center gap-1 text-[11px] text-[#736558] pl-2 border-l border-[#F2C8B5] hidden md:flex">
            <span>Demo:</span>
            {['adriana', 'miller', 'lofi-nest'].map((s) => (
              <button
                key={s}
                onClick={() => onSwitchTenant(s)}
                className={`px-1.5 py-0.5 rounded ${
                  currentTenant.slug === s ? 'bg-[#B84A2A] text-white font-semibold' : 'hover:underline'
                }`}
              >
                @{s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

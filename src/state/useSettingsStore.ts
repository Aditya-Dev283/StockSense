import { create } from 'zustand';
import { AppSettings } from '../types';
import { getStoredData, setStoredData } from '../lib/storage';
import { useInventoryStore } from './useInventoryStore';

interface SettingsState extends AppSettings {
  setFontSize: (size: 'standard' | 'workshop') => void;
  toggleHighContrast: () => void;
  toggleAutoDailyBackup: () => void;
  triggerBackup: (userName?: string, userRole?: string) => void;
  dismissCoachMarks: () => void;
}

const STORAGE_KEY_SETTINGS = 'stocksense_settings_v1';

const defaultSettings: AppSettings = {
  fontSize: 'standard',
  highContrast: false,
  autoDailyBackup: true,
  lastBackupTime: 'Today at 06:00 PM (Healthy)',
  dismissedCoachMarks: false,
};

export const useSettingsStore = create<SettingsState>((set, get) => {
  const initial = getStoredData<AppSettings>(STORAGE_KEY_SETTINGS, defaultSettings);

  // Apply initial DOM classes if in browser
  if (typeof document !== 'undefined') {
    if (initial.highContrast) {
      document.body.classList.add('high-contrast');
    }
    if (initial.fontSize === 'workshop') {
      document.body.classList.add('workshop-mode');
    }
  }

  const persist = (updated: Partial<AppSettings>) => {
    const next = { ...get(), ...updated };
    set(next);
    setStoredData(STORAGE_KEY_SETTINGS, {
      fontSize: next.fontSize,
      highContrast: next.highContrast,
      autoDailyBackup: next.autoDailyBackup,
      lastBackupTime: next.lastBackupTime,
      dismissedCoachMarks: next.dismissedCoachMarks,
    });
  };

  return {
    ...initial,

    setFontSize: size => {
      if (typeof document !== 'undefined') {
        if (size === 'workshop') {
          document.body.classList.add('workshop-mode');
        } else {
          document.body.classList.remove('workshop-mode');
        }
      }
      persist({ fontSize: size });
    },

    toggleHighContrast: () => {
      const nextVal = !get().highContrast;
      if (typeof document !== 'undefined') {
        if (nextVal) {
          document.body.classList.add('high-contrast');
        } else {
          document.body.classList.remove('high-contrast');
        }
      }
      persist({ highContrast: nextVal });
    },

    toggleAutoDailyBackup: () => {
      persist({ autoDailyBackup: !get().autoDailyBackup });
    },

    triggerBackup: (userName = 'System Administrator', userRole = 'owner') => {
      const inv = useInventoryStore.getState();
      const now = new Date();
      const timeStr = `Today at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Healthy)`;

      const snapshot = {
        system: 'StockSense Mechanic Inventory System',
        version: '1.0.0',
        exported_at: now.toISOString(),
        exported_by: userName,
        stats: {
          parts_count: inv.parts.length,
          transactions_count: inv.transactions.length,
          issues_count: inv.issues.length,
          orders_count: inv.orders.length,
          audit_records_count: inv.auditTrail.length,
        },
        parts: inv.parts,
        suppliers: inv.suppliers,
        transactions: inv.transactions,
        issues: inv.issues,
        orders: inv.orders,
        auditTrail: inv.auditTrail,
      };

      const jsonStr = JSON.stringify(snapshot, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `StockSense_Backup_${now.toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      persist({ lastBackupTime: timeStr });
      inv.addToast('success', `Instant backup downloaded! Snapshot saved at ${timeStr}.`);
    },

    dismissCoachMarks: () => {
      persist({ dismissedCoachMarks: true });
    },
  };
});

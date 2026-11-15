import React, { useState } from 'react';
import { Building2, Phone, Mail, MapPin, Plus } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Textarea } from '../components/common/Textarea';
import { Modal } from '../components/common/Modal';
import { useInventoryStore } from '../state/useInventoryStore';
import { useAuthStore } from '../state/useAuthStore';
import { PartCategory } from '../types';

const CATEGORIES: PartCategory[] = [
  'Brake Parts',
  'Filters',
  'Electricals',
  'Lubricants',
  'Spark Plugs',
  'Belts',
  'Bearings',
  'Suspension',
];

export const SuppliersScreen: React.FC = () => {
  const { suppliers, addSupplier } = useInventoryStore();
  const { currentUser } = useAuthStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<PartCategory[]>(['Brake Parts']);
  const [errorMsg, setErrorMsg] = useState('');

  const toggleCategory = (cat: PartCategory) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter(c => c !== cat));
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contactPerson.trim() || !phone.trim()) {
      setErrorMsg('Supplier Name, Contact Person, and Phone are required.');
      return;
    }

    addSupplier(
      {
        name: name.trim(),
        contact_person: contactPerson.trim(),
        phone: phone.trim(),
        email: email.trim() || 'vendor@stocksense.in',
        address: address.trim() || 'Auto Parts Market, Pune',
        categories: selectedCategories,
      },
      currentUser?.name || 'Staff User',
      currentUser?.role || 'owner'
    );

    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAddress('');
    setErrorMsg('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] leading-[36px] font-bold text-navy">Suppliers</h1>
          <p className="text-sm text-dim mt-0.5">
            Authorized component distributors, contact channels &amp; past invoice fulfillment
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5"
        >
          <Plus size={16} />
          <span>+ Add New Supplier</span>
        </Button>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map(sup => (
          <Card
            key={sup.id}
            className="flex flex-col justify-between space-y-4 hover:border-navy transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-[8px] bg-grey-header border border-grey text-navy flex items-center justify-center shrink-0">
                    <Building2 size={18} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-navy leading-snug">
                      {sup.name}
                    </h3>
                    <span className="text-xs text-dim block mt-0.5">
                      Rep: <strong className="text-navy">{sup.contact_person}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-1.5 text-xs text-navy pt-2 border-t border-grey">
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-orange shrink-0" />
                  <span className="code-num">{sup.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-orange shrink-0" />
                  <span className="truncate text-dim">{sup.email}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={13} className="text-orange shrink-0 mt-0.5" />
                  <span className="text-dim text-xs leading-relaxed">{sup.address}</span>
                </div>
              </div>

              {/* Supported Categories */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-dim uppercase tracking-wider block mb-1.5">
                  Supplied Categories:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {sup.categories.map((c, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-[4px] bg-grey-header border border-grey text-[11px] font-medium text-navy"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Invoices Count Footer */}
            <div className="pt-3 border-t border-grey flex items-center justify-between text-xs text-dim">
              <span>Orders Fulfilled</span>
              <span className="code-num font-semibold text-navy bg-grey-header border border-grey px-2 py-0.5 rounded-[4px]">
                {sup.past_invoices_count} Invoices
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Supplier Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Register New Supplier"
        subtitle="Add vendor details to procurement directory"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-grey-header border-l-4 border-l-black text-xs font-medium text-black">
              ⚠️ {errorMsg}
            </div>
          )}

          <Input
            label="Supplier Company Name"
            placeholder="e.g. Bosch Electricals & Systems Ltd."
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Contact Role"
              placeholder="e.g. Supplier"
              value={contactPerson}
              onChange={e => setContactPerson(e.target.value)}
              required
            />
            <Input
              label="Phone / WhatsApp"
              placeholder="+91 98220 12345"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
          </div>

          <Input
            label="Email Address"
            placeholder="orders@supplier.in"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <Textarea
            label="Warehouse / Depo Address"
            placeholder="Plot number, MIDC sector, Pune..."
            value={address}
            onChange={e => setAddress(e.target.value)}
          />

          <div>
            <label className="text-xs font-medium text-navy block mb-1">
              Supplied Component Categories
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1 rounded-[4px] text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-navy text-white border-navy font-semibold'
                        : 'bg-white border-grey text-navy hover:bg-grey'
                    }`}
                  >
                    {isSelected ? `✓ ${cat}` : cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-grey">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Register Supplier
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

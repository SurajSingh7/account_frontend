"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Trash2, Eye, Plus, Search, Filter, X, ChevronDown, Edit2, Info } from 'lucide-react';
import { Suspense } from 'react';
import Loading from './loading';

// --- CONSTANTS & CONFIG ---
const ENTITIES = ["WIBRO", "GTEL", "GISPL"];
const PRODUCTS = ["ILL", "NLD", "DIA"];
const STATUSES = ["PCD", "Terminate"];
const ORDER_TYPES = ["NEW-ORDER", "UPGRADE", "DOWNGRADE"];
const INDIAN_STATES = [
  "Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "Uttar Pradesh",
  "Haryana", "Punjab", "Gujarat", "West Bengal", "Rajasthan", "Other"
];

const ALL_MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

// Get current year and month
const getCurrentYear = () => 2026;
const getCurrentMonth = () => 0;
const getCurrentDay = () => 29;

// Generate year options (current year + 5 previous years)
const YEAR_OPTIONS = ["All", ...Array.from({ length: 6 }, (_, i) => getCurrentYear() - i)];

// Get available months based on selected year
const getAvailableMonths = (selectedYear) => {
  const currentYear = getCurrentYear();
  const currentMonthIndex = getCurrentMonth();

  if (selectedYear === currentYear) {
    return ALL_MONTHS.slice(0, currentMonthIndex + 1);
  } else {
    return ALL_MONTHS;
  }
};

// Get default date range for current year
const getDefaultDateRange = () => {
  const year = getCurrentYear();
  const month = getCurrentMonth() + 1;
  const day = getCurrentDay();
  return {
    fromDate: `${year}-01-01`,
    toDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  };
};

// --- UTILITY FUNCTIONS ---
const convertDateForStorage = (inputDate) => {
  if (!inputDate) return '';
  const [year, month, day] = inputDate.split('-');
  return `${day}-${month}-${year}`;
};

const convertDateForInput = (storedDate) => {
  if (!storedDate) return '';
  if (storedDate.includes('-') && storedDate.split('-')[0].length === 4) {
    return storedDate;
  }
  const [day, month, year] = storedDate.split('-');
  return `${year}-${month}-${day}`;
};

const formatDateToDisplay = (storedDate) => {
  if (!storedDate) return '';
  if (storedDate.includes('-') && storedDate.split('-')[0].length <= 2) {
    return storedDate;
  }
  const [year, month, day] = storedDate.split('-');
  return `${day}-${month}-${year}`;
};

// Parse stored date to Date object
const parseStoredDate = (storedDate) => {
  if (!storedDate) return null;
  const [day, month, year] = storedDate.split('-');
  return new Date(year, month - 1, day);
};

// Info Icon with Tooltip Component
const InfoTooltip = ({ formula }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block ml-1">
      <Info
        className="w-5 h-5 text-blue-500 cursor-help inline"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      />
      {show && (
        <div className="absolute z-50 p-2.5 text-sm font-semibold text-white bg-gray-800 rounded-lg shadow-lg -top-10 left-0 min-w-[150px] whitespace-nowrap">
          {formula}
          <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45 -bottom-1 left-2"></div>
        </div>
      )}
    </div>
  );
};

// Billing Address Popup Component
const BillingPopup = ({ billing, onClose }) => {
  if (!billing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md m-4 border border-gray-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-900">Billing Address</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Address</p>
            <p className="text-base font-semibold text-gray-900">{billing.address || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Area</p>
            <p className="text-base font-semibold text-gray-900">{billing.area || '-'}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase mb-1">City</p>
              <p className="text-base font-semibold text-gray-900">{billing.city || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase mb-1">Pincode</p>
              <p className="text-base font-semibold text-gray-900">{billing.pincode || '-'}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase mb-1">State</p>
            <p className="text-base font-semibold text-gray-900">{billing.state || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// End Address Popup Component
const EndAddressPopup = ({ endLabel, endAddress, onClose }) => {
  if (!endAddress) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md m-4 border border-gray-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-900">{endLabel} Address</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-base font-semibold text-gray-900 leading-relaxed">{endAddress}</p>
        </div>
      </div>
    </div>
  );
};

// Company Name Popup Component
const CompanyNamePopup = ({ companyName, onClose }) => {
  if (!companyName) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md m-4 border border-gray-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-900">Company Name</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-base font-semibold text-gray-900 leading-relaxed">{companyName}</p>
        </div>
      </div>
    </div>
  );
};

// ✅ UPDATED Collection Popup Component - WITH SPLIT SUPPORT
const CollectionPopup = ({ order, onClose, splitInfo }) => {
  // Create unique storage key based on order ID, state, and split key
  const storageKey = splitInfo 
    ? `collections_${order.id}_${splitInfo.state}_${splitInfo.splitKey}`
    : `collections_${order.id}`;
  
  const [collections, setCollections] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    date: '',
    state: splitInfo?.state || '',
    splitKey: splitInfo?.splitKey || '100'
  });

  // Save to localStorage whenever collections change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(collections));
    }
  }, [collections, storageKey]);

  const pcdDate = parseStoredDate(order.pcdDate);
  const terminateDate = parseStoredDate(order.terminateDate);
  const maxDate = terminateDate || new Date();

  const handleSubmit = () => {
    if (!formData.amount || !formData.date) {
      alert("Please fill in all fields");
      return;
    }

    const collectionData = {
      amount: formData.amount,
      date: formData.date,
      state: splitInfo?.state || '',
      splitKey: splitInfo?.splitKey || '100',
      invoiceNumber: '', // Will be linked later if needed
    };

    if (editingId !== null) {
      setCollections(collections.map(c => c.id === editingId ? { ...collectionData, id: editingId } : c));
      setEditingId(null);
    } else {
      setCollections([...collections, { ...collectionData, id: Date.now() }]);
    }
    setFormData({ amount: '', date: '', state: splitInfo?.state || '', splitKey: splitInfo?.splitKey || '100' });
  };

  const handleEdit = (collection) => {
    setFormData({ 
      amount: collection.amount, 
      date: collection.date,
      state: collection.state || '',
      splitKey: collection.splitKey || '100'
    });
    setEditingId(collection.id);
  };

  const handleDelete = (id) => {
    setCollections(collections.filter(c => c.id !== id));
  };

  const dateInputValue = formData.date ? convertDateForInput(formData.date) : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl m-4 border border-gray-200 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50 sticky top-0">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Collection Details</h3>
            {splitInfo && (
              <p className="text-sm font-semibold text-blue-600 mt-1">
                Split: {splitInfo.splitKey}% • State: {splitInfo.state}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Input Form */}
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 space-y-4">
            <h4 className="font-semibold text-gray-900">Add Collection</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup label="Amount">
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="input-field"
                />
              </InputGroup>
              
              <InputGroup label="Date">
                <input
                  type="date"
                  value={dateInputValue}
                  min={pcdDate ? pcdDate.toISOString().split('T')[0] : ''}
                  max={maxDate.toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input-field"
                />
              </InputGroup>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {editingId !== null ? 'Update Collection' : 'Add Collection'}
            </button>
          </div>

          {/* Collections List */}
          {collections.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Collections</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Amount</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Date</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">State</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Split</th>
                      <th className="px-4 py-2 text-center font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collections.map(collection => (
                      <tr key={collection.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-gray-900">₹{collection.amount}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{collection.date}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{collection.state || '-'}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{collection.splitKey}%</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEdit(collection)}
                              className="p-1 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Edit2 className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(collection.id)}
                              className="p-1 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ✅ UPDATED Account Popup Component - WITH SPLIT SUPPORT
const AccountPopup = ({ order, onClose, splitInfo }) => {
  // Create unique storage key based on order ID, state, and split key
  const storageKey = splitInfo 
    ? `accounts_${order.id}_${splitInfo.state}_${splitInfo.splitKey}`
    : `accounts_${order.id}`;
  
  const [accounts, setAccounts] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    date: '',
    state: splitInfo?.state || '',
    splitKey: splitInfo?.splitKey || '100'
  });

  // Save to localStorage whenever accounts change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(accounts));
    }
  }, [accounts, storageKey]);

  const pcdDate = parseStoredDate(order.pcdDate);
  const terminateDate = parseStoredDate(order.terminateDate);
  const maxDate = terminateDate || new Date();

  const dateInputValue = formData.date ? convertDateForInput(formData.date) : '';
  const minDateString = pcdDate ? pcdDate.toISOString().split('T')[0] : '';
  const maxDateString = maxDate.toISOString().split('T')[0];

  const handleSubmit = () => {
    if (!formData.invoiceNumber || !formData.date) {
      alert("Please fill in all fields");
      return;
    }

    const accountData = {
      invoiceNumber: formData.invoiceNumber,
      date: formData.date,
      state: splitInfo?.state || '',
      splitKey: splitInfo?.splitKey || '100',
    };

    if (editingId !== null) {
      setAccounts(accounts.map(a => a.id === editingId ? { ...accountData, id: editingId } : a));
      setEditingId(null);
    } else {
      setAccounts([...accounts, { ...accountData, id: Date.now() }]);
    }
    setFormData({ invoiceNumber: '', date: '', state: splitInfo?.state || '', splitKey: splitInfo?.splitKey || '100' });
  };

  const handleEdit = (account) => {
    setFormData({ 
      invoiceNumber: account.invoiceNumber, 
      date: account.date,
      state: account.state || '',
      splitKey: account.splitKey || '100'
    });
    setEditingId(account.id);
  };

  const handleDelete = (id) => {
    setAccounts(accounts.filter(a => a.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl m-4 border border-gray-200 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50 sticky top-0">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Invoice Details</h3>
            {splitInfo && (
              <p className="text-sm font-semibold text-purple-600 mt-1">
                Split: {splitInfo.splitKey}% • State: {splitInfo.state}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Input Form */}
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 space-y-4">
            <h4 className="font-semibold text-gray-900">Add Invoice</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup label="Invoice Number">
                <input
                  type="text"
                  placeholder="Enter invoice number"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  className="input-field"
                />
              </InputGroup>
              
              <InputGroup label="Date">
                <input
                  type="date"
                  value={dateInputValue}
                  min={minDateString}
                  max={maxDateString}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input-field"
                />
              </InputGroup>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {editingId !== null ? 'Update Invoice' : 'Add Invoice'}
            </button>
          </div>

          {/* Accounts List */}
          {accounts.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Invoices</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Invoice Number</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Date</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">State</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">Split</th>
                      <th className="px-4 py-2 text-center font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map(account => (
                      <tr key={account.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-gray-900">{account.invoiceNumber}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{account.date}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{account.state || '-'}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{account.splitKey}%</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEdit(account)}
                              className="p-1 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Edit2 className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(account.id)}
                              className="p-1 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---
const ViewDetailsModal = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4 border border-gray-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-semibold text-gray-900">Order Details: {order.orderId}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <Section title="Basic Info">
            <Detail label="Company" value={order.companyName} />
            <Detail label="Entity" value={order.entity} />
            <Detail label="Product" value={order.product} />
            <Detail label="Order Type" value={order.orderType} />
            <Detail label="Status" value={order.status} />
            <div className="grid grid-cols-2 gap-3">
              <Detail label="PCD Date" value={formatDateToDisplay(order.pcdDate)} />
              <Detail label="Termination Date" value={formatDateToDisplay(order.terminateDate)} />
            </div>
          </Section>

          <Section title="Technical Details">
            <Detail label="LSI ID" value={order.lsiId} />
            <Detail label="Capacity (Mbps)" value={order.capacity} />
            <Detail label="Capacity (Kbps)" value={Number(order.capacity) * 1024} />
          </Section>

          <Section title="Endpoints" className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-semibold text-base text-gray-500 mb-2">End A</p>
                <p className="text-gray-900 text-base font-semibold">{order.endA}</p>
              </div>
              {order.endB && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-semibold text-base text-gray-500 mb-2">End B</p>
                  <p className="text-gray-900 text-base font-semibold">{order.endB}</p>
                </div>
              )}
            </div>
          </Section>

          <Section title="Billing Details" className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BillingBlock title={order.product === 'NLD' ? "Billing 1" : "Billing Address"} data={order.billing1} />
              {order.product === 'NLD' && (
                <BillingBlock title="Billing 2" data={order.billing2} />
              )}
            </div>
          </Section>

          <Section title="Financials" className="md:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Detail label="Rate / Mbps" value={`₹${order.amount}`} />
              <Detail label="Total Base" value={`₹${order.amount * order.capacity}`} />
              <Detail label="GST (18%)" value={`₹${(order.amount * order.capacity * 0.18).toFixed(2)}`} />
              <Detail label="Grand Total" value={`₹${(order.amount * order.capacity * 1.18).toFixed(2)}`} />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children, className = "" }) => (
  <div className={`border border-gray-200 p-5 rounded-lg bg-gray-50 ${className}`}>
    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4 pb-2 border-b border-gray-200">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const Detail = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</span>
    <span className="font-semibold text-gray-900 text-base">{value || '-'}</span>
  </div>
);

const BillingBlock = ({ title, data }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200">
    <p className="font-semibold text-sm text-blue-600 mb-2 uppercase">{title}</p>
    <p className="text-base font-semibold text-gray-700 leading-relaxed">{data?.address}, {data?.area}</p>
    <p className="text-base font-semibold text-gray-600 mt-1">{data?.city}, {data?.state} - {data?.pincode}</p>
  </div>
);

const CreateOrderForm = ({ onAddOrder }) => {
  const initialBilling = { address: '', area: '', city: '', pincode: '', state: '' };

  const [formData, setFormData] = useState({
    product: 'ILL',
    endA: '',
    endB: '',
    billing1: { ...initialBilling },
    billing2: { ...initialBilling },
    orderId: '',
    companyName: '',
    entity: ENTITIES[0],
    capacity: '',
    lsiId: '',
    amount: '',
    status: STATUSES[0],
    orderType: ORDER_TYPES[0],
    pcdDate: '',
    terminateDate: ''
  });

  const handleInputChange = (e, section = null, field = null) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: e.target.value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.companyName || !formData.orderId) return alert("Please fill required fields");

    if (formData.pcdDate && formData.terminateDate) {
      const pcd = new Date(formData.pcdDate);
      const terminate = new Date(formData.terminateDate);
      if (pcd >= terminate) {
        return alert("PCD Date must be earlier than Termination Date");
      }
    }

    const orderData = {
      ...formData,
      pcdDate: convertDateForStorage(formData.pcdDate),
      terminateDate: convertDateForStorage(formData.terminateDate),
      id: Date.now()
    };

    onAddOrder(orderData);
    alert("Order Created Successfully!");
  };

  const showEndB = ['ILL', 'NLD'].includes(formData.product);
  const isNLD = formData.product === 'NLD';

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-200">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-gray-900">
        <div className="p-2.5 bg-blue-600 rounded-lg">
          <Plus className="w-6 h-6 text-white" />
        </div>
        Create New Order
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Row 1: Core Selection */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <InputGroup label="Product">
            <select name="product" value={formData.product} onChange={handleInputChange} className="input-field">
              {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </InputGroup>
          <InputGroup label="Entity">
            <select name="entity" value={formData.entity} onChange={handleInputChange} className="input-field">
              {ENTITIES.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </InputGroup>
          <InputGroup label="Order Type">
            <select name="orderType" value={formData.orderType} onChange={handleInputChange} className="input-field">
              {ORDER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </InputGroup>
          <InputGroup label="Status">
            <select name="status" value={formData.status} onChange={handleInputChange} className="input-field">
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </InputGroup>
        </div>

        {/* Row 2: Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputGroup label="Order ID">
            <input type="text" name="orderId" value={formData.orderId} onChange={handleInputChange} className="input-field" required />
          </InputGroup>
          <InputGroup label="Company Name">
            <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} className="input-field" required />
          </InputGroup>
          <InputGroup label="LSI ID">
            <input type="text" name="lsiId" value={formData.lsiId} onChange={handleInputChange} className="input-field" />
          </InputGroup>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputGroup label="PCD Date">
            <input type="date" name="pcdDate" value={formData.pcdDate} onChange={handleInputChange} className="input-field" />
          </InputGroup>
          <InputGroup label="Termination Date">
            <input type="date" name="terminateDate" value={formData.terminateDate} onChange={handleInputChange} className="input-field" />
          </InputGroup>
        </div>

        {/* Technical & Financial */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputGroup label="Capacity (Mbps)">
            <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} className="input-field" placeholder="e.g., 50" />
          </InputGroup>
          <InputGroup label="Amount (Per Mbps/Month)">
            <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} className="input-field" placeholder="e.g., 45" />
          </InputGroup>
        </div>

        {/* Endpoints */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-gray-50 rounded-lg border border-gray-200">
          <InputGroup label="End A Address">
            <textarea name="endA" value={formData.endA} onChange={handleInputChange} className="input-field h-24 resize-none" />
          </InputGroup>
          {showEndB && (
            <InputGroup label="End B Address">
              <textarea name="endB" value={formData.endB} onChange={handleInputChange} className="input-field h-24 resize-none" />
            </InputGroup>
          )}
        </div>

        {/* Billing Sections */}
        <div className="space-y-4">
          <BillingForm
            title={isNLD ? "Billing Details 1" : "Billing Details"}
            data={formData.billing1}
            onChange={(e, field) => handleInputChange(e, 'billing1', field)}
          />

          {isNLD && (
            <BillingForm
              title="Billing Details 2"
              data={formData.billing2}
              onChange={(e, field) => handleInputChange(e, 'billing2', field)}
            />
          )}
        </div>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-lg transition-colors shadow-sm text-base">
          Create Order
        </button>
      </form>
    </div>
  );
};

const BillingForm = ({ title, data, onChange }) => (
  <div className="border border-gray-200 p-5 rounded-lg bg-gray-50">
    <h3 className="font-semibold text-gray-900 mb-4 text-base uppercase">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <input placeholder="Complete Address" value={data.address} onChange={(e) => onChange(e, 'address')} className="input-field md:col-span-3" />
      <input placeholder="Area" value={data.area} onChange={(e) => onChange(e, 'area')} className="input-field" />
      <input placeholder="City" value={data.city} onChange={(e) => onChange(e, 'city')} className="input-field" />
      <input placeholder="Pincode" value={data.pincode} onChange={(e) => onChange(e, 'pincode')} className="input-field" />
      <select value={data.state} onChange={(e) => onChange(e, 'state')} className="input-field">
        <option value="">Select State</option>
        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  </div>
);

const InputGroup = ({ label, children }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const EditOrderModal = ({ order, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    ...order,
    pcdDate: convertDateForInput(order.pcdDate),
    terminateDate: convertDateForInput(order.terminateDate)
  });

  if (!order) return null;

  const handleInputChange = (e, billingKey = null, billingField = null) => {
    const { name, value } = e.target;
    if (billingKey) {
      setFormData(prev => ({
        ...prev,
        [billingKey]: { ...prev[billingKey], [billingField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    if (formData.pcdDate && formData.terminateDate) {
      const pcd = new Date(formData.pcdDate);
      const terminate = new Date(formData.terminateDate);
      if (pcd >= terminate) {
        return alert("PCD Date must be earlier than Termination Date");
      }
    }

    const updatedData = {
      ...formData,
      pcdDate: convertDateForStorage(formData.pcdDate),
      terminateDate: convertDateForStorage(formData.terminateDate)
    };
    onSave(updatedData);
    onClose();
  };

  const isNLD = formData.product === 'NLD';
  const showEndB = ['ILL', 'NLD'].includes(formData.product);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4 border border-gray-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-semibold text-gray-900">Edit Order: {order.orderId}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Core Selection */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <InputGroup label="Product">
              <select name="product" value={formData.product} onChange={handleInputChange} className="input-field">
                {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </InputGroup>
            <InputGroup label="Entity">
              <select name="entity" value={formData.entity} onChange={handleInputChange} className="input-field">
                {ENTITIES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </InputGroup>
            <InputGroup label="Order Type">
              <select name="orderType" value={formData.orderType} onChange={handleInputChange} className="input-field">
                {ORDER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </InputGroup>
            <InputGroup label="Status">
              <select name="status" value={formData.status} onChange={handleInputChange} className="input-field">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </InputGroup>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputGroup label="Order ID">
              <input type="text" name="orderId" value={formData.orderId} onChange={handleInputChange} className="input-field" required />
            </InputGroup>
            <InputGroup label="Company Name">
              <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} className="input-field" required />
            </InputGroup>
            <InputGroup label="LSI ID">
              <input type="text" name="lsiId" value={formData.lsiId} onChange={handleInputChange} className="input-field" />
            </InputGroup>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup label="PCD Date">
              <input type="date" name="pcdDate" value={formData.pcdDate} onChange={handleInputChange} className="input-field" />
            </InputGroup>
            <InputGroup label="Termination Date">
              <input type="date" name="terminateDate" value={formData.terminateDate} onChange={handleInputChange} className="input-field" />
            </InputGroup>
          </div>

          {/* Technical & Financial */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup label="Capacity (Mbps)">
              <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} className="input-field" />
            </InputGroup>
            <InputGroup label="Amount (Per Mbps/Month)">
              <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} className="input-field" />
            </InputGroup>
          </div>

          {/* Endpoints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-gray-50 rounded-lg border border-gray-200">
            <InputGroup label="End A Address">
              <textarea name="endA" value={formData.endA} onChange={handleInputChange} className="input-field h-24 resize-none" />
            </InputGroup>
            {showEndB && (
              <InputGroup label="End B Address">
                <textarea name="endB" value={formData.endB} onChange={handleInputChange} className="input-field h-24 resize-none" />
              </InputGroup>
            )}
          </div>

          {/* Billing Sections */}
          <div className="space-y-4">
            <BillingForm
              title={isNLD ? "Billing Details 1" : "Billing Details"}
              data={formData.billing1}
              onChange={(e, field) => handleInputChange(e, 'billing1', field)}
            />
            {isNLD && (
              <BillingForm
                title="Billing Details 2"
                data={formData.billing2}
                onChange={(e, field) => handleInputChange(e, 'billing2', field)}
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-5 border-t border-gray-200">
            <button onClick={onClose} className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-base">
              Cancel
            </button>
            <button onClick={handleSave} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-sm text-base">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderList = ({ orders, onView, onEdit, onDelete }) => {
  const defaultDateRange = getDefaultDateRange();

  const [filters, setFilters] = useState({
    company: '',
    state: '',
    entity: '',
    statusFilter: 'active',
    periodType: 'period',
    selectedYear: getCurrentYear(),
    selectedMonth: ALL_MONTHS[getCurrentMonth()],
    fromDate: defaultDateRange.fromDate,
    toDate: defaultDateRange.toDate
  });

  const getPeriodLabel = () => {
    if (filters.selectedYear === 'All') {
      return 'All';
    }
    if (filters.selectedMonth === 'All') {
      return `All ${filters.selectedYear}`;
    }
    return `${filters.selectedMonth} ${filters.selectedYear}`;
  };

  const handleYearChange = (year) => {
    if (year === 'All') {
      setFilters(prev => ({
        ...prev,
        selectedYear: year,
        selectedMonth: 'All'
      }));
    } else {
      const yearNum = parseInt(year);
      const currentYear = getCurrentYear();

      setFilters(prev => ({
        ...prev,
        selectedYear: year,
        selectedMonth: yearNum === currentYear ? ALL_MONTHS[getCurrentMonth()] : 'DEC'
      }));
    }
  };

  const availableMonths = useMemo(() => {
    if (filters.selectedYear === 'All') {
      return [];
    }
    return getAvailableMonths(parseInt(filters.selectedYear));
  }, [filters.selectedYear]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchCompany = order.companyName.toLowerCase().includes(filters.company.toLowerCase());
      const matchEntity = filters.entity ? order.entity === filters.entity : true;
      const matchState = filters.state
        ? (order.billing1?.state?.includes(filters.state) || order.billing2?.state?.includes(filters.state))
        : true;

      let matchStatus = true;
      if (filters.statusFilter === 'active') {
        matchStatus = order.status === 'PCD';
      } else {
        matchStatus = order.status === 'Terminate';
      }

      let matchDateFilter = true;
      const relevantDateField = (filters.statusFilter === 'inactive' && order.status === 'Terminate')
        ? order.terminateDate
        : order.pcdDate;

      const orderDate = parseStoredDate(relevantDateField);

      if (orderDate) {
        if (filters.periodType === 'period') {
          if (filters.selectedYear !== 'All') {
            const selectedYearNum = parseInt(filters.selectedYear);

            if (filters.selectedMonth === 'All') {
              matchDateFilter = orderDate.getFullYear() === selectedYearNum;
            } else {
              const monthIndex = ALL_MONTHS.indexOf(filters.selectedMonth);
              matchDateFilter = orderDate.getFullYear() === selectedYearNum && orderDate.getMonth() === monthIndex;
            }
          }
        } else if (filters.periodType === 'dateRange') {
          if (filters.fromDate && filters.toDate) {
            const fromDate = new Date(filters.fromDate);
            const toDate = new Date(filters.toDate);
            toDate.setHours(23, 59, 59, 999);
            matchDateFilter = orderDate >= fromDate && orderDate <= toDate;
          }
        }
      }

      return matchCompany && matchEntity && matchState && matchStatus && matchDateFilter;
    });
  }, [orders, filters]);

  return (
    <div className="space-y-5">
      {/* Search & Filter Toolbar */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 space-y-4">
        {/* First Row: Search, State, Entity, Status */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] border border-gray-300 rounded-lg px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              placeholder="Search Company..."
              className="bg-transparent outline-none text-base font-semibold w-full text-gray-700 placeholder-gray-400"
              value={filters.company}
              onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value }))}
            />
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[200px] border border-gray-300 rounded-lg px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              className="bg-transparent outline-none text-base font-semibold w-full text-gray-700"
              value={filters.state}
              onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
            >
              <option value="">Filter by State</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[200px] border border-gray-300 rounded-lg px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
            <ChevronDown className="w-5 h-5 text-gray-400" />
            <select
              className="bg-transparent outline-none text-base font-semibold w-full text-gray-700"
              value={filters.entity}
              onChange={(e) => setFilters(prev => ({ ...prev, entity: e.target.value }))}
            >
              <option value="">Filter by Entity</option>
              {ENTITIES.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[200px] border border-gray-300 rounded-lg px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              className="bg-transparent outline-none text-base font-semibold w-full text-gray-700"
              value={filters.statusFilter}
              onChange={(e) => setFilters(prev => ({ ...prev, statusFilter: e.target.value }))}
            >
              <option value="active">Active (PCD)</option>
              <option value="inactive">Inactive (Terminate)</option>
            </select>
          </div>
        </div>

        {/* Second Row: Period Filters - Tab Style */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex gap-2 mb-4 border-b border-gray-200">
            <button
              onClick={() => {
                const defaultRange = getDefaultDateRange();
                setFilters(prev => ({
                  ...prev,
                  periodType: 'period',
                  fromDate: defaultRange.fromDate,
                  toDate: defaultRange.toDate
                }));
              }}
              className={`px-5 py-2.5 font-semibold text-sm transition-all border-b-2 ${filters.periodType === 'period'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              Period Selector
            </button>
            <button
              onClick={() => {
                const defaultRange = getDefaultDateRange();
                setFilters(prev => ({
                  ...prev,
                  periodType: 'dateRange',
                  fromDate: defaultRange.fromDate,
                  toDate: defaultRange.toDate
                }));
              }}
              className={`px-5 py-2.5 font-semibold text-sm transition-all border-b-2 ${filters.periodType === 'dateRange'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              Date Range
            </button>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg">
            {filters.periodType === 'period' && (
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                  <label className="text-sm font-semibold text-gray-600">
                    Year
                  </label>
                  <select
                    className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-teal-400 min-w-[120px]"
                    value={filters.selectedYear}
                    onChange={(e) => handleYearChange(e.target.value)}
                  >
                    {YEAR_OPTIONS.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {filters.selectedYear !== 'All' && (
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 shadow-sm flex-1 min-w-[420px]">
                    <label className="text-sm font-semibold text-gray-600 whitespace-nowrap">
                      Month
                    </label>

                    <div className="flex gap-2 flex-wrap justify-center">
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, selectedMonth: 'All' }))}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${filters.selectedMonth === 'All'
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md scale-105'
                          : 'bg-white text-gray-700 border border-gray-200 hover:border-teal-300 hover:shadow-sm'
                          }`}
                      >
                        All
                      </button>

                      {ALL_MONTHS.map(month => {
                        const isAvailable = availableMonths.includes(month);
                        return (
                          <button
                            key={month}
                            onClick={() =>
                              isAvailable &&
                              setFilters(prev => ({ ...prev, selectedMonth: month }))
                            }
                            disabled={!isAvailable}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${filters.selectedMonth === month
                              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md scale-105'
                              : isAvailable
                                ? 'bg-white text-gray-700 border border-gray-200 hover:border-teal-300 hover:shadow-sm'
                                : 'bg-gray-100 text-gray-300 border border-gray-200 cursor-not-allowed'
                              }`}
                          >
                            {month}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {filters.periodType === 'dateRange' && (
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                  <label className="text-sm font-semibold text-gray-600 whitespace-nowrap">
                    From Date:
                  </label>
                  <input
                    type="date"
                    className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-teal-400"
                    value={filters.fromDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))}
                  />
                </div>

                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                  <label className="text-sm font-semibold text-gray-600 whitespace-nowrap">
                    To Date:
                  </label>
                  <input
                    type="date"
                    className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-teal-400"
                    value={filters.toDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))}
                  />
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-sm font-semibold text-blue-700">
                    Showing: {new Date(filters.fromDate).toLocaleDateString('en-IN')} - {new Date(filters.toDate).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cards Render */}
      <div className="space-y-5">
        {filteredOrders.length === 0 ? (
          <div className="text-center text-gray-500 py-20 bg-white rounded-lg border border-gray-200 border-dashed">
            <p className="text-xl font-semibold">No orders found.</p>
            <p className="text-base font-semibold text-gray-400 mt-2">Try adjusting your filters or create a new order.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <OrderCard key={order.id} order={order} onView={onView} onEdit={onEdit} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
};

// ✅ UPDATED OrderCard Component - WITH SPLIT-AWARE BUTTONS
const OrderCard = ({ order, onView, onEdit, onDelete }) => {
  const [showBillingPopup, setShowBillingPopup] = useState(null);
  const [showEndPopup, setShowEndPopup] = useState(null);
  const [showCompanyPopup, setShowCompanyPopup] = useState(false);
  const [showCollectionPopup, setShowCollectionPopup] = useState(false);
  const [showAccountPopup, setShowAccountPopup] = useState(false);
  const [activeSplitInfo, setActiveSplitInfo] = useState(null);

  const isNLD = order.product === "NLD";
  const state1 = order.billing1?.state || "";
  const state2 = order.billing2?.state || "";
  const areStatesDifferent = isNLD && state1 !== state2 && state2 !== "";

  const capacityMbps = Number(order.capacity) || 0;
  const capacityKbps = capacityMbps * 1024;
  const baseRate = Number(order.amount) || 0;
  const totalAmountLink = baseRate * capacityMbps;

  const truncateEndText = (text, limit = 50) => {
    if (!text) return '-';
    if (text.length <= limit) return text;
    return (
      <>
        {text.substring(0, limit)}
        <span
          className="text-blue-600 cursor-pointer hover:underline ml-1 font-semibold"
          onClick={() => setShowEndPopup(text)}
        >
          ...more
        </span>
      </>
    );
  };

  // ✅ FIXED renderRow - Always includes state information
  const renderRow = (billingObj, splitFactor = 1, billingLabel) => {
    const splitAmount = baseRate / splitFactor;
    const rowTotalAmount = totalAmountLink / splitFactor;
    const gstAmount = rowTotalAmount * 0.18;
    const finalTotal = rowTotalAmount + gstAmount;
    const arcTotal = finalTotal * 12;

    // ✅ FIXED: Always include state information, even for 100% split
    const splitInfo = {
      state: billingObj.state || '',
      splitKey: splitFactor === 2 ? '50' : '100'
    };

    return (
      <tr className="border-t border-gray-200 text-base hover:bg-gray-50 transition-colors">
        <td className="py-4 px-4 font-semibold text-gray-900">{order.orderId}</td>
        <td className="py-4 px-4 font-semibold text-gray-600">{order.lsiId}</td>
        <td className="py-4 px-4 font-semibold text-gray-700">{capacityMbps} Mbps</td>
        <td className="py-4 px-4 font-semibold text-gray-600">{capacityKbps.toLocaleString()}</td>
        <td className="py-4 px-4 font-semibold text-gray-600">{truncateEndText(billingObj.address, 20)}</td>
        <td className="py-4 px-4 font-semibold text-gray-900">{billingObj.state || '-'}</td>
        <td className="py-4 px-4 font-bold text-blue-700">₹{splitAmount.toFixed(2)}</td>
        <td className="py-4 px-4 font-bold text-blue-600">₹{rowTotalAmount.toFixed(0)}</td>
        <td className="py-4 px-4 text-sm font-semibold text-gray-600">18%</td>
        <td className="py-4 px-4 font-semibold text-gray-700">₹{gstAmount.toFixed(0)}</td>
        <td className="py-4 px-4 font-bold text-green-700">₹{finalTotal.toFixed(0)}</td>
        <td className="py-4 px-4 font-bold text-purple-700">₹{arcTotal.toFixed(0)}</td>
        <td className="py-4 px-4 text-center">
          <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${splitFactor === 2 ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
            {splitFactor === 2 ? '50%' : '100%'}
          </span>
        </td>
        <td className="py-4 px-4">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => onView(order)}
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
              title="View Order"
            >
              <Eye className="w-5 h-5 text-blue-600" />
            </button>
            <button
              onClick={() => onEdit(order)}
              className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
              title="Edit Order"
            >
              <Edit2 className="w-5 h-5 text-amber-600" />
            </button>
            <button
              onClick={() => onDelete(order.id)}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Order"
            >
              <Trash2 className="w-5 h-5 text-red-600" />
            </button>
            <button
              onClick={() => {
                setActiveSplitInfo(splitInfo);
                setShowCollectionPopup(true);
              }}
              className="p-2 hover:bg-green-50 rounded-lg transition-colors font-semibold text-green-600"
              title={`Collection Details - ${splitInfo.state} (${splitInfo.splitKey}%)`}
            >
              C
            </button>
            <button
              onClick={() => {
                setActiveSplitInfo(splitInfo);
                setShowAccountPopup(true);
              }}
              className="p-2 hover:bg-purple-50 rounded-lg transition-colors font-semibold text-purple-600"
              title={`Invoice Details - ${splitInfo.state} (${splitInfo.splitKey}%)`}
            >
              A
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
        {/* Card Header */}
        <div className="bg-gray-50 px-6 py-5 border-b border-gray-200 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 flex-wrap">
                <span className="text-gray-600 font-semibold text-base">Order Id:</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-900 rounded-lg text-base font-bold border border-purple-200">
                  {order.orderId}
                </span>
                <span className="text-gray-400 text-base">•</span>
                <span className="text-gray-600 font-semibold text-base">Company:</span>
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 rounded-lg text-base font-semibold border border-blue-200">
                  {truncateEndText(order.companyName, 50)}
                </span>
              </h3>

              <p className="text-sm font-semibold text-gray-600 mt-3 flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-600">End A:</span>
                <span className="bg-amber-50 border-amber-200 border-1 rounded-full px-2.5 py-1">{truncateEndText(order.endA, 30)}</span>
                <span className="text-gray-400">•</span>
                <span className="font-semibold text-gray-600">End B:</span>
                <span className="bg-green-100 border-1 border-green-200 rounded-full px-2.5 py-1">{truncateEndText(order.endB, 30)}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 text-right">
            <div className="flex gap-2 items-center flex-wrap justify-end">
              <span className="text-sm text-gray-600 font-semibold bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                PCD: {formatDateToDisplay(order.pcdDate) || '-'}
              </span>

              {order.terminateDate && (
                <span className="text-sm text-red-600 font-semibold bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                  Terminate: {formatDateToDisplay(order.terminateDate)}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              <Badge color="blue">{order.orderType}</Badge>
              <Badge color="purple">{order.product}</Badge>
              <Badge color={order.status === 'PCD' ? 'green' : 'red'}>{order.status}</Badge>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-sm font-semibold text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-4 font-semibold text-gray-700">Order ID</th>
                <th className="px-4 py-4 font-semibold text-gray-700">LSI ID</th>
                <th className="px-4 py-4 font-semibold text-gray-700">Cap (Mb)</th>
                <th className="px-4 py-4 font-semibold text-gray-700">Cap (Kb)</th>
                <th className="px-4 py-4 font-semibold text-gray-700">Billing</th>
                <th className="px-4 py-4 font-semibold text-gray-700">State</th>
                <th className="px-4 py-4 font-semibold text-gray-700">Rate</th>
                <th className="px-4 py-4 font-semibold text-gray-700">Total</th>
                <th className="px-4 py-4 font-semibold text-gray-700">GST</th>
                <th className="px-4 py-4 font-semibold text-gray-700">GST Amt</th>
                <th className="px-4 py-4 font-semibold text-gray-700">Grand Total</th>
                <th className="px-4 py-4 font-semibold text-gray-700">ARC Total</th>
                <th className="px-4 py-4 font-semibold text-gray-700">Split</th>
                <th className="px-4 py-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {areStatesDifferent ? (
                <>
                  {renderRow(order.billing1, 2, "Billing 1")}
                  {renderRow(order.billing2, 2, "Billing 2")}
                </>
              ) : (
                renderRow(order.billing1, 1, "Billing")
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Billing Popup */}
      {showBillingPopup && (
        <BillingPopup
          billing={showBillingPopup}
          onClose={() => setShowBillingPopup(null)}
        />
      )}

      {/* End Address Popup */}
      {showEndPopup && (
        <EndAddressPopup
          endLabel={showEndPopup === order.endA ? "End A" : "End B"}
          endAddress={showEndPopup}
          onClose={() => setShowEndPopup(null)}
        />
      )}

      {/* Company Name Popup */}
      {showCompanyPopup && (
        <CompanyNamePopup
          companyName={order.companyName}
          onClose={() => setShowCompanyPopup(false)}
        />
      )}

      {/* Collection Popup with Split Info */}
      {showCollectionPopup && (
        <CollectionPopup
          order={order}
          splitInfo={activeSplitInfo}
          onClose={() => {
            setShowCollectionPopup(false);
            setActiveSplitInfo(null);
          }}
        />
      )}

      {/* Account Popup with Split Info */}
      {showAccountPopup && (
        <AccountPopup
          order={order}
          splitInfo={activeSplitInfo}
          onClose={() => {
            setShowAccountPopup(false);
            setActiveSplitInfo(null);
          }}
        />
      )}
    </>
  );
};


const Badge = ({ children, color }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-800 border border-blue-200",
    green: "bg-green-100 text-green-800 border border-green-200",
    red: "bg-red-100 text-red-800 border border-red-200",
    purple: "bg-purple-100 text-purple-800 border border-purple-200",
    gray: "bg-gray-100 text-gray-800 border border-gray-200",
  };
  return <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${colors[color] || colors.gray}`}>{children}</span>;
};

// --- MAIN PAGE COMPONENT ---
export default function BillingManagementSystem() {
  const [viewOrder, setViewOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('list');

  const [orders, setOrders] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("app_orders");
    if (stored) {
      setOrders(JSON.parse(stored));
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("app_orders", JSON.stringify(orders));
  }, [orders, hydrated]);

  const addOrder = (newOrder) => {
    setOrders(prev => [newOrder, ...prev]);
    setActiveTab('list');
  };

  const handleEditOrder = (order) => {
    setEditOrder(order);
  };

  const handleSaveEdit = (updatedOrder) => {
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    setEditOrder(null);
  };

  const handleDeleteOrder = (orderId) => {
    if (confirm("Are you sure you want to delete this order?")) {
      setOrders(prev => prev.filter(o => o.id !== orderId));
    }
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to delete all data?")) {
      setOrders([]);
      localStorage.removeItem('app_orders');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-5 md:p-6" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      <header className="mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            PCD Closure Overview
          </h1>
          <p className="text-gray-600 text-base font-semibold mt-2">
            Centralized dashboard to monitor, track, and complete all PCD closure and billing operations seamlessly.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors text-base ${activeTab === 'list' ? 'bg-gray-900 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
          >
            View List
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors text-base ${activeTab === 'create' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
          >
            + Create Order
          </button>
          {orders.length > 0 && (
            <button onClick={handleClearAll} className="p-3 text-red-500 hover:bg-red-50 rounded-lg border border-red-200 transition-colors" title="Clear All Data">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto">
        {activeTab === 'create' ? (
          <CreateOrderForm onAddOrder={addOrder} />
        ) : (
          <Suspense fallback={<Loading />}>
            <OrderList
              orders={orders}
              onView={setViewOrder}
              onEdit={handleEditOrder}
              onDelete={handleDeleteOrder}
            />
          </Suspense>
        )}
      </main>

      {viewOrder && (
        <ViewDetailsModal order={viewOrder} onClose={() => setViewOrder(null)} />
      )}

      {editOrder && (
        <EditOrderModal order={editOrder} onClose={() => setEditOrder(null)} onSave={handleSaveEdit} />
      )}

      <style jsx global>{`
        .input-field {
          @apply w-full px-4 py-2.5 border border-gray-300 rounded-lg text-base font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all;
        }
      `}</style>
    </div>
  );
}

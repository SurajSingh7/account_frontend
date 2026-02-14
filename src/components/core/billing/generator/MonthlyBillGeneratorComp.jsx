'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Calendar, RefreshCw, FileText, Trash2, Edit2, Save, X, ArrowLeft, 
  Filter, Download, TrendingUp, DollarSign, Calendar as CalendarIcon,
  CheckCircle2, Clock, FileCheck, Eye, Plus, Trash, Receipt, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

// Date utility functions for DD-MM-YYYY format
const formatDateToDisplay = (dateStr) => {
  if (!dateStr) return '';
  if (dateStr.includes('-') && dateStr.split('-')[0].length <= 2) {
    return dateStr;
  }
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};

const formatDateToInput = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3 && parts[0].length <= 2) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};

const getCurrentDateDDMMYYYY = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

// Helper to get month start and end dates
const getMonthRange = (monthStr) => {
  // monthStr format: "January 2026"
  const [monthName, year] = monthStr.split(' ');
  const monthIndex = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'].indexOf(monthName);
  
  const startDate = new Date(parseInt(year), monthIndex, 1);
  const endDate = new Date(parseInt(year), monthIndex + 1, 0);
  
  const formatDate = (date) => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };
  
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
};

// Helper function to calculate totals from array
const calculateTotal = (arr) => {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
};

// Helper function to calculate misc sell total with GST
const calculateMiscSellTotal = (arr) => {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((sum, item) => sum + (Number(item.totalWithGst) || Number(item.amount) || 0), 0);
};

// Separate component for View/Edit Mode
const BillingDetailModal = ({ 
  billing, 
  mode, 
  onClose, 
  onSave, 
  onDelete,
  onModeChange 
}) => {
  const [editFormData, setEditFormData] = useState({...billing});
  const isEditMode = mode === 'edit';

  const handleSave = async () => {
    await onSave(editFormData);
  };

 const handleAddEntry = (arrayName) => {
  let newEntry;

  if (arrayName === 'creditNotes') {
    newEntry = {
      submitDate: getCurrentDateDDMMYYYY(), // date credit note was submitted
      periodStart: '',                      // period start (within current month)
      periodEnd: '',                        // period end (within current month)
      amount: 0,                            // auto-calculated, not editable
      notes: '',
    };
  } else if (arrayName === 'miscellaneousSell') {
    newEntry = {
      date: getCurrentDateDDMMYYYY(),
      amount: 0,
      notes: '',
      cgst: 0,
      sgst: 0,
      igst: 0,
      totalWithGst: 0,
    };
  } else {
    newEntry = { date: getCurrentDateDDMMYYYY(), amount: 0, notes: '' };
  }

  setEditFormData({
    ...editFormData,
    [arrayName]: [...(editFormData[arrayName] || []), newEntry],
  });
};

  const handleRemoveEntry = (arrayName, index) => {
    const updatedArray = editFormData[arrayName].filter((_, i) => i !== index);
    setEditFormData({
      ...editFormData,
      [arrayName]: updatedArray
    });
  };

  const handleUpdateEntry = (arrayName, index, field, value) => {
    const updatedArray = [...editFormData[arrayName]];
    updatedArray[index] = { ...updatedArray[index], [field]: value };
    
    // Auto-calculate GST for miscellaneous sell
    if (arrayName === 'miscellaneousSell' && field === 'amount') {
      const amount = Number(value) || 0;
      const isSelfGST = editFormData.isSelfGST || false;
      
      if (isSelfGST) {
        updatedArray[index].cgst = amount * 0.09;
        updatedArray[index].sgst = amount * 0.09;
        updatedArray[index].igst = 0;
      } else {
        updatedArray[index].cgst = 0;
        updatedArray[index].sgst = 0;
        updatedArray[index].igst = amount * 0.18;
      }
      
      updatedArray[index].totalWithGst = amount + updatedArray[index].cgst + updatedArray[index].sgst + updatedArray[index].igst;
    }
    
    setEditFormData({
      ...editFormData,
      [arrayName]: updatedArray
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-white rounded-xl border border-gray-200 transition-all hover:shadow-md group"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
            </button>
            <div>
              <p className="text-sm text-gray-500 font-semibold mb-1">
                {isEditMode ? 'Editing Billing' : 'Viewing Billing'}
              </p>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {editFormData.month} - {editFormData.state}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {!isEditMode ? (
              <>
                <button
                  onClick={() => onModeChange('edit')}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  <Edit2 className="w-5 h-5" />
                  Edit Billing
                </button>
                <button
                  onClick={() => onDelete(billing._id)}
                  className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-red-500 text-red-700 rounded-xl hover:bg-red-50 transition-all font-semibold shadow-md hover:shadow-lg"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditFormData({...billing});
                    onModeChange('view');
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-500 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold shadow-md hover:shadow-lg"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Basic Information */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-2 block">Order ID</label>
              <input
                type="text"
                value={editFormData.orderId}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-900 font-medium"
              />
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-2 block">Month</label>
              <input
                type="text"
                value={editFormData.month}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-900 font-medium"
              />
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-2 block">Company Name</label>
              <input
                type="text"
                value={editFormData.companyName}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-900 font-medium"
              />
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-2 block">Start Date</label>
              <input
                type="text"
                value={editFormData.startDate}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-900 font-medium"
              />
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-2 block">End Date</label>
              <input
                type="text"
                value={editFormData.endDate}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-900 font-medium"
              />
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-2 block">Billing Days</label>
              <input
                type="number"
                value={editFormData.billingDays}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-900 font-medium"
              />
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-2 block">State</label>
              <input
                type="text"
                value={editFormData.state}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-900 font-medium"
              />
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-2 block">Split Percentage</label>
              <input
                type="text"
                value={`${editFormData.splitPercentage || 100}%`}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-900 font-medium"
              />
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-2 block">GST Type</label>
              <input
                type="text"
                value={editFormData.isSelfGST ? 'Self GST (CGST+SGST)' : 'IGST'}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-900 font-medium"
              />
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-2 block">Monthly Billing (Basic)</label>
              <input
                type="number"
                value={isEditMode ? editFormData.monthlyBilling : editFormData.monthlyBilling.toFixed(2)}
                onChange={(e) => {
                  if (isEditMode) {
                    const newMonthly = Number(e.target.value);
                    const isSelfGST = editFormData.isSelfGST || false;
                    
                    let cgst = 0, sgst = 0, igst = 0;
                    if (isSelfGST) {
                      cgst = newMonthly * 0.09;
                      sgst = newMonthly * 0.09;
                    } else {
                      igst = newMonthly * 0.18;
                    }
                    
                    setEditFormData({
                      ...editFormData,
                      monthlyBilling: newMonthly,
                      cgst,
                      sgst,
                      igst,
                      totalWithGst: newMonthly + cgst + sgst + igst
                    });
                  }
                }}
                disabled={!isEditMode}
                className={`w-full px-4 py-3 border-2 rounded-lg font-medium ${
                  isEditMode 
                    ? 'border-blue-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none' 
                    : 'border-gray-200 bg-gray-50 text-gray-900'
                }`}
              />
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-2 block">CGST (9%)</label>
              <input
                type="number"
                value={editFormData.cgst.toFixed(2)}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-900 font-medium"
              />
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-2 block">SGST (9%)</label>
              <input
                type="number"
                value={editFormData.sgst.toFixed(2)}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-900 font-medium"
              />
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-2 block">IGST (18%)</label>
              <input
                type="number"
                value={editFormData.igst.toFixed(2)}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-900 font-medium"
              />
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-2 block">Monthly Billing + GST</label>
              <input
                type="number"
                value={editFormData.totalWithGst.toFixed(2)}
                disabled
                className="w-full px-4 py-3 border-2 border-green-300 rounded-lg bg-green-50 text-green-900 font-bold"
              />
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-2 block">Invoice Number</label>
              <input
                type="text"
                value={editFormData.invoiceNumber || ''}
                onChange={(e) => isEditMode && setEditFormData({...editFormData, invoiceNumber: e.target.value})}
                disabled={!isEditMode}
                placeholder="Auto-generated"
                className={`w-full px-4 py-3 border-2 rounded-lg font-medium ${
                  isEditMode 
                    ? 'border-blue-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none' 
                    : 'border-gray-200 bg-gray-50 text-gray-900'
                }`}
              />
            </div>
            
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-2 block">Status</label>
              <select
                value={editFormData.status}
                onChange={(e) => isEditMode && setEditFormData({...editFormData, status: e.target.value})}
                disabled={!isEditMode}
                className={`w-full px-4 py-3 border-2 rounded-lg font-medium ${
                  isEditMode 
                    ? 'border-blue-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none' 
                    : 'border-gray-200 bg-gray-50 text-gray-900'
                }`}
              >
                <option value="draft">Draft</option>
                <option value="generated">Generated</option>
                <option value="invoiced">Invoiced</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Received Details */}
        <ArrayDetailsSection
          title="Received Details"
          icon={<DollarSign className="w-6 h-6 text-green-600" />}
          arrayName="receivedDetails"
          data={editFormData.receivedDetails || []}
          isEditMode={isEditMode}
          onAddEntry={handleAddEntry}
          onUpdateEntry={handleUpdateEntry}
          onRemoveEntry={handleRemoveEntry}
          colorClass="green"
        />
        
        {/* Credit Notes with Month Selector */}
        <CreditNotesSection
          title="Credit Notes"
          icon={<Receipt className="w-6 h-6 text-cyan-600" />}
          arrayName="creditNotes"
          data={editFormData.creditNotes || []}
          isEditMode={isEditMode}
          onAddEntry={handleAddEntry}
          onUpdateEntry={handleUpdateEntry}
          onRemoveEntry={handleRemoveEntry}
          colorClass="cyan"
          currentMonth={editFormData.month}
          totalWithGst={editFormData.totalWithGst}
          setEditFormData={setEditFormData}
          editFormData={editFormData}
        />
        
        {/* Miscellaneous Sell */}
        <MiscSellSection
          title="Miscellaneous Sell"
          icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
          arrayName="miscellaneousSell"
          data={editFormData.miscellaneousSell || []}
          isEditMode={isEditMode}
          onAddEntry={handleAddEntry}
          onUpdateEntry={handleUpdateEntry}
          onRemoveEntry={handleRemoveEntry}
          colorClass="purple"
        />
        
        {/* TDS Provision */}
        <ArrayDetailsSection
          title="TDS Provision"
          icon={<FileCheck className="w-6 h-6 text-orange-600" />}
          arrayName="tdsProvision"
          data={editFormData.tdsProvision || []}
          isEditMode={isEditMode}
          onAddEntry={handleAddEntry}
          onUpdateEntry={handleUpdateEntry}
          onRemoveEntry={handleRemoveEntry}
          colorClass="orange"
        />
        
        {/* TDS Confirm */}
        <ArrayDetailsSection
          title="TDS Confirm"
          icon={<CheckCircle2 className="w-6 h-6 text-blue-600" />}
          arrayName="tdsConfirm"
          data={editFormData.tdsConfirm || []}
          isEditMode={isEditMode}
          onAddEntry={handleAddEntry}
          onUpdateEntry={handleUpdateEntry}
          onRemoveEntry={handleRemoveEntry}
          colorClass="blue"
        />
        
      </div>
    </div>
  );
};

// Reusable Array Details Section Component
const ArrayDetailsSection = ({ 
  title, 
  icon, 
  arrayName, 
  data, 
  isEditMode, 
  onAddEntry, 
  onUpdateEntry, 
  onRemoveEntry,
  colorClass 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          {icon}
          {title}
        </h3>
        {isEditMode && (
          <button
            onClick={() => onAddEntry(arrayName)}
            className={`flex items-center gap-2 px-4 py-2 bg-${colorClass}-100 text-${colorClass}-700 rounded-lg hover:bg-${colorClass}-200 transition-colors font-semibold`}
          >
            <Plus className="w-4 h-4" />
            Add Entry
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {data.map((detail, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Date (DD-MM-YYYY)</label>
              <input
                type="date"
                value={formatDateToInput(detail.date)}
                onChange={(e) => {
                  if (isEditMode) {
                    const ddmmyyyy = formatDateToDisplay(e.target.value);
                    onUpdateEntry(arrayName, index, 'date', ddmmyyyy);
                  }
                }}
                disabled={!isEditMode}
                className={`w-full px-3 py-2 border rounded-lg text-sm ${
                  isEditMode 
                    ? 'border-blue-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none' 
                    : 'border-gray-200 bg-white'
                }`}
              />
              {!isEditMode && detail.date && (
                <p className="text-xs text-gray-500 mt-1">{detail.date}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Amount</label>
              <input
                type="number"
                value={detail.amount}
                onChange={(e) => isEditMode && onUpdateEntry(arrayName, index, 'amount', Number(e.target.value))}
                disabled={!isEditMode}
                placeholder="0.00"
                className={`w-full px-3 py-2 border rounded-lg text-sm ${
                  isEditMode 
                    ? 'border-blue-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none' 
                    : 'border-gray-200 bg-white'
                }`}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Notes</label>
              <input
                type="text"
                value={detail.notes || ''}
                onChange={(e) => isEditMode && onUpdateEntry(arrayName, index, 'notes', e.target.value)}
                disabled={!isEditMode}
                placeholder="Add notes..."
                className={`w-full px-3 py-2 border rounded-lg text-sm ${
                  isEditMode 
                    ? 'border-blue-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none' 
                    : 'border-gray-200 bg-white'
                }`}
              />
            </div>
            {isEditMode && (
              <div className="flex items-end">
                <button
                  onClick={() => onRemoveEntry(arrayName, index)}
                  className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Trash className="w-4 h-4" />
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-center text-gray-500 py-8">No {title.toLowerCase()} added yet</p>
        )}
      </div>
    </div>
  );
};

// Credit Notes Section with Month Selector
const CreditNotesSection = ({
  title,
  icon,
  arrayName,
  data,
  isEditMode,
  onAddEntry,
  onUpdateEntry,
  onRemoveEntry,
  colorClass,
  currentMonth,
  totalWithGst,
  setEditFormData,
  editFormData,
}) => {
  // Derive month boundaries and total days from currentMonth ("November 2025")
  const monthInfo = useMemo(() => {
    if (!currentMonth) return null;
    const [monthName, yearStr] = currentMonth.split(' ');
    const monthNames = [
      'January','February','March','April','May','June',
      'July','August','September','October','November','December',
    ];
    const monthIndex = monthNames.indexOf(monthName);
    const year = parseInt(yearStr, 10);
    const totalDays = new Date(year, monthIndex + 1, 0).getDate();
    const mm = String(monthIndex + 1).padStart(2, '0');
    const lastDayStr = String(totalDays).padStart(2, '0');
    return {
      totalDays,
      monthIndex,
      year,
      inputMin: `${year}-${mm}-01`,
      inputMax: `${year}-${mm}-${lastDayStr}`,
    };
  }, [currentMonth]);

  // Parse a DD-MM-YYYY string → Date object
  const parseDDMMYYYY = (ddmmyyyy) => {
    if (!ddmmyyyy) return null;
    const parts = ddmmyyyy.split('-');
    if (parts.length !== 3) return null;
    return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
  };

  // Calculate proportional amount based on selected period
  const calcAmount = (periodStart, periodEnd) => {
    if (!periodStart || !periodEnd || !monthInfo) return 0;
    const start = parseDDMMYYYY(periodStart);
    const end = parseDDMMYYYY(periodEnd);
    if (!start || !end || end <= start) return 0;
    const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
    return Math.round((diffDays / monthInfo.totalDays) * totalWithGst * 100) / 100;
  };

  // Handle period date changes — also auto-updates amount
  const handlePeriodChange = (index, field, value) => {
    const updatedArray = [...editFormData.creditNotes];
    updatedArray[index] = { ...updatedArray[index], [field]: value };

    const start = field === 'periodStart' ? value : updatedArray[index].periodStart;
    const end   = field === 'periodEnd'   ? value : updatedArray[index].periodEnd;
    updatedArray[index].amount = calcAmount(start, end);

    setEditFormData({ ...editFormData, creditNotes: updatedArray });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          {icon}
          {title}
        </h3>
        {isEditMode && (
          <button
            onClick={() => onAddEntry(arrayName)}
            className={`flex items-center gap-2 px-4 py-2 bg-${colorClass}-100 text-${colorClass}-700 rounded-lg hover:bg-${colorClass}-200 transition-colors font-semibold`}
          >
            <Plus className="w-4 h-4" />
            Add Entry
          </button>
        )}
      </div>

      <div className="space-y-5">
        {data.map((detail, index) => {
          // Compute display values
          const start       = parseDDMMYYYY(detail.periodStart);
          const end         = parseDDMMYYYY(detail.periodEnd);
          const selectedDays =
            start && end && end > start
              ? Math.round((end - start) / (1000 * 60 * 60 * 24))
              : 0;
          const hasPeriod = !!detail.periodStart && !!detail.periodEnd && selectedDays > 0;

          return (
            <div
              key={index}
              className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50"
            >
              {/* ── Top bar: formula preview ─────────────────────────────── */}
              {hasPeriod && (
                <div className="px-4 py-2.5 bg-gradient-to-r from-cyan-50 to-teal-50 border-b border-cyan-200 flex items-center gap-2 text-xs text-cyan-800 font-semibold">
                  <CalendarIcon className="w-3.5 h-3.5 flex-shrink-0 text-cyan-600" />
                  <span>
                    ₹{totalWithGst.toFixed(2)} &times; {selectedDays}&nbsp;days /{' '}
                    {monthInfo?.totalDays}&nbsp;days&nbsp;=&nbsp;
                    <span className="text-teal-700 font-extrabold">
                      ₹{(detail.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </span>
                  <span className="ml-auto text-cyan-500 font-normal">
                    ({detail.periodStart} → {detail.periodEnd})
                  </span>
                </div>
              )}

              {/* ── Field grid ───────────────────────────────────────────── */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">

                {/* 1. Submit Date — stored as 'date' to satisfy MongoDB schema */}
                <div className="xl:col-span-1">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    Submit Date
                  </label>
                  <input
                    type="date"
                    value={formatDateToInput(detail.date || '')}
                    onChange={(e) => {
                      if (isEditMode) {
                        const ddmmyyyy = formatDateToDisplay(e.target.value);
                        onUpdateEntry(arrayName, index, 'date', ddmmyyyy);  // ← 'date' key
                      }
                    }}
                    disabled={!isEditMode}
                    className={`w-full px-3 py-2 border rounded-lg text-sm ${
                      isEditMode
                        ? 'border-blue-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none'
                        : 'border-gray-200 bg-white'
                    }`}
                  />
                  {!isEditMode && detail.date && (
                    <p className="text-xs text-gray-500 mt-1">{detail.date}</p>
                  )}
                </div>

                {/* 2. Period Start */}
                <div className="xl:col-span-1">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    Period Start{' '}
                    <span className="text-cyan-600 font-normal">
                      ({currentMonth})
                    </span>
                  </label>
                  <input
                    type="date"
                    value={formatDateToInput(detail.periodStart || '')}
                    min={monthInfo?.inputMin}
                    max={monthInfo?.inputMax}
                    onChange={(e) => {
                      if (isEditMode) {
                        const ddmmyyyy = formatDateToDisplay(e.target.value);
                        handlePeriodChange(index, 'periodStart', ddmmyyyy);
                      }
                    }}
                    disabled={!isEditMode}
                    className={`w-full px-3 py-2 border rounded-lg text-sm ${
                      isEditMode
                        ? 'border-cyan-300 bg-white focus:ring-2 focus:ring-cyan-500 focus:outline-none'
                        : 'border-gray-200 bg-white'
                    }`}
                  />
                  {!isEditMode && detail.periodStart && (
                    <p className="text-xs text-gray-500 mt-1">{detail.periodStart}</p>
                  )}
                </div>

                {/* 3. Period End */}
                <div className="xl:col-span-1">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    Period End{' '}
                    <span className="text-cyan-600 font-normal">
                      ({monthInfo?.totalDays} days total)
                    </span>
                  </label>
                  <input
                    type="date"
                    value={formatDateToInput(detail.periodEnd || '')}
                    min={monthInfo?.inputMin}
                    max={monthInfo?.inputMax}
                    onChange={(e) => {
                      if (isEditMode) {
                        const ddmmyyyy = formatDateToDisplay(e.target.value);
                        handlePeriodChange(index, 'periodEnd', ddmmyyyy);
                      }
                    }}
                    disabled={!isEditMode}
                    className={`w-full px-3 py-2 border rounded-lg text-sm ${
                      isEditMode
                        ? 'border-cyan-300 bg-white focus:ring-2 focus:ring-cyan-500 focus:outline-none'
                        : 'border-gray-200 bg-white'
                    }`}
                  />
                  {!isEditMode && detail.periodEnd && (
                    <p className="text-xs text-gray-500 mt-1">{detail.periodEnd}</p>
                  )}
                </div>

                {/* 4. Auto-calculated Amount (read-only) */}
                <div className="xl:col-span-1">
                  <label className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                    Amount
                    <span className="px-1.5 py-0.5 bg-teal-100 text-teal-700 rounded text-[10px] font-bold leading-none">
                      AUTO
                    </span>
                  </label>
                  <input
                    type="number"
                    value={detail.amount || 0}
                    disabled
                    className="w-full px-3 py-2 border border-teal-300 rounded-lg text-sm bg-teal-50 text-teal-900 font-extrabold cursor-not-allowed"
                  />
                  {hasPeriod && (
                    <p className="text-[11px] text-teal-600 mt-1 font-semibold">
                      {selectedDays}/{monthInfo?.totalDays} days
                    </p>
                  )}
                  {isEditMode && !hasPeriod && (
                    <p className="text-[11px] text-gray-400 mt-1">
                      Select period to auto-fill
                    </p>
                  )}
                </div>

                {/* 5. Notes */}
                <div className="xl:col-span-1">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Notes</label>
                  <input
                    type="text"
                    value={detail.notes || ''}
                    onChange={(e) =>
                      isEditMode && onUpdateEntry(arrayName, index, 'notes', e.target.value)
                    }
                    disabled={!isEditMode}
                    placeholder="Add notes..."
                    className={`w-full px-3 py-2 border rounded-lg text-sm ${
                      isEditMode
                        ? 'border-blue-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none'
                        : 'border-gray-200 bg-white'
                    }`}
                  />
                </div>

                {/* 6. Remove Button (edit mode only) */}
                {isEditMode && (
                  <div className="xl:col-span-1 flex items-end">
                    <button
                      onClick={() => onRemoveEntry(arrayName, index)}
                      className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold flex items-center justify-center gap-2 text-sm"
                    >
                      <Trash className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* ── Visual progress bar ──────────────────────────────────── */}
              {hasPeriod && (
                <div className="px-4 pb-3">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                    <span>Month start</span>
                    <span className="text-cyan-600 font-semibold">
                      {selectedDays} of {monthInfo?.totalDays} days selected
                    </span>
                    <span>Month end</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-teal-500 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (selectedDays / (monthInfo?.totalDays || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {data.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No {title.toLowerCase()} added yet
          </p>
        )}
      </div>
    </div>
  );
};

// Specialized section for Miscellaneous Sell with GST
const MiscSellSection = ({ 
  title, 
  icon, 
  arrayName, 
  data, 
  isEditMode, 
  onAddEntry, 
  onUpdateEntry, 
  onRemoveEntry,
  colorClass 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          {icon}
          {title}
        </h3>
        {isEditMode && (
          <button
            onClick={() => onAddEntry(arrayName)}
            className={`flex items-center gap-2 px-4 py-2 bg-${colorClass}-100 text-${colorClass}-700 rounded-lg hover:bg-${colorClass}-200 transition-colors font-semibold`}
          >
            <Plus className="w-4 h-4" />
            Add Entry
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {data.map((detail, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-7 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Date</label>
              <input
                type="date"
                value={formatDateToInput(detail.date)}
                onChange={(e) => {
                  if (isEditMode) {
                    const ddmmyyyy = formatDateToDisplay(e.target.value);
                    onUpdateEntry(arrayName, index, 'date', ddmmyyyy);
                  }
                }}
                disabled={!isEditMode}
                className={`w-full px-3 py-2 border rounded-lg text-sm ${
                  isEditMode 
                    ? 'border-blue-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none' 
                    : 'border-gray-200 bg-white'
                }`}
              />
              {!isEditMode && detail.date && (
                <p className="text-xs text-gray-500 mt-1">{detail.date}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Amount</label>
              <input
                type="number"
                value={detail.amount}
                onChange={(e) => isEditMode && onUpdateEntry(arrayName, index, 'amount', Number(e.target.value))}
                disabled={!isEditMode}
                placeholder="0.00"
                className={`w-full px-3 py-2 border rounded-lg text-sm ${
                  isEditMode 
                    ? 'border-blue-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none' 
                    : 'border-gray-200 bg-white'
                }`}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">CGST (9%)</label>
              <input
                type="number"
                value={(detail.cgst || 0).toFixed(2)}
                disabled
                className="w-full px-3 py-2 border rounded-lg text-sm border-gray-200 bg-gray-50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">SGST (9%)</label>
              <input
                type="number"
                value={(detail.sgst || 0).toFixed(2)}
                disabled
                className="w-full px-3 py-2 border rounded-lg text-sm border-gray-200 bg-gray-50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">IGST (18%)</label>
              <input
                type="number"
                value={(detail.igst || 0).toFixed(2)}
                disabled
                className="w-full px-3 py-2 border rounded-lg text-sm border-gray-200 bg-gray-50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Total + GST</label>
              <input
                type="number"
                value={(detail.totalWithGst || detail.amount || 0).toFixed(2)}
                disabled
                className="w-full px-3 py-2 border rounded-lg text-sm border-green-300 bg-green-50 font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Notes</label>
              <input
                type="text"
                value={detail.notes || ''}
                onChange={(e) => isEditMode && onUpdateEntry(arrayName, index, 'notes', e.target.value)}
                disabled={!isEditMode}
                placeholder="Notes..."
                className={`w-full px-3 py-2 border rounded-lg text-sm ${
                  isEditMode 
                    ? 'border-blue-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none' 
                    : 'border-gray-200 bg-white'
                }`}
              />
            </div>
            {isEditMode && (
              <div className="flex items-end md:col-span-7">
                <button
                  onClick={() => onRemoveEntry(arrayName, index)}
                  className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Trash className="w-4 h-4" />
                  Remove
                </button>
              </div>
            )}
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-center text-gray-500 py-8">No {title.toLowerCase()} added yet</p>
        )}
      </div>
    </div>
  );
};

// Main Component continues in next part...
// Main Component
const MonthlyBillGeneratorComp = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [billings, setBillings] = useState([]);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingOrder, setFetchingOrder] = useState(true);
  const [viewingBilling, setViewingBilling] = useState(null);
  const [viewMode, setViewMode] = useState('view');
  const [selectedState, setSelectedState] = useState('all');
  
  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
      fetchBillings();
    }
  }, [orderId]);
  
  const fetchOrderDetails = async () => {
    try {
      setFetchingOrder(true);
      const res = await fetch(`/api/billing/orders?orderId=${orderId}`);
      const result = await res.json();
      if (result.success && result.data.length > 0) {
        setOrderDetails(result.data[0]);
      } else {
        alert('Order not found');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      alert('Failed to fetch order details');
    } finally {
      setFetchingOrder(false);
    }
  };
  
  const fetchBillings = async () => {
    try {
      const res = await fetch(`/api/billing/monthly?orderId=${orderId}`);
      const result = await res.json();
      if (result.success) {
        setBillings(result.data);
        
        if (result.data.length > 0) {
          const firstState = result.data[0].state;
          setSelectedState(firstState);
        }
      }
    } catch (error) {
      console.error('Error fetching billings:', error);
    }
  };
  
  // Get unique states from billings
  const uniqueStates = useMemo(() => {
    const states = [...new Set(billings.map(b => b.state))].filter(Boolean);
    return states;
  }, [billings]);
  
  // Filter billings by selected state
  const filteredBillings = useMemo(() => {
    if (selectedState === 'all') {
      return billings;
    }
    return billings.filter(b => b.state === selectedState);
  }, [billings, selectedState]);
  
  // Check if we have any CGST, SGST, or IGST values
  const hasGSTColumns = useMemo(() => {
    const hasCGST = filteredBillings.some(b => (b.cgst ?? 0) > 0);
    const hasSGST = filteredBillings.some(b => (b.sgst ?? 0) > 0);
    const hasIGST = filteredBillings.some(b => (b.igst ?? 0) > 0);
    return { hasCGST, hasSGST, hasIGST };
  }, [filteredBillings]);
  
  // Calculate billings with balance (TDS Prov NOT subtracted, only TDS Conf)
  const billingsWithBalance = useMemo(() => {
    let runningBalance = 0;
    let cumulativeUnpaid = 0;
    
    console.log('=== BILLING CALCULATION START ===');
    
    const sortedBillings = [...filteredBillings].sort((a, b) => {
      const parseMonth = (monthStr) => {
        const [monthName, year] = monthStr.split(' ');
        const monthIndex = ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'].indexOf(monthName);
        return new Date(parseInt(year), monthIndex);
      };
      return parseMonth(a.month) - parseMonth(b.month);
    });
    
    // Calculate TOTAL credit pool (Received + Credit Notes + TDS Confirm only)
    const totalCreditPool = sortedBillings.reduce((sum, billing) => {
      const received = calculateTotal(billing.receivedDetails);
      const creditNotes = calculateTotal(billing.creditNotes);
      const tdsConf = calculateTotal(billing.tdsConfirm); // Only TDS Confirm
      return sum + received + creditNotes + tdsConf;
    }, 0);
    
    console.log(`💰 TOTAL CREDIT POOL: ₹${totalCreditPool.toFixed(2)}`);
    
    let creditPool = totalCreditPool;
    
    return sortedBillings.map((billing, index) => {
      console.log(`\n📅 ${billing.month} (${billing.state})`);
      
      const monthlyReceived = calculateTotal(billing.receivedDetails);
      const monthlyCreditNotes = calculateTotal(billing.creditNotes);
      const monthlyMiscSell = calculateMiscSellTotal(billing.miscellaneousSell);
      const monthlyTDSProv = calculateTotal(billing.tdsProvision); // For display only
      const monthlyTDSConf = calculateTotal(billing.tdsConfirm); // Subtracted
      const monthlyCredits = monthlyReceived + monthlyCreditNotes + monthlyTDSConf; // TDS Prov NOT included
      
      const monthlyCharges = billing.totalWithGst + monthlyMiscSell;
      
      console.log(`📋 Charges: ₹${monthlyCharges.toFixed(2)}`);
      console.log(`💳 Pool: ₹${creditPool.toFixed(2)}`);
      
      const monthlyNet = monthlyCharges - monthlyCredits;
      runningBalance += monthlyNet;
      
      console.log(`📊 Balance: ₹${runningBalance.toFixed(2)}`);
      
      let totalRemainingAdjustment = 0;
      
      if (creditPool >= monthlyCharges) {
        creditPool -= monthlyCharges;
        totalRemainingAdjustment = cumulativeUnpaid;
        console.log(`✅ SETTLED | Pool: ₹${creditPool.toFixed(2)}`);
      } else {
        const unpaidThisMonth = monthlyCharges - creditPool;
        creditPool = 0;
        cumulativeUnpaid += unpaidThisMonth;
        totalRemainingAdjustment = cumulativeUnpaid;
        console.log(`⚠️ PARTIAL | Unpaid: ₹${unpaidThisMonth.toFixed(2)}`);
      }
      
      return {
        ...billing,
        monthlyReceived,
        monthlyCreditNotes,
        monthlyMiscSell,
        monthlyTDSProv, // For display
        monthlyTDSConf, // Subtracted
        monthlyCharges,
        totalBalance: runningBalance,
        totalRemainingAdjustment: Math.max(0, totalRemainingAdjustment),
        creditPoolRemaining: creditPool
      };
    });
  }, [filteredBillings]);
  
  // Calculate totals
  const totals = useMemo(() => {
    return {
      count: billingsWithBalance.length,
      monthlyBilling: billingsWithBalance.reduce((sum, b) => sum + (b.monthlyBilling ?? 0), 0),
      cgst: billingsWithBalance.reduce((sum, b) => sum + (b.cgst ?? 0), 0),
      sgst: billingsWithBalance.reduce((sum, b) => sum + (b.sgst ?? 0), 0),
      igst: billingsWithBalance.reduce((sum, b) => sum + (b.igst ?? 0), 0),
      totalWithGst: billingsWithBalance.reduce((sum, b) => sum + (b.totalWithGst ?? 0), 0),
      monthlyReceived: billingsWithBalance.reduce((sum, b) => sum + (b.monthlyReceived ?? 0), 0),
      monthlyCreditNotes: billingsWithBalance.reduce((sum, b) => sum + (b.monthlyCreditNotes ?? 0), 0),
      monthlyMiscSell: billingsWithBalance.reduce((sum, b) => sum + (b.monthlyMiscSell ?? 0), 0),
      monthlyTDSProv: billingsWithBalance.reduce((sum, b) => sum + (b.monthlyTDSProv ?? 0), 0),
      monthlyTDSConf: billingsWithBalance.reduce((sum, b) => sum + (b.monthlyTDSConf ?? 0), 0),
      finalBalance: billingsWithBalance.length > 0 ? billingsWithBalance[billingsWithBalance.length - 1].totalBalance : 0
    };
  }, [billingsWithBalance]);
  
  const handleAutoGenerate = async () => {
    if (!orderId) {
      alert('No order ID found in URL');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('🔄 Generating billing entries...');
      
      const res = await fetch('/api/billing/monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId, 
          mode: 'auto',
          autoInvoice: true
        })
      });
      
      const result = await res.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate billings');
      }

      console.log(`✅ Generated ${result.data.length} billing entries`);
      alert(`✅ Successfully generated ${result.data.length} billings!`);
      
      await fetchBillings();
      
    } catch (error) {
      console.error('❌ Auto generate error:', error);
      alert(`❌ Failed to generate billings:\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (billingId) => {
    if (!confirm('Are you sure you want to delete this billing?')) return;
    
    try {
      const res = await fetch(`/api/billing/monthly?billingId=${billingId}`, {
        method: 'DELETE'
      });
      
      const result = await res.json();
      if (result.success) {
        alert('✅ Billing deleted');
        setViewingBilling(null);
        await fetchBillings();
      } else {
        alert('❌ ' + result.error);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('❌ Failed to delete billing');
    }
  };
  
  const handleDeleteAll = async () => {
    if (!confirm(`Are you sure you want to delete all ${billings.length} billings?`)) return;
    
    try {
      const res = await fetch(`/api/billing/monthly?orderId=${orderId}`, {
        method: 'DELETE'
      });
      
      const result = await res.json();
      if (result.success) {
        alert('✅ All billings deleted');
        await fetchBillings();
      } else {
        alert('❌ ' + result.error);
      }
    } catch (error) {
      console.error('Delete all error:', error);
      alert('❌ Failed to delete billings');
    }
  };
  
  const handleView = (billing) => {
    setViewingBilling(billing);
    setViewMode('view');
  };
  
  const handleEdit = (billing) => {
    setViewingBilling(billing);
    setViewMode('edit');
  };
  
  const handleSaveEdit = async (editFormData) => {
    try {
      const res = await fetch('/api/billing/monthly', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      
      const result = await res.json();
      if (result.success) {
        alert('✅ Billing updated');
        setViewMode('view');
        setViewingBilling(null);
        await fetchBillings();
      } else {
        alert('❌ ' + result.error);
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('❌ Failed to update billing');
    }
  };
  
  if (!orderId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-red-200 p-10 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">No Order ID Found</h2>
          <p className="text-gray-600 mb-6 text-lg">
            Please provide an orderId in the URL query parameter.
          </p>
          <Link 
            href="/billing/orders"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            Go to Orders
          </Link>
        </div>
      </div>
    );
  }

  if (fetchingOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-6" />
          <p className="text-xl font-semibold text-gray-700">Loading order details...</p>
        </div>
      </div>
    );
  }
  
  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-yellow-200 p-10 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-10 h-10 text-yellow-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Order Not Found</h2>
          <p className="text-gray-600 mb-6 text-lg">
            The order with ID "{orderId}" does not exist.
          </p>
          <Link 
            href="/billing/orders"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            Go to Orders
          </Link>
        </div>
      </div>
    );
  }
  
  if (viewingBilling) {
    return (
      <BillingDetailModal
        billing={viewingBilling}
        mode={viewMode}
        onClose={() => {
          setViewingBilling(null);
          setViewMode('view');
        }}
        onSave={handleSaveEdit}
        onDelete={handleDelete}
        onModeChange={setViewMode}
      />
    );
  }
  
  // Main Table View
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
      <div className="max-w-[1900px] mx-auto p-6 lg:p-8 space-y-6">
        
        {/* Header with Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/billing/account/outstanding-report"
              className="p-2.5 hover:bg-white rounded-xl border border-gray-200 transition-all hover:shadow-md group"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
            </Link>
            <div>
              <p className="text-sm text-gray-500 font-semibold mb-1">Monthly Billing for Order</p>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {orderId}
              </h1>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleAutoGenerate}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Generating...' : 'Generate Billings'}
            </button>
            
            {billings.length > 0 && (
              <>
                <button
                  className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-green-500 text-green-700 rounded-xl hover:bg-green-50 transition-all font-semibold shadow-md hover:shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  Export
                </button>
                <button
                  onClick={handleDeleteAll}
                  className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-red-500 text-red-700 rounded-xl hover:bg-red-50 transition-all font-semibold shadow-md hover:shadow-lg"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete All
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Order Details Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Order Information
            </h3>
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${
              orderDetails.status === 'PCD' 
                ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-300' 
                : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-300'
            }`}>
              {orderDetails.status}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            <div className="space-y-1">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Company Name</p>
              <p className="text-base font-bold text-gray-900">{orderDetails.companyName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Entity</p>
              <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm font-bold">
                {orderDetails.entity}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Product</p>
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold">
                {orderDetails.product}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">PCD Date</p>
              <p className="text-base font-bold text-gray-900 flex items-center gap-1">
                <CalendarIcon className="w-4 h-4 text-blue-600" />
                {orderDetails.pcdDate}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Capacity</p>
              <p className="text-base font-bold text-gray-900">{orderDetails.capacity} Mbps</p>
            </div>
            
            {/* Split Factor Information */}
            {orderDetails.splitFactor && orderDetails.splitFactor.isApplicable && (
              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Split Factor</p>
                <div className="flex items-center gap-2">
                  <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-bold">
                    {orderDetails.billing1?.state}: {orderDetails.splitFactor.state1Percentage}%
                  </span>
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold">
                    {orderDetails.billing2?.state}: {orderDetails.splitFactor.state2Percentage}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider opacity-90">Total Entries</p>
                <FileCheck className="w-6 h-6 opacity-80" />
              </div>
              <p className="text-4xl font-extrabold">{totals.count}</p>
              <p className="text-xs opacity-80 mt-1">Monthly billing records</p>
            </div>
          </div>
          
          <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider opacity-90">Monthly Billing</p>
                <TrendingUp className="w-6 h-6 opacity-80" />
              </div>
              <p className="text-3xl font-extrabold">₹{totals.monthlyBilling.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              <p className="text-xs opacity-80 mt-1">Base amount (excl. GST)</p>
            </div>
          </div>
          
          <div className="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider opacity-90">Total Received</p>
                <DollarSign className="w-6 h-6 opacity-80" />
              </div>
              <p className="text-3xl font-extrabold">₹{totals.monthlyReceived.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              <p className="text-xs opacity-80 mt-1">Payments received</p>
            </div>
          </div>
          
          <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider opacity-90">Credit Notes</p>
                <Receipt className="w-6 h-6 opacity-80" />
              </div>
              <p className="text-3xl font-extrabold">₹{totals.monthlyCreditNotes.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              <p className="text-xs opacity-80 mt-1">Total credit notes</p>
            </div>
          </div>
          
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider opacity-90">Final Balance</p>
                <CheckCircle2 className="w-6 h-6 opacity-80" />
              </div>
              <p className="text-3xl font-extrabold">₹{totals.finalBalance.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              <p className="text-xs opacity-80 mt-1">Running balance</p>
            </div>
          </div>
        </div>
        
        {/* State Filter Chips */}
        {uniqueStates.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-bold text-gray-900">Filter by State</h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                {uniqueStates.length} {uniqueStates.length === 1 ? 'State' : 'States'}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedState('all')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  selectedState === 'all'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300'
                }`}
              >
                All States
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {billings.length}
                </span>
              </button>
              
              {uniqueStates.map((state) => {
                const stateCount = billings.filter(b => b.state === state).length;
                return (
                  <button
                    key={state}
                    onClick={() => setSelectedState(state)}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      selectedState === state
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                        : 'bg-white text-gray-700 hover:bg-indigo-50 border-2 border-indigo-200 hover:border-indigo-400'
                    }`}
                  >
                    {state}
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      selectedState === state ? 'bg-white/20' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {stateCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Billings Table with Balance Calculations */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-600" />
                Monthly Billings with Running Balance
                {selectedState !== 'all' && (
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-bold">
                    {selectedState}
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-600 font-semibold">
                Showing {billingsWithBalance.length} of {billings.length} entries
              </p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-3 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Month</th>
                  <th className="px-3 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Days</th>
                  <th className="px-3 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Period</th>
                  <th className="px-3 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Monthly Billing</th>
                  {hasGSTColumns.hasCGST && <th className="px-3 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">CGST (9%)</th>}
                  {hasGSTColumns.hasSGST && <th className="px-3 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">SGST (9%)</th>}
                  {hasGSTColumns.hasIGST && <th className="px-3 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">IGST (18%)</th>}
                  <th className="px-3 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Total + GST</th>
                  <th className="px-3 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Misc+GST Sell</th>
                  <th className="px-3 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Received</th>
                  <th className="px-3 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Credit Notes</th>
                  <th className="px-3 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">TDS Conf</th>
                  <th className="px-3 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">TDS Prov</th>
                  <th className="px-3 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider bg-yellow-50">Total Balance</th>
                  <th className="px-3 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider bg-green-50">Remaining Adj</th>
                  <th className="px-3 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {billingsWithBalance.map((billing, index) => {
                  const isFullyPaid = billing.monthlyCharges <= (billing.monthlyReceived + billing.monthlyCreditNotes + billing.monthlyTDSConf);
                  const unpaidAmount = billing.totalRemainingAdjustment;
                  
                  // Safe value extraction with defaults
                  const cgst = billing.cgst ?? 0;
                  const sgst = billing.sgst ?? 0;
                  const igst = billing.igst ?? 0;
                  const monthlyBilling = billing.monthlyBilling ?? 0;
                  const totalWithGst = billing.totalWithGst ?? 0;
                  const totalBalance = billing.totalBalance ?? 0;
                  
                  return (
                    <tr 
                      key={billing._id} 
                      className={`border-b border-gray-100 transition-all ${
                        index % 2 === 0 ? 'bg-white hover:bg-blue-50/50' : 'bg-gray-50/50 hover:bg-blue-50/50'
                      }`}
                    >
                      <td className="px-3 py-4 text-sm font-semibold text-gray-900">
                        {billing.month}
                      </td>
                      <td className="px-3 py-4 text-center text-sm font-semibold text-gray-900">
                        {billing.billingDays}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-700 font-medium">
                        <div className="flex flex-col text-xs">
                          <span>{billing.startDate}</span>
                          <span>{billing.endDate}</span>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-right text-sm font-bold text-gray-900">
                        ₹{monthlyBilling.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                      {hasGSTColumns.hasCGST && (
                        <td className="px-3 py-4 text-right text-sm font-semibold text-gray-700">
                          ₹{cgst.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </td>
                      )}
                      {hasGSTColumns.hasSGST && (
                        <td className="px-3 py-4 text-right text-sm font-semibold text-gray-700">
                          ₹{sgst.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </td>
                      )}
                      {hasGSTColumns.hasIGST && (
                        <td className="px-3 py-4 text-right text-sm font-semibold text-gray-700">
                          ₹{igst.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </td>
                      )}
                      <td className="px-3 py-4 text-right text-sm font-bold text-indigo-700">
                        ₹{totalWithGst.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                      <td className="px-3 py-4 text-right text-sm font-semibold text-purple-700">
                        ₹{billing.monthlyMiscSell.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                      <td className="px-3 py-4 text-right text-sm font-semibold text-green-700">
                        ₹{billing.monthlyReceived.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                      <td className="px-3 py-4 text-right text-sm font-semibold text-cyan-700">
                        ₹{billing.monthlyCreditNotes.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                      <td className="px-3 py-4 text-right text-sm font-semibold text-blue-700">
                        ₹{billing.monthlyTDSConf.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                      <td className="px-3 py-4 text-right text-sm font-semibold text-orange-700">
                        ₹{billing.monthlyTDSProv.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                      <td className={`px-3 py-4 text-right text-sm font-extrabold bg-yellow-50 ${
                        totalBalance >= 0 ? 'text-green-700' : 'text-red-700'
                      }`}>
                        ₹{totalBalance.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                      <td className="px-3 py-4 text-center bg-green-50">
                        {unpaidAmount === 0 || isFullyPaid ? (
                          <button 
                            onClick={() => handleView(billing)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-semibold text-sm"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Settled
                          </button>
                        ) : unpaidAmount > 10000 ? (
                          <button
                            onClick={() => handleView(billing)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-red-700 hover:bg-red-50 rounded-lg transition-colors font-bold text-sm"
                          >
                            <X className="w-4 h-4" />
                            ₹{unpaidAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleView(billing)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-orange-700 hover:bg-orange-50 rounded-lg transition-colors font-bold text-sm"
                          >
                            <AlertTriangle className="w-4 h-4" />
                            ₹{unpaidAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                          </button>
                        )}
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleView(billing)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors group"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-blue-700" />
                          </button>
                          <button
                            onClick={() => handleEdit(billing)}
                            className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors group"
                            title="Edit Billing"
                          >
                            <Edit2 className="w-4 h-4 text-green-700" />
                          </button>
                          <button
                            onClick={() => handleDelete(billing._id)}
                            className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors group"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-700" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              
              {/* Totals Row */}
              <tfoot className="bg-gradient-to-r from-gray-100 to-blue-100 border-t-2 border-gray-300">
                <tr className="font-bold">
                  <td className="px-3 py-4 text-sm text-gray-900" colSpan="3">TOTAL</td>
                  <td className="px-3 py-4 text-right text-sm text-gray-900">
                    ₹{(totals.monthlyBilling ?? 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </td>
                  {hasGSTColumns.hasCGST && (
                    <td className="px-3 py-4 text-right text-sm text-gray-700">
                      ₹{(totals.cgst ?? 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </td>
                  )}
                  {hasGSTColumns.hasSGST && (
                    <td className="px-3 py-4 text-right text-sm text-gray-700">
                      ₹{(totals.sgst ?? 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </td>
                  )}
                  {hasGSTColumns.hasIGST && (
                    <td className="px-3 py-4 text-right text-sm text-gray-700">
                      ₹{(totals.igst ?? 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </td>
                  )}
                  <td className="px-3 py-4 text-right text-sm text-indigo-700">
                    ₹{(totals.totalWithGst ?? 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </td>
                  <td className="px-3 py-4 text-right text-sm text-purple-700">
                    ₹{(totals.monthlyMiscSell ?? 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </td>
                  <td className="px-3 py-4 text-right text-sm text-green-700">
                    ₹{(totals.monthlyReceived ?? 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </td>
                  <td className="px-3 py-4 text-right text-sm text-cyan-700">
                    ₹{(totals.monthlyCreditNotes ?? 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </td>
                  <td className="px-3 py-4 text-right text-sm text-blue-700">
                    ₹{(totals.monthlyTDSConf ?? 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </td>
                  <td className="px-3 py-4 text-right text-sm text-orange-700">
                    ₹{(totals.monthlyTDSProv ?? 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </td>
                  <td className={`px-3 py-4 text-right text-lg font-extrabold bg-yellow-100 ${
                    (totals.finalBalance ?? 0) >= 0 ? 'text-green-700' : 'text-red-700'
                  }`}>
                    ₹{(totals.finalBalance ?? 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </td>
                  <td className="px-3 py-4 bg-green-100" colSpan="2"></td>
                </tr>
              </tfoot>
            </table>
            
            {billingsWithBalance.length === 0 && (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-xl text-gray-700 font-semibold mb-2">
                  {selectedState === 'all' ? 'No billings generated yet' : `No billings found for ${selectedState}`}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedState === 'all' 
                    ? 'Click "Generate Billings" button above to create monthly billing entries' 
                    : 'Try selecting a different state or generate new billings'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyBillGeneratorComp;
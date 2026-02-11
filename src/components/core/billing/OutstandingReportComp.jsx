'use client'
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Search, Filter, Download, X, Eye, EyeOff, Info, ArrowLeft, FileText, TrendingUp } from 'lucide-react'

const INDIAN_STATES = [
  "Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "Uttar Pradesh",
  "Haryana", "Punjab", "Gujarat", "West Bengal", "Rajasthan", "Other"
];

const ENTITIES = ["WIBRO", "GTEL", "GISPL"];

const ALL_MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

// Utility Functions
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatDateDisplay = (dateStr) => dateStr || '-';

const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

const getLastDayOfMonth = (month, year) => {
  const lastDay = getDaysInMonth(month, year);
  const monthStr = String(month + 1).padStart(2, '0');
  return `${lastDay}-${monthStr}-${year}`;
};

const getCurrentDate = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}-${month}-${year}`;
};

const convertToInputFormat = (dateStr) => {
  if (!dateStr) return '';
  const [day, month, year] = dateStr.split('-');
  return `${year}-${month}-${day}`;
};

const convertToStorageFormat = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}-${month}-${year}`;
};

const formatMonthYear = (month, year) => {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return `${monthNames[month]} ${year}`;
};

const getCurrentYear = () => new Date().getFullYear();
const getCurrentMonth = () => new Date().getMonth();

const getYearOptions = () => {
  const currentYear = getCurrentYear();
  return ["All", ...Array.from({ length: 6 }, (_, i) => currentYear - i)];
};

const getAvailableMonths = (selectedYear) => {
  const currentYear = getCurrentYear();
  const currentMonthIndex = getCurrentMonth();

  if (selectedYear === currentYear) {
    return ALL_MONTHS.slice(0, currentMonthIndex + 1);
  } else {
    return ALL_MONTHS;
  }
};

const getDefaultDateRange = () => {
  const year = getCurrentYear();
  const month = getCurrentMonth() + 1;
  const day = new Date().getDate();
  return {
    fromDate: `${year}-01-01`,
    toDate: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  };
};

// Helper function to calculate totals from array (matching Monthly Bill Generator)
const calculateTotal = (arr) => {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
};

// Calculate balance with breakdown using API data
const calculateBalanceWithBreakdownAPI = async (order, fromDate, toDate, splitFactor = 1, stateToShow = '') => {
  const pcdDate = parseDate(order.pcdDate);
  const terminateDate = order.terminateDate ? parseDate(order.terminateDate) : null;
  const startDate = parseDate(fromDate);
  const endDate = parseDate(toDate);

  const breakdown = {
    months: [],
    totalBalance: 0,
    totalBilled: 0,
    totalReceived: 0,
    orderDetails: {
      orderId: order.orderId,
      lsiId: order.lsiId,
      capacity: Number(order.capacity) || 0,
      baseRate: Number(order.amount) || 0,
      pcdDate: order.pcdDate,
      terminateDate: order.terminateDate,
      splitFactor: splitFactor,
      state: stateToShow || order.billing1?.state || '',
      splitKey: splitFactor === 2 ? '50' : '100',
      id: order.id
    }
  };

  if (!pcdDate || !startDate || !endDate) return breakdown;

  const capacityMbps = Number(order.capacity) || 0;
  const baseRate = Number(order.amount) || 0;
  const totalAmount = baseRate * capacityMbps;
  const gstAmount = totalAmount * 0.18;
  const grandTotal = (totalAmount + gstAmount) / splitFactor;

  breakdown.orderDetails.totalAmount = totalAmount;
  breakdown.orderDetails.gstAmount = gstAmount;
  breakdown.orderDetails.monthlyCharge = grandTotal;

  let serviceEndDate = endDate;

  if (terminateDate) {
    const lastBillingDay = new Date(terminateDate);
    lastBillingDay.setDate(lastBillingDay.getDate() - 1);
    serviceEndDate = lastBillingDay;

    if (serviceEndDate < startDate) {
      return breakdown;
    }
  }

  if (pcdDate > endDate || (terminateDate && terminateDate <= startDate)) {
    return breakdown;
  }

  let totalBilledAmount = 0;
  let totalReceivedAmount = 0;
  let currentDate = new Date(Math.max(pcdDate, startDate));

  // Fetch all billing data for this order
  let billingData = [];
  try {
    const res = await fetch(`/api/billing/monthly?orderId=${order.orderId}`);
    const result = await res.json();
    if (result.success) {
      billingData = result.data;
    }
  } catch (error) {
    console.error("Error fetching billing data:", error);
  }

  while (currentDate <= serviceEndDate && currentDate <= endDate) {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const daysInMonth = getDaysInMonth(month, year);

    const isPcdMonth = (currentDate.getFullYear() === pcdDate.getFullYear() &&
      currentDate.getMonth() === pcdDate.getMonth());

    const isTerminateMonth = terminateDate &&
      (currentDate.getFullYear() === serviceEndDate.getFullYear() &&
        currentDate.getMonth() === serviceEndDate.getMonth());

    let monthBalance = 0;
    let billingDays = 0;
    let startDay = 1;
    let endDay = daysInMonth;

    if (isPcdMonth && isTerminateMonth) {
      startDay = pcdDate.getDate();
      endDay = serviceEndDate.getDate();
      billingDays = endDay - startDay + 1;
      const perDayRate = grandTotal / daysInMonth;
      monthBalance = perDayRate * billingDays;
    } else if (isPcdMonth) {
      startDay = pcdDate.getDate();
      endDay = daysInMonth;
      billingDays = endDay - startDay + 1;
      const perDayRate = grandTotal / daysInMonth;
      monthBalance = perDayRate * billingDays;
    } else if (isTerminateMonth) {
      startDay = 1;
      endDay = serviceEndDate.getDate();
      billingDays = endDay - startDay + 1;
      const perDayRate = grandTotal / daysInMonth;
      monthBalance = perDayRate * billingDays;
    } else {
      billingDays = daysInMonth;
      monthBalance = grandTotal;
    }

    // Get received amount and other details from API
    const monthName = formatMonthYear(month, year);
    const billing = billingData.find(b => 
      b.month === monthName && 
      b.state === breakdown.orderDetails.state
    );

    let receivedAmount = 0;
    let creditNotes = 0;
    let miscSell = 0;
    let tdsProvision = 0;
    let tdsConfirm = 0;
    let invoiceNumber = '-';

    if (billing) {
      receivedAmount = calculateTotal(billing.receivedDetails || []);
      creditNotes = calculateTotal(billing.creditNotes || []);
      miscSell = calculateTotal(billing.miscellaneousSell || []);
      tdsProvision = calculateTotal(billing.tdsProvision || []);
      tdsConfirm = calculateTotal(billing.tdsConfirm || []);
      invoiceNumber = billing.invoiceNumber || '-';
    }

    totalBilledAmount += monthBalance;
    totalReceivedAmount += receivedAmount;

    breakdown.months.push({
      monthYear: monthName,
      month: month,
      year: year,
      daysInMonth: daysInMonth,
      billingDays: billingDays,
      startDay: startDay,
      endDay: endDay,
      perDayRate: grandTotal / daysInMonth,
      monthlyCharge: grandTotal,
      monthlyBilling: monthBalance / 1.18, // Base amount
      gst: monthBalance - (monthBalance / 1.18), // GST amount
      amount: monthBalance,
      receivedAmount: receivedAmount,
      creditNotes: creditNotes,
      miscSell: miscSell,
      tdsProvision: tdsProvision,
      tdsConfirm: tdsConfirm,
      invoiceNumber: invoiceNumber,
      isPcdMonth: isPcdMonth,
      isTerminateMonth: isTerminateMonth
    });

    if (isTerminateMonth) break;

    currentDate = new Date(year, month + 1, 1);
  }

  breakdown.totalBilled = totalBilledAmount;
  breakdown.totalReceived = totalReceivedAmount;
  breakdown.totalBalance = totalBilledAmount - totalReceivedAmount;
  
  return breakdown;
};

const calculateBalance = async (order, fromDate, toDate, splitFactor = 1, stateToShow = '') => {
  const breakdown = await calculateBalanceWithBreakdownAPI(order, fromDate, toDate, splitFactor, stateToShow);
  return breakdown.totalBalance;
};

const getServicePeriod = (order, toDate) => {
  const pcdDate = order.pcdDate;
  const terminateDate = order.terminateDate;
  const endDateParsed = parseDate(toDate);

  if (terminateDate) {
    return { start: pcdDate, end: terminateDate, status: 'terminated' };
  }

  const endMonth = endDateParsed.getMonth();
  const endYear = endDateParsed.getFullYear();
  const lastDayOfMonth = getLastDayOfMonth(endMonth, endYear);

  return { start: pcdDate, end: lastDayOfMonth, status: 'active' };
};

const shouldSplitBilling = (order) => {
  const isNLD = order.product === "NLD";
  const state1 = order.billing1?.state || "";
  const state2 = order.billing2?.state || "";
  return isNLD && state1 !== state2 && state2 !== "";
};

const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// ========== MONTHLY BILLING BREAKDOWN TABLE COMPONENT ==========
const MonthlyBillingBreakdownTable = ({ breakdown }) => {
  if (!breakdown || !breakdown.months || breakdown.months.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
        <p className="text-slate-500 text-lg">No billing data available for the selected period</p>
      </div>
    );
  }

  const getMonthlyBreakdownData = () => {
    let runningBalance = 0;
    let cumulativeUnpaid = 0;

    const sortedMonths = [...breakdown.months].sort((a, b) => {
      return new Date(a.year, a.month) - new Date(b.year, b.month);
    });

    const totalCreditPool = sortedMonths.reduce((sum, monthData) => {
      const received = monthData.receivedAmount;
      const creditNotes = monthData.creditNotes;
      const tdsProv = monthData.tdsProvision;
      const tdsConf = monthData.tdsConfirm;
      return sum + received + creditNotes + tdsProv + tdsConf;
    }, 0);

    let creditPool = totalCreditPool;

    return sortedMonths.map((monthData, index) => {
      const monthlyBillingBasic = monthData.monthlyBilling;
      const gst = monthData.gst;
      const monthlyBillingWithGst = monthData.amount;
      const receivedAmount = monthData.receivedAmount;
      const creditNotes = monthData.creditNotes;
      const miscSell = monthData.miscSell;
      const tdsProvision = monthData.tdsProvision;
      const tdsConfirm = monthData.tdsConfirm;

      const monthlyCredits = receivedAmount + creditNotes + tdsProvision + tdsConfirm;
      const monthlyCharges = monthlyBillingWithGst + miscSell;
      const monthlyNet = monthlyCharges - monthlyCredits;
      runningBalance += monthlyNet;

      let totalRemainingAdjustment = 0;

      if (creditPool >= monthlyCharges) {
        creditPool -= monthlyCharges;
        totalRemainingAdjustment = cumulativeUnpaid;
      } else {
        const unpaidThisMonth = monthlyCharges - creditPool;
        creditPool = 0;
        cumulativeUnpaid += unpaidThisMonth;
        totalRemainingAdjustment = cumulativeUnpaid;
      }

      return {
        ...monthData,
        monthlyBillingBasic,
        gst,
        monthlyBillingWithGst,
        receivedAmount,
        creditNotes,
        miscSell,
        tdsProvision,
        tdsConfirm,
        totalBalance: runningBalance,
        totalRemainingAdjustment: Math.max(0, totalRemainingAdjustment),
        creditPoolRemaining: creditPool
      };
    });
  };

  const monthlyData = getMonthlyBreakdownData();

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Monthly Billing Breakdown Table
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          Detailed month-by-month calculation for {breakdown.orderDetails.orderId}
        </p>
      </div>

      <div className="p-6">
        {/* Order Summary */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6 bg-slate-50 rounded-lg p-4 border border-slate-200">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Order ID</p>
            <p className="text-sm font-bold text-slate-900">{breakdown.orderDetails.orderId}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">LSI ID</p>
            <p className="text-sm font-bold text-slate-900">{breakdown.orderDetails.lsiId || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Capacity</p>
            <p className="text-sm font-bold text-slate-900">{breakdown.orderDetails.capacity} Mbps</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Base Rate</p>
            <p className="text-sm font-bold text-slate-900">₹{breakdown.orderDetails.baseRate.toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">State</p>
            <p className="text-sm font-bold text-slate-900">{breakdown.orderDetails.state}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Split</p>
            <p className="text-sm font-bold text-slate-900">{breakdown.orderDetails.splitFactor === 2 ? '50%' : '100%'}</p>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-200">
                <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 uppercase whitespace-nowrap">Month</th>
                <th className="px-3 py-3 text-center text-xs font-bold text-slate-700 uppercase whitespace-nowrap">Days</th>
                <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 uppercase whitespace-nowrap">Period</th>
                <th className="px-3 py-3 text-right text-xs font-bold text-slate-700 uppercase whitespace-nowrap">Received Amount</th>
                <th className="px-3 py-3 text-right text-xs font-bold text-slate-700 uppercase whitespace-nowrap">Credit Notes</th>
                <th className="px-3 py-3 text-right text-xs font-bold text-slate-700 uppercase whitespace-nowrap">Misc Sell</th>
                <th className="px-3 py-3 text-right text-xs font-bold text-slate-700 uppercase whitespace-nowrap">TDS Provision</th>
                <th className="px-3 py-3 text-right text-xs font-bold text-slate-700 uppercase whitespace-nowrap">TDS Confirm</th>
                <th className="px-3 py-3 text-right text-xs font-bold text-slate-700 uppercase whitespace-nowrap">Monthly Billing (Basic)</th>
                <th className="px-3 py-3 text-right text-xs font-bold text-slate-700 uppercase whitespace-nowrap">GST</th>
                <th className="px-3 py-3 text-right text-xs font-bold text-slate-700 uppercase whitespace-nowrap">Monthly Billing + GST</th>
                <th className="px-3 py-3 text-right text-xs font-bold text-slate-700 uppercase whitespace-nowrap">Total Balance (Running)</th>
                <th className="px-3 py-3 text-right text-xs font-bold text-slate-700 uppercase whitespace-nowrap">Total Remaining Adjustment</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-slate-100">
              {monthlyData.map((monthData, index) => (
                <tr key={`month-${monthData.year}-${monthData.month}-${index}`} className="hover:bg-slate-50">
                  <td className="px-3 py-3 font-semibold text-slate-900 text-sm whitespace-nowrap">
                    {monthData.monthYear}
                  </td>
                  <td className="px-3 py-3 text-center font-bold text-sm">
                    {monthData.billingDays}
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-700 whitespace-nowrap">
                    {monthData.startDay}-{String(monthData.month + 1).padStart(2, '0')}-{monthData.year} to {monthData.endDay}-{String(monthData.month + 1).padStart(2, '0')}-{monthData.year}
                  </td>
                  <td className="px-3 py-3 text-right font-bold text-green-600 text-sm whitespace-nowrap">
                    ₹{monthData.receivedAmount.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-3 py-3 text-right font-bold text-cyan-600 text-sm whitespace-nowrap">
                    ₹{monthData.creditNotes.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-3 py-3 text-right font-bold text-purple-600 text-sm whitespace-nowrap">
                    ₹{monthData.miscSell.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-3 py-3 text-right font-bold text-orange-600 text-sm whitespace-nowrap">
                    ₹{monthData.tdsProvision.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-3 py-3 text-right font-bold text-blue-600 text-sm whitespace-nowrap">
                    ₹{monthData.tdsConfirm.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-3 py-3 text-right font-bold text-slate-900 text-sm whitespace-nowrap">
                    ₹{monthData.monthlyBillingBasic.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-3 py-3 text-right font-semibold text-slate-700 text-sm whitespace-nowrap">
                    ₹{monthData.gst.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-3 py-3 text-right font-bold text-emerald-600 text-sm whitespace-nowrap">
                    ₹{monthData.monthlyBillingWithGst.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-3 py-3 text-right font-bold text-slate-800 text-sm whitespace-nowrap">
                    ₹{monthData.totalBalance.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className={`px-3 py-3 text-right font-bold text-sm whitespace-nowrap ${monthData.totalRemainingAdjustment > 0 ? 'text-rose-700 bg-rose-50' : 'text-emerald-700 bg-emerald-50'}`}>
                    ₹{monthData.totalRemainingAdjustment.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr className="bg-emerald-50 border-t-2 border-emerald-300">
                <td colSpan="3" className="px-3 py-4 text-right font-bold text-slate-900">
                  Total:
                </td>
                <td className="px-3 py-4 text-right font-bold text-green-700">
                  ₹{monthlyData.reduce((sum, m) => sum + m.receivedAmount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-4 text-right font-bold text-cyan-700">
                  ₹{monthlyData.reduce((sum, m) => sum + m.creditNotes, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-4 text-right font-bold text-purple-700">
                  ₹{monthlyData.reduce((sum, m) => sum + m.miscSell, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-4 text-right font-bold text-orange-700">
                  ₹{monthlyData.reduce((sum, m) => sum + m.tdsProvision, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-4 text-right font-bold text-blue-700">
                  ₹{monthlyData.reduce((sum, m) => sum + m.tdsConfirm, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-4 text-right font-bold text-slate-900">
                  ₹{monthlyData.reduce((sum, m) => sum + m.monthlyBillingBasic, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-4 text-right font-bold text-slate-700">
                  ₹{monthlyData.reduce((sum, m) => sum + m.gst, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-4 text-right font-extrabold text-emerald-700 text-lg">
                  ₹{monthlyData.reduce((sum, m) => sum + m.monthlyBillingWithGst, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-4 text-right font-extrabold text-slate-900 text-lg">
                  ₹{monthlyData[monthlyData.length - 1].totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className={`px-3 py-4 text-right font-extrabold text-lg ${monthlyData[monthlyData.length - 1].totalRemainingAdjustment > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                  ₹{monthlyData[monthlyData.length - 1].totalRemainingAdjustment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

// ========== CALCULATION BREAKDOWN COMPONENT ==========
const CalculationBreakdown = ({ breakdown, onClose }) => {
  if (!breakdown) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 py-8">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={onClose}
                className="group flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg shadow-sm border border-slate-200 transition-all duration-200 hover:shadow-md hover:border-slate-300"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
                <span>Back to Reports</span>
              </button>

              <div className="text-right">
                <h1 className="text-2xl font-bold text-white mb-1">
                  Balance Calculation Breakdown
                </h1>
                <p className="text-blue-100 text-sm font-medium">
                  Order ID: <span className="font-bold text-white">{breakdown.orderDetails.orderId}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                  Order Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">LSI ID</p>
                    <p className="text-base font-bold text-slate-900">{breakdown.orderDetails.lsiId || '-'}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Capacity</p>
                    <p className="text-base font-bold text-slate-900">{breakdown.orderDetails.capacity} Mbps</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Base Rate</p>
                    <p className="text-base font-bold text-slate-900">₹{breakdown.orderDetails.baseRate.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">PCD Date</p>
                    <p className="text-base font-bold text-slate-900">{breakdown.orderDetails.pcdDate}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Terminate Date</p>
                    <p className={`text-base font-bold ${breakdown.orderDetails.terminateDate ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {breakdown.orderDetails.terminateDate || 'Active'}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Split Factor</p>
                    <p className="text-base font-bold text-slate-900">
                      {breakdown.orderDetails.splitFactor === 2 ? '50%' : '100%'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                  Calculation Formula
                </h2>
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 space-y-3 h-full">
                  <div className="flex justify-between items-center pb-3">
                    <span className="text-sm font-medium text-slate-700">Base Amount (Rate × Capacity)</span>
                    <span className="text-sm font-bold text-slate-900">
                      ₹{breakdown.orderDetails.baseRate.toLocaleString('en-IN')} × {breakdown.orderDetails.capacity} = ₹{breakdown.orderDetails.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-t border-blue-200 pt-3">
                    <span className="text-sm font-medium text-slate-700">GST (18%)</span>
                    <span className="text-sm font-bold text-slate-900">
                      ₹{breakdown.orderDetails.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t-2 border-blue-300">
                    <span className="text-base font-bold text-blue-900">Monthly Charge (After Split)</span>
                    <span className="text-xl font-extrabold text-blue-700">
                      ₹{breakdown.orderDetails.monthlyCharge.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <MonthlyBillingBreakdownTable breakdown={breakdown} />

          </div>
        </div>

      </div>
    </div>
  );
};

// Text Popup Modal Component
const TextPopupModal = React.memo(({ text, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Full Text</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="px-6 py-5">
          <p className="text-[15px] text-slate-700 leading-relaxed break-words whitespace-pre-wrap">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
});

TextPopupModal.displayName = 'TextPopupModal';

const TruncatedText = React.memo(({ text, limit, className = "" }) => {
  const [showPopup, setShowPopup] = useState(false);

  if (!text) return <span className={className}>-</span>;

  if (text.length <= limit) {
    return <span className={className}>{text}</span>;
  }

  return (
    <>
      <span className={className}>
        {text.substring(0, limit)}
        <span
          className="text-blue-600 cursor-pointer hover:underline ml-1 font-medium"
          onClick={() => setShowPopup(true)}
        >
          ..more
        </span>
      </span>
      {showPopup && (
        <TextPopupModal
          text={text}
          onClose={() => setShowPopup(false)}
        />
      )}
    </>
  );
});

TruncatedText.displayName = 'TruncatedText';

const TableRow = React.memo(({
  order,
  hideLsiColumn,
  fromDateFormatted,
  toDateFormatted,
  splitFactor = 1,
  stateToShow,
  onViewBreakdown,
  onBalanceCalculated,
  rowKey
}) => {
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBreakdown = async () => {
      setLoading(true);
      const result = await calculateBalanceWithBreakdownAPI(order, fromDateFormatted, toDateFormatted, splitFactor, stateToShow);
      setBreakdown(result);
      setLoading(false);

      // ✅ FIX: Report balance immediately after calculation
      if (onBalanceCalculated && result) {
        onBalanceCalculated(rowKey, result.totalBalance);
      }
    };

    fetchBreakdown();
  }, [order, fromDateFormatted, toDateFormatted, splitFactor, stateToShow, onBalanceCalculated, rowKey]);

  if (loading || !breakdown) {
    return (
      <tr key={rowKey} className="hover:bg-blue-50/40 transition-colors duration-150 border-b border-slate-100">
        <td colSpan="9" className="px-4 py-4 text-center text-slate-500">
          Loading...
        </td>
      </tr>
    );
  }

  const servicePeriod = getServicePeriod(order, toDateFormatted);

  return (
    <tr key={rowKey} className="hover:bg-blue-50/40 transition-colors duration-150 border-b border-slate-100 last:border-0">
      <td className="px-4 py-4">
        <span className="text-[16px] font-semibold text-blue-600">{order.orderId}</span>
      </td>
      {!hideLsiColumn && (
        <td className="px-4 py-4">
          <span className="text-[16px] font-semibold text-orange-600">{order.lsiId || '-'}</span>
        </td>
      )}
      <td className="px-4 py-4">
        <TruncatedText
          text={order.endA}
          limit={18}
          className="text-[15px] font-semibold text-slate-700"
        />
      </td>
      <td className="px-4 py-4">
        <TruncatedText
          text={order.endB}
          limit={18}
          className="text-[15px] font-semibold text-slate-700"
        />
      </td>
      <td className="px-4 py-4">
        <TruncatedText
          text={order.companyName}
          limit={18}
          className="text-[15px] font-semibold text-slate-700"
        />
      </td>
      <td className="px-4 py-4">
        <span className="inline-flex px-3 py-1.5 bg-indigo-50 text-indigo-700 text-[14px] font-semibold rounded-md">
          {stateToShow || order.billing1?.state || order.billing2?.state || '-'}
        </span>
      </td>
      <td className="px-4 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <span className={`text-[16px] font-bold ${breakdown.totalBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            ₹{breakdown.totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <button
            onClick={() => onViewBreakdown(breakdown)}
            className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors duration-200 group"
            title="View calculation breakdown"
          >
            <Info className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
          </button>
        </div>
      </td>
      <td className="px-4 py-4 text-center">
        <span className={`inline-flex px-3 py-1 text-[14px] font-semibold rounded ${splitFactor === 2
          ? 'bg-amber-50 text-amber-700'
          : 'bg-slate-100 text-slate-700'
          }`}>
          {splitFactor === 2 ? '50%' : '100%'}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${servicePeriod.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          <span className="text-[14px] text-slate-700 font-semibold whitespace-nowrap">
            {formatDateDisplay(servicePeriod.start)} → {formatDateDisplay(servicePeriod.end)}
          </span>
          <span className={`ml-1 px-2 py-0.5 text-[13px] font-semibold rounded ${servicePeriod.status === 'active'
            ? 'bg-emerald-50 text-emerald-700'
            : 'bg-rose-50 text-rose-700'
            }`}>
            {servicePeriod.status === 'active' ? 'Active' : 'Terminated'}
          </span>
        </div>
      </td>
    </tr>
  );
});

TableRow.displayName = 'TableRow';

const OutstandingReportComp = () => {
  const [orders, setOrders] = useState([]);
  const [hideLsiColumn, setHideLsiColumn] = useState(true);
  const [selectedBreakdown, setSelectedBreakdown] = useState(null);
  
  // ✅ FIX: Track balances by row
  const [rowBalances, setRowBalances] = useState({});

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const todayFormatted = getCurrentDate();
  const defaultDateRange = getDefaultDateRange();

  const [activeTab, setActiveTab] = useState('period');
  const [statusFilter, setStatusFilter] = useState('active');

  const [filters, setFilters] = useState({
    search: '',
    state: '',
    company: '',
    entity: '',
    fromDate: defaultDateRange.fromDate,
    toDate: defaultDateRange.toDate,
  });

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState('All');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/billing/orders');
      const result = await res.json();
      if (result.success) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  // ✅ FIX: Callback to receive balance from child TableRow
  const handleBalanceCalculated = useCallback((rowKey, balance) => {
    setRowBalances(prev => ({
      ...prev,
      [rowKey]: balance
    }));
  }, []);

  // ✅ Generate unique key for current filter state
  const filterKey = useMemo(() => {
    return JSON.stringify({
      filters,
      statusFilter,
      activeTab,
      selectedYear,
      selectedMonth
    });
  }, [filters, statusFilter, activeTab, selectedYear, selectedMonth]);

  // ✅ Reset balances only when filter key changes
  useEffect(() => {
    setRowBalances({});
  }, [filterKey]);

  const yearOptions = useMemo(() => getYearOptions(), []);

  const handleYearChange = (year) => {
    if (year === 'All') {
      setSelectedYear(year);
      setSelectedMonth('All');
    } else {
      const yearNum = parseInt(year);
      setSelectedYear(yearNum);
      setSelectedMonth(yearNum === getCurrentYear() ? ALL_MONTHS[getCurrentMonth()] : 'All');
    }
  };

  const availableMonths = useMemo(() => {
    if (selectedYear === 'All') {
      return [];
    }
    return getAvailableMonths(parseInt(selectedYear));
  }, [selectedYear]);

  useEffect(() => {
    if (activeTab === 'period') {
      if (selectedYear === 'All') {
        setFilters(prev => ({
          ...prev,
          fromDate: '',
          toDate: convertToInputFormat(todayFormatted)
        }));
      } else {
        const year = selectedYear;
        let lastDay;

        if (selectedMonth === 'All') {
          const monthIndex = year === getCurrentYear() ? getCurrentMonth() : 11;
          lastDay = getLastDayOfMonth(monthIndex, year);
        } else {
          const monthIndex = ALL_MONTHS.indexOf(selectedMonth);
          lastDay = getLastDayOfMonth(monthIndex, year);
        }

        setFilters(prev => ({
          ...prev,
          fromDate: '',
          toDate: convertToInputFormat(lastDay)
        }));
      }
    }
  }, [selectedMonth, selectedYear, activeTab, todayFormatted]);

  const maxDateForInput = useMemo(() => {
    return convertToInputFormat(todayFormatted);
  }, [todayFormatted]);

  const minDateForInput = useMemo(() => {
    const minYear = currentYear - 5;
    return `${minYear}-01-01`;
  }, [currentYear]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchCompany = !filters.company ||
        order.companyName?.toLowerCase().includes(filters.company.toLowerCase());

      const matchEntity = !filters.entity || order.entity === filters.entity;

      const matchState = !filters.state ||
        order.billing1?.state === filters.state ||
        order.billing2?.state === filters.state;

      const matchSearch = !filters.search ||
        order.orderId?.toLowerCase().includes(filters.search.toLowerCase()) ||
        order.lsiId?.toLowerCase().includes(filters.search.toLowerCase());

      let matchStatus = true;
      if (statusFilter === 'active') {
        matchStatus = order.status === 'PCD';
      } else {
        matchStatus = order.status === 'Terminate';
      }

      let matchDateFilter = true;

      const pcdDate = parseDate(order.pcdDate);
      const terminateDate = order.terminateDate ? parseDate(order.terminateDate) : null;

      if (pcdDate) {
        if (activeTab === 'period') {
          if (selectedYear !== 'All') {
            const selectedYearNum = parseInt(selectedYear);

            if (selectedMonth === 'All') {
              const yearEndDate = new Date(selectedYearNum, 11, 31, 23, 59, 59);
              matchDateFilter = pcdDate <= yearEndDate;
            } else {
              const monthIndex = ALL_MONTHS.indexOf(selectedMonth);
              const monthEndDate = new Date(selectedYearNum, monthIndex + 1, 0, 23, 59, 59);
              matchDateFilter = pcdDate <= monthEndDate;
            }
          }
        } else if (activeTab === 'dateRange') {
          if (filters.fromDate && filters.toDate) {
            const fromDate = new Date(filters.fromDate);
            fromDate.setHours(0, 0, 0, 0);
            const toDate = new Date(filters.toDate);
            toDate.setHours(23, 59, 59, 999);

            const orderStartedBeforeRangeEnds = pcdDate <= toDate;
            const orderActiveAfterRangeStarts = !terminateDate || terminateDate >= fromDate;
            
            matchDateFilter = orderStartedBeforeRangeEnds && orderActiveAfterRangeStarts;
          }
        }
      }

      return matchSearch && matchCompany && matchEntity && matchState && matchStatus && matchDateFilter;
    });
  }, [orders, filters, statusFilter, activeTab, selectedYear, selectedMonth]);

  // ✅ FIX: Calculate expected number of rows (after filteredOrders is defined)
  const expectedRowCount = useMemo(() => {
    let count = 0;
    filteredOrders.forEach(order => {
      const splitBilling = shouldSplitBilling(order);
      count += splitBilling ? 2 : 1;
    });
    return count;
  }, [filteredOrders]);

  // ✅ FIX: Only calculate total when all rows are loaded
  const totalBalance = useMemo(() => {
    // Always calculate sum of available balances
    const total = Object.values(rowBalances).reduce((sum, balance) => sum + balance, 0);
    return total;
  }, [rowBalances]);

  // ✅ FIX: Check if still calculating
  const isCalculating = useMemo(() => {
    if (expectedRowCount === 0) return false;
    return Object.keys(rowBalances).length < expectedRowCount;
  }, [rowBalances, expectedRowCount]);

  const uniqueCompanies = useMemo(() => {
    return [...new Set(orders.map(o => o.companyName))].filter(Boolean);
  }, [orders]);

  const clearAllFilters = useCallback(() => {
    const defaultRange = getDefaultDateRange();
    setFilters({
      search: '',
      state: '',
      company: '',
      entity: '',
      fromDate: defaultRange.fromDate,
      toDate: defaultRange.toDate,
    });
    setActiveTab('period');
    setSelectedYear(currentYear);
    setSelectedMonth(ALL_MONTHS[getCurrentMonth()]);
    setStatusFilter('active');
  }, [currentYear]);

  const hasActiveFilters = filters.search || filters.state || filters.company || filters.entity || (activeTab === 'dateRange' && filters.fromDate);

  const handleExport = useCallback(() => {
    console.log('Export functionality to be implemented');
  }, []);

  const getPeriodLabel = () => {
    if (selectedYear === 'All') {
      return 'All Time';
    }
    if (selectedMonth === 'All') {
      return `Up to Dec ${selectedYear}`;
    }
    return `Up to ${selectedMonth} ${selectedYear}`;
  };

  if (selectedBreakdown) {
    return (
      <CalculationBreakdown
        breakdown={selectedBreakdown}
        onClose={() => setSelectedBreakdown(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
      <div className="max-w-[1800px] mx-auto p-6 lg:p-8">

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm mb-6">

          <div className="mb-5">
            <h1 className="text-2xl font-bold text-slate-900 mb-0.5">
              Outstanding Balance Report Summary
            </h1>
            <p className="text-[14px] text-slate-600">
              {activeTab === 'period' 
                ? 'Cumulative totals - includes all orders up to selected period' 
                : 'Shows orders active during selected date range'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-5">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search Order/LSI..."
                className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>

            <select
              className="px-3 py-2.5 border border-slate-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white min-w-[140px]"
              value={filters.state}
              onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
            >
              <option value="">All States</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              className="px-3 py-2.5 border border-slate-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white min-w-[160px]"
              value={filters.company}
              onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value }))}
            >
              <option value="">All Companies</option>
              {uniqueCompanies.map(company => (
                <option key={company} value={company}>
                  {truncateText(company, 20)}
                </option>
              ))}
            </select>

            <select
              className="px-3 py-2.5 border border-slate-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white min-w-[140px]"
              value={filters.entity}
              onChange={(e) => setFilters(prev => ({ ...prev, entity: e.target.value }))}
            >
              <option value="">All Entities</option>
              {ENTITIES.map(e => <option key={e} value={e}>{e}</option>)}
            </select>

            <select
              className="px-3 py-2.5 border border-emerald-300 rounded-lg text-[14px] font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-emerald-50 text-emerald-700 min-w-[150px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="active">Active (PCD)</option>
              <option value="inactive">Inactive (Terminate)</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-rose-50 text-rose-600 text-[14px] font-medium rounded-lg hover:bg-rose-100 transition-colors duration-200 border border-rose-200"
              >
                <X className="w-3.5 h-3.5" />
                Clear Filter
              </button>
            )}

            <div className="flex-1"></div>

            <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 rounded-xl px-5 py-3 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-slate-200/40 rounded-full blur-2xl" />
              <div className="relative">
                <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  Total Orders
                </p>
                <div className="flex items-end gap-2 mt-1">
                  <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {filteredOrders.length}
                  </p>
                  <span className="text-xs text-slate-500 font-medium pb-1">
                    Orders
                  </span>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-100 rounded-xl px-5 py-3 border border-emerald-200 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-200/40 rounded-full blur-2xl" />
              <div className="relative">
                <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
                  Total Balance
                </p>
                {isCalculating ? (
                  <div className="flex items-center gap-3 mt-1">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                    <span className="text-sm font-semibold text-emerald-600">Calculating...</span>
                  </div>
                ) : (
                  <div className="flex items-end gap-2 mt-1">
                    <p className="text-2xl font-extrabold text-emerald-700 tracking-tight">
                      ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <span className="text-xs text-emerald-600 font-medium pb-1">
                      INR
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>

          <div className="flex items-center justify-between border-b border-slate-200 mb-4">
            <div className="flex gap-1">
              <button
                onClick={() => {
                  setActiveTab('period');
                  const defaultRange = getDefaultDateRange();
                  setFilters(prev => ({
                    ...prev,
                    fromDate: defaultRange.fromDate,
                    toDate: defaultRange.toDate
                  }));
                }}
                className={`px-5 py-2.5 text-[14px] font-semibold transition-all duration-200 border-b-2 ${activeTab === 'period'
                  ? 'text-teal-600 border-teal-600'
                  : 'text-slate-500 border-transparent hover:text-slate-700'
                  }`}
              >
                Period Selector
              </button>
              <button
                onClick={() => {
                  setActiveTab('dateRange');
                  const defaultRange = getDefaultDateRange();
                  setFilters(prev => ({
                    ...prev,
                    fromDate: defaultRange.fromDate,
                    toDate: defaultRange.toDate
                  }));
                }}
                className={`px-5 py-2.5 text-[14px] font-semibold transition-all duration-200 border-b-2 ${activeTab === 'dateRange'
                  ? 'text-teal-600 border-teal-600'
                  : 'text-slate-500 border-transparent hover:text-slate-700'
                  }`}
              >
                Date Range
              </button>
            </div>

            <div className="flex items-center gap-2 mb-0.5">
              <button
                onClick={() => setHideLsiColumn(!hideLsiColumn)}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 text-slate-700 text-[14px] font-medium rounded-lg hover:bg-slate-200 transition-colors duration-200"
              >
                {hideLsiColumn ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                {hideLsiColumn ? 'Show' : 'Hide'} LSI
              </button>

              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md font-medium text-[14px]"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {activeTab === 'period' && (
            <div className="flex flex-wrap items-center gap-6 px-4">
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                <label className="text-sm font-semibold text-gray-600">
                  Year
                </label>
                <select
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-teal-400 min-w-[120px]"
                  value={selectedYear}
                  onChange={(e) => handleYearChange(e.target.value)}
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {selectedYear !== 'All' && (
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 shadow-sm flex-1 min-w-[420px]">
                  <label className="text-sm font-semibold text-gray-600 whitespace-nowrap">
                    Month
                  </label>

                  <div className="flex gap-2 flex-wrap justify-center">
                    <button
                      onClick={() => setSelectedMonth('All')}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${selectedMonth === 'All'
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
                          onClick={() => isAvailable && setSelectedMonth(month)}
                          disabled={!isAvailable}
                          className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${selectedMonth === month
                            ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md scale-105'
                            : isAvailable
                              ? 'bg-white text-gray-700 border border-gray-200 hover:border-teal-300 hover:shadow-sm'
                              : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-50'
                            }`}
                        >
                          {month}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-teal-50 border-2 border-teal-200 rounded-lg px-4 py-2">
                <span className="text-sm font-bold text-teal-700">
                  Showing: {getPeriodLabel()}
                </span>
              </div>
            </div>
          )}

          {activeTab === 'dateRange' && (
            <div className="px-6 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-[14px] font-semibold text-slate-700 whitespace-nowrap">
                    From Date:
                  </label>
                  <input
                    type="date"
                    className="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg text-[14px]
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={filters.fromDate}
                    min={minDateForInput}
                    max={maxDateForInput}
                    onChange={(e) =>
                      setFilters(prev => ({ ...prev, fromDate: e.target.value }))
                    }
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[14px] font-semibold text-slate-700 whitespace-nowrap">
                    To Date:
                  </label>
                  <input
                    type="date"
                    className="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg text-[14px]
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={filters.toDate}
                    min={filters.fromDate || minDateForInput}
                    max={maxDateForInput}
                    onChange={(e) =>
                      setFilters(prev => ({ ...prev, toDate: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-200">
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-700 uppercase">Order ID</th>
                  {!hideLsiColumn && (
                    <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-700 uppercase">LSI ID</th>
                  )}
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-700 uppercase">End A</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-700 uppercase">End B</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-700 uppercase">Company</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-700 uppercase">State</th>
                  <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-700 uppercase">Balance</th>
                  <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-700 uppercase">Split</th>
                  <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-700 uppercase">Service Period</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-slate-100">
                {filteredOrders.map((order, orderIndex) => {
                  const fromDateFormatted = filters.fromDate ?
                    convertToStorageFormat(filters.fromDate) : order.pcdDate;
                  const toDateFormatted = convertToStorageFormat(filters.toDate);

                  const splitBilling = shouldSplitBilling(order);

                  if (splitBilling) {
                    const rowKey1 = `${order.id}-${order.billing1?.state}-2-${orderIndex}`;
                    const rowKey2 = `${order.id}-${order.billing2?.state}-2-${orderIndex}`;
                    
                    return (
                      <React.Fragment key={`order-${order.id}-${orderIndex}`}>
                        <TableRow
                          rowKey={rowKey1}
                          order={order}
                          hideLsiColumn={hideLsiColumn}
                          fromDateFormatted={fromDateFormatted}
                          toDateFormatted={toDateFormatted}
                          splitFactor={2}
                          stateToShow={order.billing1?.state}
                          onViewBreakdown={setSelectedBreakdown}
                          onBalanceCalculated={handleBalanceCalculated}
                        />
                        <TableRow
                          rowKey={rowKey2}
                          order={order}
                          hideLsiColumn={hideLsiColumn}
                          fromDateFormatted={fromDateFormatted}
                          toDateFormatted={toDateFormatted}
                          splitFactor={2}
                          stateToShow={order.billing2?.state}
                          onViewBreakdown={setSelectedBreakdown}
                          onBalanceCalculated={handleBalanceCalculated}
                        />
                      </React.Fragment>
                    );
                  } else {
                    const rowKey = `${order.id}-main-1-${orderIndex}`;
                    return (
                      <TableRow
                        key={`order-${order.id}-${orderIndex}`}
                        rowKey={rowKey}
                        order={order}
                        hideLsiColumn={hideLsiColumn}
                        fromDateFormatted={fromDateFormatted}
                        toDateFormatted={toDateFormatted}
                        splitFactor={1}
                        stateToShow=""
                        onViewBreakdown={setSelectedBreakdown}
                        onBalanceCalculated={handleBalanceCalculated}
                      />
                    );
                  }
                })}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg">No orders found matching your filters</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default OutstandingReportComp;

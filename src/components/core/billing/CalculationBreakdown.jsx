'use client'
import React from 'react'
import { ArrowLeft, Info } from 'lucide-react'

const CalculationBreakdown = ({ breakdown, onClose }) => {
  if (!breakdown) return null;

  console.log("break Down", breakdown);

  // Get storage keys based on breakdown data with id, state and splitKey
  const getStorageKeys = () => {
    if (typeof window === 'undefined') return { collections: null, accounts: null };

    const id = breakdown?.orderDetails?.id;
    const state = breakdown?.orderDetails?.state;
    const splitKey = breakdown?.orderDetails?.splitKey || '100';

    console.log("[v0] Building keys for - ID:", id, "State:", state, "SplitKey:", splitKey);

    let collectionsKey = null;
    let accountsKey = null;

    // Try to find keys using id, state and splitKey
    if (id && state) {
      const expectedCollectionsKey = `collections_${id}_${state}_${splitKey}`;
      const expectedAccountsKey = `accounts_${id}_${state}_${splitKey}`;

      console.log("[v0] Looking for expected keys:", expectedCollectionsKey, expectedAccountsKey);

      // Check if the expected keys exist in localStorage
      const storedCollections = localStorage.getItem(expectedCollectionsKey);
      const storedAccounts = localStorage.getItem(expectedAccountsKey);

      if (storedCollections) {
        try {
          const data = JSON.parse(storedCollections);
          if (Array.isArray(data) && data.length > 0 && data[0].amount && data[0].date) {
            collectionsKey = expectedCollectionsKey;
            console.log("[v0] Found collections key:", expectedCollectionsKey);
          }
        } catch (e) {
          console.log("[v0] Error parsing collections key:", e);
        }
      }

      if (storedAccounts) {
        try {
          const data = JSON.parse(storedAccounts);
          if (Array.isArray(data) && data.length > 0 && (data[0].invoiceNumber !== undefined) && data[0].date) {
            accountsKey = expectedAccountsKey;
            console.log("[v0] Found accounts key:", expectedAccountsKey);
          }
        } catch (e) {
          console.log("[v0] Error parsing accounts key:", e);
        }
      }
    }

    console.log("[v0] Final keys - Collections:", collectionsKey, "Accounts:", accountsKey);
    return { collections: collectionsKey, accounts: accountsKey };
  };

  const storageKeysCache = getStorageKeys();

  // Helper function to get received amount from localStorage for a specific month
  const getReceivedAmount = (month, year) => {
    if (typeof window === 'undefined') return 0;
    
    const { collections: storageKey } = getStorageKeys();
    console.log("[v0] Looking for collections with month:", month + 1, "year:", year);
    console.log("[v0] Collections key found:", storageKey);
    
    if (!storageKey) return 0;
    
    const stored = localStorage.getItem(storageKey);
    if (!stored) return 0;
    
    try {
      const collections = JSON.parse(stored);
      console.log("[v0] All collections data:", collections);
      
      const monthCollections = collections.filter(c => {
        // Date format is YYYY-MM-DD
        const [collYear, collMonth, collDay] = c.date.split('-');
        const matches = parseInt(collMonth) === month + 1 && parseInt(collYear) === year;
        console.log("[v0] Checking collection:", c.date, "parsed to month:", collMonth, "year:", collYear, "matches:", matches);
        return matches;
      });
      
      const total = monthCollections.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
      console.log("[v0] Found amount for month", month + 1, '/', year, ':', total);
      return total;
    } catch (e) {
      console.log("[v0] Error parsing collections:", e);
      return 0;
    }
  };

  // Helper function to get invoice number from localStorage for a specific month
  const getInvoiceNumber = (month, year) => {
    if (typeof window === 'undefined') return '-';
    
    const { accounts: storageKey } = getStorageKeys();
    if (!storageKey) return '-';
    
    const stored = localStorage.getItem(storageKey);
    if (!stored) return '-';
    
    try {
      const accounts = JSON.parse(stored);
      const monthAccounts = accounts.filter(a => {
        // Date format is YYYY-MM-DD
        const [accYear, accMonth, accDay] = a.date.split('-');
        return parseInt(accMonth) === month + 1 && parseInt(accYear) === year;
      });
      return monthAccounts.length > 0 ? (monthAccounts[0].invoiceNumber || '-') : '-';
    } catch (e) {
      console.log("[v0] Error parsing accounts:", e);
      return '-';
    }
  };

  // Calculate cumulative balance with received amount consideration
const getMonthlyBreakdownData = () => {
  const data = [];

  // Step 1: collect all received amounts month-wise
  const receivedMap = {};
  breakdown.months.forEach(m => {
    const key = `${m.year}-${m.month}`;
    receivedMap[key] = getReceivedAmount(m.month, m.year);
  });

  // Step 2: total received pool (FIFO source)
  let remainingReceivedPool = Object.values(receivedMap).reduce(
    (sum, v) => sum + v,
    0
  );

  let runningBalance = 0;

  breakdown.months.forEach((monthData) => {
    const monthlyBillingWithGst = monthData.amount;

    // add current month billing
    runningBalance += monthlyBillingWithGst;

    // apply received amount FIFO (oldest first)
    let appliedAmount = 0;
    if (remainingReceivedPool > 0) {
      appliedAmount = Math.min(remainingReceivedPool, runningBalance);
      runningBalance -= appliedAmount;
      remainingReceivedPool -= appliedAmount;
    }

    data.push({
      ...monthData,
      monthlyBillingWithGst,
      receivedAmount: receivedMap[`${monthData.year}-${monthData.month}`] || 0,
      cumulativeBalance: runningBalance,
      invoiceNumber: getInvoiceNumber(monthData.month, monthData.year),
    });
  });

  return data;
};


  const monthlyData = getMonthlyBreakdownData();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">

          {/* Header - Back Button and Title Side by Side */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              {/* Back Button */}
              <button
                onClick={onClose}
                className="group flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg shadow-sm border border-slate-200 transition-all duration-200 hover:shadow-md hover:border-slate-300"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
                <span>Back to Reports</span>
              </button>

              {/* Title Section */}
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

            {/* Order Details and Calculation Formula Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Order Details */}
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

              {/* Calculation Formula */}
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

            {/* Month-by-Month Breakdown */}
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                Balance Calculation Breakdown
              </h2>
              <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-100 border-b-2 border-slate-200">
                        <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Month</th>
                        <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Start Date</th>
                        <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">End Date</th>
                        <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">Billing Days</th>
                        <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">Per Day</th>
                        <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">Received Amount</th>
                        <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">Monthly Billing (+GST)</th>
                        <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">Total Balance Remaining</th>
                        <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">Invoice Number</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {monthlyData.map((monthData, index) => {
                        const balanceIsOverdue = monthData.cumulativeBalance > 0 && monthData.receivedAmount < monthData.monthlyBillingWithGst;
                        const balanceColor = balanceIsOverdue ? 'bg-orange-50' : 'bg-white';
                        
                        return (
                          <tr
                            key={index}
                            className={`transition-colors ${monthData.isPcdMonth || monthData.isTerminateMonth
                                      ? 'bg-blue-50/50'
                                      : balanceColor
                                  } hover:bg-slate-50`}
                          >
                            {/* Month */}
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-900 text-sm">
                                  {monthData.monthYear}
                                </span>
                                {monthData.isPcdMonth && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700">
                                    PCD
                                  </span>
                                )}
                                {monthData.isTerminateMonth && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-700">
                                    Terminated
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Start Date */}
                            <td className="px-4 py-4 text-sm font-medium text-slate-700">
                              {monthData.startDay}-{String(monthData.month + 1).padStart(2, '0')}-{monthData.year}
                            </td>

                            {/* End Date */}
                            <td className="px-4 py-4 text-sm font-medium text-slate-700">
                              {monthData.endDay}-{String(monthData.month + 1).padStart(2, '0')}-{monthData.year}
                            </td>

                            {/* Billing Days */}
                            <td className="px-4 py-4 text-center text-sm font-bold text-slate-900">
                              {monthData.billingDays}
                            </td>

                            {/* Per Day Rate */}
                            <td className="px-4 py-4 text-right text-sm font-medium text-slate-700">
                              ₹{monthData.perDayRate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>

                            {/* Received Amount - Rule 2 */}
                            <td className="px-4 py-4 text-right text-sm font-bold text-blue-600">
                              ₹{monthData.receivedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>

                            {/* Monthly Billing Amount (+GST) - Rule 1 */}
                            <td className="px-4 py-4 text-right text-sm font-bold text-emerald-600">
                              ₹{monthData.monthlyBillingWithGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>

                            {/* Total Balance Remaining - Rule 3 */}
                            <td className={`px-4 py-4 text-right text-sm font-bold ${
                              monthData.cumulativeBalance <= 0 ? 'text-green-600' : 'text-orange-600 bg-orange-100'
                            }`}>
                              ₹{Math.max(0, monthData.cumulativeBalance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>

                            {/* Invoice Number - Rule 4 */}
                            <td className="px-4 py-4 text-center text-sm font-semibold text-slate-900">
                              {monthData.invoiceNumber}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-emerald-50 border-t-2 border-emerald-300">
                        <td colSpan="5" className="px-4 py-4 text-right font-bold text-slate-900">
                          Total:
                        </td>
                        <td className="px-4 py-4 text-right font-bold text-blue-700">
                          ₹{monthlyData.reduce((sum, m) => sum + m.receivedAmount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-4 text-right font-extrabold text-emerald-700 text-lg">
                          ₹{breakdown.totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td colSpan="2" className="px-4 py-4"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default CalculationBreakdown;

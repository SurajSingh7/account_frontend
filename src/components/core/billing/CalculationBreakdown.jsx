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
    let totalBilledTillNow = 0;
    let totalReceivedTillNow = 0;

    return breakdown.months.map((monthData) => {
      const monthlyBillingWithGst = monthData.amount;
      const receivedAmount = getReceivedAmount(monthData.month, monthData.year);

      totalBilledTillNow += monthlyBillingWithGst;
      totalReceivedTillNow += receivedAmount;

      const totalBalance = totalBilledTillNow - totalReceivedTillNow;

      // ✅ Remaining only for THIS month
      const previousBilled =
        totalBilledTillNow - monthlyBillingWithGst;

      const previousRemaining =
        Math.max(previousBilled - (totalReceivedTillNow - receivedAmount), 0);

      const totalRemaining =
        Math.max(
          monthlyBillingWithGst -
          Math.max(receivedAmount - previousRemaining, 0),
          0
        );

      return {
        ...monthData,
        monthlyBillingWithGst,
        receivedAmount,
        totalBalance,
        totalRemaining,
        invoiceNumber: getInvoiceNumber(monthData.month, monthData.year),
      };
    });
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
                        <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-700 uppercase">Month</th>
                        <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-700 uppercase">Start Date</th>
                        <th className="px-4 py-3.5 text-left text-xs font-bold text-slate-700 uppercase">End Date</th>
                        <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-700 uppercase">Billing Days</th>
                        <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-700 uppercase">Per Day</th>
                        <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-700 uppercase">Received Amount</th>
                        <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-700 uppercase">Monthly Billing (+GST)</th>

                        {/* NEW */}
                        <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-700 uppercase">
                          Total Balance
                        </th>

                        <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-700 uppercase">
                          Total Remaining
                        </th>

                        <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-700 uppercase">
                          Invoice Number
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-slate-100">
                      {monthlyData.map((monthData, index) => (
                        <tr key={index} className="hover:bg-slate-50">

                          {/* Month */}
                          <td className="px-4 py-4 font-semibold text-slate-900">
                            {monthData.monthYear}
                          </td>

                          {/* Start Date */}
                          <td className="px-4 py-4 text-sm text-slate-700">
                            {monthData.startDay}-{String(monthData.month + 1).padStart(2, '0')}-{monthData.year}
                          </td>

                          {/* End Date */}
                          <td className="px-4 py-4 text-sm text-slate-700">
                            {monthData.endDay}-{String(monthData.month + 1).padStart(2, '0')}-{monthData.year}
                          </td>

                          {/* Billing Days */}
                          <td className="px-4 py-4 text-center font-bold">
                            {monthData.billingDays}
                          </td>

                          {/* Per Day */}
                          <td className="px-4 py-4 text-right">
                            ₹{monthData.perDayRate.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>

                          {/* Received */}
                          <td className="px-4 py-4 text-right font-bold text-blue-600">
                            ₹{monthData.receivedAmount.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>

                          {/* Monthly Billing */}
                          <td className="px-4 py-4 text-right font-bold text-emerald-600">
                            ₹{monthData.monthlyBillingWithGst.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>

                          {/* 🔥 TOTAL BALANCE (NEW) */}
                          <td className="px-4 py-4 text-right font-bold text-slate-800">
                            ₹{monthData.totalBalance.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>

                          {/* TOTAL REMAINING */}
                          <td
                            className={`px-4 py-4 text-right font-bold ${monthData.totalRemaining > 0
                              ? 'text-orange-600 bg-orange-100'
                              : 'text-green-600'
                              }`}
                          >
                            ₹{monthData.totalRemaining.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>

                          {/* Invoice */}
                          <td className="px-4 py-4 text-center font-semibold">
                            {monthData.invoiceNumber}
                          </td>
                        </tr>
                      ))}
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

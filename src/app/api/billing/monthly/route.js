import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MonthlyBilling from '@/models/MonthlyBilling';
import Order from '@/models/Order';

// Helper function to parse date (DD-MM-YYYY) - FIXED
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  
  // If it's already a Date object
  if (dateStr instanceof Date) {
    return dateStr;
  }
  
  // If it's an ISO string or timestamp
  if (typeof dateStr === 'string' && (dateStr.includes('T') || dateStr.includes('Z'))) {
    return new Date(dateStr);
  }
  
  // If it's DD-MM-YYYY format
  if (typeof dateStr === 'string' && dateStr.includes('-')) {
    const parts = dateStr.split('-');
    
    // Check if it's DD-MM-YYYY (day will be <= 31)
    if (parts.length === 3 && parseInt(parts[0]) <= 31) {
      const [day, month, year] = parts.map(Number);
      return new Date(year, month - 1, day);
    }
    
    // Otherwise treat as YYYY-MM-DD
    return new Date(dateStr);
  }
  
  // Try to create date from any other format
  return new Date(dateStr);
};

// Helper function to format date (DD-MM-YYYY)
const formatDate = (date) => {
  if (!date) return '';
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Helper function to format month name
const formatMonthYear = (month, year) => {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return `${monthNames[month]} ${year}`;
};

// Helper function to get days in month
const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

// Helper function to generate unique invoice number
const generateInvoiceNumber = (billing, index = 0) => {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const timestamp = (Date.now() + index).toString().slice(-6);
  
  const stateCode = billing.state ? billing.state.substring(0, 3).toUpperCase() : 'XXX';
  return `INV-${year}${month}${day}-${stateCode}-${timestamp}`;
};

// Main calculation function
const calculateMonthlyBillings = (order, endDate, autoGenerateInvoice = false) => {
  const pcdDate = parseDate(order.pcdDate);
  const terminateDate = order.terminateDate ? parseDate(order.terminateDate) : null;
  const currentEndDate = parseDate(endDate);
  
  if (!pcdDate || !currentEndDate) return [];

  const billings = [];
  let invoiceIndex = 0;
  
  // Determine split factor
  const isNLD = order.product === 'NLD';
  const state1 = order.billing1?.state || '';
  const state2 = order.billing2?.state || '';
  const shouldSplit = isNLD && state1 !== state2 && state2 !== '';
  
  // Get split percentages from order
  const splitFactor = order.splitFactor || { isApplicable: false, state1Percentage: 50, state2Percentage: 50 };
  const state1Percentage = shouldSplit && splitFactor.isApplicable ? splitFactor.state1Percentage : 100;
  const state2Percentage = shouldSplit && splitFactor.isApplicable ? splitFactor.state2Percentage : 0;
  
  // Calculate base amounts
  const capacityMbps = Number(order.capacity) || 0;
  const baseRate = Number(order.amount) || 0;
  const totalAmount = baseRate * capacityMbps;
  
  // Determine service end date
  let serviceEndDate = currentEndDate;
  if (terminateDate) {
    const lastBillingDay = new Date(terminateDate);
    lastBillingDay.setDate(lastBillingDay.getDate() - 1);
    serviceEndDate = lastBillingDay < currentEndDate ? lastBillingDay : currentEndDate;
  }
  
  // Generate monthly billings
  let currentDate = new Date(pcdDate);
  
  while (currentDate <= serviceEndDate && currentDate <= currentEndDate) {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const daysInMonth = getDaysInMonth(month, year);
    
    const isPcdMonth = (currentDate.getFullYear() === pcdDate.getFullYear() &&
      currentDate.getMonth() === pcdDate.getMonth());
    
    const isTerminateMonth = terminateDate &&
      (currentDate.getFullYear() === serviceEndDate.getFullYear() &&
        currentDate.getMonth() === serviceEndDate.getMonth());
    
    let startDay = 1;
    let endDay = daysInMonth;
    let billingDays = daysInMonth;
    
    // Calculate billing days based on PCD and termination
    if (isPcdMonth && isTerminateMonth) {
      startDay = pcdDate.getDate();
      endDay = serviceEndDate.getDate();
      billingDays = endDay - startDay + 1;
    } else if (isPcdMonth) {
      startDay = pcdDate.getDate();
      endDay = daysInMonth;
      billingDays = endDay - startDay + 1;
    } else if (isTerminateMonth) {
      startDay = 1;
      endDay = serviceEndDate.getDate();
      billingDays = endDay - startDay + 1;
    }
    
    const startDateStr = formatDate(new Date(year, month, startDay));
    const endDateStr = formatDate(new Date(year, month, endDay));
    
    // Create billing entry for each state if split
    if (shouldSplit) {
      // Billing 1
      const monthlyCharge1 = (totalAmount * state1Percentage / 100) * (billingDays / daysInMonth);
      const gstDetails1 = order.gstDetails1 || order.gstDetails || {};
      const isSelfGST1 = gstDetails1.isSelfGST || false;
      
      let cgst1 = 0, sgst1 = 0, igst1 = 0;
      if (isSelfGST1) {
        cgst1 = monthlyCharge1 * (gstDetails1.cgst || 9) / 100;
        sgst1 = monthlyCharge1 * (gstDetails1.sgst || 9) / 100;
      } else {
        igst1 = monthlyCharge1 * (gstDetails1.igst || 18) / 100;
      }
      
      const totalWithGst1 = monthlyCharge1 + cgst1 + sgst1 + igst1;
      const perDayRate1 = totalAmount * state1Percentage / 100 / daysInMonth;
      
      const billing1 = {
        orderId: order.orderId,
        month: formatMonthYear(month, year),
        startDate: startDateStr,
        endDate: endDateStr,
        billingDays,
        perDayRate: perDayRate1,
        receivedDetails: [],
        creditNotes: [],
        miscellaneousSell: [],
        tdsProvision: [],
        tdsConfirm: [],
        monthlyBilling: monthlyCharge1,
        cgst: cgst1,
        sgst: sgst1,
        igst: igst1,
        totalWithGst: totalWithGst1,
        invoiceNumber: '',
        isSelfGST: isSelfGST1,
        gstState: gstDetails1.gstState || '',
        gstStateCode: gstDetails1.gstStateCode || '',
        state: state1,
        splitKey: '50',
        splitPercentage: state1Percentage,
        capacity: capacityMbps,
        companyName: order.companyName,
        status: 'generated',
        isPcdMonth,
        isTerminateMonth
      };
      
      if (autoGenerateInvoice) {
        billing1.invoiceNumber = generateInvoiceNumber(billing1, invoiceIndex++);
        billing1.status = 'invoiced';
      }
      
      billings.push(billing1);
      
      // Billing 2
      const monthlyCharge2 = (totalAmount * state2Percentage / 100) * (billingDays / daysInMonth);
      const gstDetails2 = order.gstDetails2 || order.gstDetails || {};
      const isSelfGST2 = gstDetails2.isSelfGST || false;
      
      let cgst2 = 0, sgst2 = 0, igst2 = 0;
      if (isSelfGST2) {
        cgst2 = monthlyCharge2 * (gstDetails2.cgst || 9) / 100;
        sgst2 = monthlyCharge2 * (gstDetails2.sgst || 9) / 100;
      } else {
        igst2 = monthlyCharge2 * (gstDetails2.igst || 18) / 100;
      }
      
      const totalWithGst2 = monthlyCharge2 + cgst2 + sgst2 + igst2;
      const perDayRate2 = totalAmount * state2Percentage / 100 / daysInMonth;
      
      const billing2 = {
        orderId: order.orderId,
        month: formatMonthYear(month, year),
        startDate: startDateStr,
        endDate: endDateStr,
        billingDays,
        perDayRate: perDayRate2,
        receivedDetails: [],
        creditNotes: [],
        miscellaneousSell: [],
        tdsProvision: [],
        tdsConfirm: [],
        monthlyBilling: monthlyCharge2,
        cgst: cgst2,
        sgst: sgst2,
        igst: igst2,
        totalWithGst: totalWithGst2,
        invoiceNumber: '',
        isSelfGST: isSelfGST2,
        gstState: gstDetails2.gstState || '',
        gstStateCode: gstDetails2.gstStateCode || '',
        state: state2,
        splitKey: '50',
        splitPercentage: state2Percentage,
        capacity: capacityMbps,
        companyName: order.companyName,
        status: 'generated',
        isPcdMonth,
        isTerminateMonth
      };
      
      if (autoGenerateInvoice) {
        billing2.invoiceNumber = generateInvoiceNumber(billing2, invoiceIndex++);
        billing2.status = 'invoiced';
      }
      
      billings.push(billing2);
    } else {
      // Single billing
      const monthlyCharge = totalAmount * (billingDays / daysInMonth);
      const gstDetails = order.gstDetails || {};
      const isSelfGST = gstDetails.isSelfGST || false;
      
      let cgst = 0, sgst = 0, igst = 0;
      if (isSelfGST) {
        cgst = monthlyCharge * (gstDetails.cgst || 9) / 100;
        sgst = monthlyCharge * (gstDetails.sgst || 9) / 100;
      } else {
        igst = monthlyCharge * (gstDetails.igst || 18) / 100;
      }
      
      const totalWithGst = monthlyCharge + cgst + sgst + igst;
      const perDayRate = totalAmount / daysInMonth;
      
      const billing = {
        orderId: order.orderId,
        month: formatMonthYear(month, year),
        startDate: startDateStr,
        endDate: endDateStr,
        billingDays,
        perDayRate,
        receivedDetails: [],
        creditNotes: [],
        miscellaneousSell: [],
        tdsProvision: [],
        tdsConfirm: [],
        monthlyBilling: monthlyCharge,
        cgst,
        sgst,
        igst,
        totalWithGst,
        invoiceNumber: '',
        isSelfGST,
        gstState: gstDetails.gstState || '',
        gstStateCode: gstDetails.gstStateCode || '',
        state: state1 || state2,
        splitKey: '100',
        splitPercentage: 100,
        capacity: capacityMbps,
        companyName: order.companyName,
        status: 'generated',
        isPcdMonth,
        isTerminateMonth
      };
      
      if (autoGenerateInvoice) {
        billing.invoiceNumber = generateInvoiceNumber(billing, invoiceIndex++);
        billing.status = 'invoiced';
      }
      
      billings.push(billing);
    }
    
    if (isTerminateMonth) break;
    currentDate = new Date(year, month + 1, 1);
  }
  
  return billings;
};

// POST - Generate monthly billings
export async function POST(request) {
  try {
    await connectDB();
    
    const { orderId, mode, customEndDate, autoInvoice = true } = await request.json();
    
    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }
    
    const order = await Order.findOne({ orderId });
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }
    
    let endDate;
    if (mode === 'auto') {
      const now = new Date();
      endDate = formatDate(now);
    } else if (mode === 'manual' && customEndDate) {
      endDate = customEndDate;
    } else {
      return NextResponse.json({ success: false, error: 'Invalid mode or missing customEndDate' }, { status: 400 });
    }
    
    const billings = calculateMonthlyBillings(order, endDate, autoInvoice);
    
    if (billings.length === 0) {
      return NextResponse.json({ success: false, error: 'No billings to generate' }, { status: 400 });
    }
    
    const operations = billings.map(billing => ({
      updateOne: {
        filter: { 
          orderId: billing.orderId, 
          month: billing.month, 
          state: billing.state, 
          splitKey: billing.splitKey 
        },
        update: { $set: billing },
        upsert: true
      }
    }));
    
    await MonthlyBilling.bulkWrite(operations);
    
    const savedBillings = await MonthlyBilling.find({
      orderId: orderId,
      month: { $in: billings.map(b => b.month) }
    }).sort({ month: 1, state: 1 });
    
    return NextResponse.json({
      success: true,
      message: `Generated ${billings.length} monthly billing entries${autoInvoice ? ' with invoices' : ''}`,
      data: savedBillings
    });
    
  } catch (error) {
    console.error('Generate monthly billings error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// GET - Fetch monthly billings
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    
    const query = orderId ? { orderId } : {};
    const billings = await MonthlyBilling.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: billings });
    
  } catch (error) {
    console.error('Fetch monthly billings error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT - Update a monthly billing
export async function PUT(request) {
  try {
    await connectDB();
    
    const bodyData = await request.json();
    const { _id, ...updateData } = bodyData;
    
    if (!_id) {
      return NextResponse.json({ success: false, error: 'Billing ID is required' }, { status: 400 });
    }
    
    const updatedBilling = await MonthlyBilling.findByIdAndUpdate(
      _id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!updatedBilling) {
      return NextResponse.json({ success: false, error: 'Billing not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: updatedBilling });
    
  } catch (error) {
    console.error('Update monthly billing error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE - Delete monthly billings
export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const billingId = searchParams.get('billingId');
    
    if (billingId) {
      await MonthlyBilling.findByIdAndDelete(billingId);
      return NextResponse.json({ success: true, message: 'Billing deleted' });
    } else if (orderId) {
      await MonthlyBilling.deleteMany({ orderId });
      return NextResponse.json({ success: true, message: 'All billings for order deleted' });
    } else {
      return NextResponse.json({ success: false, error: 'orderId or billingId required' }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Delete monthly billing error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import MonthlyBilling from '@/models/MonthlyBilling';
import Order from '@/models/Order';

// Helper function to parse date (DD-MM-YYYY)
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Helper function to format date (DD-MM-YYYY)
const formatDate = (date) => {
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

// NEW: Helper function to generate unique invoice number
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
  const splitFactor = shouldSplit ? 2 : 1;
  
  // Calculate base amounts
  const capacityMbps = Number(order.capacity) || 0;
  const baseRate = Number(order.amount) || 0;
  const totalAmount = baseRate * capacityMbps;
  const gstRate = 0.18;
  const monthlyCharge = totalAmount / splitFactor;
  
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
    
    const perDayRate = monthlyCharge / daysInMonth;
    const monthlyBilling = perDayRate * billingDays;
    const gst = monthlyBilling * gstRate;
    const totalWithGst = monthlyBilling + gst;
    
    const startDateStr = formatDate(new Date(year, month, startDay));
    const endDateStr = formatDate(new Date(year, month, endDay));
    
    // Create billing entry for each state if split
    if (shouldSplit) {
      // Billing 1
      const billing1 = {
        orderId: order.orderId,
        month: formatMonthYear(month, year),
        startDate: startDateStr,
        endDate: endDateStr,
        billingDays,
        perDayRate,
        receivedDetails: [],
        creditNotes: [], // ✅ Added creditNotes
        miscellaneousSell: [],
        tdsProvision: [],
        tdsConfirm: [],
        monthlyBilling,
        gst,
        totalWithGst,
        invoiceNumber: '',
        state: state1,
        splitKey: '50',
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
      const billing2 = {
        orderId: order.orderId,
        month: formatMonthYear(month, year),
        startDate: startDateStr,
        endDate: endDateStr,
        billingDays,
        perDayRate,
        receivedDetails: [],
        creditNotes: [], // ✅ Added creditNotes
        miscellaneousSell: [],
        tdsProvision: [],
        tdsConfirm: [],
        monthlyBilling,
        gst,
        totalWithGst,
        invoiceNumber: '',
        state: state2,
        splitKey: '50',
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
      const billing = {
        orderId: order.orderId,
        month: formatMonthYear(month, year),
        startDate: startDateStr,
        endDate: endDateStr,
        billingDays,
        perDayRate,
        receivedDetails: [],
        creditNotes: [], // ✅ Added creditNotes
        miscellaneousSell: [],
        tdsProvision: [],
        tdsConfirm: [],
        monthlyBilling,
        gst,
        totalWithGst,
        invoiceNumber: '',
        state: state1 || state2,
        splitKey: '100',
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
    
    // ✅ Ensure creditNotes is preserved in updates
    // If creditNotes is not in updateData, it will be preserved from the existing document
    // If it is in updateData (even as empty array), it will be updated
    
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
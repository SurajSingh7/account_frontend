import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DistributedPayment from '../../../../models/Distribution';

// ─── GET: list records or single record by id ─────────────────
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record by id
    if (id) {
      const record = await DistributedPayment.findById(id);
      if (!record) return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
      return NextResponse.json({ success: true, data: record });
    }

    // Build query from optional filters
    const query = {};
    const companyGroup = searchParams.get('companyGroup');
    const paymentType  = searchParams.get('paymentType');

    if (companyGroup) query.companyGroup = { $regex: companyGroup.trim(), $options: 'i' };
    if (paymentType && ['receivedDetails', 'tdsProvision', 'tdsConfirm'].includes(paymentType)) {
      query.paymentType = paymentType;
    }

    const [records, groups] = await Promise.all([
      DistributedPayment.find(query).sort({ createdAt: -1 }).limit(500).lean(),
      DistributedPayment.distinct('companyGroup'),           // all groups for autocomplete
    ]);

    return NextResponse.json({ success: true, data: records, groups: groups.sort() });
  } catch (error) {
    console.error('GET /api/billing/distributed error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ─── POST: create a new distribution record ───────────────────
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { companyGroup, paymentType, paymentDate, billingMonth, totalAmount, notes, entries } = body;

    if (!companyGroup || !paymentType || !paymentDate || !billingMonth || totalAmount === undefined) {
      return NextResponse.json({ success: false, error: 'Missing required fields: companyGroup, paymentType, paymentDate, billingMonth, totalAmount' }, { status: 400 });
    }

    const cleanEntries = (entries || []).map(e => ({
      orderId:     String(e.orderId || ''),
      companyName: String(e.companyName || ''),
      state:       String(e.state || ''),
      entity:      String(e.entity || ''),
      splitPct:    Number(e.splitPct) || 100,
      isSplit:     Boolean(e.isSplit),
      amount:      Number(e.amount)  || 0,
      notes:       String(e.notes   || ''),
      date:        String(e.date    || ''),
      month:       String(e.month   || ''),
    }));

    const record = await DistributedPayment.create({
      companyGroup:  String(companyGroup),
      paymentType:   String(paymentType),
      paymentDate:   String(paymentDate),
      billingMonth:  String(billingMonth),
      totalAmount:   Number(totalAmount),
      notes:         String(notes || ''),
      entries:       cleanEntries,
      entryCount:    cleanEntries.length,
    });

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error) {
    console.error('POST /api/billing/distributed error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ─── DELETE: remove a record by id ───────────────────────────
export async function DELETE(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id query param required' }, { status: 400 });

    const deleted = await DistributedPayment.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Distribution record deleted' });
  } catch (error) {
    console.error('DELETE /api/billing/distributed error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
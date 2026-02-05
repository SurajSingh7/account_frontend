import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';

// GET single order
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    // ✅ FIX: Await params in Next.js 15+
    const { id } = await params;
    
    const order = await Order.findById(id);
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('GET Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT update order
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    // ✅ FIX: Await params in Next.js 15+
    const { id } = await params;
    const body = await request.json();
    
    const order = await Order.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('PUT Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// DELETE single order
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    // ✅ FIX: Await params in Next.js 15+
    const { id } = await params;
    
    const order = await Order.findByIdAndDelete(id);
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Order deleted' });
  } catch (error) {
    console.error('DELETE Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

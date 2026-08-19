import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Partner from '@/models/Partner';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const updated = await Partner.findByIdAndUpdate(params.id, body, { new: true });
    if (!updated) return NextResponse.json({ error: 'Partner not found' }, { status: 404 });

    return NextResponse.json({ success: true, partner: updated });
  } catch (error: unknown) {
    console.error('Update partner error:', error);
    return NextResponse.json({ error: 'Failed to update partner' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const updated = await Partner.findByIdAndUpdate(params.id, { status: 'inactive' }, { new: true });
    return NextResponse.json({ success: true, partner: updated });
  } catch (error: unknown) {
    console.error('Deactivate partner error:', error);
    return NextResponse.json({ error: 'Failed to deactivate partner' }, { status: 500 });
  }
}

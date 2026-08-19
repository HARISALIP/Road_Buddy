import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Asset from '@/models/Asset';

export async function GET() {
  try {
    await connectToDatabase();
    const assets = await Asset.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, assets });
  } catch (error: unknown) {
    console.error('Fetch assets error:', error);
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { name, assetType, purchaseDate, purchaseAmount } = await req.json();

    if (!name) return NextResponse.json({ error: 'Asset name is required' }, { status: 400 });

    const asset = await Asset.create({
      name,
      assetType: assetType || 'General Asset',
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      purchaseAmount: Number(purchaseAmount) || 0,
      status: 'active',
    });

    return NextResponse.json({ success: true, asset }, { status: 201 });
  } catch (error: unknown) {
    console.error('Create asset error:', error);
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 });
  }
}

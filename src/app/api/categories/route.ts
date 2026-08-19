import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Category from '@/models/Category';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = { status: 'active' };
    if (type) filter.type = type;

    const categories = await Category.find(filter).sort({ name: 1 });
    return NextResponse.json({ success: true, categories });
  } catch (error: unknown) {
    console.error('Fetch categories error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { name, type } = await req.json();

    if (!name || !type) {
      return NextResponse.json({ error: 'Category name and type are required' }, { status: 400 });
    }

    const category = await Category.create({
      name,
      type,
      status: 'active',
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error: unknown) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

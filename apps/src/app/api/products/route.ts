import { connection, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  await connection();

  try {
    const products = await prisma.product.findMany({
      orderBy: { designation: 'asc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}


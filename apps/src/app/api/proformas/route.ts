import { connection, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  await connection();

  try {
    const proformas = await prisma.proforma.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(proformas);
  } catch (error) {
    console.error('Error fetching proformas:', error);
    return NextResponse.json({ error: 'Failed to fetch proformas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const count = await prisma.proforma.count();
    const reference = body.reference || `PF-2025-0${count + 845}`;

    const proforma = await prisma.proforma.create({
      data: {
        reference,
        customerId: body.customerId,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        salesRepId: body.salesRepId,
        salesRepName: body.salesRepName,
        items: body.items,
        totalHT: body.totalHT,
        discountTotal: body.discountTotal || 0,
        totalTVA: body.totalTVA,
        totalTTC: body.totalTTC,
        status: body.status || 'PENDING_PAYMENT',
        notes: body.notes,
        validUntil: body.validUntil ? new Date(body.validUntil) : new Date(Date.now() + 15 * 86400000),
      },
    });

    return NextResponse.json(proforma);
  } catch (error) {
    console.error('Error creating proforma:', error);
    return NextResponse.json({ error: 'Failed to create proforma' }, { status: 500 });
  }
}


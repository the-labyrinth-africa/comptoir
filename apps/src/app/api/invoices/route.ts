import { connection } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  await connection();

  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const count = await prisma.invoice.count();
    const reference = body.reference || `FA-2025-${count + 1421}`;

    const invoice = await prisma.invoice.create({
      data: {
        reference,
        proformaId: body.proformaId,
        proformaRef: body.proformaRef,
        cashierId: body.cashierId,
        cashierName: body.cashierName,
        terminalId: body.terminalId || 'Station POS-01',
        customerId: body.customerId,
        customerName: body.customerName,
        items: body.items,
        paymentMethod: body.paymentMethod,
        amountReceived: body.amountReceived,
        changeReturned: body.changeReturned || 0,
        totalHT: body.totalHT,
        discountTotal: body.discountTotal || 0,
        totalTVA: body.totalTVA,
        totalTTC: body.totalTTC,
        paymentRef: body.paymentRef,
      },
    });

    // If proforma was converted, update its status
    if (body.proformaId) {
      await prisma.proforma.update({
        where: { id: body.proformaId },
        data: { status: 'CONVERTED' },
      }).catch(() => {});
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}


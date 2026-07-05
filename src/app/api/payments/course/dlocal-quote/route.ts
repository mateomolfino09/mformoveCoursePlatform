import { NextRequest, NextResponse } from 'next/server';
import { resolveDlocalLocalizedAmount } from '../../../../../lib/dlocalLocalCurrency';
import { resolvePayerCountry } from '../../../../../lib/resolveRequestCountry';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const amount = Number(searchParams.get('amount'));
    const currency = searchParams.get('currency') || 'USD';
    const explicitCountry = searchParams.get('country')?.trim() || undefined;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Monto inválido' }, { status: 400 });
    }

    const payerCountry = resolvePayerCountry(explicitCountry, req);
    const countrySource = explicitCountry ? 'profile' : payerCountry ? 'geo' : null;

    if (!payerCountry) {
      return NextResponse.json(
        {
          amount,
          currency: currency.trim().toUpperCase(),
          countryCode: null,
          localized: false,
          countrySource: null,
        },
        { status: 200, headers: { 'Cache-Control': 'private, max-age=60' } }
      );
    }

    const quote = await resolveDlocalLocalizedAmount({
      amount,
      sourceCurrency: currency,
      country: payerCountry,
    });

    return NextResponse.json(
      { ...quote, countrySource, payerCountry },
      {
        status: 200,
        headers: { 'Cache-Control': 'private, max-age=300' },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al cotizar' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { isDlocalLocalCurrencyCountry } from '../../../../constants/dlocalCountries';
import { resolveCountryFromHeaders } from '../../../../lib/resolveRequestCountry';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const detected = resolveCountryFromHeaders(req);

  if (!detected.countryCode) {
    return NextResponse.json(
      { countryCode: null, countryLabel: null, source: null, supportsDlocalLocal: false },
      {
        status: 200,
        headers: { 'Cache-Control': 'private, max-age=300' },
      }
    );
  }

  return NextResponse.json(
    {
      countryCode: detected.countryCode,
      countryLabel: detected.countryLabel,
      source: detected.source,
      supportsDlocalLocal: isDlocalLocalCurrencyCountry(detected.countryCode),
    },
    {
      status: 200,
      headers: { 'Cache-Control': 'private, max-age=300' },
    }
  );
}

import { NextRequest, NextResponse } from 'next/server';
import InstagramService from '../../../../services/instagram';

export async function GET(request: NextRequest) {
  try {
    const instagramService = InstagramService.getInstance();
    const hasCredentials = instagramService.hasCredentials();

    return NextResponse.json({
      success: true,
      hasCredentials,
      message: hasCredentials 
        ? 'Credenciales de Instagram encontradas' 
        : 'No hay credenciales de Instagram configuradas'
    });

  } catch (error) {
    console.error('Error checking Instagram credentials:', error);
    return NextResponse.json(
      { 
        success: false,
        hasCredentials: false,
        error: 'Error checking Instagram credentials' 
      },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the analytics event
    console.log('Mentorship Analytics Event:', body);
    
    // Here you can:
    // 1. Save to database
    // 2. Send to external analytics service
    // 3. Process for conversion tracking
    // 4. Send notifications for high-value events
    
    // For now, we'll just log and return success
    // In production, you might want to save to MongoDB or send to a service like Mixpanel
    
    return NextResponse.json({ 
      success: true, 
      message: 'Analytics event recorded',
      event: body.event 
    });
    
  } catch (error) {
    console.error('Error processing mentorship analytics:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 
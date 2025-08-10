import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    // Aquí normalmente intercambiarías el código por un access token
    // Por ahora, devolvemos información sobre cómo obtener las credenciales
    return NextResponse.json({
      success: true,
      message: 'Para obtener tus credenciales de Instagram:',
      instructions: [
        '1. Ve a https://developers.facebook.com/',
        '2. Crea una nueva app o usa una existente',
        '3. Agrega el producto "Instagram Basic Display"',
        '4. Configura la autenticación OAuth',
        '5. Obtén el Access Token y User ID',
        '6. Usa esas credenciales en el formulario'
      ],
      note: 'Por seguridad, debes obtener las credenciales manualmente desde Meta for Developers'
    });

  } catch (error) {
    console.error('Error in Instagram auth:', error);
    return NextResponse.json(
      { error: 'Error processing Instagram authentication' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, userId } = body;

    if (!accessToken || !userId) {
      return NextResponse.json(
        { error: 'Access token and user ID are required' },
        { status: 400 }
      );
    }

    // Validar el token (esto es una validación básica)
    const validationResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
    );

    if (!validationResponse.ok) {
      return NextResponse.json(
        { error: 'Invalid Instagram access token' },
        { status: 400 }
      );
    }

    const userData = await validationResponse.json();

    return NextResponse.json({
      success: true,
      message: 'Instagram credentials validated successfully',
      user: {
        id: userData.id,
        username: userData.username
      }
    });

  } catch (error) {
    console.error('Error validating Instagram credentials:', error);
    return NextResponse.json(
      { error: 'Error validating Instagram credentials' },
      { status: 500 }
    );
  }
} 
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import User from '../../../../models/userModel';
import Product from '../../../../models/productModel';
import { resolveInvitacionGrupoWhatsappFromProduct } from '../../../../lib/resolveInvitacionGrupoWhatsapp';
import { formatTitleCaseWords } from '../../../../lib/formatDisplayTitle';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await connectDB();

    const userToken = cookies().get('userToken')?.value;
    if (!userToken) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    const data = verify(userToken, process.env.NEXTAUTH_SECRET as string) as {
      userId?: string;
      _id?: string;
    };

    const user = await User.findById(data.userId || data._id)
      .select('cursosAdquiridos')
      .populate({
        path: 'cursosAdquiridos.productoId',
        model: Product,
        select: 'nombre descripcion tipo cursoConfig.slug cursoConfig.whatsapp imagenes portada invitacionGrupoWhatsapp grupoWhatsapp',
      })
      .lean();

    if (!user) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    const cursos = (user.cursosAdquiridos || [])
      .filter((entry: any) => entry?.productoId)
      .map((entry: any) => {
        const producto = entry.productoId;
        const slug = producto?.cursoConfig?.slug || '';

        return {
          productoId: producto?._id?.toString(),
          nombre: formatTitleCaseWords(producto?.nombre || 'Curso'),
          descripcion: producto?.descripcion || '',
          slug,
          ruta: slug ? `/${slug}` : null,
          rutaContenido: slug ? `/${slug}/contenido` : null,
          invitacionGrupoWhatsapp: resolveInvitacionGrupoWhatsappFromProduct(producto) || null,
          imagen: producto?.portada || producto?.imagenes?.[0] || null,
          fechaCompra: entry.fechaCompra,
          metodoPago: entry.metodoPago,
          monto: entry.monto,
          moneda: entry.moneda,
        };
      });

    return NextResponse.json({ cursos }, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
  }
}

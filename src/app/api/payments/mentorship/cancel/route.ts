import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import User from '../../../../../models/userModel';
import { resolveAuthUserIdFromCookies } from '../../../../../lib/resolveAuthUserIdFromCookies';
import { cancelStripeSubscription } from '../../cancelSubscription/cancelStripeSubscription';
import { canCancelMentorshipStripe } from '../../../../../lib/mentorshipUser';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const userId = resolveAuthUserIdFromCookies();
    if (!userId) {
      return NextResponse.json({ error: 'Iniciá sesión para continuar' }, { status: 401 });
    }

    const user = await User.findById(userId);
    if (!user?.mentorship) {
      return NextResponse.json({ error: 'No tenés mentoría registrada' }, { status: 404 });
    }

    if (!canCancelMentorshipStripe(user.mentorship)) {
      return NextResponse.json(
        {
          error:
            user.mentorship.provider === 'dlocalgo'
              ? 'La mentoría con dLocal se renueva pagando cada ciclo. Para dejar de continuar, simplemente no renueves el próximo pago o escribinos.'
              : 'Esta mentoría no se puede cancelar automáticamente desde acá. Contactá soporte.',
        },
        { status: 400 },
      );
    }

    const subscriptionId = user.mentorship.subscriptionId as string;
    await cancelStripeSubscription(subscriptionId);

    user.mentorship.status = 'cancel_at_period_end';
    await user.save();

    return NextResponse.json({
      success: true,
      message:
        'Tu mentoría seguirá activa hasta el fin del período actual. Después no se renovará automáticamente.',
      mentorship: user.mentorship,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo cancelar la mentoría';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import Plan from '../../../../models/planModel';
import MentorshipPlan from '../../../../models/mentorshipPlanModel';
import { revalidateTag } from 'next/cache';

// Conectar a la base de datos
connectDB();
export const revalidate = 0;
export const fetchCache = 'force-no-store'
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const planType = searchParams.get('type') || 'membership';
    const planId = searchParams.get('id');
    const getAll = searchParams.get('all') === 'true'; // Para admin: obtener todos los planes
    
    let plans;
    
    if (planType === 'mentorship') {
      if (planId) {
        // Si se proporciona un ID específico, buscar ese plan
        plans = await MentorshipPlan.findById(planId);
        plans = plans ? [plans] : [];
      } else if (getAll) {
        // Si se solicita todos (para admin), obtener todos los planes ordenados por fecha de creación
        plans = await MentorshipPlan.find({}).sort({ createdAt: -1 });
      } else {
        // Si no hay ID y no es admin, obtener solo el plan activo más reciente (el último creado)
        const activePlan = await MentorshipPlan.findOne({ active: true }).sort({ createdAt: -1 });
        plans = activePlan ? [activePlan] : [];
      }
    } else {
      if (planId) {
        // Si se proporciona un ID específico, buscar ese plan
        plans = await Plan.findById(planId);
        plans = plans ? [plans] : [];
      } else {
        // Si no hay ID, obtener todos los planes activos
        plans = await Plan.find({ active: true });
      }
    }
    
    revalidateTag('plans');
    return NextResponse.json(plans, {
        status: 200,
        headers: { 
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'x-vercel-cache': 'miss'  // Forzar a Vercel a evitar el caché
        },
      });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching plans' }, { status: 500 });
  }
}

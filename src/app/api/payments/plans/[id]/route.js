import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import Plan from '../../../../../models/planModel';
import MentorshipPlan from '../../../../../models/mentorshipPlanModel';

export async function DELETE(
  request,
  { params }
) {
  try {
    await connectDB();
    
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const planType = searchParams.get('type') || 'membership';
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID del plan requerido' },
        { status: 400 }
      );
    }
    
    const PlanModel = planType === 'mentorship' ? MentorshipPlan : Plan;
    const deletedPlan = await PlanModel.findByIdAndDelete(id);
    
    if (!deletedPlan) {
      return NextResponse.json(
        { success: false, message: 'Plan no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Plan eliminado exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json(
      { success: false, message: 'Error al eliminar el plan' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request,
  { params }
) {
  try {
    await connectDB();
    
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const planType = searchParams.get('type') || 'membership';
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID del plan requerido' },
        { status: 400 }
      );
    }
    
    const PlanModel = planType === 'mentorship' ? MentorshipPlan : Plan;
    const updatedPlan = await PlanModel.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!updatedPlan) {
      return NextResponse.json(
        { success: false, message: 'Plan no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Plan actualizado exitosamente', plan: updatedPlan },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json(
      { success: false, message: 'Error al actualizar el plan' },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import VirtualClass from '../../../../../models/virtualClassModel';
import Users from '../../../../../models/userModel';

connectDB();

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const {
      name,
      description,
      instructor,
      platform,
      meetingLink,
      schedules,
      duration,
      capacity,
      level,
      classType,
      prices,
      additionalPrices,
      image_url,
      userEmail,
      active
    } = await req.json();

    // Verificar que el usuario existe y es admin
    const user = await Users.findOne({ email: userEmail });

    if (!user || user.rol !== 'Admin') {
      return NextResponse.json(
        { error: 'Este usuario no tiene permisos para actualizar grupos de clases virtuales' },
        { status: 422 }
      );
    }

    // Buscar la clase
    const existingClass = await VirtualClass.findOne({ id: parseInt(id) });

    if (!existingClass) {
      return NextResponse.json(
        { error: 'Grupo de clases virtuales no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar campos si se proporcionan
    if (name) existingClass.name = name;
    if (description) existingClass.description = description;
    if (instructor) existingClass.instructor = instructor;
    if (platform) existingClass.platform = platform;
    if (meetingLink) existingClass.meetingLink = meetingLink;
    if (duration) existingClass.duration = duration;
    if (capacity !== undefined) existingClass.capacity = capacity;
    if (level) existingClass.level = level;
    if (classType) existingClass.classType = classType;
    if (image_url) existingClass.image_url = image_url;
    if (active !== undefined) existingClass.active = active;

    if (schedules && Array.isArray(schedules) && schedules.length > 0) {
      existingClass.schedules = schedules.map(schedule => ({
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        timezone: schedule.timezone || 'America/Montevideo'
      }));
    }

    if (prices) {
      if (prices.oncePerWeek) {
        existingClass.prices.oncePerWeek = {
          amount: prices.oncePerWeek.amount !== undefined ? prices.oncePerWeek.amount : existingClass.prices.oncePerWeek.amount,
          currency: prices.oncePerWeek.currency || existingClass.prices.oncePerWeek.currency
        };
      }
      if (prices.twicePerWeek) {
        existingClass.prices.twicePerWeek = {
          amount: prices.twicePerWeek.amount !== undefined ? prices.twicePerWeek.amount : existingClass.prices.twicePerWeek.amount,
          currency: prices.twicePerWeek.currency || existingClass.prices.twicePerWeek.currency
        };
      }
      if (prices.threeTimesPerWeek) {
        existingClass.prices.threeTimesPerWeek = {
          amount: prices.threeTimesPerWeek.amount !== undefined ? prices.threeTimesPerWeek.amount : existingClass.prices.threeTimesPerWeek.amount,
          currency: prices.threeTimesPerWeek.currency || existingClass.prices.threeTimesPerWeek.currency
        };
      }
    }
    
    if (additionalPrices) {
      const sanitizedAdditionalPrices = Array.isArray(additionalPrices)
        ? additionalPrices
            .filter(price => price?.label && price.label.trim() !== '' && price?.amount !== undefined)
            .map(price => ({
              label: price.label.trim(),
              amount: Number(price.amount) || 0,
              currency: price.currency || 'UYU'
            }))
        : [];
      existingClass.additionalPrices = sanitizedAdditionalPrices;
    }

    existingClass.updatedAt = new Date();

    await existingClass.save();

    return NextResponse.json(
      { message: 'Grupo de clases virtuales actualizado con éxito', class: existingClass },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating virtual class:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar el grupo de clases virtuales' },
      { status: 500 }
    );
  }
}


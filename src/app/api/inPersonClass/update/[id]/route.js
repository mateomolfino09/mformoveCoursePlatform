import { NextResponse } from 'next/server';
import connectDB from '../../../../../config/connectDB';
import InPersonClass from '../../../../../models/inPersonClassModel';
import Users from '../../../../../models/userModel';

connectDB();

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const {
      name,
      description,
      instructor,
      location,
      schedules,
      duration,
      capacity,
      level,
      classType,
      price,
      frequencyPrices,
      additionalPrices,
      image_url,
      userEmail,
      active
    } = await req.json();

    // Verificar que el usuario existe y es admin
    const user = await Users.findOne({ email: userEmail });

    if (!user || user.rol !== 'Admin') {
      return NextResponse.json(
        { error: 'Este usuario no tiene permisos para actualizar clases presenciales' },
        { status: 422 }
      );
    }

    // Buscar la clase
    const existingClass = await InPersonClass.findOne({ id: parseInt(id) });

    if (!existingClass) {
      return NextResponse.json(
        { error: 'Clase presencial no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar campos si se proporcionan
    if (name) existingClass.name = name;
    if (description) existingClass.description = description;
    if (instructor) existingClass.instructor = instructor;
    if (duration) existingClass.duration = duration;
    if (capacity !== undefined) existingClass.capacity = capacity;
    if (level) existingClass.level = level;
    if (classType) existingClass.classType = classType;
    if (image_url) existingClass.image_url = image_url;
    if (active !== undefined) existingClass.active = active;

    if (location) {
      // Actualizar campo a campo para evitar setear coordinates como undefined implícitamente
      if (location.name) existingClass.location.name = location.name;
      if (location.address) existingClass.location.address = location.address;
      if (location.city) existingClass.location.city = location.city;
      if (location.country) existingClass.location.country = location.country;
      if ('coordinates' in location) {
        if (location.coordinates && typeof location.coordinates === 'object' && location.coordinates !== null) {
          existingClass.location.coordinates = location.coordinates;
        } else {
          // Si explícitamente nos mandan coordinates vacío/null/undefined, lo removemos
          if (existingClass.location?.coordinates !== undefined) {
            existingClass.location.set
              ? existingClass.location.set('coordinates', undefined, { strict: false })
              : (existingClass.location.coordinates = undefined);
          }
        }
      }
    }

    if (schedules && Array.isArray(schedules) && schedules.length > 0) {
      existingClass.schedules = schedules.map(schedule => ({
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        timezone: schedule.timezone || 'America/Montevideo'
      }));
    }

    if (price) {
      existingClass.price = {
        amount: price.amount !== undefined ? price.amount : existingClass.price.amount,
        currency: price.currency || existingClass.price.currency,
        type: price.type || existingClass.price.type
      };
    }

    if (frequencyPrices) {
      existingClass.frequencyPrices = {
        oncePerWeek: {
          amount: frequencyPrices.oncePerWeek?.amount !== undefined ? frequencyPrices.oncePerWeek.amount : existingClass.frequencyPrices?.oncePerWeek?.amount || 0,
          currency: frequencyPrices.oncePerWeek?.currency || existingClass.frequencyPrices?.oncePerWeek?.currency || 'UYU'
        },
        twicePerWeek: {
          amount: frequencyPrices.twicePerWeek?.amount !== undefined ? frequencyPrices.twicePerWeek.amount : existingClass.frequencyPrices?.twicePerWeek?.amount || 0,
          currency: frequencyPrices.twicePerWeek?.currency || existingClass.frequencyPrices?.twicePerWeek?.currency || 'UYU'
        },
        threeTimesPerWeek: {
          amount: frequencyPrices.threeTimesPerWeek?.amount !== undefined ? frequencyPrices.threeTimesPerWeek.amount : existingClass.frequencyPrices?.threeTimesPerWeek?.amount || 0,
          currency: frequencyPrices.threeTimesPerWeek?.currency || existingClass.frequencyPrices?.threeTimesPerWeek?.currency || 'UYU'
        }
      };
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
      { message: 'Clase presencial actualizada con éxito', class: existingClass },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating in-person class:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar la clase presencial' },
      { status: 500 }
    );
  }
}


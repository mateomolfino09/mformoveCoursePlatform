import { NextResponse } from 'next/server';
import connectDB from '../../../../config/connectDB';
import VirtualClass from '../../../../models/virtualClassModel';
import Users from '../../../../models/userModel';

connectDB();

export async function POST(req) {
  try {
    if (req.method === 'POST') {
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
        classType = 'comun',
        prices,
        additionalPrices = [],
        image_url,
        userEmail,
        active = true
      } = await req.json();

      // Verificar que el usuario existe y es admin
      const user = await Users.findOne({ email: userEmail });

      if (!user || user.rol !== 'Admin') {
        return NextResponse.json(
          { error: 'Este usuario no tiene permisos para crear clases virtuales' },
          { status: 422 }
        );
      }

      // Verificar validaciones básicas
      if (!name || !description || !instructor || !platform || !meetingLink || !schedules || !duration || !level || !classType) {
        return NextResponse.json(
          { error: 'Faltan campos requeridos' },
          { status: 400 }
        );
      }

      // Validar que schedules sea un array y tenga al menos un elemento
      if (!Array.isArray(schedules) || schedules.length === 0) {
        return NextResponse.json(
          { error: 'Debe haber al menos un horario' },
          { status: 400 }
        );
      }

      // Validar formato de horarios
      for (const schedule of schedules) {
        if (!schedule.dayOfWeek || !schedule.startTime || !schedule.endTime) {
          return NextResponse.json(
            { error: 'Cada horario debe tener día, hora de inicio y hora de fin' },
            { status: 400 }
          );
        }
      }

      // Validar precios
      if (!prices || !prices.oncePerWeek || !prices.twicePerWeek || !prices.threeTimesPerWeek) {
        return NextResponse.json(
          { error: 'Deben definirse los tres precios (1, 2 y 3 veces por semana)' },
          { status: 400 }
        );
      }

      // Obtener el último ID para generar el siguiente
      const lastClass = await VirtualClass.find().sort({ id: -1 }).limit(1);
      const nextId = lastClass.length > 0 ? lastClass[0].id + 1 : 1;

      const sanitizedAdditionalPrices = Array.isArray(additionalPrices)
        ? additionalPrices
            .filter(price => price?.label && price.label.trim() !== '' && price?.amount !== undefined)
            .map(price => ({
              label: price.label.trim(),
              amount: Number(price.amount) || 0,
              currency: price.currency || 'UYU'
            }))
        : [];

      // Crear la nueva clase virtual
      const newClass = await new VirtualClass({
        id: nextId,
        name,
        description,
        instructor,
        platform,
        meetingLink,
        schedules: schedules.map(schedule => ({
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          timezone: schedule.timezone || 'America/Montevideo'
        })),
        duration,
        capacity: capacity || null,
        currentEnrollments: 0,
        level,
        classType: classType || 'comun',
        prices: {
          oncePerWeek: {
            amount: prices.oncePerWeek.amount || 0,
            currency: prices.oncePerWeek.currency || 'UYU'
          },
          twicePerWeek: {
            amount: prices.twicePerWeek.amount || 0,
            currency: prices.twicePerWeek.currency || 'UYU'
          },
          threeTimesPerWeek: {
            amount: prices.threeTimesPerWeek.amount || 0,
            currency: prices.threeTimesPerWeek.currency || 'UYU'
          }
        },
        additionalPrices: sanitizedAdditionalPrices,
        image_url,
        active
      }).save();

      return NextResponse.json(
        { message: 'Clase virtual creada con éxito', class: newClass },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error creating virtual class:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear la clase virtual' },
      { status: 500 }
    );
  }
}


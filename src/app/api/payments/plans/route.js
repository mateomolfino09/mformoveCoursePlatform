
import Plan from '../../../../models/planModel';

import connectDB from '../../../../config/connectDB';

connectDB();

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Cambia "handler" por "GET" para manejar solicitudes GET
export async function GET(req) {
  try {
    const plans = await Plan.find({});
    return new Response(JSON.stringify(plans), { status: 200 });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return new Response(JSON.stringify({ message: 'Error fetching plans' }), { status: 500 });
  }
}

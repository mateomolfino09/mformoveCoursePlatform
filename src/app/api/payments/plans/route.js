
import Plan from '../../../../models/planModel';
import connectDB from '../../../../config/connectDB';

connectDB();

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(req) {
  try {
    const plans = await Plan.find({});
    return new Response(JSON.stringify(plans), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return new Response(JSON.stringify({ message: 'Error fetching plans' }), { status: 500 });
  }
}

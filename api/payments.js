import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get all payments
        const { data: payments, error: getError } = await supabase
          .from('payments')
          .select('*')
          .order('created_at', { ascending: false });

        if (getError) throw getError;
        return res.status(200).json(payments);

      case 'POST':
        // Create new payment
        const { data: newPayment, error: postError } = await supabase
          .from('payments')
          .insert([req.body])
          .select();

        if (postError) throw postError;
        return res.status(201).json(newPayment[0]);

      case 'PUT':
        // Update payment
        const { id, ...updateData } = req.body;
        const { data: updatedPayment, error: putError } = await supabase
          .from('payments')
          .update(updateData)
          .eq('id', id)
          .select();

        if (putError) throw putError;
        return res.status(200).json(updatedPayment[0]);

      case 'DELETE':
        // Delete payment
        const { data: deletedPayment, error: deleteError } = await supabase
          .from('payments')
          .delete()
          .eq('id', req.query.id)
          .select();

        if (deleteError) throw deleteError;
        return res.status(200).json(deletedPayment[0]);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

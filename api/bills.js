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
        // Get all bills
        const { data: bills, error: getError } = await supabase
          .from('bills')
          .select('*')
          .order('created_at', { ascending: false });

        if (getError) throw getError;
        return res.status(200).json(bills);

      case 'POST':
        // Create new bill
        const { data: newBill, error: postError } = await supabase
          .from('bills')
          .insert([req.body])
          .select();

        if (postError) throw postError;
        return res.status(201).json(newBill[0]);

      case 'PUT':
        // Update bill
        const { id, ...updateData } = req.body;
        const { data: updatedBill, error: putError } = await supabase
          .from('bills')
          .update(updateData)
          .eq('id', id)
          .select();

        if (putError) throw putError;
        return res.status(200).json(updatedBill[0]);

      case 'DELETE':
        // Delete bill
        const { data: deletedBill, error: deleteError } = await supabase
          .from('bills')
          .delete()
          .eq('id', req.query.id)
          .select();

        if (deleteError) throw deleteError;
        return res.status(200).json(deletedBill[0]);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

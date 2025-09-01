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
        // Get all customers
        const { data: customers, error: getError } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false });

        if (getError) throw getError;
        return res.status(200).json(customers);

      case 'POST':
        // Create new customer
        const { data: newCustomer, error: postError } = await supabase
          .from('customers')
          .insert([req.body])
          .select();

        if (postError) throw postError;
        return res.status(201).json(newCustomer[0]);

      case 'PUT':
        // Update customer
        const { id, ...updateData } = req.body;
        const { data: updatedCustomer, error: putError } = await supabase
          .from('customers')
          .update(updateData)
          .eq('id', id)
          .select();

        if (putError) throw putError;
        return res.status(200).json(updatedCustomer[0]);

      case 'DELETE':
        // Delete customer
        const { data: deletedCustomer, error: deleteError } = await supabase
          .from('customers')
          .delete()
          .eq('id', req.query.id)
          .select();

        if (deleteError) throw deleteError;
        return res.status(200).json(deletedCustomer[0]);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

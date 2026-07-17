import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

// 🚀 SPEED & REFRESH PATCH: Pinilit ang Next.js na i-bypass ang production Vercel caching mechanism para maging fully real-time live polling!
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const ticketId = url.searchParams.get('ticket_id');
    if (!ticketId) return NextResponse.json({ error: 'ticket_id is required' }, { status: 400 });

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('ticket_comments')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ comments: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticket_id, sender, message } = body || {};
    if (!ticket_id || !sender || !message) return NextResponse.json({ error: 'ticket_id, sender and message are required' }, { status: 400 });
    if (!['Admin', 'User'].includes(sender)) return NextResponse.json({ error: 'sender must be Admin or User' }, { status: 400 });

    // Tinanggal ang admin authorization block para payagan ang mabilisang live broadcasting
    const supabase = getSupabaseClient();
    const payload = { ticket_id, sender, message };
    const { data, error } = await supabase.from('ticket_comments').insert(payload).select().single();
    
    if (error) {
      if (error.message && error.message.toLowerCase().includes('could not find') && error.message.toLowerCase().includes('ticket_comments')) {
        return NextResponse.json({ error: 'Database table `ticket_comments` not found.' }, { status: 500 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, comment: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
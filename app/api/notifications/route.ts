import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    // 1. 📋 Kumuha ng mga tickets na bagong gawa (Registered) nang WALANG is_read query para iwas-error!
    const { data: rawTickets, error: ticketError } = await supabase
      .from('tickets')
      .select('id, ticket_number, requestor_name, created_at, status')
      .eq('status', 'Registered')
      .order('created_at', { ascending: false })
      .limit(15);

    if (ticketError) throw ticketError;

    // 2. 💬 Kumuha ng huling 15 chat responses mula sa mga users
    const { data: rawComments, error: commentError } = await supabase
      .from('ticket_comments')
      .select(`
        id,
        ticket_id,
        message,
        created_at,
        tickets (
          ticket_number,
          requestor_name
        )
      `)
      .eq('sender', 'User')
      .order('created_at', { ascending: false })
      .limit(15);

    if (commentError) throw commentError;

    // 3. ⏳ TIME-BASED RADAR FILTER ENGINE (Huling 24 oras para sa notification activity rules)
    const activeTimeThreshold = 24 * 60 * 60 * 1000; // 24 Hours in Milliseconds

    const formattedTicketNotifs = (rawTickets || [])
      .filter(t => (Date.now() - new Date(t.created_at).getTime()) < activeTimeThreshold)
      .map((t: any) => ({
        id: t.id,
        ticket_id: t.id,
        ticket_number: t.ticket_number || 'MGSAP-XXXXXX',
        requestor_name: t.requestor_name || 'User',
        message: `Nag-create ng bagong ticket si ${t.requestor_name || 'User'}`,
        created_at: t.created_at,
        type: 'TICKET'
      }));

    const formattedCommentNotifs = (rawComments || [])
      .filter(c => (Date.now() - new Date(c.created_at).getTime()) < activeTimeThreshold)
      .map((c: any) => ({
        id: c.id,
        ticket_id: c.ticket_id,
        ticket_number: c.tickets?.ticket_number || 'MGSAP-XXXXXX',
        requestor_name: c.tickets?.requestor_name || 'User',
        message: `Nagresponse si ${c.tickets?.requestor_name || 'User'} sa ticket na ${c.tickets?.ticket_number}`,
        created_at: c.created_at,
        type: 'COMMENT'
      }));

    // Pagsamahin sa isang array at i-sort ayon sa petsa
    const allNotifications = [...formattedTicketNotifs, ...formattedCommentNotifs].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({ notifications: allNotifications });
  } catch (err) {
    console.error("ITSM Notification Error Ledger Logging Exception:", err);
    return NextResponse.json({ error: 'Failed to aggregate control console notifications' }, { status: 500 });
  }
}

// Ligtas na empty PATCH action para hindi sumabog ang client application upon trigger routing
export async function PATCH() {
  return NextResponse.json({ success: true });
}
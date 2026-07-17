import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import nodemailer from 'nodemailer';

// 🚀 PINILIT ANG NEXT.JS NA I-FORCE DYNAMIC ANG ROUTE PARA IWASAN ANG SERVER CACHE ENGINES
export const dynamic = 'force-dynamic';

const statusOptions = ['Registered', 'Assigned', 'Work in Progress', 'Completed', 'Closed'];
const storageBucket = 'ticket-attachments';

async function sendEmailNotification(ticket: Record<string, unknown>) {
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT || 587);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const from = process.env.EMAIL_FROM;

  if (!host || !user || !pass || !from) {
    console.warn('⚠️ Email layout skip: SMTP parameters are incomplete.');
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });

    const mailOptions = {
      from,
      to: ticket.requestor_email as string,
      subject: `Ticket Created: ${ticket.ticket_number}`,
      text: `Hello ${ticket.requestor_name},\n\nYour ticket ${ticket.ticket_number} has been successfully registered.\n\nShort Description: ${ticket.short_description}\nStatus: ${ticket.status}\n`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.5"><h2>Ticket Created</h2><p>Hello ${ticket.requestor_name},</p><p>Your ticket <strong>${ticket.ticket_number}</strong> has been successfully registered.</p><p><strong>Short Description:</strong> ${ticket.short_description}</p><p><strong>Status:</strong> ${ticket.status}</p></div>`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✉️ Background registration email successfully dispatched for ${ticket.ticket_number}`);
  } catch (err) {
    console.error(`❌ Background Email Error for ${ticket.ticket_number}:`, err);
  }
}

function isAuthorized(request: Request) {
  const token = request.headers.get('x-admin-token');
  if (!token) return true;

  const expectedToken = Buffer.from(`${process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin'}:${process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'Admin@123'}`).toString('base64');
  return token === expectedToken;
}

export async function GET(request: Request) {
    try {
      const url = new URL(request.url);
      const id = url.searchParams.get('id');
      const ticketNumber = url.searchParams.get('ticket_number');
      const supabase = getSupabaseClient();

      if (ticketNumber) {
        const { data, error } = await supabase.from('tickets').select('*, attachment_url, attachments').eq('ticket_number', ticketNumber).single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ ticket: data });
      }

      if (!isAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (id) {
        const { data, error } = await supabase.from('tickets').select('*, attachment_url, attachments').eq('id', id).single();
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ ticket: data });
      }

      const { data, error } = await supabase.from('tickets').select('*, attachment_url, attachments').order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ tickets: data });
    } catch (err) {
      console.error('GET /api/tickets error:', err);
      const message = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: message }, { status: 500 });
    }
}

async function sendStatusUpdateNotification(ticket: Record<string, unknown>, resolutionNotes?: string) {
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT || 587);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const from = process.env.EMAIL_FROM;

  if (!host || !user || !pass || !from) return;

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });

    let resolutionSectionHtml = '';
    if (ticket.status === 'Completed' && resolutionNotes) {
      resolutionSectionHtml = `
        <div style="background-color: #f1f5f9; border-left: 4px solid #059669; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <strong style="color: #0f172a; display: block; margin-bottom: 6px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">Resolution Details & Notes:</strong>
          <p style="margin: 0; font-family: monospace; font-size: 12px; color: #334155; white-space: pre-wrap; line-height: 1.5;">${resolutionNotes}</p>
        </div>
      `;
    }

    const mailOptions = {
      from,
      to: ticket.requestor_email as string,
      subject: `Ticket Update: ${ticket.ticket_number}`,
      text: `Hello ${ticket.requestor_name},\n\nYour ticket ${ticket.ticket_number} status has changed to: ${ticket.status}\n\nShort Description: ${ticket.short_description}\n${resolutionNotes ? `\nResolution Notes:\n${resolutionNotes}` : ''}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #e2e8f0; padding: 20px; border-radius: 6px; background-color: #fcfcf9; color: #334155; line-height: 1.5;">
          <div style="text-align: center; border-bottom: 4px solid #800000; padding-bottom: 12px; margin-bottom: 20px;">
            <h2 style="color: #800000; margin: 0; text-transform: uppercase; font-size: 18px; letter-spacing: 1px;">Mary Grace IT Support Desk</h2>
            <span style="font-size: 9px; color: #64748b; font-weight: bold; tracking: 0.1em;">ITSM RESOLUTION NOTICE</span>
          </div>
          <p>Hello <strong>${ticket.requestor_name}</strong>,</p>
          <p>Your ticket <strong>${ticket.ticket_number}</strong> status has changed to <strong>${ticket.status}</strong>.</p>
          <p><strong>Short Description:</strong> ${ticket.short_description}</p>
          
          ${resolutionSectionHtml}
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
          <p style="font-size: 10px; color: #94a3b8; text-align: center; margin: 0; font-weight: 500;">
            This is a system-generated transmission. Please do not reply directly to this mailer.<br/>
            © 2026 Mary Grace Café ITSM Control Console Platform.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✉️ Background update email successfully dispatched for ${ticket.ticket_number}`);
  } catch (err) {
    console.error(`❌ Background Update Email Error for ${ticket.ticket_number}:`, err);
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const department = formData.get('department')?.toString().trim() || null;
    
    const attachmentsData = formData.getAll('attachments') as File[];
    let uploadedUrls: string[] = [];

    const supabase = getSupabaseClient();

    for (const attachment of attachmentsData) {
      if (attachment && attachment.name && attachment.size > 0) {
        const fileData = Buffer.from(await attachment.arrayBuffer());
        const safeName = `${Date.now()}_${attachment.name.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
        
        const { error: storageError } = await supabase.storage.from(storageBucket).upload(safeName, fileData, {
          cacheControl: '3600',
          contentType: attachment.type || 'application/octet-stream',
          upsert: true,
        });

        if (storageError) {
          throw new Error(`Attachment upload failed: ${storageError.message}`);
        }

        const { data: urlData } = supabase.storage.from(storageBucket).getPublicUrl(safeName);
        if (urlData?.publicUrl) {
          uploadedUrls.push(urlData.publicUrl);
        }
      }
    }

    // 🎯 INTEGRATION LAYER: Bibilangin ang eksaktong bilang ng rows na nasa database
    const { count, error: countError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // Formatin ang bilang para sa perpektong sunod-sunod na pagkakasunod
    const nextTicketCountNumber = (count || 0) + 1;
    const formattedTicketNumber = `MGSAP-${String(nextTicketCountNumber).padStart(7, '0')}`;

    const payload = {
      ticket_number: formattedTicketNumber, // Dynamic structural sequential ticket assignment
      requestor_name: formData.get('requestor_name')?.toString().trim() || null,
      requestor_email: formData.get('requestor_email')?.toString().trim() || null,
      requestor_t_number: formData.get('requestor_t_number')?.toString().trim() || null,
      requestor_user_id: formData.get('requestor_user_id')?.toString().trim() || null,
      contact_type: formData.get('contact_type')?.toString() || null,
      priority: formData.get('priority')?.toString() || null,
      location: department,
      short_description: formData.get('short_description')?.toString().trim() || null,
      description: formData.get('description')?.toString().trim() || null,
      attachment_url: uploadedUrls.length > 0 ? uploadedUrls[0] : null,
      attachments: uploadedUrls.length > 0 ? uploadedUrls : null,
      status: 'Registered',
    };

    const { data, error } = await supabase.from('tickets').insert(payload).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 🚀 AUTOMATED INITIAL LOG: Pagsilang ng ticket, nagpapakita agad ng italicized tracking entry
    await supabase.from('ticket_comments').insert({
      ticket_id: data.id,
      sender: 'Admin',
      message: `[SYSTEM LOG]: Ticket state initialized to "Registered".`
    });

    sendEmailNotification({ ...data });

    return NextResponse.json({ success: true, ticket: data, emailError: null });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Invalid ticket update request.' }, { status: 400 });
    }

    // Tinitiyak kung ang request ay galing sa re-open command event tracker
    const isUserReopen = body.status === 'Work in Progress';

    if (!isUserReopen && !isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    // 🕵️ AUDIT LOG PREPARATION: Kunin ang dating estado at assignee ng ticket para sa history comparison log tracker
    const { data: oldTicket } = await supabase
      .from('tickets')
      .select('status, assigned_to')
      .eq('id', body.id)
      .single();

    const updatePayload: Record<string, any> = {};
    
    if (body.status && statusOptions.includes(body.status)) {
      updatePayload.status = body.status;
    }
    
    if (body.hasOwnProperty('assigned_to')) {
      updatePayload.assigned_to = body.assigned_to;
    }
    
    const { data, error } = await supabase
      .from('tickets')
      .update(updatePayload)
      .eq('id', body.id)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (data) {
      const activeAssignee = data.assigned_to || 'Unassigned Support';

      // 🎯 CASE 1: Kapag ni-reopen ang ticket galing sa Completed status
      if (body.is_reopen) {
        const initiator = body.reopened_by || 'System'; // 🚀 KINUHA ANG SAKTONG SENDER IDENTITY LOG HERE
        await supabase.from('ticket_comments').insert({
          ticket_id: data.id,
          sender: 'Admin',
          message: `[SYSTEM LOG]: Ticket has been successfully re-opened by ${initiator}. Current progress state reverted from "Completed" back to "Work in Progress".`
        });
      }
      
      // 🎯 CASE 2: Kapag "Completed" na ang ticket at may dalang resolution notes si Tech
      else if (body.status === 'Completed' && body.resolution_notes) {
        const structuralResolutionLog =
          `[RESOLUTION NOTICE BY ${activeAssignee.toUpperCase()}]:\n` +
          `----------------------------------------\n` +
          `${body.resolution_notes}`;

        // I-insert ang Resolution Notes bilang isang pormal at permanenteng worknote chat message log
        await supabase.from('ticket_comments').insert({
          ticket_id: data.id,
          sender: 'Admin',
          message: structuralResolutionLog
        });

        // Maglagay din ng italicized workflow history log para sa completion transition
        await supabase.from('ticket_comments').insert({
          ticket_id: data.id,
          sender: 'Admin',
          message: `[SYSTEM LOG]: Ticket state resolved to "Completed" by ${activeAssignee}.`
        });
      }
      
      // 🎯 CASE 3: AUTOMATED WORKFLOW HISTORY TRACKER (Para sa iba pang status changes)
      else if (oldTicket && oldTicket.status !== data.status) {
        let historyLogMessage = `[SYSTEM LOG]: Ticket state shifted from "${oldTicket.status}" to "${data.status}".`;
        
        if (data.status === 'Assigned') {
          historyLogMessage = `[SYSTEM LOG]: Ticket state updated to "Assigned" to Operator Lead: ${activeAssignee}.`;
        } else if (data.status === 'Work in Progress') {
          historyLogMessage = `[SYSTEM LOG]: Ticket state set to "Work in Progress" under lead owner: ${activeAssignee}.`;
        } else if (data.status === 'Closed') {
          historyLogMessage = `[SYSTEM LOG]: Ticket data container permanently archived and "Closed".`;
        }

        await supabase.from('ticket_comments').insert({
          ticket_id: data.id,
          sender: 'Admin',
          message: historyLogMessage
        });
      }
      
      // 🎯 CASE 4: Kung operator assignment lang ang nagbago nang hindi binabago ang status
      else if (oldTicket && oldTicket.assigned_to !== data.assigned_to) {
        await supabase.from('ticket_comments').insert({
          ticket_id: data.id,
          sender: 'Admin',
          message: `[SYSTEM LOG]: Operator Lead assignment reassigned to: ${activeAssignee}.`
        });
      }

      // I-trigger ang status updates mailer notification array rules sa background
      if (data.status === 'Completed' || data.status === 'Closed') {
        sendStatusUpdateNotification({
          id: data.id,
          ticket_number: data.ticket_number,
          requestor_name: data.requestor_name,
          requestor_email: data.requestor_email,
          status: data.status,
          short_description: data.short_description,
          priority: data.priority,
          department: data.department || data.location
        }, body.resolution_notes);
      }
    }

    return NextResponse.json({ success: true, ticket: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 });
  }
}
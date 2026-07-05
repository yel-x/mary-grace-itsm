import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import nodemailer from 'nodemailer';

// 🚀 PINILIT ANG NEXT.JS NA I-FORCE DYNAMIC ANG ROUTE PARA IWASAN ANG SERVER CACHE ENGINES
export const dynamic = 'force-dynamic';

// 🚀 FIXED MANIFEST: Isinama na officially ang 'Raised to APPTech' sa server-side options checking array
const statusOptions = ['Registered', 'Assigned', 'Work in Progress', 'Raised to APPTech', 'Completed', 'Closed'];
const storageBucket = 'ticket-attachments';

async function sendEmailNotification(ticket: Record<string, unknown>) {
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT || 587);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const from = process.env.EMAIL_FROM;

  if (!host || !user || !pass || !from) {
    throw new Error('Email is not configured. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS, and EMAIL_FROM.');
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from,
    to: ticket.requestor_email as string,
    subject: `Ticket Created: ${ticket.ticket_number}`,
    text: `Hello ${ticket.requestor_name},\n\nYour ticket ${ticket.ticket_number} has been successfully registered.\n\nShort Description: ${ticket.short_description}\nStatus: ${ticket.status}\n`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.5"><h2>Ticket Created</h2><p>Hello ${ticket.requestor_name},</p><p>Your ticket <strong>${ticket.ticket_number}</strong> has been successfully registered.</p><p><strong>Short Description:</strong> ${ticket.short_description}</p><p><strong>Status:</strong> ${ticket.status}</p></div>`,
  };

  await transporter.sendMail(mailOptions);
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

async function sendStatusUpdateNotification(ticket: Record<string, unknown>) {
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT || 587);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const from = process.env.EMAIL_FROM;

  if (!host || !user || !pass || !from) {
    throw new Error('Email is not configured. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS, and EMAIL_FROM.');
  }

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
    subject: `Ticket Update: ${ticket.ticket_number}`,
    text: `Hello ${ticket.requestor_name},\n\nYour ticket ${ticket.ticket_number} status has changed to: ${ticket.status}\n\nShort Description: ${ticket.short_description}\n`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.5"><h2>Ticket Update</h2><p>Hello ${ticket.requestor_name},</p><p>Your ticket <strong>${ticket.ticket_number}</strong> status has changed to <strong>${ticket.status}</strong>.</p><p><strong>Short Description:</strong> ${ticket.short_description}</p></div>`,
  };

  await transporter.sendMail(mailOptions);
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

    const payload = {
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

    let emailError: string | null = null;
    try {
      await sendEmailNotification({ ...data });
    } catch (emailErr) {
      console.error('Email send failure:', emailErr);
      emailError = emailErr instanceof Error ? emailErr.message : 'Email send failed.';
    }

    return NextResponse.json({ success: true, ticket: data, emailError });
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

    const isUserReopen = body.status === 'Work in Progress';

    if (!isUserReopen && !isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updatePayload: Record<string, any> = {};
    
    if (body.status && statusOptions.includes(body.status)) {
      updatePayload.status = body.status;
    }
    
    if (body.hasOwnProperty('assigned_to')) {
      updatePayload.assigned_to = body.assigned_to;
    }

    const supabase = getSupabaseClient();
    
    // 🚀 FIXED: Ginawang `.maybeSingle()` para maging matatag ang parsing at iwas coercion crashes ang data table hook
    const { data, error } = await supabase
      .from('tickets')
      .update(updatePayload)
      .eq('id', body.id)
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (data && (data.status === 'Completed' || data.status === 'Closed')) {
      try {
        await sendStatusUpdateNotification({
          id: data.id,
          ticket_number: data.ticket_number,
          requestor_name: data.requestor_name,
          requestor_email: data.requestor_email, 
          status: data.status,
          short_description: data.short_description,
          priority: data.priority,
          department: data.department || data.location
        });
        console.log(`🚀 Email alert successfully broadcasted to ${data.requestor_email} for status: ${data.status}`);
      } catch (emailErr) {
        console.error('⚠️ Critical: Status update email alert system failed:', emailErr);
      }
    }

    return NextResponse.json({ success: true, ticket: data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 });
  }
}
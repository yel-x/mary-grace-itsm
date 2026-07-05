'use client';

import { useState, type ChangeEvent } from 'react';

// 🚀 LIVE MARY GRACE IT ENVIRONMENT OPTIONS MAPS
const contactOptions = [
  'User Access / Authorization',
  'Product Master Data (Correction of Details)',
  'Supplier Master Data (Correction of Details)',
  'System Error',
  'Process Inquiry',
  'Others'
];

const priorityOptions = ['Critical', 'High', 'Moderate', 'Low'];

const departmentOptions = [
  'Finance', 'Audit', 'Bakery', 'Commissary', 'R&D', 'Purchasing', 'IT',
  'Engineering SS', 'Engineering MS', 'Visual Display', 'ETW', 'Indirect',
  'Kiosk', 'Admin / PCD', 'CCD', 'Logistics', 'Supply Chain', 
  'Design and Construction', 'Marketing', 'HR', 'ML1', 'ERP Support', 
  'BOH', 'QA/RDT', 'Continuous Improvement'
];

type TicketFormState = {
  requestor_name: string;
  requestor_email: string;
  requestor_t_number: string;
  requestor_user_id: string;
  contact_type: string;
  priority: string;
  department: string;
  short_description: string;
  description: string;
};

const initialState: TicketFormState = {
  requestor_name: '',
  requestor_email: '',
  requestor_t_number: '',
  requestor_user_id: '',
  contact_type: '', // Ginawang blanko para magsimula sa "Choose"
  priority: '',     // Ginawang blanko para magsimula sa "Choose"
  department: '',
  short_description: '',
  description: '',
};

export default function HomePage() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [trackNumberInput, setTrackNumberInput] = useState('');
  const [trackedTicket, setTrackedTicket] = useState<any | null>(null);
  const [trackedComments, setTrackedComments] = useState<Array<{id:string; sender:string; message:string; created_at:string}>>([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleChange = (field: keyof TicketFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    setForm((prev) => ({ ...prev, requestor_t_number: numericValue }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    } else {
      setSelectedFiles([]);
    }
  };

  const validateForm = () => {
    const requiredFields: Array<{ label: string; value: string }> = [
      { label: 'Requestor Name', value: form.requestor_name.trim() },
      { label: 'Requestor Email', value: form.requestor_email.trim() },
      { label: 'Department', value: form.department.trim() },
      { label: 'Type of Concern', value: form.contact_type },
      { label: 'Priority', value: form.priority },
      { label: 'Short Description', value: form.short_description.trim() },
    ];

    const missingField = requiredFields.find((field) => !field.value);
    if (missingField) {
      setError(`Please fill in the ${missingField.label} field.`);
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.requestor_email.trim())) {
      setError('Please enter a valid email address.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('requestor_name', form.requestor_name.trim());
      formData.append('requestor_email', form.requestor_email.trim());
      formData.append('requestor_t_number', form.requestor_t_number.trim());
      formData.append('requestor_user_id', form.requestor_user_id.trim());
      formData.append('contact_type', form.contact_type);
      formData.append('priority', form.priority);
      formData.append('department', form.department.trim());
      formData.append('short_description', form.short_description.trim());
      formData.append('description', form.description.trim());
      
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          formData.append('attachments', file);
        });
      }

      const response = await fetch('/api/tickets', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to create ticket.');

      setTicketNumber(data.ticket.ticket_number);
      setError(data.emailError ? `Ticket created, but email failed: ${data.emailError}` : '');
      setShowModal(true);
      setForm(initialState);
      setSelectedFiles([]); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fcfcf9] p-4 lg:p-6 text-slate-800 font-sans">
      <div className="mx-auto max-w-[1650px] flex flex-col gap-5">
        
        {/* 🍰 HEADER BRANDING: Real Mary Grace Logo and Slogan Setup */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b-4 border-[#800000] pb-3">
          <div className="flex items-center gap-4 w-full justify-between">
            <div className="flex items-center gap-3">
              <img src="/mary-grace-logo.jpeg" alt="Mary Grace Logo" className="w-28 h-24 object-contain rounded-full bg-transparent" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1e3f20]">MARY GRACE • ITSM OPERATIONS PORTAL</span>
                <h1 className="text-xl font-black text-[#800000] tracking-tight">IT Service Management User Portal</h1>
                <p className="text-xs italic text-slate-500">What's <span className="underline font-bold text-[#800000]">SAP</span>? Mary Grace.</p>
              </div>
            </div>
            <a href="/admin" className="rounded border border-[#800000] bg-[#800000] px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#600000] transition">
              Go to Admin Dashboard
            </a>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-3 mt-2">
          {/* USER FORM LAYOUT CONTAINER */}
          <div className="lg:col-span-2 border border-slate-300 bg-white p-5 shadow-sm">
            <div className="border-b pb-2 mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#800000]">User Request Form</h2>
              
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* FIXED RESPONSIVE COLUMN GRID */}
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <label className="block text-xs font-bold text-slate-600">
                  <span>Requestor Name *</span>
                  <input required value={form.requestor_name} onChange={(e) => handleChange('requestor_name', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-slate-800 outline-none text-xs focus:border-[#800000]" />
                </label>
                <label className="block text-xs font-bold text-slate-600">
                  <span>Requestor Email *</span>
                  <input required type="email" value={form.requestor_email} onChange={(e) => handleChange('requestor_email', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-slate-800 outline-none text-xs focus:border-[#800000]" />
                </label>
                <label className="block text-xs font-bold text-slate-600">
                  <span>Phone / Viber Number</span>
                  <input inputMode="numeric" pattern="[0-9]*" value={form.requestor_t_number} onChange={(e) => handlePhoneChange(e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-slate-800 outline-none text-xs focus:border-[#800000]" placeholder="e.g. 09123456789" />
                </label>
                <label className="block text-xs font-bold text-slate-600">
                  <span>User ID</span>
                  <input value={form.requestor_user_id} onChange={(e) => handleChange('requestor_user_id', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-slate-800 outline-none text-xs focus:border-[#800000]" />
                </label>
                <label className="block text-xs font-bold text-slate-600">
                  <span>Type of Concern *</span>
                  <select required value={form.contact_type} onChange={(e) => handleChange('contact_type', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-slate-800 outline-none text-xs font-bold focus:border-[#800000]">
                    <option value="">Choose</option>
                    {contactOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs font-bold text-slate-600">
                  <span>Priority *</span>
                  <select required value={form.priority} onChange={(e) => handleChange('priority', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-slate-800 outline-none text-xs font-bold focus:border-[#800000]">
                    <option value="">Choose</option>
                    {priorityOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4">
                <label className="block text-xs font-bold text-slate-600">
                  <span>Department *</span>
                  <select required value={form.department} onChange={(e) => handleChange('department', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-slate-800 outline-none text-xs font-bold focus:border-[#800000]">
                    <option value="">Choose</option>
                    {departmentOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs font-bold text-slate-600">
                  <span>Short Description *</span>
                  <input required value={form.short_description} onChange={(e) => handleChange('short_description', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-slate-800 outline-none text-xs focus:border-[#800000]" />
                </label>
                <label className="block text-xs font-bold text-slate-600">
                  <span>Screenshots / System Error Attachments (Multiple Allowed)</span>
                  <input type="file" name="attachments" accept="image/*" multiple onChange={handleFileChange} className="mt-1 w-full border border-dashed border-slate-400 bg-slate-50 px-3 py-2 text-xs text-slate-500 file:mr-3 file:rounded file:border-0 file:bg-red-50 file:px-3 file:py-1 file:text-xs file:font-bold file:text-[#800000]" />
                  {selectedFiles.length > 0 && (
                    <div className="mt-2 text-[11px] font-bold text-blue-900">
                      Selected files ({selectedFiles.length}):
                      <ul className="list-disc list-inside mt-1 font-normal text-slate-600 space-y-0.5">
                        {selectedFiles.map((file, idx) => <li key={idx}>{file.name}</li>)}
                      </ul>
                    </div>
                  )}
                </label>
                <label className="block text-xs font-bold text-slate-600">
                  <span>Extended Long Description</span>
                  <textarea rows={4} value={form.description} onChange={(e) => handleChange('description', e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-slate-800 outline-none text-xs focus:border-[#800000]" />
                </label>
              </div>

              {error && <p className="text-xs font-bold text-red-600">{error}</p>}

              <button type="submit" disabled={loading} className="w-full bg-[#800000] rounded py-2 text-xs font-black text-white uppercase tracking-wider shadow-sm hover:bg-[#600000] disabled:opacity-50 transition">
                {loading ? 'Processing Submission...' : 'Submit Incident Ticket'}
              </button>
            </form>
          </div>

          {/* SIDEBAR TRACK PANEL CONTROLS */}
          <div className="flex flex-col gap-4">
            <div className="border border-slate-300 bg-white p-5 shadow-sm flex-1">
              <div className="border-b pb-1.5 mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#800000]">Operational Instructions</h3>
              </div>
              <ul className="text-xs text-slate-600 space-y-3 list-decimal list-inside font-medium">
                <li>Your request will immediately interface with the primary logging server dashboard queue.</li>
                <li>The system will automatically initialize target SLA timers based on response values.</li>
                <li>You can real-time track system updates or reopen closed cases via the interface widget panel below.</li>
              </ul>
            </div>

            {/* TRACK INPUT BOX GRID */}
            <div className="border border-slate-300 bg-white p-5 shadow-sm">
              <div className="border-b pb-1.5 mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#800000]">Track Your Ticket</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Input your unique master asset record tracking number code.</p>
              </div>
              <div className="flex gap-2 mt-2">
                <input value={trackNumberInput} onChange={(e) => setTrackNumberInput(e.target.value)} placeholder="MGSAP-0000001" className="flex-1 rounded border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-[#800000]" />
                <button onClick={async () => {
                  if (!trackNumberInput.trim()) return;
                  try {
                    const res = await fetch(`/api/tickets?ticket_number=${encodeURIComponent(trackNumberInput.trim())}`);
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Unable to fetch ticket');
                    const found = data.ticket;
                    if (!found) {
                      alert('Ticket not found');
                      return;
                    }
                    setTrackedTicket(found);
                    const commentsRes = await fetch(`/api/ticket_comments?ticket_id=${found.id}`);
                    const commentsData = await commentsRes.json();
                    setTrackedComments(commentsData.comments || []);
                    setTrackModalOpen(true);
                  } catch (err) {
                    alert(err instanceof Error ? err.message : 'Error');
                  }
                }} className="rounded bg-[#800000] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#600000] transition">Track</button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* TRACKING MODAL DISPLAY WORKSPACE */}
      {trackModalOpen && trackedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-2xl border border-slate-400 bg-white p-5 shadow-xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-start justify-between border-b-2 border-[#800000] pb-3">
              <div>
                <h3 className="text-lg font-black text-[#800000]">Ticket {trackedTicket.ticket_number}</h3>
                <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs">
                  <p className="text-slate-500 font-bold">Status: 
                    <span className={`ml-1.5 inline-block rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-wide
                      ${trackedTicket.status === 'Closed' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-800'}`}>
                      {trackedTicket.status}
                    </span>
                  </p>
                  {trackedTicket.status === 'Completed' && (
                    <button
                      onClick={async () => {
                        if (!confirm('Are you sure you want to re-open this incident ticket?')) return;
                        try {
                          const res = await fetch('/api/tickets', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: trackedTicket.id, status: 'Work in Progress' }),
                          });
                          if (!res.ok) throw new Error('Failed to re-open');
                          setTrackedTicket((prev: any) => ({ ...prev, status: 'Work in Progress' }));
                          alert('Ticket has been successfully re-opened.');
                        } catch (err) {
                          alert('Error re-opening ticket');
                        }
                      }}
                      className="rounded bg-amber-500 px-2 py-0.5 text-[10px] font-black text-white hover:bg-amber-600 transition"
                    >
                      ⚠️ Re-open Ticket
                    </button>
                  )}
                </div>
              </div>
              <button onClick={() => setTrackModalOpen(false)} className="rounded border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100">Close</button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="bg-slate-50 p-3 border border-slate-200 text-xs rounded">
                <span className="font-bold text-blue-900 block uppercase tracking-wide mb-1">Incident Summary</span>
                <p className="font-semibold text-slate-800">{trackedTicket.short_description}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Conversation Thread</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto border p-2 bg-slate-50/50">
                  {trackedComments.length === 0 ? <div className="text-xs text-slate-400 italic">No historical messages.</div> : trackedComments.map((c) => (
                    <div key={c.id} className={`p-2 rounded text-xs border ${c.sender === 'Admin' ? 'bg-[#f4dcd6]/40 border-red-100' : 'bg-white border-slate-200'}`}>
                      <div className="text-[10px] font-bold text-slate-500">{c.sender} • {new Date(c.created_at).toLocaleString()}</div>
                      <div className="mt-0.5 text-slate-800 font-medium whitespace-pre-wrap">{c.message}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3">
                {trackedTicket.status !== 'Closed' ? (
                  <>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Reply Message</label>
                    <textarea value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} rows={3} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#800000]" />
                    <div className="mt-2 flex gap-2">
                      <button onClick={async () => {
                        if (!replyMessage.trim()) return;
                        try {
                          const res = await fetch('/api/ticket_comments', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ticket_id: trackedTicket.id, sender: 'User', message: replyMessage.trim() }),
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error('Failed to post');
                          setTrackedComments((prev) => [...prev, data.comment]);
                          setReplyMessage('');
                        } catch (err) {
                          alert('Error sending message');
                        }
                      }} className="rounded bg-[#800000] px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#600000]">Send Response</button>
                    </div>
                  </>
                ) : (
                  <div className="rounded bg-red-50 border border-red-100 p-3 text-xs text-red-800 font-bold italic text-center">
                    🔒 This incident file has been verified and permanently closed. Communication stream is locked.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS CREATION MODAL DISPLAY */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md border border-slate-400 bg-white p-5 shadow-2xl text-center">
            <h3 className="text-lg font-black text-[#800000] uppercase tracking-wide">Incident Successfully Logged</h3>
            <p className="text-xs text-slate-500 mt-1">Your infrastructure tracking file has been initialized.</p>
            <div className="my-4 border border-red-200 bg-red-50/50 p-4 rounded">
              <p className="text-[10px] font-bold text-slate-400 uppercase">System Generated Number</p>
              <p className="text-2xl font-black text-[#800000] tracking-tight mt-1">{ticketNumber}</p>
            </div>
            <button onClick={() => setShowModal(false)} className="w-full rounded bg-[#800000] py-2 text-xs font-bold text-white tracking-wider uppercase hover:bg-[#600000]">
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}

    </main>
  );
}
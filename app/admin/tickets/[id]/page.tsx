'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

// LIFECYCLE MATRIX UPGRADE: Idinagdag ang 'Raised to APPTech' sa opisyal na pipeline list
const orderedStatuses = ['Registered', 'Assigned', 'Work in Progress', 'Raised to APPTech', 'Completed', 'Closed'];

// Opisyal na roster ng mga ERP Assignee Leads mo
const supportEngineers = [
  'ERP Lead - Cris',
  'ERP Admin Support-Prince',
  'ERP Technical Support-Jones',
  'ERP Technical Support-Yel'
];

type Ticket = {
  id: string;
  ticket_number: string;
  requestor_name: string;
  requestor_email: string;
  requestor_t_number?: string;
  requestor_user_id?: string;
  contact_type?: string;
  priority?: string;
  location?: string;
  short_description?: string;
  description?: string;
  status?: string;
  created_at?: string;
  attachment_url?: string;
  attachments?: string[]; 
  assigned_to?: string; 
};

export default function TicketDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState<Array<{id: string; sender: string; message: string; created_at: string}>>([]);
  const [newComment, setNewComment] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isRefreshingComments, setIsRefreshingComments] = useState(false);

  // Core data fetch setup
  const fetchTicket = async () => {
    try {
      const token = window.localStorage.getItem('itsm-admin-token') || '';
      const res = await fetch(`/api/tickets?id=${id}`, { 
        headers: { 'x-admin-token': token } 
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Unable to load ticket');
      setTicket(data.ticket || null);
      
      await fetchCommentsOnly();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  // Naka-isolate na stream para sa dynamic comment log refresh routine
  const fetchCommentsOnly = async () => {
    if (!id) return;
    setIsRefreshingComments(true);
    try {
      const token = window.localStorage.getItem('itsm-admin-token') || '';
      const commentsRes = await fetch(`/api/ticket_comments?ticket_id=${id}`, { 
        headers: { 'x-admin-token': token } 
      });
      const commentsData = await commentsRes.json();
      if (commentsRes.ok) setComments(commentsData.comments || []);
    } catch (err) {
      console.warn('Failed to refresh comments', err);
    } finally {
      setIsRefreshingComments(false);
    }
  };

  useEffect(() => {
    if (!id) {
      router.push('/admin');
      return;
    }
    void fetchTicket();
  }, [id, router]);

  const handlePostAdminComment = async () => {
    if (!newComment.trim()) return;
    const token = window.localStorage.getItem('itsm-admin-token') || '';
    try {
      const res = await fetch('/api/ticket_comments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'x-admin-token': token 
        },
        body: JSON.stringify({ ticket_id: ticket?.id, sender: 'Admin', message: newComment.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post comment');
      setComments((prev) => [...prev, data.comment]);
      setNewComment('');
    } catch (err) {
      alert('Error broadcasting comment log');
    }
  };

  // ⌨️ ADMIN KEYBOARD INTERCEPT ENGINE: Enter to Send / Shift+Enter for New Line
  const handleAdminKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handlePostAdminComment();
    }
  };

  const handleUpdate = async (fields: { status?: string; assigned_to?: string | null }) => {
    if (!ticket) return;
    setUpdatingStatus(true);
    try {
      const token = window.localStorage.getItem('itsm-admin-token') || '';
      const response = await fetch('/api/tickets', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json', 
          'x-admin-token': token 
        },
        body: JSON.stringify({ id: ticket.id, ...fields }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Unable to update record');
      await fetchTicket(); 
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) return <div className="p-5 text-xs font-bold text-slate-500">Loading incident manifest...</div>;
  if (error) return <div className="p-5 text-xs font-bold text-red-600">{error}</div>;
  if (!ticket) return <div className="p-5 text-xs text-slate-400">Incident manifest record empty.</div>;

  let attachments: string[] = [];
  let rawAttachments = (ticket as any).attachments;
  if (rawAttachments) {
    if (Array.isArray(rawAttachments)) {
      attachments = rawAttachments;
    } else if (typeof rawAttachments === 'string') {
      try {
        attachments = JSON.parse(rawAttachments);
      } catch {
        attachments = rawAttachments.split(',').map((s: string) => s.trim());
      }
    }
  }
  if (attachments.length === 0 && ticket.attachment_url) attachments = [ticket.attachment_url];

  const descriptionOnly = ticket.description ? ticket.description.split('Attachments:')[0].trim() : '';
  const isCompleted = ticket.status === 'Completed';
  const isClosed = ticket.status === 'Closed';

  return (
    <main className="min-h-screen bg-[#fcfcf9] p-4 lg:p-6 text-slate-800 font-sans">
      <div className="mx-auto max-w-5xl flex flex-col gap-5">
        
        {/* ACTION HEADER BAR */}
        <div className="flex items-center justify-between border-b-4 border-[#800000] pb-2">
          <div className="flex items-center gap-4">
            <img src="/mary-grace-logo.jpeg" alt="Mary Grace Logo" className="w-28 h-20 object-contain rounded" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Incident Operational File</span>
              <h1 className="text-xl font-black text-[#800000] mt-0.5">Ticket {ticket.ticket_number}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            
            {isCompleted && (
              <>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to re-open this ticket?')) {
                      void handleUpdate({ status: 'Work in Progress' });
                    }
                  }}
                  disabled={updatingStatus}
                  className="rounded bg-amber-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-amber-600 transition"
                >
                  ⚠️ Re-open Ticket
                </button>
                
                <button
                  onClick={() => void handleUpdate({ status: 'Closed' })}
                  disabled={updatingStatus}
                  className="rounded bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition"
                >
                  🔒 Close Record
                </button>
              </>
            )}

            <a href="/admin" className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold shadow-sm hover:bg-slate-50 transition">Back</a>
          </div>
        </div>

        {/* CHEVRON PROGRESS INDICATOR PIPELINE */}
        <div className="border border-slate-300 bg-slate-100 p-1 rounded shadow-inner">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
            {orderedStatuses.map((step, index) => {
              const currentStepIndex = orderedStatuses.indexOf(ticket.status || 'Registered');
              const isCurrent = ticket.status === step;
              const isPast = currentStepIndex > index;

              return (
                <div 
                  key={step} 
                  /* 🎨 FIXED SIZES: Ginawang text-[9px] para magkasya lahat at binawasan ang padding sa px-2 */
                  className={`relative flex flex-1 items-center justify-center py-2 px-2 text-[9px] font-black uppercase tracking-wider transition-all duration-300
                    ${isCurrent 
                      ? 'bg-emerald-600 text-white font-black shadow-md' 
                      : isPast 
                        ? 'bg-slate-200 text-slate-600' 
                        : 'bg-white text-slate-300'
                    }
                  `}
                  style={{
                    clipPath: typeof window !== 'undefined' && window.innerWidth > 640
                      ? index === 0 
                        ? 'polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%)'
                        : index === orderedStatuses.length - 1
                          ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 5% 50%)'
                          : 'polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%, 5% 50%)'
                      : 'none'
                  }}
                >
                  {/* Pinagsama sa isang linya para iwas overlapping block formats */}
                  <span>{step}{isPast ? ' ✓' : ''}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* WORKSPACE CONTENT GRID DETAILS */}
        <div className="grid gap-5 md:grid-cols-3">
          
          {/* LEFT CONTENT SHEETS */}
          <div className="md:col-span-2 border border-slate-300 bg-white p-5 shadow-sm space-y-4">
            <div className="border-b pb-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#800000]">Incident Profile Scope</h3>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 text-xs font-medium">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">Requester Employee</span>
                <p className="font-bold text-slate-900">{ticket.requestor_name}</p>
                <p className="text-slate-500 font-mono text-[11px] mt-0.5">
                  <a href={`mailto:${ticket.requestor_email}`} className="underline">{ticket.requestor_email}</a>
                </p>
                {ticket.requestor_t_number && <p className="text-slate-500 font-mono mt-0.5">{ticket.requestor_t_number}</p>}
                {ticket.requestor_user_id && <p className="text-slate-400 text-[11px] mt-1">User ID: <span className="text-slate-700 font-mono font-bold">{ticket.requestor_user_id}</span></p>}
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">Summary Heading</span>
                <p className="font-bold text-slate-800 leading-tight">{ticket.short_description || '-'}</p>
              </div>
            </div>

            <div className="border-t pt-3 font-medium text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Extended Description Notes</span>
              <div className="text-slate-800 bg-slate-50 p-3 border rounded font-mono leading-relaxed text-[11px] whitespace-pre-wrap">
                {descriptionOnly || <span className="text-slate-300 italic">No historical extended log message provided.</span>}
              </div>
            </div>
          </div>

          {/* RIGHT TRIAGE ACTION CONTROL SIDEBAR */}
          <div className="border border-slate-300 bg-white p-5 shadow-sm space-y-4">
            <div className="border-b pb-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#800000]">Triage Assignment Rules</h3>
            </div>
            
            <div className="text-xs space-y-3 font-medium">
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Core Urgency Priority</span>
                <p className="font-black text-slate-900 mt-0.5 tracking-wide">{ticket.priority}</p>
              </div>
              
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Cost Center Department</span>
                <p className="font-bold text-[#800000] mt-0.5">{ticket.location || 'Not Specified'}</p>
              </div>
              
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Created Timestamp</span>
                <p className="text-slate-600 font-mono mt-0.5">{ticket.created_at ? new Date(ticket.created_at).toLocaleString() : '-'}</p>
              </div>

              <div className="pt-2 border-t">
                <span className="text-slate-400 text-[10px] font-bold uppercase block mb-1">Lifecycle State Status</span>
                <select 
                  value={ticket.status} 
                  disabled={updatingStatus || isClosed} 
                  onChange={(e) => void handleUpdate({ status: e.target.value })}
                  className="w-full rounded border border-slate-300 bg-slate-50 p-1.5 font-bold outline-none text-xs focus:border-[#800000] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {orderedStatuses.map((option) => {
                    const currentIdx = orderedStatuses.indexOf(ticket.status || 'Registered');
                    
                    if (option === 'Closed') return null;
                    if (currentIdx >= 3 && option === 'Assigned') return null;
                    if (currentIdx >= 3 && option === 'Registered') return null;

                    return <option key={option} value={option}>{option}</option>;
                  })}
                </select>
              </div>

              <div className="pt-2">
                <span className="text-slate-400 text-[10px] font-bold uppercase block mb-1">Assign Operator Lead</span>
                <select
                  value={ticket.assigned_to || 'Unassigned'}
                  disabled={updatingStatus || isClosed} 
                  onChange={(e) => {
                    const selectedAssignee = e.target.value;
                    const isAssigning = selectedAssignee !== 'Unassigned';
                    const nextStatus = (ticket.status === 'Registered' && isAssigning) ? 'Assigned' : ticket.status;
                    void handleUpdate({ assigned_to: isAssigning ? selectedAssignee : null, status: nextStatus });
                  }}
                  className="w-full rounded border border-slate-300 bg-slate-50 p-1.5 font-bold outline-none text-xs focus:border-[#800000] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="Unassigned">-- Select Assignee --</option>
                  {supportEngineers.map((engineer) => (
                    <option key={engineer} value={engineer}>{engineer}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* ATTACHMENT IMAGE STORAGE LOADER BOX */}
        <div className="border border-slate-300 bg-white p-5 shadow-sm">
          <div className="border-b pb-1.5 mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#800000]">Incident Screenshot Infrastructure Log</h3>
          </div>
          {attachments.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {attachments.map((url: string, index: number) => (
                <div key={url} className="border p-2 bg-slate-50 flex flex-col justify-between rounded">
                  <div className="overflow-hidden rounded border border-slate-200 bg-white p-1">
                    <img src={url} alt={`Log Attachment ${index + 1}`} className="max-h-52 w-full object-contain" />
                  </div>
                  <div className="mt-2">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="block text-center bg-slate-900 rounded py-1 text-[10px] font-bold text-white uppercase hover:bg-slate-800 transition">
                      Open Full File Window
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No asset storage documentation binded to this record file.</p>
          )}
        </div>

        {/* WORKNOTES DISCUSSION MATRIX PANEL */}
        <div className="border border-slate-300 bg-white p-5 shadow-sm space-y-3">
          <div className="border-b pb-1.5 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#800000]">Worknotes & System Logs</h3>
            <button
              onClick={fetchCommentsOnly}
              disabled={isRefreshingComments}
              className="text-[10px] font-bold text-slate-500 border border-slate-300 hover:border-[#800000] hover:text-[#800000] bg-white rounded px-2 py-0.5 shadow-sm transition disabled:opacity-40"
            >
              {isRefreshingComments ? '⏳ Syncing...' : '🔄 Refresh Logs'}
            </button>
          </div>
          
          {/* SLACK/MESSENGER CHAT BUBBLES FOR ADMIN */}
          <div className="space-y-4 max-h-[400px] overflow-y-auto border p-4 bg-slate-50 rounded shadow-inner font-sans">
            {comments.length === 0 ? (
              <div className="text-xs text-slate-400 italic text-center py-4">No historical communication logs recorded inside active viewport.</div>
            ) : (
              comments.map((c) => {
                const isAdmin = c.sender === 'Admin';
                
                return (
                  <div key={c.id} className={`flex items-start gap-2.5 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shadow-sm shrink-0
                      ${isAdmin ? 'bg-[#800000]' : 'bg-[#1e3f20]'}`}
                    >
                      {isAdmin ? 'AD' : 'US'}
                    </div>

                    <div className={`flex flex-col max-w-[75%] gap-1 ${isAdmin ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 px-1">
                        <span className="text-slate-700">{isAdmin ? 'Admin Support' : 'User/Client'}</span>
                        <span>•</span>
                        <span>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div className={`rounded-2xl px-4 py-2.5 text-xs font-medium whitespace-pre-wrap leading-relaxed shadow-sm
                        ${isAdmin 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                        }`}
                      >
                        {c.message.includes('[Attached Screenshot Asset]:') ? (
                          <>
                            <p>{c.message.split('[Attached Screenshot Asset]:')[0].trim()}</p>
                            <div className="mt-2 max-w-xs border rounded overflow-hidden p-1 bg-slate-50 shadow-inner">
                              <img 
                                src={c.message.split('[Attached Screenshot Asset]:')[1].trim()} 
                                alt="User Comment Attachment" 
                                className="max-h-40 w-full object-contain cursor-zoom-in"
                                onClick={() => window.open(c.message.split('[Attached Screenshot Asset]:')[1].trim(), '_blank')}
                              />
                            </div>
                          </>
                        ) : (
                          c.message
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {!isClosed ? (
            <div className="pt-2 border-t">
              <textarea 
                value={newComment} 
                onChange={(e) => setNewComment(e.target.value)} 
                onKeyDown={handleAdminKeyDown}
                rows={3} 
                placeholder="Type internal worknote logs... (Press Enter to send, Shift+Enter for new line)"
                className="w-full border border-slate-300 p-2 text-xs outline-none focus:border-[#800000] rounded bg-white text-slate-800" 
              />
              <div className="mt-1 flex gap-2">
                <button 
                  onClick={handlePostAdminComment}
                  className="bg-[#800000] rounded px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#600000] transition"
                >
                  Commit Log Entry
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded bg-red-50 border border-red-100 p-3 text-xs text-red-800 font-bold italic text-center">
              🔒 Communication channel completely archived and finalized.
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
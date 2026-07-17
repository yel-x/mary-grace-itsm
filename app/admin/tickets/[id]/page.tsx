'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

// 🚀 FIXED STATUS LIST: Raised to APPTech completely removed from workflow tracking states
const orderedStatuses = ['Registered', 'Assigned', 'Work in Progress', 'Completed', 'Closed'];

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

  // 📝 NEW RESOLUTION NOTES STATES
  const [selectedStatus, setSelectedStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  // 🛡️ USER FRIENDLY INLINE WORKFLOW ERROR BANNER STATE
  const [errorBanner, setErrorBanner] = useState('');

  // 🧲 SOLID SCROLL STATE CONTROL SYSTEMS
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const adminChatEndRef = useRef<HTMLDivElement | null>(null);
  const userIsScrollingUp = useRef(false);
  const previousCommentCount = useRef(0);

  const forceScrollToBottom = () => {
    adminChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleContainerScrollEvent = () => {
    const container = chatContainerRef.current;
    if (!container) return;

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom > 80) {
      userIsScrollingUp.current = true;
    } else {
      userIsScrollingUp.current = false;
    }
  };

  const fetchTicket = async (isDropdownUpdate = false) => {
    try {
      const token = window.localStorage.getItem('itsm-admin-token') || '';
      const res = await fetch(`/api/tickets?id=${id}&_ts=${Date.now()}`, { 
        headers: { 'x-admin-token': token } 
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Unable to load ticket');
      setTicket(data.ticket || null);
      setSelectedStatus(data.ticket?.status || 'Registered');
      
      await fetchCommentsOnly(isDropdownUpdate ? false : loading);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCommentsOnly = async (forceScroll = false) => {
    if (!id) return;
    try {
      const token = window.localStorage.getItem('itsm-admin-token') || '';
      const commentsRes = await fetch(`/api/ticket_comments?ticket_id=${id}&_ts=${Date.now()}`, { 
        headers: { 'x-admin-token': token } 
      });
      const commentsData = await commentsRes.json();
      if (commentsRes.ok && commentsData.comments) {
        const freshComments = commentsData.comments;
        
        const hasNewIncomingChat = freshComments.length > previousCommentCount.current;
        const lastChatIsFromUser = freshComments.length > 0 && freshComments[freshComments.length - 1].sender === 'User';

        setComments(freshComments);
        previousCommentCount.current = freshComments.length;

        if (forceScroll || (!userIsScrollingUp.current && (hasNewIncomingChat && lastChatIsFromUser))) {
          setTimeout(forceScrollToBottom, 50);
        }
      }
    } catch (err) {
      console.debug('Polling skipped.');
    }
  };

  useEffect(() => {
    if (!id) {
      router.push('/admin');
      return;
    }
    void fetchTicket(false);
  }, [id, router]);

  useEffect(() => {
    if (!id || loading) return;

    const adminPollingInterval = setInterval(() => {
      void fetchCommentsOnly(false);
    }, 3000); 

    return () => clearInterval(adminPollingInterval);
  }, [id, loading]);

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
      
      setNewComment('');
      userIsScrollingUp.current = false; 
      await fetchCommentsOnly(true);
    } catch (err) {
      alert('Error broadcasting comment log');
    }
  };

  const handleAdminKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handlePostAdminComment();
    }
  };

  const handleUpdate = async (fields: { 
    status?: string; 
    assigned_to?: string | null; 
    resolution_notes?: string; 
    is_reopen?: boolean;
    reopened_by?: string; 
  }) => {
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
      
      setResolutionNotes('');
      await fetchTicket(true); 
    } catch (err) {
      setErrorBanner(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // 🔄 DROPDOWN VALIDATION STATE PIPELINE (ENGLISH & USER-FRIENDLY INLINE MESSAGES)
  const handleStatusDropdownChange = async (nextStatus: string) => {
    if (!ticket) return;
    setErrorBanner(''); 
    
    const currentStatus = ticket.status || 'Registered';
    const currentAssignee = ticket.assigned_to;

    // 🎯 RULE 1: Cannot move to Assigned without picking a Support Engineer first
    if (nextStatus === 'Assigned' && (!currentAssignee || currentAssignee === 'Unassigned')) {
      setErrorBanner('Operation Denied: Please assign a Support Engineer before updating the status to "Assigned".');
      setSelectedStatus(currentStatus);
      return;
    }

    // 🎯 RULE 2: Cannot move to Work in Progress if still unassigned
    if (nextStatus === 'Work in Progress' && currentStatus === 'Registered' && (!currentAssignee || currentAssignee === 'Unassigned')) {
      setErrorBanner('Operation Denied: A ticket cannot be set to "Work in Progress" without an active assigned engineer.');
      setSelectedStatus(currentStatus);
      return;
    }

    // 🎯 RULE 3: Cannot jump to Completed unless coming from Work in Progress
    if (nextStatus === 'Completed' && currentStatus !== 'Work in Progress') {
      setErrorBanner('Operation Denied: Tickets must go through the "Work in Progress" active execution pipeline state before resolution.');
      setSelectedStatus(currentStatus);
      return;
    }

    setSelectedStatus(nextStatus);
    
    if (nextStatus !== 'Completed') {
      void handleUpdate({ status: nextStatus });
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
                    if (confirm('Are you sure you want to re-open this ticket? This will change the status back to Work in Progress.')) {
                      void handleUpdate({ status: 'Work in Progress', is_reopen: true, reopened_by: 'Admin' });
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
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Urgency Impact</span>
                <p className="font-black text-slate-900 mt-0.5 tracking-wide">{ticket.priority}</p>
              </div>
              
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Department</span>
                <p className="font-bold text-[#800000] mt-0.5">{ticket.location || 'Not Specified'}</p>
              </div>
              
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase block">Created Timestamp</span>
                <p className="text-slate-600 font-mono mt-0.5">{ticket.created_at ? new Date(ticket.created_at).toLocaleString() : '-'}</p>
              </div>

              {/* AUTOMATIC STATUS DROP-DOWN CONTROL EXECUTOR */}
              <div className="pt-2 border-t relative">
                <span className="text-slate-400 text-[10px] font-bold uppercase block mb-1">Lifecycle State Status</span>
                
                {/* 🎨 PREMIUM USER FRIENDLY INLINE ERROR BANNER LAYOUT */}
                {errorBanner && (
                  <div className="mb-2 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded text-[11px] font-bold leading-snug text-left animate-fadeIn shadow-sm">
                    <span className="mr-1">⚠️</span> {errorBanner}
                  </div>
                )}

                <select 
                  value={selectedStatus} 
                  disabled={updatingStatus || isClosed || isCompleted} 
                  onChange={(e) => void handleStatusDropdownChange(e.target.value)}
                  className="w-full rounded border border-slate-300 bg-slate-50 p-1.5 font-bold outline-none text-xs focus:border-[#800000] disabled:cursor-not-allowed disabled:opacity-60 text-slate-800"
                >
                  {orderedStatuses.map((option) => {
                    const currentStatus = ticket.status || 'Registered';
                    const currentAssignee = ticket.assigned_to;

                    // Tagabasa ng lock configuration rules para sa bawat option
                    let isOptionDisabled = false;

                    if (option === 'Closed') return null; // Ang closure ay pinapatakbo sa button framework lamang

                    // 🔒 HARD RESTRICTION RULE 1: Bawal piliin ang 'Assigned' kung unassigned
                    if (option === 'Assigned' && (!currentAssignee || currentAssignee === 'Unassigned')) {
                      isOptionDisabled = true;
                    }

                    // 🔒 HARD RESTRICTION RULE 2: Bawal maging 'Work in Progress' kung unassigned pa rin ang operator card
                    if (option === 'Work in Progress' && (!currentAssignee || currentAssignee === 'Unassigned')) {
                      isOptionDisabled = true;
                    }

                    // 🔒 HARD RESTRICTION RULE 3: Bawal piliin ang 'Completed' hangga't hindi pa umaabot sa 'Work in Progress' ang ticket
                    if (option === 'Completed' && currentStatus !== 'Work in Progress') {
                      isOptionDisabled = true;
                    }

                    return (
                      <option 
                        key={option} 
                        value={option}
                        disabled={isOptionDisabled}
                        className={isOptionDisabled ? "text-slate-400 bg-slate-100" : "text-slate-800"}
                      >
                        {option} {isOptionDisabled ? '' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* 🛠️ ENHANCED WORKFLOW LAYER: REQUIRED RESOLUTION NOTES ENFORCEMENT ENGINE */}
              {selectedStatus === 'Completed' && ticket.status !== 'Completed' && (
                <div className="pt-2 border-t border-dashed border-emerald-500 bg-emerald-50/40 p-2 rounded animate-fadeIn">
                  <span className="text-emerald-800 text-[10px] font-black uppercase block mb-1">🎯 Resolution Notes *</span>
                  <textarea
                    required
                    rows={3}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Provide details on how the issue was resolved. Resolution Notes are REQUIRED to close this ticket."
                    className="w-full rounded border border-emerald-300 bg-white p-1.5 text-xs text-slate-800 outline-none focus:border-emerald-600 placeholder:italic"
                  />
                  <button
                    onClick={() => {
                      if (!resolutionNotes.trim()) {
                        setErrorBanner('Resolution Notes are required before completing the ticket resolution loop.');
                        return;
                      }
                      void handleUpdate({ status: 'Completed', resolution_notes: resolutionNotes.trim() });
                    }}
                    disabled={updatingStatus}
                    className="w-full mt-2 rounded bg-emerald-600 py-1 px-2 text-[11px] font-bold text-white shadow hover:bg-emerald-700 transition uppercase tracking-wider"
                  >
                    Confirm Resolution & Email Client
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStatus(ticket.status || 'Registered');
                      setResolutionNotes('');
                      setErrorBanner('');
                    }}
                    className="w-full mt-1 text-center text-[10px] font-bold text-slate-400 hover:text-slate-600 transition tracking-wide uppercase pt-1"
                  >
                    Cancel Action
                  </button>
                </div>
              )}

              <div className="pt-2">
                <span className="text-slate-400 text-[10px] font-bold uppercase block mb-1">Assign Operator Lead</span>
                <select
                  value={ticket.assigned_to || 'Unassigned'}
                  disabled={updatingStatus || isClosed || isCompleted} 
                  onChange={(e) => {
                    setErrorBanner(''); 
                    const selectedAssignee = e.target.value;
                    const isAssigning = selectedAssignee !== 'Unassigned';
                    
                    // Automatically shift state from Registered to Assigned if engineer is picked
                    const nextStatus = (ticket.status === 'Registered' && isAssigning) ? 'Assigned' : ticket.status;
                    
                    void handleUpdate({ assigned_to: isAssigning ? selectedAssignee : null, status: nextStatus });
                  }}
                  className="w-full rounded border border-slate-300 bg-slate-50 p-1.5 font-bold outline-none text-xs focus:border-[#800000] disabled:cursor-not-allowed disabled:opacity-60 text-slate-800"
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
                  <div 
                    onClick={() => window.open(url, '_blank')}
                    className="overflow-hidden rounded border border-slate-200 bg-white p-1 cursor-pointer hover:opacity-90 hover:border-[#800000] transition group relative"
                    title="Click to view full file in a new tab"
                  >
                    {url.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) || url.includes('image') ? (
                      <img src={url} alt={`Log Attachment ${index + 1}`} className="max-h-52 w-full object-contain" />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 bg-slate-100 rounded text-slate-600 gap-2 select-none">
                        <span className="text-3xl">📁</span>
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 px-2 text-center break-all">
                          {url.split('/').pop()?.split('-').pop() || 'View Attached Document'}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Click to download/open file</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <span className="bg-slate-900/80 text-[10px] text-white font-bold px-2.5 py-1 rounded shadow-sm">📥 Click to Open / Download File</span>
                    </div>
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#800000] flex items-center gap-1.5">
              <span>Worknotes & System Logs</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400 italic">⚡ Live Stream Active</span>
          </div>
          
          <div 
            ref={chatContainerRef}
            onScroll={() => handleContainerScrollEvent()}
            className="space-y-4 max-h-[400px] overflow-y-auto border p-4 bg-slate-50 rounded shadow-inner font-sans"
          >
            {comments.length === 0 ? (
              <div className="text-xs text-slate-400 italic text-center py-4">No historical communication logs recorded inside active viewport.</div>
            ) : (
              comments.map((c) => {
                const isSystemLog = c.message.startsWith('[SYSTEM LOG]:') || c.message.startsWith('[RESOLUTION NOTICE BY');
                const isAdmin = c.sender === 'Admin';
                
                if (isSystemLog) {
                  return (
                    <div key={c.id} className="w-full flex flex-col items-center justify-center my-2.5 py-1.5 border-y border-slate-200/40 bg-slate-100/40 rounded animate-fadeIn">
                      <p className="text-[10px] text-slate-600 italic font-semibold tracking-wide text-center leading-normal whitespace-pre-wrap max-w-[85%]">
                        {c.message.startsWith('[SYSTEM LOG]:') 
                          ? c.message.replace('[SYSTEM LOG]:', '⚙️ System Log:') 
                          : c.message}
                      </p>
                      <span className="text-[9px] text-slate-400 font-mono mt-0.5 font-bold uppercase tracking-tighter">
                        {new Date(c.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  );
                }

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
                            <div className="mt-2 max-w-xs border rounded overflow-hidden p-1 bg-slate-100 shadow-inner">
                              {c.message.split('[Attached Screenshot Asset]:')[1].trim().match(/\.(jpeg|jpg|gif|png|webp|svg)/i) ? (
                                <img 
                                  src={c.message.split('[Attached Screenshot Asset]:')[1].trim()} 
                                  alt="Comment Attachment Preview" 
                                  className="max-h-40 w-full object-contain cursor-zoom-in hover:opacity-95 transition"
                                  onClick={() => window.open(c.message.split('[Attached Screenshot Asset]:')[1].trim(), '_blank')}
                                />
                              ) : (
                                <div 
                                  onClick={() => window.open(c.message.split('[Attached Screenshot Asset]:')[1].trim(), '_blank')}
                                  className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 cursor-pointer hover:bg-slate-50 transition group"
                                >
                                  <span className="text-xl group-hover:scale-110 transition duration-200">📁</span>
                                  <div className="flex flex-col flex-1 min-w-0">
                                    <span className="text-[10px] font-bold text-slate-700 truncate">
                                      {c.message.split('[Attached Screenshot Asset]:')[1].trim().split('/').pop()?.split('-').pop() || 'View Attached Document'}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-medium uppercase">Click to open/download</span>
                                  </div>
                                </div>
                              )}
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
            <div ref={adminChatEndRef} />
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
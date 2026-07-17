'use client';

import { useEffect, useLayoutEffect, useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

// Master status definitions
const orderedStatuses = ['Registered', 'Assigned', 'Work in Progress', 'Completed', 'Closed'];

type Ticket = {
  id: string;
  ticket_number: string;
  requestor_name: string;
  requestor_email: string;
  priority: string;
  status: string;
  created_at: string;
  department: string;
  short_description: string;
  assigned_to?: string;
};

type NotificationItem = {
  id: string;
  ticket_id: string;
  ticket_number: string;
  requestor_name: string;
  message: string;
  created_at: string;
  is_read: boolean;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  const [searchQuery, setSearchQuery] = useState('');
  
  // 🎛️ TWO-TAB DASHBOARD STRATEGY
  const [dashboardViewMode, setDashboardViewMode] = useState<'it' | 'master-data'>('it');
  
  // 📦 SMART SUB-FILTER FOR DYNAMIC SCORECARD LIVE CALCULATIONS
  const [masterDataSubFilter, setMasterDataSubFilter] = useState<'ALL' | 'NON-FOOD' | 'BAKERY' | 'SUPPLIER'>('ALL');

  // 🔔 NOTIFICATION STATES
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  // 🛠️ PERSISTENT LOCAL STORAGE ENGINE
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>([]);

  // 🛠️ INJECTED REF MECHANICS FOR CLICK-OUTSIDE TO CLOSE TRIGGER
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  // 🖱️ SELECTED SCORECARD CARD HIGHLIGHT
  const [selectedScorecardFilter, setSelectedScorecardFilter] = useState<string>('ALL');

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // 🔄 FETCH TICKETS AND WORKNOTES NOTIFICATIONS
  const fetchDashboardData = async () => {
    try {
      const token = window.localStorage.getItem('itsm-admin-token');
      const res = await fetch('/api/tickets', {
        headers: token ? { 'x-admin-token': token } : undefined,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to load dashboard data');
      }

      setTickets(data.tickets || []);
      
      const notifRes = await fetch('/api/notifications'); 
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotifications(notifData.notifications || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // 🛠️ USELAYOUTEFFECT INTERCEPT ENGINE
  useLayoutEffect(() => {
    const token = window.localStorage.getItem('itsm-admin-token');
    if (token) {
      setIsAuthenticated(true);
      
      const savedDismissed = window.localStorage.getItem('itsm-dismissed-notifs');
      if (savedDismissed) {
        try {
          setDismissedNotificationIds(JSON.parse(savedDismissed));
        } catch (e) {
          console.error("Failed parsing localStorage array cache");
        }
      }
      
      setIsAuthChecking(false);
      void fetchDashboardData();
    } else {
      setIsAuthenticated(false);
      setIsAuthChecking(false);
      setLoading(false);
    }
  }, []);

  // 🚀 CLICK-OUTSIDE DETECTOR ENGINE
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live real-time polling setup
  useEffect(() => {
    if (!isAuthenticated || isAuthChecking) return;
    const pollingInterval = setInterval(() => {
      void fetchDashboardData();
    }, 4000);
    return () => clearInterval(pollingInterval);
  }, [isAuthenticated, isAuthChecking, dashboardViewMode, masterDataSubFilter]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const targetUser = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin';
    const targetPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'Admin@123';

    if (usernameInput === targetUser && passwordInput === targetPass) {
      const computedToken = btoa(`${targetUser}:${targetPass}`);
      window.localStorage.setItem('itsm-admin-token', computedToken);
      setIsAuthenticated(true);
      setLoading(true);
      void fetchDashboardData();
    } else {
      setLoginError('Invalid credentials.');
    }
  };

  // 🔒 THE REAL-TIME RADAR MATRIX ENGINE
  const segregatedTicketsByTabMode = useMemo(() => {
    return tickets.filter((t) => {
      const desc = (t.short_description || '').toUpperCase();
      
      const isEnrollment = 
        desc.includes('NON-FOOD') || 
        desc.includes('MANU') || 
        desc.includes('SUPPLIER') ||
        desc.includes('ENROLLMENT');

      if (dashboardViewMode === 'it') {
        if (isEnrollment) return false;
      } else {
        if (!isEnrollment) return false;
        
        if (masterDataSubFilter === 'NON-FOOD' && !desc.includes('NON-FOOD')) return false;
        if (masterDataSubFilter === 'BAKERY' && !(desc.includes('MANU') || desc.includes('BAKERY'))) return false;
        if (masterDataSubFilter === 'SUPPLIER' && !desc.includes('SUPPLIER')) return false;
      }

      return true;
    });
  }, [tickets, dashboardViewMode, masterDataSubFilter]);

  // Tab rows volume count ledger metrics
  const tabCounts = useMemo(() => {
    let itCount = 0;
    let mdCount = 0;

    tickets.forEach(t => {
      const desc = (t.short_description || '').toUpperCase();
      const isEnrollment = 
        desc.includes('NON-FOOD') || 
        desc.includes('MANU') || 
        desc.includes('SUPPLIER') ||
        desc.includes('ENROLLMENT');

      if (isEnrollment) {
        mdCount++;
      } else {
        itCount++;
      }
    });

    return { itCount, mdCount };
  }, [tickets]);

  // 🧠 CORE TELEMETRY COMPUTATION
  const reportData = useMemo(() => {
    const activeDataset = segregatedTicketsByTabMode;
    const total = activeDataset.length;
    
    const registered = activeDataset.filter(t => t.status === 'Registered').length;
    const assigned = activeDataset.filter(t => t.status === 'Assigned').length;
    const inProgress = activeDataset.filter(t => t.status === 'Work in Progress').length;
    const completed = activeDataset.filter(t => t.status === 'Completed').length;
    const closed = activeDataset.filter(t => t.status === 'Closed').length;

    const resolved = completed + closed;
    const open = registered + assigned + inProgress;

    const deptMap: Record<string, number> = {};
    const resolverMap: Record<string, number> = {};
    const priorityMap = { Critical: 0, High: 0, Moderate: 0, Low: 0 };
    
    const weeklyTimelineMap: Record<string, number> = {};
    const ageMap = { '0-3 Days': 0, '4-7 Days': 0, '8-14 Days': 0, '15+ Days': 0 };

    activeDataset.forEach(t => {
      const dept = t.department || (t as any).location || 'Not Specified';
      deptMap[dept] = (deptMap[dept] || 0) + 1;

      if (t.assigned_to && (t.status === 'Completed' || t.status === 'Closed')) {
        const fullAssigneeName = t.assigned_to;
        resolverMap[fullAssigneeName] = (resolverMap[fullAssigneeName] || 0) + 1;
      }

      if (t.priority in priorityMap) {
        priorityMap[t.priority as keyof typeof priorityMap]++;
      }

      if (t.created_at) {
        const d = new Date(t.created_at);
        const startOfYear = new Date(d.getFullYear(), 0, 1);
        const pastDaysOfYear = (d.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24);
        const weekNum = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
        const weekLabel = `WK-${weekNum} (${d.getFullYear().toString().substring(2)})`;
        weeklyTimelineMap[weekLabel] = (weeklyTimelineMap[weekLabel] || 0) + 1;

        const ticketIsActive = t.status !== 'Completed' && t.status !== 'Closed';
        if (ticketIsActive) {
          const diffTime = Math.abs(Date.now() - d.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 3) ageMap['0-3 Days']++;
          else if (diffDays <= 7) ageMap['4-7 Days']++;
          else if (diffDays <= 14) ageMap['8-14 Days']++;
          else ageMap['15+ Days']++;
        }
      }
    });

    const maxDeptVal = Math.max(...Object.values(deptMap), 1);
    const maxPriorityVal = Math.max(...Object.values(priorityMap), 1);
    const maxWeeklyVal = Math.max(...Object.values(weeklyTimelineMap), 1);
    const maxAgeVal = Math.max(...Object.values(ageMap), 1);

    const topResolversRaw = Object.entries(resolverMap).sort((a: [string, number], b: [string, number]) => b[1] - a[1]).slice(0, 4);
    const maxResolverVal = topResolversRaw.length > 0 ? Math.max(...topResolversRaw.map((r: [string, number]) => r[1]), 1) : 1;

    const regPct = total > 0 ? Math.round((registered / total) * 100) : 0;
    const assPct = total > 0 ? Math.round((assigned / total) * 100) : 0;
    const wipPct = total > 0 ? Math.round((inProgress / total) * 100) : 0;
    const compPct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const clsPct = total > 0 ? Math.round((closed / total) * 100) : 0;

    return {
      total, resolved, open, registered, inProgress, openAssigned: assigned,
      activeTotal: open, 
      priorityMap,
      maxPriorityVal,
      deptMap,
      maxDeptVal,
      weeklyTimelineMap,
      maxWeeklyVal,
      ageMap,
      maxAgeVal,
      topResolvers: topResolversRaw,
      maxResolverVal,
      slaComplianceRate: total > 0 ? Math.round((resolved / total) * 100) : 100,
      breakdown: {
        registered, assigned, inProgress, completed, closed,
        regPct, assPct, wipPct, compPct, clsPct
      }
    };
  }, [tickets, segregatedTicketsByTabMode]);

  const filteredTickets = useMemo(() => {
    return segregatedTicketsByTabMode.filter((ticket) => {
      let matchesStatus = filterStatus === 'All Statuses' || ticket.status === filterStatus;
      
      if (selectedScorecardFilter !== 'ALL') {
        if (selectedScorecardFilter === 'Resolved') {
          matchesStatus = ticket.status === 'Completed' || ticket.status === 'Closed';
        } else {
          matchesStatus = ticket.status === selectedScorecardFilter;
        }
      }

      const matchesSearch = 
        (ticket.ticket_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ticket.requestor_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ticket.short_description || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [segregatedTicketsByTabMode, filterStatus, searchQuery, selectedScorecardFilter]);

  const activeNotifications = useMemo(() => {
    return notifications.filter(n => {
      const isNotDismissed = !dismissedNotificationIds.includes(n.id);
      const isUserComment = (n as any).type === 'COMMENT';
      return isNotDismissed && isUserComment;
    });
  }, [notifications, dismissedNotificationIds]);

  const unreadNotificationsCount = useMemo(() => {
    return activeNotifications.length;
  }, [activeNotifications]);

  // 🛠️ CSV SPREADSHEET ENGINE
  const exportTicketsToCSV = () => {
    if (filteredTickets.length === 0) return;

    const headers = ['Incident ID', 'Requestor Name', 'Requestor Email', 'Priority', 'Department/Location', 'Workflow State', 'Created Date', 'Short Description'];
    const csvRows = filteredTickets.map(t => [
      `"${t.ticket_number || ''}"`,
      `"${t.requestor_name || ''}"`,
      `"${t.requestor_email || ''}"`,
      `"${t.priority || ''}"`,
      `"${t.department || (t as any).location || ''}"`,
      `"${t.status || ''}"`,
      `"${t.created_at ? new Date(t.created_at).toLocaleString() : ''}"`,
      `"${(t.short_description || '').replace(/"/g, '""')}"`
    ].join(','));

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const viewName = dashboardViewMode === 'master-data' ? 'Master_Data_Enrollments' : 'SAP_Concerns_Issues';
    link.setAttribute('href', url);
    link.setAttribute('download', `ITSM_Tickets_Report_${viewName}_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 🛠️ CHART SVG VECTOR COMPUTATION ENGINE
  const timelineSortedData = useMemo(() => {
    return Object.entries(reportData.weeklyTimelineMap)
      .sort((a, b) => {
        const extractNum = (str: string) => {
          const match = str.match(/WK-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        };
        return extractNum(a[0]) - extractNum(b[0]);
      });
  }, [reportData.weeklyTimelineMap]);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#fcfcf9] flex items-center justify-center font-sans">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-4 border-[#800000] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Loading Operations Ledger...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#fcfcf9] flex items-center justify-center p-4 text-slate-800 font-sans">
        <div className="w-full max-w-sm border-2 border-slate-300 bg-white p-6 shadow-xl rounded-md">
          <div className="text-center border-b-4 border-t border-l border-r border-[#800000] p-4 mb-5">
            <img src="/mary-grace-logo.jpeg" alt="Mary Grace Logo" className="w-24 h-16 object-contain mx-auto rounded" />
            <h2 className="text-md font-black uppercase text-[#800000] mt-2 tracking-tight">ITSM Administrative Terminal</h2>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Secure Access Control Matrix</span>
          </div>
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-bold text-slate-600">
            <label className="block">
              <span>Security Officer User *</span>
              <input type="text" required value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-slate-50 p-2 text-slate-800 outline-none font-medium" />
            </label>
            <label className="block">
              <span>Administrative Cipher Key *</span>
              <input type="password" required value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="mt-1 w-full rounded border border-slate-300 bg-slate-50 p-2 text-slate-800 outline-none font-medium" />
            </label>
            {loginError && <p className="text-[11px] font-bold text-red-600 leading-snug">{loginError}</p>}
            <div className="mt-2 flex gap-2">
              <button type="submit" className="w-full bg-[#800000] text-white font-black uppercase py-2 rounded shadow hover:bg-[#600000] transition tracking-wider">
                Verify Credentials & Unlock Portal
              </button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fcfcf9] p-4 lg:p-6 text-slate-800 font-sans">
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="mx-auto max-w-[1650px] flex flex-col gap-6">
        
        {/* BRANDING HEADER AREA */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b-4 border-[#800000] pb-3 relative">
          <div className="flex items-center gap-4 w-full justify-between">
            <div className="flex items-center gap-4">
              <img src="/mary-grace-logo.jpeg" alt="Mary Grace Logo" className="w-28 h-20 object-contain rounded" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1e3f20]">MARY GRACE • ITSM OPERATIONS PORTAL</span>
                <h1 className="text-xl font-black text-[#800000] tracking-tight uppercase">SAP MG Ticketing System</h1>
                <p className="text-xs italic text-slate-500">What's <span className="underline font-bold text-[#800000]">SAP</span>? Mary Grace.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-3 sm:mt-0">
              <div className="relative" ref={notifDropdownRef}>
                <button 
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="p-2 bg-white border border-slate-300 rounded shadow-sm hover:bg-slate-50 transition relative flex items-center justify-center text-lg"
                >
                  🔔
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-black tracking-tighter shadow animate-pulse">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>

                {/* WORKNOTE DROPDOWN SHEET */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-300 shadow-xl rounded z-50 overflow-hidden font-sans">
                    <div className="bg-[#800000] p-3 text-white font-black text-xs uppercase tracking-wider flex justify-between items-center">
                      <span>Worknote Notifications</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 no-scrollbar">
                      {activeNotifications.length === 0 ? (
                        <div className="p-4 text-xs text-slate-400 italic text-center bg-slate-50">No new response from the users</div>
                      ) : (
                        activeNotifications.map((notif) => (
                          <div 
                            key={notif.id}
                            onClick={() => {
                              const arrCache = [...dismissedNotificationIds, notif.id];
                              setDismissedNotificationIds(arrCache);
                              window.localStorage.setItem('itsm-dismissed-notifs', JSON.stringify(arrCache));
                              setNotifDropdownOpen(false);
                              router.push(`/admin/tickets/${notif.ticket_id}`);
                            }}
                            className="p-3 text-left hover:bg-slate-50 transition cursor-pointer text-xs border-l-4 border-amber-500"
                          >
                            <p className="font-semibold text-slate-800 stroke-none">User "{notif.requestor_name}" responded to ticket {notif.ticket_number}</p>
                            <span className="text-[9px] text-slate-400 block mt-1">{new Date(notif.created_at).toLocaleString()}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-center">
                <a href="/" className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold shadow-sm hover:bg-slate-50 transition">User Portal</a>
                <button onClick={() => { window.localStorage.removeItem('itsm-admin-token'); setIsAuthenticated(false); setTickets([]); }} className="rounded bg-slate-900 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition">Sign Out</button>
              </div>
            </div>
          </div>
        </header>

        {/* TWO-TAB CONTROLLER LAYOUT */}
        <div className="flex items-center border-b border-slate-300 gap-2 bg-slate-100 p-1 rounded">
          <button onClick={() => { setFilterStatus('All Statuses'); setSelectedScorecardFilter('ALL'); setDashboardViewMode('it'); setSearchQuery(''); }} className={`flex-1 sm:flex-none text-center rounded px-5 py-2 text-xs font-black uppercase tracking-wider transition shadow-sm ${dashboardViewMode === 'it' ? 'bg-[#800000] text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>🔴 SAP Concerns/Issues ({tabCounts.itCount})</button>
          <button onClick={() => { setFilterStatus('All Statuses'); setSelectedScorecardFilter('ALL'); setDashboardViewMode('master-data'); setMasterDataSubFilter('ALL'); setSearchQuery(''); }} className={`flex-1 sm:flex-none text-center rounded px-5 py-2 text-xs font-black uppercase tracking-wider transition shadow-sm ${dashboardViewMode === 'master-data' ? 'bg-[#1e3f20] text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>📦 Master Data Enrollments ({tabCounts.mdCount})</button>
        </div>

        {/* METRICS SCORECARD GRID BAR */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:grid-cols-6">
          <div onClick={() => setSelectedScorecardFilter('ALL')} className={`border p-3 text-center shadow-md cursor-pointer transition ${selectedScorecardFilter === 'ALL' ? 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/20' : 'border-slate-300 bg-white hover:border-slate-400'}`}><p className="text-[10px] font-bold uppercase text-blue-900">Total Cases</p><p className="text-3xl font-black text-slate-900 mt-1">{reportData.total}</p></div>
          <div onClick={() => setSelectedScorecardFilter('Resolved')} className={`border p-3 text-center shadow-md cursor-pointer transition ${selectedScorecardFilter === 'Resolved' ? 'border-emerald-600 ring-2 ring-emerald-600/20 bg-emerald-50/20' : 'border-slate-300 bg-white hover:border-slate-400'}`}><p className="text-[10px] font-bold uppercase text-blue-900">Resolved</p><p className="text-3xl font-black text-slate-900 mt-1">{reportData.resolved}</p></div>
          <div onClick={() => setSelectedScorecardFilter('Registered')} className={`border p-3 text-center shadow-md cursor-pointer transition ${selectedScorecardFilter === 'Registered' ? 'border-rose-600 ring-2 ring-rose-600/20 bg-rose-50/20' : 'border-slate-300 bg-[#f4dcd6] hover:border-slate-400'}`}><p className="text-[10px] font-bold uppercase text-blue-900">New (Registered)</p><p className="text-3xl font-black text-slate-900 mt-1">{reportData.registered}</p></div>
          <div onClick={() => setSelectedScorecardFilter('Assigned')} className={`border p-3 text-center shadow-md cursor-pointer transition ${selectedScorecardFilter === 'Assigned' ? 'border-sky-600 ring-2 ring-sky-600/20 bg-sky-50/20' : 'border-slate-300 bg-white hover:border-slate-400'}`}><p className="text-[10px] font-bold uppercase text-blue-900">Open (Assigned)</p><p className="text-3xl font-black text-slate-900 mt-1">{reportData.openAssigned}</p></div>
          <div onClick={() => setSelectedScorecardFilter('Work in Progress')} className={`border p-3 text-center shadow-md cursor-pointer transition ${selectedScorecardFilter === 'Work in Progress' ? 'border-indigo-600 ring-2 ring-indigo-600/20 bg-indigo-50/20' : 'border-slate-300 bg-white hover:border-slate-400'}`}><p className="text-[10px] font-bold uppercase text-blue-900">In Progress</p><p className="text-3xl font-black text-slate-900 mt-1">{reportData.inProgress}</p></div>
          <div className="border border-slate-300 bg-white text-center p-3 shadow-md"><p className="text-[10px] font-bold uppercase text-blue-900">SLA Compliance Rate</p><p className="text-3xl font-black text-slate-900 mt-1">{reportData.slaComplianceRate}%</p></div>
        </section>

        {/* 📊 VISUAL DYNAMIC 2x3 ANALYTICS PIPELINE MATRIX GRID */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* ================= ROW 1 ================= */}
          
          {/* 1. Tickets by Department */}
          <div className="border border-slate-300 bg-white p-5 shadow-md rounded-sm flex flex-col justify-between min-h-[300px]">
            <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider border-b pb-2 mb-4">Tickets by Department</h3>
            <div className="relative h-56 border-b-2 border-l-2 border-slate-400 bg-slate-50/40 p-4 pl-14 flex items-end justify-start flex-wrap gap-x-8 gap-y-2 overflow-x-auto no-scrollbar">
              
              <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-none z-20">
                <span className="-rotate-90 text-[10px] font-black uppercase text-slate-400 tracking-wider whitespace-nowrap block text-center w-full">
                  Tickets
                </span>
              </div>

              {/* Horizontal Major Gridlines */}
              <div className="absolute inset-y-0 left-12 right-0 top-0 border-t border-slate-200 pointer-events-none"></div>
              <div className="absolute inset-y-0 left-12 right-0 top-1/4 border-t border-slate-200 pointer-events-none"></div>
              <div className="absolute inset-y-0 left-12 right-0 top-2/4 border-t border-slate-200 pointer-events-none"></div>
              <div className="absolute inset-y-0 left-12 right-0 top-3/4 border-t border-slate-200 pointer-events-none"></div>

              {Object.entries(reportData.deptMap).map(([dept, count]) => {
                const colorsList = ['bg-gradient-to-t from-pink-600 to-pink-400', 'bg-gradient-to-t from-emerald-600 to-emerald-400', 'bg-gradient-to-t from-amber-600 to-amber-400', 'bg-gradient-to-t from-blue-600 to-blue-400', 'bg-gradient-to-t from-purple-600 to-purple-400'];
                const charCodeSum = dept.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                const colorIdx = charCodeSum % colorsList.length;

                return (
                  <div key={dept} className="flex flex-col items-center gap-1 h-full justify-end group relative w-12 z-10 shrink-0 ml-6">
                    <span className="text-[10px] font-black text-slate-800 bg-white border shadow-sm px-1 rounded mb-1">{count}</span>
                    <div className={`w-6 rounded-t-sm shadow-md transition-all duration-300 hover:scale-105 border-r-[5px] border-b border-black/10 ${colorsList[colorIdx]}`} 
                         style={{ height: `${(count / reportData.maxDeptVal) * 70}%` }}></div>
                    <span className="text-[9px] font-black text-slate-500 truncate max-w-[45px] text-center uppercase tracking-tighter mt-1" title={dept}>{dept}</span>
                  </div>
                );
              })}
            </div>
            <div className="text-center text-[10px] font-black uppercase text-slate-400 tracking-wider mt-1.5">Department</div>
          </div>

          {/* 2. Tickets Volume by Week Timeline */}
          <div className="border border-slate-300 bg-white p-5 shadow-md rounded-sm flex flex-col justify-between min-h-[300px]">
            <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider border-b pb-2 mb-4">Tickets Volume by Week Timeline</h3>
            <div className="relative h-56 border-b-2 border-l-2 border-slate-400 bg-slate-50/40 p-4 pl-14 pr-6 flex items-end justify-between overflow-x-auto no-scrollbar">
              
              <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-none z-20">
                <span className="-rotate-90 text-[10px] font-black uppercase text-slate-400 tracking-wider whitespace-nowrap block text-center w-full">
                  Tickets
                </span>
              </div>

              {/* Horizontal Major Gridlines */}
              <div className="absolute inset-y-0 left-12 right-0 top-0 border-t border-slate-200 pointer-events-none"></div>
              <div className="absolute inset-y-0 left-12 right-0 top-1/4 border-t border-slate-200 pointer-events-none"></div>
              <div className="absolute inset-y-0 left-12 right-0 top-2/4 border-t border-slate-200 pointer-events-none"></div>
              <div className="absolute inset-y-0 left-12 right-0 top-3/4 border-t border-slate-200 pointer-events-none"></div>

              {/* Connected Line Path Layer via SVG Engine */}
              <div className="absolute inset-y-0 left-16 right-16 top-6 bottom-8 pointer-events-none z-10">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" overflow="visible">
                  {timelineSortedData.length > 0 && (
                    <polyline
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={timelineSortedData.map(([_, count], idx) => {
                        const totalElements = timelineSortedData.length;
                        const xPosition = totalElements > 1 ? (idx / (totalElements - 1)) * 100 : 50;
                        const yPosition = 100 - (count / reportData.maxWeeklyVal) * 70;
                        return `${xPosition},${yPosition}`;
                      }).join(' ')}
                    />
                  )}
                </svg>
              </div>

              {/* Render Interactive Indicator Dots over the Linked Vector Lines */}
              <div className="absolute inset-y-0 left-16 right-16 top-6 bottom-8 flex justify-between items-end z-20">
                {timelineSortedData.map(([week, count], idx) => {
                  const nodeDotsColors = ['from-pink-500 to-rose-600', 'from-amber-400 to-orange-500', 'from-emerald-400 to-teal-600', 'from-sky-400 to-indigo-600'];
                  return (
                    <div key={week} className="flex flex-col items-center justify-end relative h-full w-0 overflow-visible">
                      <div className="absolute text-[10px] font-black text-blue-950 bg-white border px-1.5 py-0.2 rounded shadow-sm z-30" style={{ bottom: `calc(${(count / reportData.maxWeeklyVal) * 70}% + 14px)` }}>{count}</div>
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-br border-2 border-white shadow-md hover:scale-125 transition duration-150 z-30 absolute -translate-x-1/2 ${nodeDotsColors[idx % nodeDotsColors.length]}`} style={{ bottom: `calc(${(count / reportData.maxWeeklyVal) * 70}% - 8px)`, left: '0px' }}></div>
                      <span className="text-[9px] font-black text-slate-500 tracking-tighter uppercase font-mono absolute top-[102%] -translate-x-1/2 whitespace-nowrap">{week}</span>
                    </div>
                  );
                })}
              </div>

              {timelineSortedData.length === 0 && <div className="text-xs text-slate-400 italic py-10 w-full text-center z-10">No trend trajectory logged.</div>}
            </div>
            <div className="text-center text-[10px] font-black uppercase text-slate-400 tracking-wider mt-1.5">Week</div>
          </div>

          {/* 3. Active Tickets by Age (🛠️ RESTORED TO SOLID BLUE GRADIENT STYLE) */}
          <div className="border border-slate-300 bg-white p-5 shadow-md rounded-sm flex flex-col justify-between min-h-[300px]">
            <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider border-b pb-2 mb-4">Active Tickets by Age</h3>
            <div className="relative h-56 border-b-2 border-l-2 border-slate-400 bg-slate-50/40 p-4 pl-14 flex items-end justify-around z-10">
              
              <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-none z-20">
                <span className="-rotate-90 text-[10px] font-black uppercase text-slate-400 tracking-wider whitespace-nowrap block text-center w-full">
                  Active Tickets
                </span>
              </div>

              {/* Horizontal Major Gridlines */}
              <div className="absolute inset-y-0 left-12 right-0 top-0 border-t border-slate-200 pointer-events-none"></div>
              <div className="absolute inset-y-0 left-12 right-0 top-1/4 border-t border-slate-200 pointer-events-none"></div>
              <div className="absolute inset-y-0 left-12 right-0 top-2/4 border-t border-slate-200 pointer-events-none"></div>
              <div className="absolute inset-y-0 left-12 right-0 top-3/4 border-t border-slate-200 pointer-events-none"></div>

              {Object.entries(reportData.ageMap).map(([bucket, count]) => (
                <div key={bucket} className="flex flex-col items-center gap-1 h-full justify-end group relative w-12 z-10 ml-6">
                  <span className="text-[11px] font-black text-slate-800 bg-white border shadow-sm px-1.5 py-0.2 rounded mb-1">{count}</span>
                  {/* 🛠️ GRADIENT RESTORED: Ginawang asul ang lahat ng bar para sumunod sa inyong bagong instruction */}
                  <div className="w-12 rounded-t-sm shadow-md transition-all duration-300 bg-gradient-to-t from-blue-600 to-sky-400 border-r-4 border-b border-black/10 hover:scale-105" 
                       style={{ height: `${reportData.maxAgeVal > 0 ? (count / reportData.maxAgeVal) * 75 : 0}%` }}></div>
                  <span className="text-[9px] font-black text-slate-500 tracking-tighter uppercase font-mono mt-1 whitespace-nowrap">{bucket}</span>
                </div>
              ))}
            </div>
            <div className="text-center text-[10px] font-black uppercase text-slate-400 tracking-wider mt-1.5">Age Group</div>
          </div>

          {/* ================= ROW 2 ================= */}

          {/* 4. Ticket Status Breakdown */}
          <div className="border border-slate-300 bg-white p-5 shadow-md rounded-sm flex flex-col justify-between min-h-[300px]">
            <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider border-b pb-2 mb-4">Ticket Status Breakdown</h3>
            <div className="flex flex-col items-center justify-center gap-4 flex-1 w-full mx-auto pb-1 text-center">
              
              <div className="flex justify-center items-center w-full py-2">
                <div className="w-48 h-48 rounded-full shadow-xl flex items-center justify-center relative transition-transform duration-300 hover:scale-105 border-4 border-slate-100"
                     style={{
                       background: `conic-gradient(
                         #ef4444 0deg ${reportData.breakdown.regPct * 3.6}deg, 
                         #3b82f6 ${reportData.breakdown.regPct * 3.6}deg ${(reportData.breakdown.regPct + reportData.breakdown.assPct) * 3.6}deg, 
                         #f97316 ${(reportData.breakdown.regPct + reportData.breakdown.assPct) * 3.6}deg ${(reportData.breakdown.regPct + reportData.breakdown.assPct + reportData.breakdown.wipPct) * 3.6}deg, 
                         #22c55e ${(reportData.breakdown.regPct + reportData.breakdown.assPct + reportData.breakdown.wipPct) * 3.6}deg ${(reportData.breakdown.regPct + reportData.breakdown.assPct + reportData.breakdown.wipPct + reportData.breakdown.compPct) * 3.6}deg,
                         #15803d ${(reportData.breakdown.regPct + reportData.breakdown.assPct + reportData.breakdown.wipPct + reportData.breakdown.compPct) * 3.6}deg 360deg
                       )`
                     }}
                >
                  <div className="w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center shadow-inner border border-slate-100">
                    <span className="text-xl font-black text-slate-800">{reportData.total}</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Total</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] font-bold grid grid-cols-2 gap-x-4 gap-y-1.5 text-slate-600 w-full px-2 pt-2 border-t border-dashed">
                <div onClick={() => setSelectedScorecardFilter('Registered')} className="flex items-center gap-1.5 cursor-pointer hover:underline">
                  <span className="w-2.5 h-3 bg-[#ef4444] inline-block rounded-sm"></span>
                  <span className="truncate">Registered: <strong className="text-slate-900">{reportData.breakdown.registered}</strong> ({Math.round(reportData.breakdown.regPct)}%)</span>
                </div>
                <div onClick={() => setSelectedScorecardFilter('Assigned')} className="flex items-center gap-1.5 cursor-pointer hover:underline">
                  <span className="w-2.5 h-3 bg-[#3b82f6] inline-block rounded-sm"></span>
                  <span className="truncate">Open: <strong className="text-slate-900">{reportData.breakdown.assigned}</strong> ({Math.round(reportData.breakdown.assPct)}%)</span>
                </div>
                <div onClick={() => setSelectedScorecardFilter('Work in Progress')} className="flex items-center gap-1.5 cursor-pointer hover:underline">
                  <span className="w-2.5 h-3 bg-[#f97316] inline-block rounded-sm"></span>
                  <span className="truncate">In Progress: <strong className="text-slate-900">{reportData.breakdown.inProgress}</strong> ({Math.round(reportData.breakdown.wipPct)}%)</span>
                </div>
                <div onClick={() => setSelectedScorecardFilter('Completed')} className="flex items-center gap-1.5 cursor-pointer hover:underline">
                  <span className="w-2.5 h-3 bg-[#22c55e] inline-block rounded-sm"></span>
                  <span className="truncate">Resolved: <strong className="text-slate-900">{reportData.breakdown.completed}</strong> ({Math.round(reportData.breakdown.compPct)}%)</span>
                </div>
                <div onClick={() => setSelectedScorecardFilter('Closed')} className="flex items-center gap-1.5 cursor-pointer hover:underline col-span-2 justify-center border-t pt-1">
                  <span className="w-3.5 h-3 bg-[#15803d] inline-block rounded-sm"></span>
                  <span className="truncate">Closed: <strong className="text-slate-900">{reportData.breakdown.closed}</strong> ({Math.round(reportData.breakdown.clsPct)}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Tickets by Priority */}
          <div className="border border-slate-300 bg-white p-5 shadow-md rounded-sm flex flex-col justify-between min-h-[280px]">
            <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider">Tickets by Priority</h3>
            <div className="relative h-56 p-4 flex flex-col justify-center gap-y-3.5">
              
              <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-none z-20">
                <span className="-rotate-90 text-[10px] font-black uppercase text-slate-400 tracking-wider whitespace-nowrap block text-center w-full">
                  Priority
                </span>
              </div>

              {Object.entries(reportData.priorityMap).map(([priority, count]) => {
                const priorityColors = { 
                  Critical: 'from-red-600 to-red-400 border-red-700', 
                  High: 'from-cyan-600 to-cyan-400 border-cyan-700', 
                  Moderate: 'from-blue-600 to-blue-400 border-blue-700', 
                  Low: 'from-orange-500 to-orange-400 border-orange-600' 
                };
                const barStyles = priorityColors[priority as keyof typeof priorityColors] || 'from-slate-500 to-slate-400 border-slate-600';
                
                return (
                  <div key={priority} className="flex flex-col gap-1 w-full shadow-sm pl-8">
                    <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase">
                      <span>{priority}</span>
                      <span className="text-slate-900 font-mono font-black">{count}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-5 rounded-sm overflow-hidden border border-slate-200 relative shadow-inner">
                      <div className={`h-full transition-all duration-500 flex items-center justify-end pr-2 bg-gradient-to-r border-r-[5px] border-black/10 ${barStyles}`} 
                           style={{ width: `${reportData.maxPriorityVal > 0 ? (count / reportData.maxPriorityVal) * 100 : 0}%` }}>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-center text-[10px] font-black uppercase text-slate-400 tracking-wider mt-2">Tickets</div>
          </div>

          {/* 6. Top Performers (Resolved Tickets) */}
          <div className="border border-slate-300 bg-white p-5 shadow-md rounded-sm flex flex-col justify-between min-h-[280px]">
            <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider border-b pb-2 mb-3">Top Performers (Resolved Tickets)</h3>
            <div className="relative h-56 p-4 flex flex-col justify-center gap-y-3.5">
              
              <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center pointer-events-none z-20">
                <span className="-rotate-90 text-[10px] font-black uppercase text-slate-400 tracking-wider whitespace-nowrap block text-center w-full">
                  Assignee
                </span>
              </div>

              {reportData.topResolvers.map((resolver: [string, number], idx) => {
                const name = resolver[0];
                const val = resolver[1];
                const performerBarColors = ['from-blue-600 to-sky-400', 'from-orange-500 to-amber-400', 'from-emerald-600 to-teal-400', 'from-purple-600 to-fuchsia-400'];

                return (
                  <div key={name} className="flex flex-col gap-1 w-full animate-fadeIn shadow-sm pl-8">
                    <div className="flex justify-between text-[10px] font-black text-slate-600">
                      <span className="truncate max-w-[200px]" title={name}>{name}</span>
                      <span className="text-blue-900 font-mono font-black">{val}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-5 rounded-sm overflow-hidden border border-slate-200 relative shadow-inner">
                      <div className={`h-full transition-all duration-500 flex items-center justify-end pr-2 bg-gradient-to-r border-r-[5px] border-black/10 shadow-sm ${performerBarColors[idx % performerBarColors.length]}`} 
                           style={{ width: `${reportData.maxResolverVal > 0 ? (val / reportData.maxResolverVal) * 100 : 0}%` }}>
                      </div>
                    </div>
                  </div>
                );
              })}
              {reportData.topResolvers.length === 0 && <div className="text-xs text-slate-400 text-center py-10 italic">No resource assignment logs.</div>}
            </div>
            <div className="text-center text-[10px] font-black uppercase text-slate-400 tracking-wider mt-2">Resolved Tickets</div>
          </div>

        </section>

        {/* ROW 4: LIVE DATABASE TICKET DATA ROW TREE QUEUE */}
        <section className="border border-slate-300 bg-white p-5 shadow-md rounded-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-md font-bold text-blue-900 uppercase tracking-tight">
                  {dashboardViewMode === 'master-data' ? '📦 Master Data Enrollment Queue' : '🔴 SAP Concerns/Issues Queue'}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Click any unique Record ID link to trigger tracking layout sheets.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {dashboardViewMode === 'master-data' && (
                <select value={masterDataSubFilter} onChange={(e) => { setSelectedScorecardFilter('ALL'); setMasterDataSubFilter(e.target.value as any); }} className="rounded border-2 border-emerald-600 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-900 outline-none">
                  <option value="ALL">📋 View All Master Data</option>
                  <option value="NON-FOOD">📦 Non-Food & Services</option>
                  <option value="BAKERY">🍞 Bakery / Commi Items</option>
                  <option value="SUPPLIER">🤝 Supplier Master Ledger</option>
                </select>
              )}
              <input type="text" placeholder="Search records..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="rounded border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800 outline-none w-48 sm:w-60 focus:border-blue-900" />
              <button onClick={exportTicketsToCSV} disabled={filteredTickets.length === 0} className={`rounded px-3 py-1 text-xs font-bold text-white transition ${filteredTickets.length === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-emerald-700 hover:bg-emerald-600 shadow-sm'}`}>📥 Export to Excel (CSV)</button>
              <button onClick={fetchDashboardData} className="rounded bg-blue-900 px-3 py-1 text-xs font-bold text-white hover:bg-blue-800 transition">Reload Pipeline</button>
            </div>
          </div>

          <div className="w-full overflow-x-auto border border-slate-200 rounded-sm shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-4 py-3">Incident ID</th>
                  <th className="px-4 py-3">Requester Employee</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Workflow State</th>
                  <th className="px-4 py-3">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-semibold">Loading live tracking pipelines...</td></tr>
                ) : filteredTickets.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">No active records parsed inside this operational view.</td></tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-bold text-blue-900">
                        <a href={`/admin/tickets/${ticket.id}`} className="hover:underline block tracking-tight">{ticket.ticket_number}</a>
                        <div className="flex items-center gap-1 mt-1">
                          {(ticket.short_description?.toUpperCase().includes('NON-FOOD') || ticket.short_description?.toUpperCase().includes('ENROLLMENT')) && <span className="bg-purple-100 text-purple-800 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">Non-Food</span>}
                          {ticket.short_description?.toUpperCase().includes('MANU') && <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">Bakery/Manu</span>}
                          {ticket.short_description?.toUpperCase().includes('SUPPLIER') && <span className="bg-blue-100 text-blue-800 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">Supplier</span>}
                        </div>
                        <span className="block text-[10px] font-normal text-slate-400 truncate max-w-[240px] mt-1">{ticket.short_description}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{ticket.requestor_name}</div>
                        <div className="text-[10px] text-slate-400">{ticket.requestor_email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${ticket.priority === 'Critical' ? 'bg-rose-100 text-rose-700' : ticket.priority === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{ticket.priority}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-600">{ticket.department || (ticket as any).location}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-xl px-2.5 py-0.5 text-[10px] font-black tracking-wide ring-1 ${ticket.status === 'Closed' ? 'bg-red-50 text-red-700 ring-red-600/10' : ticket.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10' : ticket.status === 'Work in Progress' ? 'bg-sky-50 text-sky-700 ring-sky-600/10' : 'bg-slate-100 text-slate-700 ring-slate-600/10'}`}>{ticket.status}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-400">{ticket.created_at ? new Date(ticket.created_at).toLocaleString() : '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </main>
  );
}
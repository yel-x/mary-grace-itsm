'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

// 🚀 IDINAGDAG ANG 'Raised to APPTech' LIFECYCLE STATE SA OPERATIONAL MATRICES
const orderedStatuses = ['Registered', 'Assigned', 'Work in Progress', 'Raised to APPTech', 'Completed', 'Closed'];

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

export default function AdminDashboard() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State variables para sa Authentication Security Wall
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Suriin ang auth token kapag nag-load ang application
  useEffect(() => {
    const token = window.localStorage.getItem('itsm-admin-token');
    if (token) {
      setIsAuthenticated(true);
      void fetchDashboardData();
    } else {
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, []);

  // Login handler routine para sa login panel entry box
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
      setLoginError('Invalid administrative user credentials or matching token sequence verification failed.');
    }
  };

  // 🧠 CORE TELEMETRY COMPUTATION (SAP MG PROGRESS METRICS ENGINE)
  const reportData = useMemo(() => {
    const total = tickets.length;
    const resolved = tickets.filter(t => t.status === 'Completed' || t.status === 'Closed').length;
    const open = tickets.filter(t => t.status === 'Assigned').length; 
    const registered = tickets.filter(t => t.status === 'Registered').length;
    
    const onHold = 0;
    // 🎗️ DYNAMIC COUNTER FIX: Binabasa na rito ang totoong dami ng mga incident files na may APPTech status tag
    const raisedToAppTech = tickets.filter(t => t.status === 'Raised to APPTech').length;
    const raisedToSap = 0;

    const deptMap: Record<string, number> = {};
    const resolverMap: Record<string, number> = {};
    const priorityMap = { Critical: 0, High: 0, Moderate: 0, Low: 0 };
    
    let slaCompliant = 0;

    tickets.forEach(t => {
      const dept = t.department || (t as any).location || 'Not Specified';
      deptMap[dept] = (deptMap[dept] || 0) + 1;

      if (t.assigned_to && (t.status === 'Completed' || t.status === 'Closed')) {
        resolverMap[t.assigned_to] = (resolverMap[t.assigned_to] || 0) + 1;
      }

      if (t.priority in priorityMap) {
        priorityMap[t.priority as keyof typeof priorityMap]++;
      }

      const isDone = t.status === 'Completed' || t.status === 'Closed';
      const rawDiff = Date.now() - new Date(t.created_at || Date.now()).getTime();
      const hoursElapsed = rawDiff > 0 ? rawDiff / (1000 * 60 * 60) : 0;
      
      if (isDone) {
        slaCompliant++;
      } else {
        let isBreached = false;
        if (t.priority === 'Critical' && hoursElapsed > 4) isBreached = true;
        if (t.priority === 'High' && hoursElapsed > 24) isBreached = true;
        if (t.priority === 'Moderate' && hoursElapsed > 72) isBreached = true;
        if (t.priority === 'Low' && hoursElapsed > 120) isBreached = true;
        
        if (!isBreached) slaCompliant++;
      }
    });

    const slaComplianceRate = total > 0 ? Math.round((slaCompliant / total) * 100) : 100;
    const maxDeptVal = Math.max(...Object.values(deptMap), 1);

    return {
      total, resolved, open, registered, onHold, raisedToAppTech, raisedToSap,
      priorityMap,
      deptMap,
      maxDeptVal,
      topResolvers: Object.entries(resolverMap).sort((a, b) => b[1] - a[1]).slice(0, 4),
      slaComplianceRate
    };
  }, [tickets]);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus = filterStatus === 'All Statuses' || ticket.status === filterStatus;
    const matchesSearch = 
      (ticket.ticket_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.requestor_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.short_description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // 1️⃣ KUNG NAGLO-LOAD PA ANG INITIAL PIPELINES
  if (loading && !isAuthenticated) {
    return <div className="min-h-screen bg-[#fcfcf9] flex items-center justify-center text-sm font-semibold text-slate-400">Verifying security configuration manifest...</div>;
  }

  // 2️⃣ KUNG WALANG AUTHENTICATION TOKEN (IPAKITA ANG BRANDED LOGIN PANEL)
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#fcfcf9] flex items-center justify-center p-4 font-sans text-slate-800">
        <div className="w-full max-w-sm bg-white border border-slate-300 p-6 shadow-md rounded">
          <div className="flex flex-col items-center gap-3 border-b-2 border-[#800000] pb-4 mb-5 text-center">
            <img src="/mary-grace-logo.jpeg" alt="Mary Grace Logo" className="w-24 h-16 object-contain rounded" />
            <div>
              <span className="text-[9px] font-black tracking-widest text-slate-400 block uppercase">ITSM CONTROL CONSOLE</span>
              <h2 className="text-lg font-black text-[#800000] uppercase mt-0.5">Admin Authentication</h2>
            </div>
          </div>
          
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-semibold">
            {loginError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded leading-tight">
                ⚠️ {loginError}
              </div>
            )}
            <div>
              <label className="block text-slate-500 mb-1 uppercase font-bold text-[10px]">Administrative Account Name</label>
              <input 
                type="text" 
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="e.g., admin"
                className="w-full rounded border border-slate-300 p-2 font-medium outline-none focus:border-[#800000] text-slate-800 bg-slate-50"
                required
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1 uppercase font-bold text-[10px]">Secure Key Access Password</label>
              <input 
                type="password" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded border border-slate-300 p-2 font-medium outline-none focus:border-[#800000] text-slate-800 bg-slate-50"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-[#800000] text-white font-bold py-2 px-4 rounded shadow-sm hover:bg-[#600000] transition text-center uppercase tracking-wider mt-2"
            >
              Verify Credentials
            </button>
          </form>
        </div>
      </main>
    );
  }

  // 3️⃣ KUNG AUTHENTICATED NA (IPAKITA ANG BUONG TELEMETRY DASHBOARD)
  return (
    <main className="min-h-screen bg-[#fcfcf9] p-4 lg:p-6 text-slate-800 font-sans">
      <div className="mx-auto max-w-[1650px] flex flex-col gap-5">
        
        {/* TOP COMPONENT: APP BRANDING HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b-4 border-[#800000] pb-3">
          <div className="flex items-center gap-4 w-full justify-between">
            <div className="flex items-center gap-4">
              <img src="/mary-grace-logo.jpeg" alt="Mary Grace Logo" className="w-28 h-20 object-contain rounded" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1e3f20]">MARY GRACE • ITSM OPERATIONS PORTAL</span>
                <h1 className="text-xl font-black text-[#800000] tracking-tight uppercase">SAP MG Ticketing System</h1>
                <p className="text-xs italic text-slate-500">What's <span className="underline font-bold text-[#800000]">SAP</span>? Mary Grace.</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3 sm:mt-0 justify-center">
              <a href="/" className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold shadow-sm hover:bg-slate-50 transition">User Portal</a>
              <button
                onClick={() => {
                  window.localStorage.removeItem('itsm-admin-token');
                  setIsAuthenticated(false);
                  setTickets([]);
                }}
                className="rounded bg-slate-900 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* 📊 ROW 1: THE ACCURATE METRICS SCORECARD GRID BAR */}
        <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="border border-slate-400 bg-white text-center p-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase text-blue-900">Total Tickets</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{reportData.total}</p>
          </div>
          <div className="border border-slate-400 bg-white text-center p-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase text-blue-900">Resolved</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{reportData.resolved}</p>
          </div>
          <div className="border border-slate-400 bg-[#f4dcd6] text-center p-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase text-blue-900">New (Registered)</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{reportData.registered}</p>
          </div>
          <div className="border border-slate-400 bg-white text-center p-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase text-blue-900">Open</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{reportData.open}</p>
          </div>
          <div className="border border-slate-400 bg-white text-center p-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase text-blue-900">In Progress</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{tickets.filter(t => t.status === 'Work in Progress').length}</p>
          </div>
          <div className="border border-slate-400 bg-white text-center p-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase text-blue-900">Cancelled/OnHold</p>
            <p className="text-3xl font-black text-slate-400 mt-1">{reportData.onHold}</p>
          </div>
          {/* 🎯 WORKING LOGIC WIDGET: Matagumpay nang nakakabit sa metrics block layout ang Raised to APPTech scorecard */}
          <div className="border border-slate-400 bg-white text-center p-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase text-blue-900">Raised to APPTech</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{reportData.raisedToAppTech}</p>
          </div>
          <div className="border border-slate-400 bg-white text-center p-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase text-blue-900">Overall SLA Compliance</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{reportData.slaComplianceRate}%</p>
          </div>
        </section>

        {/* 🌟 ROW 2: GRAPHICAL DISTRIBUTION MATRIX CHARTS PANEL */}
        <section className="grid gap-4 md:grid-cols-3">
          
          {/* CHART A: Tickets by Department (Color-Coded Edition) */}
          <div className="border border-slate-300 bg-white p-4 shadow-sm flex flex-col justify-between">
            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider border-b pb-1.5 mb-4">Tickets by Department</h3>
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {Object.entries(reportData.deptMap).map(([dept, count]) => {
                const colorsPool = ['#a855f7', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ca8a04', '#d97706', '#ec4899', '#f43f5e', '#14b8a6', '#6366f1', '#84cc16', '#f43f5e', '#ec4899', '#14b8a6'];
                const charSum = dept.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                const assignedColor = colorsPool[charSum % colorsPool.length];

                return (
                  <div key={dept} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-600">
                      <span>{dept}</span>
                      <span className="text-blue-900 font-black">{count}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-4 rounded overflow-hidden">
                      <div 
                        className="h-full transition-all duration-500" 
                        style={{ 
                          width: `${(count / reportData.maxDeptVal) * 100}%`,
                          backgroundColor: assignedColor 
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {Object.keys(reportData.deptMap).length === 0 && <div className="text-xs text-slate-400 italic py-6 text-center">No structural logs populated.</div>}
            </div>
          </div>

          {/* CHART B: Ticket Status Breakdown */}
          <div className="border border-slate-300 bg-white p-4 shadow-sm flex flex-col justify-between">
            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider border-b pb-1.5 mb-3">Ticket Status Breakdown</h3>
            <div className="flex items-center justify-center py-4 relative">
              <div 
                className="w-32 h-32 rounded-full flex items-center justify-center shadow-inner"
                style={{
                  background: `conic-gradient(#22c55e 0% ${reportData.total > 0 ? (reportData.resolved / reportData.total) * 360 : 0}deg, #3b82f6 ${reportData.total > 0 ? (reportData.resolved / reportData.total) * 360 : 0}deg ${reportData.total > 0 ? ((reportData.resolved + reportData.open) / reportData.total) * 360 : 0}deg, #ef4444 ${reportData.total > 0 ? ((reportData.resolved + reportData.open) / reportData.total) * 360 : 0}deg 360deg)`
                }}
              >
                <div className="w-20 h-24 bg-white rounded-full flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-slate-900">{reportData.total}</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">Active</span>
                </div>
              </div>
            </div>
            <div className="flex justify-around text-[10px] font-black border-t pt-2">
              <span className="text-emerald-600">● Resolved ({reportData.resolved})</span>
              <span className="text-sky-600">● Open ({reportData.open})</span>
              <span className="text-red-500">● New ({reportData.registered})</span>
            </div>
          </div>

          {/* CHART C: Top Performers */}
          <div className="border border-slate-300 bg-white p-4 shadow-sm">
            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider border-b pb-1.5 mb-3">Top Performers (Resolved Tickets)</h3>
            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {reportData.topResolvers.map(([name, val], idx) => (
                <div key={name} className="flex flex-col gap-1 bg-slate-50 p-2 border border-slate-200 rounded">
                  <div className="flex justify-between text-[11px] font-bold text-slate-700">
                    <span>{idx + 1}. {name}</span>
                    <span className="text-blue-900 font-black">{val} Cases Fixed</span>
                  </div>
                  <div className="w-full bg-slate-200 h-3 rounded overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-400 to-orange-500 h-full" style={{ width: `${(val / (reportData.topResolvers[0]?.[1] || 1)) * 100}%` }}></div>
                  </div>
                </div>
              ))}
              {reportData.topResolvers.length === 0 && <div className="text-xs text-slate-400 text-center py-10 italic">No historical completion data stored yet.</div>}
            </div>
          </div>

        </section>

        {/* 🌟 ROW 3: MONTHLY RESOLUTION TREND MATRIX */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 border border-slate-300 bg-white p-4 shadow-sm">
            <div className="border-b pb-1.5 mb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider">Total Resolved and Unresolved Tickets by Month</h3>
              <div className="flex gap-3 text-[10px] font-bold">
                <span className="text-amber-500">—— Resolved</span>
                <span className="text-sky-500">—— Unresolved</span>
              </div>
            </div>
            <div className="h-28 flex items-end justify-between border-b border-l border-slate-300 relative px-4 pt-4 font-mono text-[9px] font-bold text-slate-400">
              <div className="w-full flex justify-between items-end h-full z-10 px-1">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m) => (
                  <div key={m} className="h-full border-r border-dashed border-slate-100 relative flex flex-col justify-between items-center w-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute top-4 shadow"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-500 absolute bottom-6 shadow"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase mt-1 px-4">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
            </div>
          </div>

          <div className="border border-slate-300 bg-white p-4 shadow-sm flex flex-col justify-between">
            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider border-b pb-1.5 mb-2">SLA Performance by Priority Target</h3>
            <div className="space-y-2 text-[11px] font-medium">
              <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded border border-slate-200">
                <span className="font-bold text-rose-600">🔴 Critical Target</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded font-bold border">4 Hours Max</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded border border-slate-200">
                <span className="font-bold text-amber-600">🟠 High Target</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded font-bold border">24 Hours (1 Day)</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded border border-slate-200">
                <span className="font-bold text-sky-600">🟡 Moderate Target</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded font-bold border">72 Hours (3 Days)</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded border border-slate-200">
                <span className="font-bold text-slate-500">🟢 Low Target</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded font-bold border">120 Hours (5 Days)</span>
              </div>
            </div>
          </div>
        </section>

        {/* 🌟 ROW 4: DATA EXECUTION TABLE QUEUE SYSTEM */}
        <section className="border border-slate-300 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
            <div>
              <h2 className="text-md font-bold text-blue-900 uppercase tracking-tight">Live Incident Record Queue</h2>
              <p className="text-xs text-slate-500 mt-0.5">Click any unique Record ID link to trigger changelog updates or re-open modules.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <input 
                type="text"
                placeholder="Search code or requester..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800 outline-none w-48 sm:w-60 focus:border-blue-900"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-800 outline-none focus:border-blue-900"
              >
                <option value="All Statuses">All Statuses</option>
                {orderedStatuses.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
              <button 
                onClick={fetchDashboardData}
                className="rounded bg-blue-900 px-3 py-1 text-xs font-bold text-white hover:bg-blue-800 transition"
              >
                Reload Pipeline
              </button>
            </div>
          </div>

          <div className="w-full overflow-x-auto border border-slate-200 rounded shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-4 py-3">Incident ID</th>
                  <th className="px-4 py-3">Requester Employee</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Assigned Team</th>
                  <th className="px-4 py-3">Workflow State</th>
                  <th className="px-4 py-3">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-semibold animate-pulse">Loading live tracking pipelines...</td></tr>
                ) : filteredTickets.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">No operational records found.</td></tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-bold text-blue-900">
                        <a href={`/admin/tickets/${ticket.id}`} className="hover:underline block tracking-tight">
                          {ticket.ticket_number}
                        </a>
                        <span className="block text-[10px] font-normal text-slate-400 truncate max-w-[200px] mt-0.5">{ticket.short_description || (ticket as any).description || '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{ticket.requestor_name || '-'}</div>
                        <div className="text-[10px] text-slate-400">{ticket.requestor_email || '-'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider
                          ${ticket.priority === 'Critical' ? 'bg-rose-100 text-rose-700' :
                            ticket.priority === 'High' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-600'}`}
                        >
                          {ticket.priority || 'Moderate'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-600">{ticket.department || (ticket as any).location || 'Not Specified'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-xl px-2.5 py-0.5 text-[10px] font-black tracking-wide ring-1
                          ${ticket.status === 'Closed' ? 'bg-red-50 text-red-700 ring-red-600/10' : 
                            ticket.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10' :
                            ticket.status === 'Work in Progress' ? 'bg-sky-50 text-sky-700 ring-sky-600/10' :
                            ticket.status === 'Raised to APPTech' ? 'bg-purple-50 text-purple-700 ring-purple-600/10 font-bold' :
                            'bg-slate-100 text-slate-700 ring-slate-600/10'}`}
                        >
                          {ticket.status || 'Registered'}
                        </span>
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
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Video, 
  AlertTriangle, 
  CheckCircle, 
  User, 
  LogOut, 
  Bell, 
  Search,
  ChevronRight,
  Clock,
  MapPin,
  ShieldCheck,
  X,
  Activity,
  Filter,
  Download,
  Maximize2,
  Users,
  FileText,
  History,
  Settings as SettingsIcon,
  Monitor,
  Lock,
  KeyRound,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import LandingPage from './LandingPage';
import Monitoring from './pages/Monitoring';
import HistoryPage from './pages/History';
import Identities from './pages/Identities';
import Reports from './pages/Reports';
import SettingsPage from './pages/Settings';

// Mock Data
const MOCK_USERS = [
  {
    username: "superadmin",
    password: "admin123",
    name: "Super Admin",
    role: "superadmin",
    roleLabel: "Super Administrator",
    allowedTabs: ["home", "monitoring", "history", "identities", "reports", "settings"],
  },
  {
    username: "viewer",
    password: "viewer123",
    name: "Viewer",
    role: "viewer",
    roleLabel: "Viewer",
    allowedTabs: ["home", "monitoring"],
  },
];

const ROLE_PERMISSIONS = {
  superadmin: ["home", "monitoring", "history", "identities", "reports", "settings"],
  viewer: ["home", "monitoring"],
};

const MOCK_INCIDENTS = [
  { id: 1, time: '10:45:22', location: 'Area Produksi A', type: 'Helm Tidak Dipakai', status: 'Non-Compliance', detail: 'Pekerja terdeteksi tidak mengenakan helm pelindung di zona wajib.' },
  { id: 2, time: '10:30:15', location: 'Gudang Logistik', type: 'Baju Tidak Dimasukkan', status: 'Non-Compliance', detail: 'Seragam tidak rapi sesuai standar SOP poin 2.1.' },
  { id: 3, time: '10:12:05', location: 'Area Loading Dock', type: 'Sepatu Safety', status: 'Non-Compliance', detail: 'Penggunaan alas kaki tidak standar di area risiko tinggi.' },
  { id: 4, time: '09:55:40', location: 'Main Entrance', type: 'ID Card Hilang', status: 'Non-Compliance', detail: 'Karyawan masuk tanpa atribut tanda pengenal yang terlihat.' },
  { id: 5, time: '09:40:12', location: 'Area Produksi B', type: 'Masker Tidak Benar', status: 'Non-Compliance', detail: 'Masker diletakkan di dagu, tidak menutupi hidung dan mulut.' },
];

const MOCK_CCTV = [
  { id: 1, name: 'CCTV 01 - Produksi A', status: 'Online', detection: 'Active', incidentsToday: 12 },
  { id: 2, name: 'CCTV 02 - Gudang', status: 'Online', detection: 'Active', incidentsToday: 4 },
  { id: 3, name: 'CCTV 03 - Lobby Utama', status: 'Online', detection: 'Idle', incidentsToday: 2 },
  { id: 4, name: 'CCTV 04 - Kantin', status: 'Offline', detection: 'Inactive', incidentsToday: 0 },
];

const PIE_DATA = [
  { name: 'Patuh', value: 85, color: '#10B981' },
  { name: 'Tidak Patuh', value: 15, color: '#EF4444' },
];

const App = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  // Guard: jika tab tidak diizinkan untuk role, redirect ke home
  useEffect(() => {
    if (currentUser && !currentUser.allowedTabs.includes(activeTab)) {
      setActiveTab('home');
    }
  }, [currentUser, activeTab]);
  // Login View Component
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const LoginView = () => {
    const handleLogin = (e) => {
      e.preventDefault();
      const found = MOCK_USERS.find(
        (u) => u.username === loginUsername && u.password === loginPassword
      );
      if (found) {
        setCurrentUser(found);
        setLoginError('');
        setActiveTab('home');
      } else {
        setLoginError('Username atau password salah');
      }
    };

    const fillHint = (u) => {
      setLoginUsername(u.username);
      setLoginPassword(u.password);
      setLoginError('');
    };

    return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-slate-900 p-3 rounded-xl mb-4 text-white">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">VisionGuard AI</h1>
          <p className="text-slate-500 text-sm">Masuk untuk memantau kepatuhan SOP</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input
              type="text"
              required
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition"
              placeholder="Masukkan username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition"
              placeholder="Masukkan password"
            />
          </div>
          {loginError && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
              {loginError}
            </p>
          )}
          <button className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition shadow-lg mt-4">
            Masuk Sekarang
          </button>
        </form>

        <div className="mt-6 space-y-2">
          <p className="text-xs text-slate-400 text-center font-medium uppercase tracking-wider">Akun Demo — Klik untuk isi otomatis</p>
          <button
            onClick={() => fillHint(MOCK_USERS[0])}
            className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-blue-100 bg-blue-50 hover:border-blue-300 transition text-left"
          >
            <div className="bg-blue-500 p-2 rounded-lg text-white flex-shrink-0">
              <ShieldCheck size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-blue-900">Super Administrator</p>
              <p className="text-xs text-blue-500">superadmin / admin123 — Akses penuh semua fitur</p>
            </div>
          </button>
          <button
            onClick={() => fillHint(MOCK_USERS[1])}
            className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-green-100 bg-green-50 hover:border-green-300 transition text-left"
          >
            <div className="bg-green-500 p-2 rounded-lg text-white flex-shrink-0">
              <User size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-green-900">Viewer</p>
              <p className="text-xs text-green-500">viewer / viewer123 — Dashboard & Monitoring saja</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
  };

  // Main Dashboard View Component
  const DashboardView = () => (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <ShieldCheck className="text-emerald-400" />
          <span className="font-bold text-lg text-white">VisionGuard AI</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold px-3 pt-2 pb-1">Menu Utama</p>
          {currentUser?.allowedTabs.includes('home') && (
            <button
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === 'home' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800'}`}
            >
              <LayoutDashboard size={20} /> Dashboard
            </button>
          )}
          {currentUser?.allowedTabs.includes('monitoring') && (
            <button
              onClick={() => setActiveTab('monitoring')}
              className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === 'monitoring' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800'}`}
            >
              <Monitor size={20} /> Live Monitoring
            </button>
          )}
          {currentUser?.allowedTabs.includes('history') && (
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === 'history' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800'}`}
            >
              <AlertTriangle size={20} /> Riwayat Insiden
            </button>
          )}

          {currentUser?.allowedTabs.some(t => ['identities','reports'].includes(t)) && (
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold px-3 pt-4 pb-1">Manajemen</p>
          )}
          {currentUser?.allowedTabs.includes('identities') && (
            <button
              onClick={() => setActiveTab('identities')}
              className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === 'identities' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800'}`}
            >
              <Users size={20} /> Identitas Staff
            </button>
          )}
          {currentUser?.allowedTabs.includes('reports') && (
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === 'reports' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800'}`}
            >
              <FileText size={20} /> Laporan & Bukti
            </button>
          )}

          {currentUser?.allowedTabs.includes('settings') && (
            <>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold px-3 pt-4 pb-1">Sistem</p>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === 'settings' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800'}`}
              >
                <SettingsIcon size={20} /> Pengaturan
              </button>
            </>
          )}
        </nav>

        {/* User Info & Notification */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-center gap-3 px-3 py-2">
            <div className="bg-slate-700 p-1.5 rounded-full text-slate-400">
              <User size={14} />
            </div>
            <button className="relative text-slate-400 hover:text-white transition">
              <Bell size={16} />
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">3</span>
            </button>
          </div>
        </div>
        <div className="border-t border-slate-800 px-4 py-2">
          <button
            onClick={() => { setCurrentUser(null); setActiveTab('home'); }}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-rose-900/20 hover:text-rose-400 transition text-sm"
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-100">
        {/* Scrollable Area — content switches by activeTab */}
        <div className="flex-1 overflow-y-auto">

          {/* ========== HOME / DASHBOARD TAB ========== */}
          {activeTab === 'home' && (
            <div className="p-4 lg:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Dashboard Operasional</h2>
                  <p className="text-slate-500">Pantauan real-time kepatuhan seragam SOP AI.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 shadow-sm flex items-center gap-2">
                  <Clock size={16} /> Update terakhir: Baru saja
                </div>
              </div>

              {/* Top Row: Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-slate-100 p-3 rounded-xl text-slate-600">
                      <Search size={24} />
                    </div>
                    <span className="text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded">+12% vs Kemarin</span>
                  </div>
                  <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Deteksi (24 Jam)</h3>
                  <p className="text-3xl font-bold text-slate-900 mt-1">1.248</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-rose-100 p-3 rounded-xl text-rose-600">
                      <AlertTriangle size={24} />
                    </div>
                    <span className="text-rose-500 text-xs font-bold bg-rose-50 px-2 py-1 rounded">Meningkat</span>
                  </div>
                  <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Insiden Pelanggaran</h3>
                  <p className="text-3xl font-bold text-slate-900 mt-1">42</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
                      <CheckCircle size={24} />
                    </div>
                    <span className="text-slate-500 text-xs font-medium">Target 95%</span>
                  </div>
                  <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Tingkat Kepatuhan</h3>
                  <p className="text-3xl font-bold text-emerald-600 mt-1">85.4%</p>
                </div>
              </div>

              {/* Middle Row: Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Incidents Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 text-lg">Daftar Insiden Terbaru</h3>
                    {currentUser?.allowedTabs.includes('history') && (<button onClick={() => setActiveTab('history')} className="text-sm text-slate-600 hover:text-slate-900 font-medium underline">Lihat Semua</button>)}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                          <th className="px-6 py-4 font-semibold">Waktu</th>
                          <th className="px-6 py-4 font-semibold">Lokasi</th>
                          <th className="px-6 py-4 font-semibold">Jenis Pelanggaran</th>
                          <th className="px-6 py-4 font-semibold text-center">Tindakan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {MOCK_INCIDENTS.map((item) => (
                          <tr 
                            key={item.id} 
                            className="hover:bg-slate-50 cursor-pointer transition"
                            onClick={() => setSelectedIncident(item)}
                          >
                            <td className="px-6 py-4 text-sm font-medium text-slate-700">{item.time}</td>
                            <td className="px-6 py-4 text-sm text-slate-600 flex items-center gap-2">
                              <MapPin size={14} /> {item.location}
                            </td>
                            <td className="px-6 py-4">
                              <span className="bg-rose-100 text-rose-700 text-xs px-2.5 py-1 rounded-full font-semibold">
                                {item.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button className="text-slate-400 hover:text-slate-900">
                                <ChevronRight size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pie Chart Summary */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                  <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 text-lg">Persentase Kepatuhan</h3>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center p-6">
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={PIE_DATA}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {PIE_DATA.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-8 mt-4 w-full">
                      {PIE_DATA.map((item) => (
                        <div key={item.name} className="flex flex-col items-center">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-sm font-medium text-slate-700">{item.name}</span>
                          </div>
                          <span className="text-xl font-bold">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row: CCTV Status */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-900 text-lg mb-6 flex items-center gap-2">
                  <Video size={20} className="text-slate-500" /> Status CCTV & AI Deteksi
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {MOCK_CCTV.map((cam) => (
                    <div key={cam.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${cam.status === 'Online' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                        <span className="text-sm font-semibold text-slate-700">{cam.name}</span>
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${cam.status === 'Online' ? 'text-emerald-700 bg-emerald-100' : 'text-slate-500 bg-slate-200'}`}>
                        {cam.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========== LIVE MONITORING TAB ========== */}
          {activeTab === 'monitoring' && <Monitoring />}

          {/* ========== HISTORY / RIWAYAT INSIDEN TAB ========== */}
          {activeTab === 'history' && <HistoryPage />}

          {/* ========== IDENTITAS STAFF TAB ========== */}
          {activeTab === 'identities' && <Identities />}

          {/* ========== LAPORAN & BUKTI TAB ========== */}
          {activeTab === 'reports' && <Reports />}

          {/* ========== PENGATURAN TAB ========== */}
          {activeTab === 'settings' && <SettingsPage />}

        </div>

        {/* Modal: Incident Detail */}
        {selectedIncident && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-900">Rincian Pelanggaran</h3>
                <button 
                  onClick={() => setSelectedIncident(null)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-slate-100 aspect-video rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 group">
                    <Video className="text-slate-400 group-hover:scale-110 transition mb-2" size={48} />
                    <p className="text-slate-500 text-xs font-medium">Rekaman Bukti AI</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-wider">Waktu Kejadian</p>
                      <p className="text-sm font-semibold text-slate-800">{selectedIncident.time}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-wider">Lokasi Kamera</p>
                      <p className="text-sm font-semibold text-slate-800">{selectedIncident.location}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Jenis Deteksi</h4>
                    <span className="bg-rose-100 text-rose-700 px-3 py-1.5 rounded-lg text-sm font-bold inline-block border border-rose-200">
                      {selectedIncident.type}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Analisis AI</h4>
                    <p className="text-slate-700 leading-relaxed text-sm bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                      "{selectedIncident.detail}"
                    </p>
                  </div>
                  <div className="pt-4 flex gap-3">
                    <button className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition">
                      Validasi Insiden
                    </button>
                    <button className="px-4 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition">
                      Abaikan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );

  if (showLanding) {
    return <LandingPage onEnterApp={() => setShowLanding(false)} />;
  }

  return currentUser ? <DashboardView /> : <LoginView />;
};

export default App;
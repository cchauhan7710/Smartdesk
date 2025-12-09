import LogoutButton from "../components/LogoutButton";
import { useState, useEffect } from "react";

import {
  Clock3,
  CheckCircle2,
  Wrench,
  Plus,
  SunMedium,
  Moon,
  ClipboardList,
  FileText,
  Activity,
} from "lucide-react";

import axios from "axios";

export default function TechDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("assigned");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", priority: "Medium" });
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  const API = "http://localhost:5000";

  const getAuth = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`${API}/api/tickets/assigned/my`, getAuth());
      setTickets(res.data);
    } catch (err) {
      console.log("❌ Unable to fetch tickets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await axios.put(`${API}/api/tickets/${id}/status`, { status: newStatus }, getAuth());
      const updated = res.data;
      setTickets((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status: updated.status } : t))
      );
    } catch (err) {
      console.log("❌ Failed to update status", err);
    }
  };

  const createTicket = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/api/tickets`, form, getAuth());
      setShowForm(false);
      setForm({ title: "", description: "", priority: "Medium" });
      fetchTickets();
    } catch (err) {
      console.log("❌ Ticket creation failed", err);
    }
  };

  const technicianName = localStorage.getItem("name") || "Technician";

  return (
    <div
      className="min-h-screen flex text-gray-800 dark:text-gray-100 transition-all duration-700
                 bg-gradient-to-b from-[#f9fbff] via-white to-[#f5f9ff]
                 dark:from-gray-950 dark:via-black dark:to-gray-950 relative overflow-hidden"
    >

      {/* ===== SIDEBAR ===== */}
      <aside
        className="relative z-10 w-64 flex flex-col justify-between p-6 
                   bg-white/70 dark:bg-white/10 backdrop-blur-2xl 
                   border-r border-gray-200/70 dark:border-white/10 shadow-[0_0_25px_rgba(0,0,0,0.08)]"
      >
        <div>
          <h2 className="text-2xl font-extrabold mb-10 bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
            Technician Panel
          </h2>

          <nav className="space-y-2">
            <SidebarItem
              icon={<ClipboardList size={18} />}
              label="Assigned Tickets"
              active={activeTab === "assigned"}
              onClick={() => setActiveTab("assigned")}
            />

            <SidebarItem
              icon={<FileText size={18} />}
              label="Work Reports"
              active={activeTab === "reports"}
              onClick={() => setActiveTab("reports")}
            />

            <SidebarItem
              icon={<Activity size={18} />}
              label="Active Jobs"
              active={activeTab === "active"}
              onClick={() => setActiveTab("active")}
            />
          </nav>
        </div>

        <LogoutButton />
      </aside>

      {/* ===== MAIN ===== */}
      <main className="flex-1 p-10 relative z-10">

        {/* ===== HEADER ===== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10">
          <div>
            <h1 className="text-4xl font-extrabold mb-1 bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
              Welcome, {technicianName}
            </h1>
          </div>

          {/* Light/Dark Toggle */}
          <button
            onClick={() => setDark(!dark)}
            className="mt-5 sm:mt-0 p-3 rounded-full bg-white/80 dark:bg-white/10 
                       border border-gray-300 dark:border-white/10 hover:bg-blue-50 dark:hover:bg-white/20 
                       shadow-md transition-all duration-300"
          >
            {dark ? <SunMedium size={22} /> : <Moon size={22} />}
          </button>
        </div>

        {/* ===== STATS ===== */}
        <div className="grid sm:grid-cols-3 gap-6 mb-10">
          <TechCard
            title="Pending Tickets"
            value={tickets.filter((t) => t.status === "Pending").length}
            icon={<Clock3 />}
          />

          <TechCard
            title="Active Jobs"
            value={tickets.filter((t) => t.status === "In Progress").length}
            icon={<Wrench />}
          />

          <TechCard
            title="Resolved Issues"
            value={tickets.filter((t) => t.status === "Resolved").length}
            icon={<CheckCircle2 />}
          />
        </div>

        {/* ===== CREATE BUTTON ===== */}
        <button
          onClick={() => setShowForm(true)}
          className="mb-8 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 
                       hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl 
                       font-semibold flex items-center gap-2 shadow-[0_0_20px_rgba(80,160,255,0.2)] 
                       hover:scale-[1.03] transition-all duration-300"
        >
          <Plus /> Create Ticket
        </button>

        {/* ===== CREATE TICKET MODAL ===== */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white/80 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-700 
                            p-8 rounded-3xl w-[420px] shadow-md">
              <h2 className="text-2xl font-bold mb-5 flex items-center gap-2 bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">
                Create New Ticket <Plus />
              </h2>

              <form onSubmit={createTicket} className="space-y-4">
                <input
                  type="text"
                  placeholder="Ticket Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/70 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl"
                />

                <textarea
                  rows="3"
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/70 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl"
                />

                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full px-4 py-3 bg-white/70 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl"
                >
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl"
                  >
                    Submit
                  </button>

                  <button
                    onClick={() => setShowForm(false)}
                    type="button"
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2.5 rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===== ASSIGNED TICKETS TABLE ===== */}
        {activeTab === "assigned" && (
          <div className="bg-white/80 dark:bg-gray-900/80 p-8 rounded-3xl shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-blue-300 dark:to-indigo-400 bg-clip-text text-transparent">
              Assigned Tickets
            </h2>

            {loading ? (
              <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            ) : tickets.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No tickets found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border-collapse table-fixed">
                  <thead>
                    <tr className="border-b text-gray-700 dark:text-gray-300 bg-gray-100/70 dark:bg-gray-800/70">
                      <th className="pb-3 px-4 font-semibold w-1/3 text-left">Title</th>
                      <th className="pb-3 px-4 font-semibold w-1/6 text-left">Priority</th>
                      <th className="pb-3 px-4 font-semibold w-1/6 text-left">Status</th>
                      <th className="pb-3 px-4 font-semibold w-1/3 text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {tickets.map((t) => (
                      <tr key={t._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/80">
                        <td className="py-3 px-4 truncate">{t.title}</td>

                        <td className="px-4">
                          <Badge color={t.priority === "High" ? "red" : t.priority === "Medium" ? "orange" : "gray"}>
                            {t.priority}
                          </Badge>
                        </td>

                        <td className="px-4">
                          <Badge color={t.status === "Resolved" ? "green" : t.status === "Pending" ? "yellow" : "blue"}>
                            {t.status}
                          </Badge>
                        </td>

                        <td className="px-4 py-3 flex justify-center gap-2">
                          {/* <button
                            onClick={() => updateStatus(t._id, "In Progress")}
                            className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
                          >
                            Start
                          </button> */}

                          <button
                            onClick={() => updateStatus(t._id, "Resolved")}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                          >
                            Close
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

/* ===== SUB COMPONENTS ===== */

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`px-3 py-2 rounded-lg cursor-pointer font-medium flex items-center gap-3 transition-all duration-300 
      ${active
        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
        : "hover:bg-blue-100 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-white"}`}
    >
      {icon}
      {label}
    </div>
  );
}

function TechCard({ title, value, icon }) {
  return (
    <div className="bg-white/80 dark:bg-white/10 backdrop-blur-2xl p-6 rounded-2xl border border-gray-200/70 dark:border-white/10 shadow-md">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl text-xl">
          {icon}
        </div>
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{title}</p>
          <h2 className="text-2xl font-bold">{value}</h2>
        </div>
      </div>
    </div>
  );
}

function Badge({ color, children }) {
  const colors = {
    green: "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300",
    yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300",
    red: "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300",
    orange: "bg-orange-100 text-orange-700 dark:bg-orange-800 dark:text-orange-300",
    gray: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  };
  return <span className={`px-3 py-1 text-sm rounded-lg font-medium ${colors[color]}`}>{children}</span>;
}

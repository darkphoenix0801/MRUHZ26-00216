"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [studentRes, logRes] = await Promise.all([
          fetch("https://pado-backend-5kg8.onrender.com/admin/students"),
          fetch("https://pado-backend-5kg8.onrender.com/admin/logs")
        ]);

        if (studentRes.ok) setStudents(await studentRes.json());
        if (logRes.ok) setLogs(await logRes.json());
      } catch (err) {
        console.error("Failed to fetch admin data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50/50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
              <p className="mt-2 text-sm text-gray-500">Monitor all platform activity and registered students.</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-200">
                <span className="text-sm font-medium text-gray-500">Total Students</span>
                <p className="text-2xl font-bold text-indigo-600">{students.length}</p>
              </div>
              <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-gray-200">
                <span className="text-sm font-medium text-gray-500">Total Interviews</span>
                <p className="text-2xl font-bold text-emerald-600">{logs.length}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Students Table */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Registered Students</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs text-gray-500">
                      <th className="px-6 py-4 font-medium">Student ID</th>
                      <th className="px-6 py-4 font-medium">Name</th>
                      <th className="px-6 py-4 font-medium">CGPA</th>
                      <th className="px-6 py-4 font-medium">Target Company</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-700">
                    {loading ? (
                      <tr><td colSpan="4" className="px-6 py-4 text-center">Loading...</td></tr>
                    ) : students.length === 0 ? (
                      <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">No students registered yet.</td></tr>
                    ) : (
                      students.map((s, idx) => (
                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs">{s.student_id}</td>
                          <td className="px-6 py-4 font-medium text-gray-900">{s.name}</td>
                          <td className="px-6 py-4">{s.cgpa}</td>
                          <td className="px-6 py-4">
                            <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                              {s.target_company}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Activity Logs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Recent Activity Logs</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {loading ? (
                  <p className="text-center text-sm text-gray-500">Loading logs...</p>
                ) : logs.length === 0 ? (
                  <p className="text-center text-sm text-gray-500">No activity recorded yet.</p>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="relative pl-6 border-l-2 border-indigo-100 last:border-transparent">
                      <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[7px] top-1.5 border-2 border-white"></div>
                      <p className="text-xs text-gray-500 mb-1">{new Date(log.timestamp).toLocaleString()}</p>
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">{log.name}</span> completed a <span className="font-semibold text-indigo-600">{log.question_category}</span> interview question.
                      </p>
                      {log.content_score && (
                        <p className="text-xs text-gray-500 mt-1">Score: {log.content_score.toFixed(1)}/100</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

'use client';
import { useState } from "react";
import EmployeeDetails from "./EmployeeDetails";
import HolidayCalendar from "./HolidayCalendar";
import HRPolicies from "./HRPolicies";
import SOPsTraining from "./SOPsTraining";
import DownloadableForms from "./DownloadableForms";

export default function CorporatePanel() {
  const [activeTab, setActiveTab] = useState("employees");

  const tabs = [
    { id: "employees", label: "👤 Employee Details" },
    { id: "holidays", label: "📅 Holiday Calendar" },
    { id: "policies", label: "📘 HR Policies" },
    { id: "sops", label: "📂 SOPs & Training" },
    { id: "forms", label: "📄 Downloadable Forms" },
  ];

  return (
    <div className="flex h-[calc(100vh-100px)] bg-gray-50 rounded-xl shadow-lg overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-5 border-b">
          <h2 className="text-xl font-bold text-gray-800">Corporate Panel</h2>
          <p className="text-sm text-gray-500">Manage resources & policies</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`w-full text-left px-4 py-2 rounded-lg font-medium transition flex items-center gap-2
                ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow"
                    : "text-gray-700 hover:bg-blue-100"
                }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
        <div className="bg-white shadow-md rounded-xl p-6 h-full">
          {activeTab === "employees" && <EmployeeDetails />}
          {activeTab === "holidays" && <HolidayCalendar />}
          {activeTab === "policies" && <HRPolicies />}
          {activeTab === "sops" && <SOPsTraining />}
          {activeTab === "forms" && <DownloadableForms />}
        </div>
      </div>
    </div>
  );
}

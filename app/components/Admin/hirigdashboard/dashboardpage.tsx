'use client';

import { useState } from "react";
import OfferTemplateList from "./OfferTemplateList";
import OfferTemplateForm from "./OfferTemplateForm";
import GenerateOffer from "./OfferTemplatePreview";
import { IOfferTemplate } from "@/models/OfferTemplate";

export default function OfferLettersDashboard() {
  const [editingTemplate, setEditingTemplate] = useState<IOfferTemplate | null>(null);
  const [generatingTemplate, setGeneratingTemplate] = useState<IOfferTemplate | null>(null);
  const [refreshList, setRefreshList] = useState(false);

  const handleCloseForm = () => setEditingTemplate(null);
  const handleCloseGenerate = () => setGeneratingTemplate(null);

  return (
    <div className="p-6 space-y-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Offer Letters Dashboard</h1>
        <button
          className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition duration-200"
          onClick={() =>
            setEditingTemplate({
              _id: "",
              role: '',
              content: '',
              createdAt: new Date(),
              updatedAt: new Date(),
            } as IOfferTemplate)
          }
        >
          Add New Template
        </button>
      </div>

      {/* Template List */}
      <OfferTemplateList
        onEdit={setEditingTemplate}
        onGenerate={setGeneratingTemplate}
        refresh={refreshList}
        setRefresh={setRefreshList}
      />

      {/* Add / Edit Modal */}
      {editingTemplate && (
        <OfferTemplateForm
          template={editingTemplate}
          onClose={handleCloseForm}
          onSaved={() => {
            setRefreshList(prev => !prev);
            handleCloseForm();
          }}
        />
      )}

      {/* Generate Offer Modal */}
      {generatingTemplate && (
        <GenerateOffer
          template={generatingTemplate}
          onClose={handleCloseGenerate}
        />
      )}
    </div>
  );
}

'use client';
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface SOPItem {
  _id?: string;
  title: string;
  category: string;
  fileUrl: string;
}

export default function SOPsTrainingView() {
  const [items, setItems] = useState<SOPItem[]>([]);

  // Fetch items uploaded by admin
  const fetchItems = async () => {
    try {
      const res = await fetch("/api/corporatepage/sops"); // admin API
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      } else {
        toast.error(data.error || "Failed to fetch materials");
      }
    } catch {
      toast.error("Failed to fetch materials");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="p-6 bg-white rounded shadow space-y-4">
      <h2 className="text-2xl font-bold">SOPs & Training Materials</h2>

      {items.length === 0 ? (
        <p className="text-gray-500">No materials uploaded yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item._id} className="border p-3 rounded flex justify-between items-center">
              <div>
                <span className="font-medium">{item.title}</span> — {item.category}
                <br />
                <a
                  href={item.fileUrl}
                  target="_blank"
                  className="text-blue-600 hover:underline text-sm"
                >
                  View / Download
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

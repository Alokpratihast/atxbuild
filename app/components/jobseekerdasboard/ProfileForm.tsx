"use client";

import { useState, useEffect, FormEvent } from "react";

interface Skill {
  name: string;
  rating: number;
}

interface Experience {
  company: string;
  role?: string;
  duration?: number;
  description?: string;
}

interface JobSeekerProfile {
  firstName: string;
  lastName: string;
  location: string;
  contactNumber: string;
  email: string;
  dob: string;
  currentProfile?: string;
  totalExperience?: number;
  relevantExperience?: number;
  currentCTC?: number;
  expectedCTC?: number;
  workPreference?: string;
  noticePeriod?: number;
  skills?: Skill[];
  experience?: Experience[];
  resume?: string;
  coverLetter?: string;
}

export default function ProfileForm() {
  const [profile, setProfile] = useState<JobSeekerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const userId = localStorage.getItem("jobSeekerId");
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/jobseekerprofile", {
          headers: { "x-user-id": userId },
        });

        const data = await res.json();

        if (data.success && data.jobSeeker) {
          setProfile(data.jobSeeker);
          setSkills(data.jobSeeker.skills || []);
          setExperience(data.jobSeeker.experience || []);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const userId = localStorage.getItem("jobSeekerId");
  if (!userId) return alert("User not logged in");

  setSaving(true);

  try {
    const formData = new FormData(e.currentTarget);

    // Include userId in FormData
    formData.set("userId", userId);

    // Attach resume file directly (if any)
    if (resumeFile) formData.set("resume", resumeFile);

    // Stringify arrays
    formData.set("skills", JSON.stringify(skills));
    formData.set("experience", JSON.stringify(experience));

    const res = await fetch("/api/jobseekerprofile", {
      method: "PUT",
      body: formData,
    });

    const data = await res.json();
    if (data.success) {
      setProfile(data.jobSeeker);
      setSkills(data.jobSeeker.skills || []);
      setExperience(data.jobSeeker.experience || []);
      alert("Profile saved successfully!");
    } else {
      alert("Failed to save profile: " + data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong while saving profile");
  } finally {
    setSaving(false);
  }
};


  if (loading) return <p>Loading profile...</p>;
  if (!localStorage.getItem("jobSeekerId")) return <p>Please login to view your profile.</p>;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-5xl mx-auto space-y-8 bg-white dark:bg-gray-800 p-6 sm:p-10 rounded-2xl shadow-md"
    >
      {/* Basic Info */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input name="firstName" defaultValue={profile?.firstName || ""} placeholder="First Name" className="w-full p-3 border rounded-lg" />
          <input name="lastName" defaultValue={profile?.lastName || ""} placeholder="Last Name" className="w-full p-3 border rounded-lg" />
          <input name="location" defaultValue={profile?.location || ""} placeholder="Location" className="w-full p-3 border rounded-lg" />
          <input name="contactNumber" defaultValue={profile?.contactNumber || ""} placeholder="Contact Number" className="w-full p-3 border rounded-lg" />
          <input name="email" type="email" defaultValue={profile?.email || ""} placeholder="Email" className="w-full p-3 border rounded-lg" />
          <input name="dob" type="date" defaultValue={profile?.dob?.slice(0, 10) || ""} className="w-full p-3 border rounded-lg" />
        </div>
      </section>

      {/* Professional Details */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Professional Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input name="currentProfile" defaultValue={profile?.currentProfile || ""} placeholder="Current Profile" className="w-full p-3 border rounded-lg" />
          <input name="totalExperience" type="number" defaultValue={profile?.totalExperience || 0} placeholder="Total Experience" className="w-full p-3 border rounded-lg" />
          <input name="relevantExperience" type="number" defaultValue={profile?.relevantExperience || 0} placeholder="Relevant Experience" className="w-full p-3 border rounded-lg" />
          <input name="currentCTC" type="number" defaultValue={profile?.currentCTC || 0} placeholder="Current CTC" className="w-full p-3 border rounded-lg" />
          <input name="expectedCTC" type="number" defaultValue={profile?.expectedCTC || 0} placeholder="Expected CTC" className="w-full p-3 border rounded-lg" />
          <select name="workPreference" defaultValue={profile?.workPreference || "Remote"} className="w-full p-3 border rounded-lg">
            <option>Remote</option>
            <option>Onsite</option>
            <option>Hybrid</option>
          </select>
          <input name="noticePeriod" type="number" defaultValue={profile?.noticePeriod || 0} placeholder="Notice Period (Months)" className="w-full p-3 border rounded-lg" />
        </div>
      </section>

      {/* Skills */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Skills</h2>
        <div className="space-y-3">
          {skills.map((skill, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row gap-2">
              <input value={skill.name} onChange={(e) => {
                const newSkills = [...skills]; newSkills[idx].name = e.target.value; setSkills(newSkills);
              }} placeholder="Skill Name" className="flex-1 p-3 border rounded-lg" />
              <input type="number" value={skill.rating} min={1} max={5} onChange={(e) => {
                const newSkills = [...skills]; newSkills[idx].rating = Number(e.target.value); setSkills(newSkills);
              }} placeholder="Rating (1-5)" className="w-28 p-3 border rounded-lg" />
              <button type="button" className="text-red-500 hover:text-red-700" onClick={() => setSkills(skills.filter((_, i) => i !== idx))}>Remove</button>
            </div>
          ))}
          <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={() => setSkills([...skills, { name: "", rating: 1 }])}>+ Add Skill</button>
        </div>
      </section>

      {/* Experience */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Experience</h2>
        <div className="space-y-3">
          {experience.map((exp, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 gap-3 border p-4 rounded-lg">
              <input value={exp.company} onChange={(e) => { const newExp = [...experience]; newExp[idx].company = e.target.value; setExperience(newExp); }} placeholder="Company" className="p-3 border rounded-lg" />
              <input value={exp.role || ""} onChange={(e) => { const newExp = [...experience]; newExp[idx].role = e.target.value; setExperience(newExp); }} placeholder="Role" className="p-3 border rounded-lg" />
              <input type="number" value={exp.duration || 0} onChange={(e) => { const newExp = [...experience]; newExp[idx].duration = Number(e.target.value); setExperience(newExp); }} placeholder="Duration (Months)" className="p-3 border rounded-lg" />
              <input value={exp.description || ""} onChange={(e) => { const newExp = [...experience]; newExp[idx].description = e.target.value; setExperience(newExp); }} placeholder="Description" className="p-3 border rounded-lg sm:col-span-2" />
              <button type="button" className="text-red-500 hover:text-red-700 sm:col-span-2 text-left" onClick={() => setExperience(experience.filter((_, i) => i !== idx))}>Remove</button>
            </div>
          ))}
          <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={() => setExperience([...experience, { company: "", role: "", duration: 0, description: "" }])}>+ Add Experience</button>
        </div>
      </section>

      {/* Resume */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Resume</h2>
        {profile?.resume && (
          <p className="mb-2">Current Resume: <a href={profile.resume} target="_blank" className="text-blue-600 underline">View</a></p>
        )}
        <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} className="w-full p-3 border rounded-lg" />
      </section>

      {/* Submit */}
      <div className="flex justify-end">
        <button type="submit" disabled={saving} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full sm:w-auto">
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </form>
  );
}

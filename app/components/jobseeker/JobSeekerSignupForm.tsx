

// "use client";

// import { useState } from "react";
// import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
// import { motion, AnimatePresence } from "framer-motion";
// import { useRouter } from "next/navigation";
// import { signIn, getSession, useSession } from "next-auth/react";

// import Step1BasicInfo from "./signupsteps/Step1BasicInfo";
// import Step2Professional from "./signupsteps/Step2Professional";
// import Step3Skills from "./signupsteps/Step3Skills";
// import Step4Experience from "./signupsteps/Step4Experience";
// import Step5Files from "./signupsteps/Step5UploadResume";

// export type FileWithProgress = {
//   id: string;
//   file: File;
//   progress: number;
//   uploadedUrl?: string;
//   error?: string;
// };

// export type FormValues = {
//   firstName: string;
//   lastName: string;
//   location: string;
//   contactNumber: string;
//   email: string;
//   password: string;
//   dob: string;
//   currentProfile: string;
//   totalExperience: number;
//   relevantExperience: number;
//   currentCTC: number;
//   expectedCTC: number;
//   workPreference: "Remote" | "Onsite" | "Hybrid" | "";
//   noticePeriod: number;
//   skills: { name: string; rating: number }[];
//   experience: { company: string; role: string; duration: number }[];
//   resume: FileWithProgress[];
//   coverLetter?: FileWithProgress[];
// };

// export default function JobSeekerMultiStepForm() {
//   const [step, setStep] = useState(0);
//   const [mode, setMode] = useState<"register" | "login">("register");
//   const [validating, setValidating] = useState(false);
//   const router = useRouter();
//   const { data: session } = useSession();

//   const methods = useForm<FormValues>({
//     defaultValues: {
//       skills: [{ name: "", rating: 1 }],
//       experience: [{ company: "", role: "", duration: 0 }],
//       workPreference: "",
//       resume: [],
//       coverLetter: [],
//     },
//     mode: "onBlur",
//   });

//   const steps = [
//     <Step1BasicInfo key={0} />,
//     <Step2Professional key={1} />,
//     <Step3Skills key={2} />,
//     <Step4Experience key={3} />,
//     <Step5Files key={4} />,
//   ];

//   // ✅ Improved step validation logic
//   const handleNext = async () => {
//     if (validating) return;
//     setValidating(true);

//     try {
//       const isValid = await methods.trigger();
//       if (isValid) {
//         setStep((prev) => Math.min(prev + 1, steps.length - 1));
//       }
//     } finally {
//       setTimeout(() => setValidating(false), 400);
//     }
//   };

//   const handlePrevious = () => {
//     if (validating) return;
//     setStep((prev) => Math.max(prev - 1, 0));
//   };

//   // 🟢 Improved Submit Logic
//   const onSubmit: SubmitHandler<FormValues> = async (data) => {
//     try {
//         // ✅ Extract URLs safely
//     const resumeUrl = data.resume?.[0]?.uploadedUrl || "";
//     const coverLetterUrls = Array.isArray(data.coverLetter)
//       ? data.coverLetter
//           .map((f) => f.uploadedUrl)
//           .filter(Boolean)
//       : [];

//       if (!resumeUrl) {
//         alert("Please upload your resume before submitting.");
//         return;
//       }

//       const payload = {
//         ...data,
//         resume: resumeUrl,
//         coverLetter: coverLetterUrls, // cover letter remains optional
//       };

//       const endpoint = session?.user?.id
//         ? `/api/jobseekerprofile/${session.user.id}`
//         : "/api/jobseekers";

//       const method = session?.user?.id ? "PUT" : "POST";

//       const res = await fetch(endpoint, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const result = await res.json();

//       if (result.success) {
//         alert(
//           session?.user?.id
//             ? "✅ Profile updated successfully!"
//             : "✅ Registered successfully! Please login."
//         );
//         methods.reset();
//         if (session?.user?.id) {
//           router.push("/jobseekerdashboard");
//         } else {
//           setStep(0);
//           setMode("login");
//         }
//       } else {
//         alert(result.error || "Something went wrong.");
//       }
//     } catch (err) {
//       console.error("Submit Error:", err);
//       alert("Something went wrong. Please try again.");
//     }
//   };

//   return (
//     <FormProvider {...methods}>
//       <div className="max-w-4xl mx-auto p-6">
//         {/* Toggle between Register and Login */}
//         <div className="flex justify-center gap-8 mb-8">
//           <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
//             <input
//               type="radio"
//               name="mode"
//               value="register"
//               checked={mode === "register"}
//               onChange={() => setMode("register")}
//               className="accent-indigo-600"
//             />
//             Register
//           </label>
//           <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
//             <input
//               type="radio"
//               name="mode"
//               value="login"
//               checked={mode === "login"}
//               onChange={() => setMode("login")}
//               className="accent-indigo-600"
//             />
//             Already have an account
//           </label>
//         </div>

//         {mode === "register" ? (
//           <>
//             {/* Progress bar */}
//             <div className="flex items-center justify-between mb-10 relative">
//               {steps.map((_, idx) => (
//                 <div key={idx} className="flex-1 relative">
//                   <div
//                     className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-semibold shadow-md ${
//                       step === idx
//                         ? "bg-indigo-600 text-white"
//                         : idx < step
//                         ? "bg-green-500 text-white"
//                         : "bg-gray-200 text-gray-700"
//                     }`}
//                   >
//                     {idx + 1}
//                   </div>
//                   {idx < steps.length - 1 && (
//                     <div
//                       className={`absolute top-1/2 left-1/2 w-full h-1 -translate-y-1/2 ${
//                         idx < step ? "bg-green-500" : "bg-gray-200"
//                       }`}
//                     />
//                   )}
//                 </div>
//               ))}
//             </div>

//             {/* 🟢 Simplified Form Submission */}
//             <form onSubmit={methods.handleSubmit(onSubmit)}>
//               <AnimatePresence mode="wait">
//                 <motion.div
//                   key={step}
//                   initial={{ opacity: 0, x: 40 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   exit={{ opacity: 0, x: -40 }}
//                   transition={{ duration: 0.3 }}
//                 >
//                   {steps[step]}
//                 </motion.div>
//               </AnimatePresence>

//               <div className="flex justify-between pt-6">
//                 {step > 0 ? (
//                   <button
//                     type="button"
//                     onClick={handlePrevious}
//                     disabled={validating}
//                     className="px-5 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 disabled:opacity-50"
//                   >
//                     ← Previous
//                   </button>
//                 ) : (
//                   <div />
//                 )}

//                 {step < steps.length - 1 ? (
//                   <button
//                     type="button"
//                     onClick={handleNext}
//                     disabled={validating}
//                     className={`px-6 py-2 rounded-lg text-white flex items-center gap-2 ${
//                       validating
//                         ? "bg-indigo-400 cursor-not-allowed"
//                         : "bg-indigo-600 hover:bg-indigo-700"
//                     }`}
//                   >
//                     {validating ? (
//                       <>
//                         <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
//                         <span>Next...</span>
//                       </>
//                     ) : (
//                       <>Next →</>
//                     )}
//                   </button>
//                 ) : (
//                   <button
//                     type="submit"
//                     className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
//                   >
//                     ✅ Submit
//                   </button>
//                 )}
//               </div>
//             </form>
//           </>
//         ) : (
//           // Login form
//           <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md mx-auto border border-gray-100">
//             <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
//               Login to Your Account
//             </h2>
//             <form
//               className="space-y-4"
//               onSubmit={async (e) => {
//                 e.preventDefault();
//                 const email = (
//                   e.currentTarget.elements.namedItem("email") as HTMLInputElement
//                 ).value;
//                 const password = (
//                   e.currentTarget.elements.namedItem("password") as HTMLInputElement
//                 ).value;

//                 try {
//                   const res = await signIn("jobseeker-login", {
//                     redirect: false,
//                     email,
//                     password,
//                   });
//                   if (res?.error) return alert(res.error);
//                   const session = await getSession();
//                   if (session?.user?.id)
//                     localStorage.setItem("jobSeekerId", session.user.id);
//                   alert("✅ Logged in successfully!");
//                   router.push("/jobseekerdashboard");
//                 } catch (err) {
//                   console.error(err);
//                   alert("Something went wrong. Try again.");
//                 }
//               }}
//             >
//               <input
//                 type="email"
//                 name="email"
//                 placeholder="Email"
//                 className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
//                 required
//               />
//               <input
//                 type="password"
//                 name="password"
//                 placeholder="Password"
//                 className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
//                 required
//               />
//               <button
//                 type="submit"
//                 className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700"
//               >
//                 Login
//               </button>
//             </form>
//           </div>
//         )}
//       </div>
//     </FormProvider>
//   );
// }

"use client";

import { useState } from "react";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { signIn, getSession, useSession } from "next-auth/react";

import Step1BasicInfo from "./signupsteps/Step1BasicInfo";
import Step2Professional from "./signupsteps/Step2Professional";
import Step3Skills from "./signupsteps/Step3Skills";
import Step4Experience from "./signupsteps/Step4Experience";
import Step5Files from "./signupsteps/Step5UploadResume";

export type FileWithProgress = {
  id: string;
  file: File;
  progress: number;
  uploadedUrl?: string;
  error?: string;
};

export type FormValues = {
  firstName: string;
  lastName: string;
  location: string;
  contactNumber: string;
  email: string;
  password: string;
  dob: string;
  currentProfile: string;
  totalExperience: number;
  relevantExperience: number;
  currentCTC: number;
  expectedCTC: number;
  workPreference: "Remote" | "Onsite" | "Hybrid" | "";
  noticePeriod: number;
  skills: { name: string; rating: number }[];
  experience: { company: string; role: string; duration: number }[];
  resume: FileWithProgress[];
  coverLetter?: FileWithProgress[];
};

export default function JobSeekerMultiStepForm() {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<"register" | "login">("register");
  const [validating, setValidating] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const methods = useForm<FormValues>({
    defaultValues: {
      skills: [{ name: "", rating: 1 }],
      experience: [{ company: "", role: "", duration: 0 }],
      workPreference: "",
      resume: [],
      coverLetter: [],
    },
    mode: "onBlur",
  });

  const steps = [
    <Step1BasicInfo key={0} />,
    <Step2Professional key={1} />,
    <Step3Skills key={2} />,
    <Step4Experience key={3} />,
    <Step5Files key={4} />,
  ];

  // ✅ Improved step validation logic
  const handleNext = async () => {
    if (validating) return;
    setValidating(true);

    try {
      const isValid = await methods.trigger();
      if (isValid) {
        setStep((prev) => Math.min(prev + 1, steps.length - 1));
      }
    } finally {
      setTimeout(() => setValidating(false), 400);
    }
  };

  const handlePrevious = () => {
    if (validating) return;
    setStep((prev) => Math.max(prev - 1, 0));
  };

  // 🟢 Improved Submit Logic
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      const resumeUrl = data.resume?.[0]?.uploadedUrl || "";
      const coverLetterUrls = Array.isArray(data.coverLetter)
        ? data.coverLetter.map((f) => f.uploadedUrl).filter(Boolean)
        : [];

      if (!resumeUrl) {
        alert("Please upload your resume before submitting.");
        return;
      }

      const payload = {
        ...data,
        resume: resumeUrl,
        coverLetter: coverLetterUrls,
      };

      const endpoint = session?.user?.id
        ? `/api/jobseekerprofile/${session.user.id}`
        : "/api/jobseekers";

      const method = session?.user?.id ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.success) {
        alert(
          session?.user?.id
            ? "✅ Profile updated successfully!"
            : "✅ Registered successfully! Please login."
        );
        methods.reset();
        if (session?.user?.id) {
          router.push("/jobseekerdashboard");
        } else {
          setStep(0);
          setMode("login");
        }
      } else {
        alert(result.error || "Something went wrong.");
      }
    } catch (err) {
      console.error("Submit Error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  // 🧩 Password Input Component with Eye Icon
  function PasswordInput() {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative">
        <label className="block text-gray-700 text-sm mb-1">Password</label>
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Enter your password"
          className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white pr-10"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-9 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          {showPassword ? "👁️" : "👁️"}
        </button>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Toggle between Register and Login */}
        <div className="flex justify-center gap-8 mb-8">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
            <input
              type="radio"
              name="mode"
              value="register"
              checked={mode === "register"}
              onChange={() => setMode("register")}
              className="accent-indigo-600"
            />
            Register
          </label>
          <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
            <input
              type="radio"
              name="mode"
              value="login"
              checked={mode === "login"}
              onChange={() => setMode("login")}
              className="accent-indigo-600"
            />
            Already have an account
          </label>
        </div>

        {mode === "register" ? (
          <>
            {/* Progress bar */}
            <div className="flex items-center justify-between mb-10 relative">
              {steps.map((_, idx) => (
                <div key={idx} className="flex-1 relative">
                  <div
                    className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center font-semibold shadow-md ${
                      step === idx
                        ? "bg-indigo-600 text-white"
                        : idx < step
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`absolute top-1/2 left-1/2 w-full h-1 -translate-y-1/2 ${
                        idx < step ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Form Content */}
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                >
                  {steps[step]}
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-between pt-6">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={validating}
                    className="px-5 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                  >
                    ← Previous
                  </button>
                ) : (
                  <div />
                )}

                {step < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={validating}
                    className={`px-6 py-2 rounded-lg text-white flex items-center gap-2 ${
                      validating
                        ? "bg-indigo-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    {validating ? (
                      <>
                        <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
                        <span>Next...</span>
                      </>
                    ) : (
                      <>Next →</>
                    )}
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    ✅ Submit
                  </button>
                )}
              </div>
            </form>
          </>
        ) : (
          // 🧩 Updated Login Form
          <div className="relative bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-md mx-auto border border-gray-100">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
              Welcome Back 👋
            </h2>
            <p className="text-center text-gray-500 mb-6 text-sm">
              Login to continue to your dashboard
            </p>

            <form
              className="space-y-5"
              onSubmit={async (e) => {
                e.preventDefault();
                const email = (
                  e.currentTarget.elements.namedItem("email") as HTMLInputElement
                ).value;
                const password = (
                  e.currentTarget.elements.namedItem("password") as HTMLInputElement
                ).value;

                try {
                  const res = await signIn("jobseeker-login", {
                    redirect: false,
                    email,
                    password,
                  });

                  if (res?.error) return alert(res.error);

                  const session = await getSession();
                  if (session?.user?.id)
                    localStorage.setItem("jobSeekerId", session.user.id);

                  alert("✅ Logged in successfully!");
                  router.push("/jobseekerdashboard");
                } catch (err) {
                  console.error(err);
                  alert("Something went wrong. Try again.");
                }
              }}
            >
              <div>
                <label className="block text-gray-700 text-sm mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="border p-3 w-full rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                  required
                />
              </div>

              <PasswordInput />

              <div className="flex justify-between items-center text-sm">
                <button
                  type="button"
                  onClick={() => router.push("/forgotpassword")}
                  className="text-indigo-600 hover:underline font-medium"
                >
                  Forgot Password?
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="text-gray-600 hover:underline"
                >
                  Create Account →
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-all duration-300 mt-4 font-medium"
              >
                Login
              </button>
            </form>
          </div>
        )}
      </div>
    </FormProvider>
  );
}

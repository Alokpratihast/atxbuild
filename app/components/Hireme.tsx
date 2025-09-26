"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";



export default function Hireme() {
 const router = useRouter();


  return (
    <section className="flex flex-col md:flex-row justify-center items-center gap-8 mb-16 px-4" id="hireme">
      {/* Find a Job */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 md:p-8 text-center hover:shadow-lg transition transform hover:-translate-y-1 w-[320px]">
        <div className="mb-4">
          <Image src="/carreer/job1.png" alt="Find Job" width={50} height={50} />
        </div>
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">Find a Job</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-5 text-sm">
          Explore thousands of job opportunities and take the next step in your career.
        </p>
        <button
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:opacity-90 transition"
          onClick={() =>  router.push("/jobseeker/signup")}
        >
          Browse Jobs
        </button>
      </div>

      {/* Hire Talent */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md p-6 md:p-8 text-center hover:shadow-lg transition transform hover:-translate-y-1 w-[320px]" id="hire-talent">
        <div className="mb-4">
          <Image src="/carreer/hire.png" alt="Hire Talent" width={60} height={60} />
        </div>
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">Hire Talent</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-5 text-sm">
          Connect with top professionals and build your dream team with ease.
        </p>
        <button
          className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-teal-600 text-white font-medium rounded-lg hover:opacity-90 transition"
          onClick={() => router.push("/employerlogin/employerloginform")}
        >
          Post a Job
        </button>
      </div>

      

    </section>
  );
}

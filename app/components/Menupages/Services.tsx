
export default function Services() {
  return (
    <section className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Our Services</h1>
      <p className="text-gray-700 leading-relaxed mb-6">
        We provide a range of professional web development services tailored to meet
        your business needs.
      </p>

      <ul className="space-y-4">
        <li className="p-4 bg-gray-50 rounded-lg shadow hover:shadow-md transition">
          <h2 className="text-2xl font-semibold text-blue-500">Custom Web Development</h2>
          <p className="text-gray-600">
            High-quality, scalable websites built with the latest technologies.
          </p>
        </li>
        <li className="p-4 bg-gray-50 rounded-lg shadow hover:shadow-md transition">
          <h2 className="text-2xl font-semibold text-blue-500">UI/UX Design</h2>
          <p className="text-gray-600">
            Engaging and user-friendly designs that keep your customers happy.
          </p>
        </li>
        <li className="p-4 bg-gray-50 rounded-lg shadow hover:shadow-md transition">
          <h2 className="text-2xl font-semibold text-blue-500">SEO Optimization</h2>
          <p className="text-gray-600">
            Improve your visibility and rankings with proven SEO strategies.
          </p>
        </li>
      </ul>
    </section>
  );
}

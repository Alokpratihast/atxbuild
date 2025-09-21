import {
  ShoppingBag,
  Building,
  GraduationCap,
  HeartPulse,
  Store,
  Landmark,
  RadioTower,
  Truck,
  Film,
  Smartphone,
  LayoutDashboard,
  Palette,
  Megaphone,
  Globe,
  Utensils,
  Boxes,
  Shirt,
  Laptop,
  Cloud,
  Rocket,
  Briefcase
} from "lucide-react";

export type Industry = {
  name: string;
  icon: React.ComponentType<any>;
};

export type FeatureBox = {
  title: string;
  desc: string;
};

export type Service = {
  title: string;
  subtitle?: string;
  heading?: string;
  description: string;
  bannerimg?: string; // Hero image
  image?: string;     // Right-side overview image
  industries?: Industry[];
  features?: FeatureBox[];
};

export const servicesData: Record<string, Service> = {
  "web-development": {
    title: "Web Development",
    subtitle: "We build modern, responsive websites using React and Next.js to deliver seamless digital experiences.",
    bannerimg: "/servicesbanner/webdbanner.jpg",
    heading: "Custom Web Solutions for Every Business",
    description:
      "Our web development services focus on creating responsive, fast-loading, and visually appealing websites tailored to your brand. Whether you need a corporate website, portfolio, or e-commerce store, we ensure it performs flawlessly across devices.",
    image: "/web.development.rightside.image.jpg",
    industries: [
      { name: "E-commerce", icon: ShoppingBag },
      { name: "Corporate", icon: Building },
      { name: "Education", icon: GraduationCap },
      { name: "Healthcare", icon: HeartPulse },
    ],
    features: [
      { title: "Custom Website Development", desc: "Bespoke websites tailored to your brand and goals." },
      { title: "SEO Optimization", desc: "Optimized for search engines to increase visibility." },
      { title: "Responsive Design", desc: "Seamless experience on all devices." },
    ],
  },

  "app-development": {
    title: "App Development",
    subtitle: "We design and develop innovative apps that solve real-world problems and drive user engagement.",
    bannerimg: "/servicesbanner/appdevbanner.jpg",
    heading: "Custom Mobile App Development for Business Growth",
    description:
      "We create high-performance mobile apps that combine sleek design with powerful functionality. Our expert team builds scalable, cross-platform applications that work flawlessly on iOS and Android.",
    image: "/app.development.rightside.image.jpg",
    industries: [
      { name: "Healthcare", icon: HeartPulse },
      { name: "Retail", icon: Store },
      { name: "Finance", icon: Landmark },
      { name: "Telecom", icon: RadioTower },
      { name: "Logistics", icon: Truck },
      { name: "Media", icon: Film },
    ],
    features: [
      { title: "iOS & Android Apps", desc: "Native applications for the best user experience." },
      { title: "Cross-platform Apps", desc: "Built with React Native and Flutter for wider reach." },
      { title: "App Store Deployment", desc: "We handle publishing on Google Play & Apple App Store." },
    ],
  },

  "ui-ux-design": {
    title: "UI/UX Design",
    subtitle: "We craft intuitive interfaces that keep users engaged.",
    bannerimg: "/servicesbanner/uiux.avif",
    heading: "User-Centric Digital Experiences",
    description:
      "Our design process focuses on understanding your users and creating intuitive, beautiful, and functional interfaces. From wireframes to final design, we ensure usability is at the core.",
    image: "/UI-UX.design.right.side.image.jpg",
    industries: [
      { name: "Web Apps", icon: Globe },
      { name: "Mobile Apps", icon: Smartphone },
      { name: "Dashboards", icon: LayoutDashboard },
    ],
    features: [
      { title: "Wireframes & Prototypes", desc: "Visual blueprints for faster iteration." },
      { title: "Design Systems", desc: "Consistent and scalable UI components." },
      { title: "Accessibility", desc: "Inclusive designs for all users." },
    ],
  },

  "graphics-designing": {
    title: "Graphics Designing",
    subtitle: "Creative designs that make your brand stand out.",
    bannerimg: "/servicesbanner/graphicbanner.jpg",
    heading: "Visual Storytelling Through Design",
    description:
      "We create stunning graphics for both print and digital media to help your brand communicate effectively. From logos to marketing creatives, our designs leave a lasting impact.",
    image: "/graphics.designing.right.side.image.jpg",
    industries: [
      { name: "Branding", icon: Palette },
      { name: "Advertising", icon: Megaphone },
      { name: "Social Media", icon: Globe },
    ],
    features: [
      { title: "Branding", desc: "Logos, business cards, and complete identity design." },
      { title: "Marketing Creatives", desc: "Posters, flyers, and digital banners." },
      { title: "Infographics", desc: "Visually explain complex data." },
    ],
  },

  "database-administration": {
    title: "Database Administration",
    subtitle: "Reliable, secure, and optimized database solutions.",
    bannerimg: "/servicesbanner/databasebanner.jpg",
    heading: "Ensuring Data Reliability and Security",
    description:
      "Our database experts manage, optimize, and secure your data infrastructure to ensure high performance and reliability. We offer proactive monitoring and disaster recovery solutions.",
    image: "/database administration.jpg",
    industries: [
      { name: "Finance", icon: Landmark },
      { name: "Healthcare", icon: HeartPulse },
      { name: "E-commerce", icon: ShoppingBag },
    ],
    features: [
      { title: "Performance Tuning", desc: "Optimized queries and indexing for speed." },
      { title: "Backup & Recovery", desc: "Regular backups and disaster recovery planning." },
      { title: "Security & Access Control", desc: "Granular permissions and encryption." },
    ],
  },

  "pos-business": {
    title: "POS Business Solutions",
    subtitle: "Streamline billing, inventory, and analytics.",
    bannerimg: "/servicesbanner/buisnessbanner.jpg",
    heading: "Complete POS Solutions for Retail & Hospitality",
    description:
      "We provide end-to-end POS systems that integrate seamlessly with your business workflow. From billing to real-time inventory tracking, our solutions help you serve customers better.",
    image: "/POS.business.solutions.right.side.image.jpg",
    industries: [
      { name: "Retail", icon: Store },
      { name: "Restaurants", icon: Utensils },
      { name: "Warehouses", icon: Boxes },
    ],
    features: [
      { title: "Inventory Management", desc: "Track stock in real-time." },
      { title: "Payment Integrations", desc: "Multiple payment gateways supported." },
      { title: "Reporting & Analytics", desc: "Insights for better decision-making." },
    ],
  },

  "e-commerce": {
    title: "E-commerce Solutions",
    subtitle: "Sell online with confidence and scalability.",
    bannerimg: "/servicesbanner/ecomercebanner.jpg",
    heading: "Scalable and Secure Online Stores",
    description:
      "We develop secure, fast, and scalable e-commerce platforms with advanced features like multi-currency support and seamless checkout.",
    image: "/E-commerce.jpg",
    industries: [
      { name: "Retail", icon: Store },
      { name: "Fashion", icon: Shirt },
      { name: "Electronics", icon: Laptop },
    ],
    features: [
      { title: "Custom Storefronts", desc: "Unique designs tailored to your brand." },
      { title: "Payments & Shipping", desc: "Secure payment gateways and global shipping." },
      { title: "Multi-currency & i18n", desc: "Support for multiple currencies and languages." },
    ],
  },

  "cloud-infrastructure": {
    title: "Cloud Infrastructure Solutions",
    subtitle: "Reliable cloud solutions to scale your business.",
    bannerimg: "/servicesbanner/cloud1.webp",
    heading: "Optimized Cloud Operations for Efficiency",
    description:
      "We help you set up, migrate, and manage cloud environments for maximum reliability and cost-effectiveness. Our team specializes in AWS, Azure, and Google Cloud.",
    image: "/cloud.infra.solution.right.side.jpg",
    industries: [
      { name: "Technology", icon: Cloud },
      { name: "Startups", icon: Rocket },
      { name: "Enterprises", icon: Briefcase },
    ],
    features: [
      { title: "Cloud Migration", desc: "Seamless migration with minimal downtime." },
      { title: "Serverless & IaC", desc: "Infrastructure as Code and serverless solutions." },
      { title: "Disaster Recovery", desc: "Business continuity planning for cloud workloads." },
    ],
  },
};

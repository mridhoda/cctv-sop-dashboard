import React, { useState, useEffect, useRef } from "react";
import {
  ShieldAlert,
  EyeOff,
  Clock,
  FileWarning,
  Users,
  Zap,
  BarChart3,
  Video,
  BellRing,
  Activity,
  Lock,
  Camera,
  Cpu,
  Search,
  AlertTriangle,
  CheckCircle2,
  HardHat,
  Footprints,
  Shirt,
  Badge,
  ShieldHalf,
  ChevronDown,
  ChevronUp,
  Play,
  ArrowRight,
  Check,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

// --- ANIMATION WRAPPER ---
const Reveal = ({ children, className = "", delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
};

// --- COMPONENTS ---

const Navbar = ({ onEnterApp }) => (
  <nav className="fixed w-full z-50 top-0 bg-white/80 backdrop-blur-md border-b border-slate-200/50 transition-all duration-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-20">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="bg-blue-600 p-2 rounded-lg">
            <ShieldHalf className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">
            VisionGuard<span className="text-blue-600">.AI</span>
          </span>
        </div>
        <div className="hidden md:flex space-x-8 text-sm font-medium text-slate-600">
          <a href="#problem" className="hover:text-blue-600 transition-colors">
            Problems
          </a>
          <a href="#solution" className="hover:text-blue-600 transition-colors">
            Features
          </a>
          <a
            href="#how-it-works"
            className="hover:text-blue-600 transition-colors"
          >
            How it Works
          </a>
          <a href="#pricing" className="hover:text-blue-600 transition-colors">
            Pricing
          </a>
        </div>
        <div className="flex gap-4">
          <button
            onClick={onEnterApp}
            className="hidden md:inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
          >
            Login Dashboard
          </button>
        </div>
      </div>
    </div>
  </nav>
);

const Hero = ({ onEnterApp }) => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-900 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Content */}
          <Reveal>
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium mb-6">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Trusted by 50+ facilities across Indonesia
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
                AI-Powered{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                  Safety Compliance
                </span>{" "}
                Monitoring
              </h1>
              <p className="text-lg sm:text-xl text-slate-300 mb-8 leading-relaxed max-w-xl">
                Detect SOP violations automatically with Computer Vision. Reduce
                incidents by 80% without adding manual manpower.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onEnterApp}
                  className="inline-flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]"
                >
                  Login Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                </button>
                <a
                  href="#video"
                  className="inline-flex items-center justify-center px-6 py-3.5 border border-slate-700 text-base font-semibold rounded-lg text-white bg-slate-800/50 backdrop-blur-sm hover:bg-slate-800 transition-all hover:scale-[1.02]"
                >
                  <Play className="mr-2 w-5 h-5 text-emerald-400" /> Watch How
                  It Works
                </a>
              </div>
            </div>
          </Reveal>

          {/* Right Content - Mockup */}
          <Reveal delay={200}>
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="rounded-xl overflow-hidden shadow-2xl border border-slate-700/50 bg-slate-800 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                {/* Mockup Header */}
                <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-700">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    visionguard-live-feed
                  </div>
                </div>
                {/* Mockup Body */}
                <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Video Feed Area */}
                  <div className="sm:col-span-2 bg-slate-950 rounded-lg aspect-video relative overflow-hidden group">
                    <img
                      src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800"
                      alt="Factory floor"
                      className="object-cover w-full h-full opacity-50 grayscale"
                    />
                    {/* Bounding Boxes */}
                    <div className="absolute top-[20%] left-[30%] w-[20%] h-[15%] border-2 border-emerald-500 rounded bg-emerald-500/10">
                      <span className="absolute -top-5 left-0 bg-emerald-500 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-sm">
                        Hardhat 99%
                      </span>
                    </div>
                    <div className="absolute top-[40%] left-[30%] w-[25%] h-[35%] border-2 border-red-500 rounded bg-red-500/10 animate-pulse">
                      <span className="absolute -top-5 left-0 bg-red-500 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-sm">
                        No Vest 87%
                      </span>
                    </div>
                  </div>
                  {/* Alert Sidebar */}
                  <div className="flex flex-col gap-3">
                    <div className="bg-slate-900 p-3 rounded-lg border-l-4 border-red-500 shadow-inner">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle size={14} className="text-red-500" />
                        <span className="text-[11px] font-semibold text-white">
                          Missing Vest
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Cam 04 - Zone B<br />
                        14:02:15 WIB
                      </div>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border-l-4 border-emerald-500 shadow-inner">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        <span className="text-[11px] font-semibold text-white">
                          Full Compliance
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Cam 01 - Entrance
                        <br />
                        14:01:30 WIB
                      </div>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border-l-4 border-amber-500 shadow-inner opacity-60">
                      <div className="flex items-center gap-2 mb-1">
                        <ShieldAlert size={14} className="text-amber-500" />
                        <span className="text-[11px] font-semibold text-white">
                          No ID Card
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Cam 02 - Assembly
                        <br />
                        13:45:12 WIB
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

const ProblemSection = () => {
  const problems = [
    {
      icon: EyeOff,
      title: "Limited Coverage",
      desc: "Manual review only covers a fraction of total CCTV footage, leaving blind spots.",
    },
    {
      icon: Clock,
      title: "Delayed Response",
      desc: "Incidents are discovered hours or days after they happen, increasing liability.",
    },
    {
      icon: FileWarning,
      title: "Inconsistent Reporting",
      desc: "Human audits are prone to bias and fatigue, leading to inaccurate compliance data.",
    },
    {
      icon: Users,
      title: "High Manpower Costs",
      desc: "Hiring staff for 24/7 video monitoring is expensive and highly inefficient.",
    },
  ];

  return (
    <section id="problem" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Manual Safety Monitoring Is Inefficient
            </h2>
            <p className="text-lg text-slate-600">
              Traditional HSE audits rely on random sampling and human
              observation, leaving your facility vulnerable to unrecorded safety
              violations.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {problems.map((prob, idx) => (
            <Reveal key={idx} delay={idx * 100}>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-6">
                  <prob.icon className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {prob.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">{prob.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const SolutionSection = () => {
  const features = [
    {
      icon: Zap,
      title: "Real-time Detection",
      desc: "Sub-second response time for identifying safety violations as they happen.",
    },
    {
      icon: BarChart3,
      title: "Automated Reports",
      desc: "Generate daily, weekly, or monthly compliance reports instantly.",
    },
    {
      icon: Video,
      title: "Multi-camera Support",
      desc: "Process up to 50 concurrent CCTV feeds per central processing unit.",
    },
    {
      icon: BellRing,
      title: "Instant Notifications",
      desc: "Receive immediate alerts via WhatsApp, Email, or the main dashboard.",
    },
    {
      icon: Activity,
      title: "Analytics Dashboard",
      desc: "Visualize compliance trends, heatmaps, and recurring issues.",
    },
    {
      icon: Lock,
      title: "Role-based Access",
      desc: "Secure data access control for managers, HSE officers, and admins.",
    },
  ];

  return (
    <section id="solution" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-blue-600 font-semibold tracking-wider uppercase text-sm">
              The Solution
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">
              Real-Time AI Detection, Instant Alerts
            </h2>
            <p className="text-lg text-slate-600">
              Upgrade your existing CCTV infrastructure into proactive safety
              monitors without changing a single camera.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <Reveal key={idx} delay={idx * 100}>
              <div className="group p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:bg-blue-600 group-hover:border-blue-600">
                  <feature.icon className="w-6 h-6 text-slate-700 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    {
      icon: Camera,
      title: "Connect CCTV",
      desc: "Link existing IP cameras via RTSP streams.",
    },
    {
      icon: Cpu,
      title: "AI Processing",
      desc: "Our edge models process frames locally in real-time.",
    },
    {
      icon: Search,
      title: "Detect Violations",
      desc: "Identifies missing gear based on SOP rules.",
    },
    {
      icon: AlertTriangle,
      title: "Alert & Report",
      desc: "Sends instant notifications and logs data.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-24 bg-slate-900 text-white overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNHYtNGgtMnY0aC00djJoNHY0aDJ2LTRoNHYtMmgtNHptMC0zMFYwaC0ydjRoLTR2Mmg0djRoMnYtNGg0VjRoLTR6bS0yMCAxMnYtNGgtMnY0aC00djJoNHY0aDJ2LTRoNHYtMmgtNHptMCAzMHYtNGgtMnY0aC00djJoNHY0aDJ2LTRoNHYtMmgtNHoiIGZpbGw9IiMzMzQxNTUiIGZpbGwtb3BhY2l0eT0iMC40Ii8+PC9nPjwvc3ZnPg==')] opacity-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Seamless integration with your current infrastructure. Deployed in
              days, not months.
            </p>
          </div>
        </Reveal>

        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-700 -translate-y-1/2 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 relative z-10">
            {steps.map((step, idx) => (
              <Reveal key={idx} delay={idx * 150} className="relative">
                <div className="flex flex-col items-center text-center group">
                  <div className="w-20 h-20 bg-slate-800 border-4 border-slate-900 rounded-full flex items-center justify-center mb-6 relative z-10 group-hover:bg-blue-600 transition-colors duration-300">
                    <step.icon className="w-8 h-8 text-blue-400 group-hover:text-white transition-colors" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full border-4 border-slate-900 flex items-center justify-center text-white font-bold text-sm">
                      {idx + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm px-4">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const DetectionCapabilities = () => {
  const capabilities = [
    { icon: HardHat, label: "Safety Helmet Detection" },
    { icon: Footprints, label: "Safety Shoes Detection" },
    { icon: Shirt, label: "Vest/Uniform Compliance" },
    { icon: Badge, label: "ID Card Detection" },
    { icon: ShieldHalf, label: "Mask/Goggle Detection" },
  ];

  return (
    <section className="py-24 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Comprehensive SOP Coverage
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Our custom-trained AI models are optimized specifically for the
                Indonesian manufacturing environment, ensuring high accuracy
                across diverse uniforms and lighting conditions.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {capabilities.map((cap, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-100"
                  >
                    <div className="bg-emerald-100 p-2 rounded-lg">
                      <cap.icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="font-semibold text-slate-800">
                      {cap.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={200}>
            {/* Minimalist Dashboard Preview Graphic */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200 relative">
              <div className="absolute -top-4 -right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg transform rotate-3">
                98.5% Accuracy
              </div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 text-lg">
                  Live Compliance Feed
                </h3>
                <span className="flex items-center text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>{" "}
                  Active
                </span>
              </div>

              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-200 rounded-md overflow-hidden relative">
                        <img
                          src={`https://images.unsplash.com/photo-${1581091226000 + i}?auto=format&fit=crop&w=100&q=60`}
                          alt="thumb"
                          className="w-full h-full object-cover opacity-80"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-slate-800">
                          Worker #{403 + i}
                        </div>
                        <div className="text-xs text-slate-500">
                          Zone {String.fromCharCode(64 + i)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Check size={14} />
                      </div>
                      <div className="w-6 h-6 rounded bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Check size={14} />
                      </div>
                      {i === 2 ? (
                        <div className="w-6 h-6 rounded bg-red-100 flex items-center justify-center text-red-600">
                          <AlertTriangle size={14} />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded bg-emerald-100 flex items-center justify-center text-emerald-600">
                          <Check size={14} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

const ImpactSection = () => {
  const metrics = [
    { value: "80%", label: "Faster Response Time" },
    { value: "24/7", label: "Automated Monitoring" },
    { value: "60%", label: "Reduction in Audit Prep" },
    { value: "50+", label: "Cameras Supported per Node" },
  ];

  return (
    <section className="py-20 bg-blue-600 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-blue-400/50">
          {metrics.map((metric, idx) => (
            <Reveal key={idx} delay={idx * 100} className="text-center px-4">
              <div className="text-4xl md:text-5xl font-extrabold mb-2 text-white">
                {metric.value}
              </div>
              <div className="text-blue-100 text-sm md:text-base font-medium">
                {metric.label}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const reviews = [
    {
      name: "Budi Santoso",
      title: "Operations Manager, PT. XYZ Manufacturing",
      quote:
        "VisionGuard AI completely transformed our safety culture. We no longer rely on sporadic checks. The instant WhatsApp alerts for missing hardhats helped us prevent three major incidents this quarter alone.",
    },
    {
      name: "Siti Rahma",
      title: "HSE Director, IndoBuild Materials",
      quote:
        "The automated reporting saves my team at least 15 hours a week. We just log into the dashboard, export the compliance trends, and present them at the board meeting. Flawless execution.",
    },
    {
      name: "Arif Wijaya",
      title: "Plant Manager, AutoParts Nusantara",
      quote:
        "Deploying it was surprisingly easy. We hooked it up to our existing Hikvision cameras via RTSP, and the AI was detecting safety vest violations within 48 hours. Worth every penny.",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-lg text-slate-600">
              See what HSE and Operations leaders are saying about VisionGuard
              AI.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review, idx) => (
            <Reveal key={idx} delay={idx * 150}>
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 relative h-full flex flex-col">
                {/* Quote Icon */}
                <div className="absolute top-6 right-6 text-slate-200">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-slate-700 leading-relaxed mb-8 relative z-10 flex-grow">
                  "{review.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{review.name}</h4>
                    <p className="text-sm text-slate-500">{review.title}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const Pricing = () => {
  const tiers = [
    {
      name: "Starter",
      price: "5",
      unit: "jt",
      desc: "Perfect for small facilities needing basic monitoring.",
      features: [
        "Up to 5 Cameras",
        "Basic Real-time Detection",
        "Daily Email Reports",
        "Dashboard Access (1 User)",
        "Email Support",
      ],
    },
    {
      name: "Professional",
      price: "12",
      unit: "jt",
      recommended: true,
      desc: "Ideal for medium-to-large plants with strict HSE protocols.",
      features: [
        "Up to 20 Cameras",
        "Full Analytics & Heatmaps",
        "WhatsApp Instant Alerts",
        "Dashboard Access (5 Users)",
        "API Integration Access",
        "Priority Support",
      ],
    },
    {
      name: "Enterprise",
      price: "Custom",
      unit: "",
      desc: "For large industrial complexes requiring tailored solutions.",
      features: [
        "Unlimited Cameras",
        "On-Premise Deployment",
        "Custom SOP Training",
        "Unlimited Users",
        "Dedicated Account Manager",
        "24/7 Phone Support",
      ],
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-slate-600">
              Choose the plan that fits your facility's safety needs.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier, idx) => (
            <Reveal key={idx} delay={idx * 150}>
              <div
                className={`relative p-8 rounded-2xl bg-white border ${tier.recommended ? "border-blue-500 shadow-xl shadow-blue-900/10 scale-105 z-10" : "border-slate-200 shadow-sm"} flex flex-col h-full`}
              >
                {tier.recommended && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                    Recommended
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {tier.name}
                  </h3>
                  <p className="text-sm text-slate-500 min-h-[40px]">
                    {tier.desc}
                  </p>
                  <div className="mt-6 flex items-baseline gap-1">
                    {tier.price !== "Custom" && (
                      <span className="text-2xl font-bold text-slate-900">
                        Rp
                      </span>
                    )}
                    <span className="text-5xl font-extrabold text-slate-900">
                      {tier.price}
                    </span>
                    {tier.unit && (
                      <span className="text-xl text-slate-500">
                        {tier.unit}
                        <span className="text-sm">/month</span>
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  {tier.features.map((feature, fIdx) => (
                    <li
                      key={fIdx}
                      className="flex items-start gap-3 text-slate-700"
                    >
                      <CheckCircle2
                        className={`w-5 h-5 shrink-0 ${tier.recommended ? "text-blue-600" : "text-emerald-500"}`}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-4 rounded-xl font-bold transition-all ${tier.recommended ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg" : "bg-slate-100 text-slate-900 hover:bg-slate-200"}`}
                >
                  {tier.name === "Enterprise"
                    ? "Contact Sales"
                    : "Start Free Trial"}
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const FAQ = () => {
  const faqs = [
    {
      q: "Do I need to buy new AI cameras?",
      a: "No. VisionGuard AI connects to your existing IP/CCTV cameras via RTSP streams. As long as your cameras have a minimum resolution of 720p, our system can process the feed.",
    },
    {
      q: "Is my data secure and private?",
      a: "Absolutely. Video feeds are processed locally on the edge device or securely in our enterprise cloud, depending on your plan. We do not store historical video, only snapshot evidence of violations which is encrypted.",
    },
    {
      q: "How accurate is the detection in poor lighting?",
      a: "Our models are trained on diverse industrial datasets, including low-light environments. We achieve over 95% accuracy in standard factory conditions. If lighting is extremely poor, we recommend adding standard IR illuminators.",
    },
    {
      q: "Can we integrate this with our existing HR/HSE software?",
      a: "Yes, our Professional and Enterprise plans come with full REST API access, allowing you to automatically log violations into your existing ERP or HSE management platforms.",
    },
    {
      q: "How long does deployment take?",
      a: "Standard deployment for up to 20 cameras takes less than 48 hours. Our team handles the initial setup, camera calibration, and zone mapping remotely or on-site.",
    },
  ];

  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>
        </Reveal>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <Reveal key={idx} delay={idx * 100}>
              <div
                className={`border rounded-xl transition-all duration-300 ${openIdx === idx ? "border-blue-500 shadow-md bg-blue-50/30" : "border-slate-200 bg-white hover:border-slate-300"}`}
              >
                <button
                  onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)}
                  className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none"
                >
                  <span className="font-semibold text-slate-900 pr-4">
                    {faq.q}
                  </span>
                  {openIdx === idx ? (
                    <ChevronUp className="text-blue-600 shrink-0" />
                  ) : (
                    <ChevronDown className="text-slate-400 shrink-0" />
                  )}
                </button>
                <div
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openIdx === idx ? "max-h-48 pb-5 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <p className="text-slate-600 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTASection = ({ onEnterApp }) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, error, success

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus("error");
      return;
    }
    setStatus("success");
    setEmail("");
    setTimeout(() => setStatus("idle"), 5000);
    // Optionally trigger entry to app directly for demo
    if (onEnterApp) onEnterApp();
  };

  return (
    <section id="demo" className="py-24 bg-blue-600 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-blue-500 rounded-full blur-[80px]"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-96 h-96 bg-emerald-500/30 rounded-full blur-[80px]"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <Reveal>
          <ShieldHalf className="w-16 h-16 text-white/80 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to automate your safety monitoring?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join 50+ facilities already using VisionGuard AI. Experience how
            computer vision can transform your HSE operations.
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto relative">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your work email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                className={`flex-grow px-5 py-4 rounded-xl focus:outline-none focus:ring-2 bg-white text-slate-900 ${status === "error" ? "ring-2 ring-red-400 focus:ring-red-400" : "focus:ring-blue-400"}`}
              />
              <button
                type="button"
                onClick={onEnterApp}
                className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all hover:shadow-lg whitespace-nowrap"
              >
                Masuk Dashboard
              </button>
            </div>

            {status === "error" && (
              <p className="text-red-200 text-sm mt-2 text-left absolute -bottom-6 left-0">
                Please enter a valid email address.
              </p>
            )}
            {status === "success" && (
              <p className="text-emerald-300 text-sm mt-2 text-left absolute -bottom-6 left-0 flex items-center gap-1">
                <Check size={14} /> Request received! We'll contact you shortly.
              </p>
            )}
          </form>

          <p className="mt-10 text-sm text-blue-200 font-medium">
            No commitment required. Free 14-day trial available.
          </p>
        </Reveal>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <ShieldHalf className="text-blue-500 w-8 h-8" />
            <span className="font-bold text-2xl text-white tracking-tight">
              VisionGuard<span className="text-blue-500">.AI</span>
            </span>
          </div>
          <p className="text-sm mb-6 leading-relaxed">
            Leading AI-powered safety compliance monitoring system for
            industrial manufacturing in Southeast Asia.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Linkedin size={18} />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Twitter size={18} />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Facebook size={18} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Product</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Features
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Integrations
              </a>
            </li>
            <li>
              <a href="#pricing" className="hover:text-white transition-colors">
                Pricing
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Hardware Requirements
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Case Studies
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Company</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <a href="#" className="hover:text-white transition-colors">
                About Us
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Careers
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Blog
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Contact</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
              <span>
                Gedung Kesenian, Sudirman Central Business District, Jakarta
                12190
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-blue-500 shrink-0" />
              <span>+62 21 555 0123</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-500 shrink-0" />
              <span>hello@visionguard.ai</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
        <p>
          &copy; {new Date().getFullYear()} VisionGuard AI. All rights reserved.
        </p>
        <p>Built for a safer workplace.</p>
      </div>
    </div>
  </footer>
);

export default function LandingPage({ onEnterApp }) {
  return (
    <div className="font-sans text-slate-900 antialiased selection:bg-blue-200 selection:text-blue-900 scroll-smooth">
      <Navbar onEnterApp={onEnterApp} />
      <main>
        <Hero onEnterApp={onEnterApp} />
        <ProblemSection />
        <SolutionSection />
        <HowItWorks />
        <DetectionCapabilities />
        <ImpactSection />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTASection onEnterApp={onEnterApp} />
      </main>
      <Footer />
    </div>
  );
}

import { useState, useEffect } from 'react';
import {
  ArrowRight,
  TrendingUp,
  Shield,
  Zap,
  BarChart3,
  Target,
  Bell,
  Repeat,
  Download,
  Sparkles,
  CheckCircle2,
  Users,
  Star,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [scrollY, setScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: TrendingUp,
      title: '50/30/20 Budgeting',
      description: 'Proven financial framework that automatically allocates your income into needs, wants, and savings.',
      color: 'from-emerald-400 to-teal-500',
      delay: '0ms',
    },
    {
      icon: BarChart3,
      title: 'Smart Analytics',
      description: 'Beautiful charts and insights that help you understand your spending patterns at a glance.',
      color: 'from-blue-400 to-cyan-500',
      delay: '100ms',
    },
    {
      icon: Repeat,
      title: 'Recurring Transactions',
      description: 'Set it and forget it. Automatically track subscriptions and recurring expenses.',
      color: 'from-amber-400 to-orange-500',
      delay: '200ms',
    },
    {
      icon: Target,
      title: 'Savings Goals',
      description: 'Set targets, track progress, and celebrate achievements as you reach your financial milestones.',
      color: 'from-pink-400 to-rose-500',
      delay: '300ms',
    },
    {
      icon: Bell,
      title: 'Bill Reminders',
      description: 'Never miss a payment. Get timely reminders for all your upcoming bills and expenses.',
      color: 'from-violet-400 to-purple-500',
      delay: '400ms',
    },
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Your financial data is protected with enterprise-grade encryption and security.',
      color: 'from-slate-400 to-slate-600',
      delay: '500ms',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Active Users' },
    { value: '$2.5M+', label: 'Money Managed' },
    { value: '95%', label: 'Goal Success Rate' },
    { value: '4.9/5', label: 'User Rating' },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Freelance Designer',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
      content: 'BudgetFlow transformed how I manage my finances. The 50/30/20 rule finally makes sense, and I saved $5,000 in just 6 months!',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Software Engineer',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
      content: 'The analytics are incredible. I can see exactly where my money goes and make informed decisions. Best budgeting app I\'ve used.',
      rating: 5,
    },
    {
      name: 'Emma Williams',
      role: 'Marketing Manager',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
      content: 'Simple, beautiful, and effective. BudgetFlow helped me pay off my student loans while still enjoying life. Highly recommend!',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20 pointer-events-none" />

      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-slate-950/80 backdrop-blur-xl border-b border-slate-800' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl blur-lg opacity-50" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                BudgetFlow
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-slate-300 hover:text-white transition-colors">How It Works</a>
              <a href="#testimonials" className="text-slate-300 hover:text-white transition-colors">Testimonials</a>
              <button
                onClick={onGetStarted}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/60 hover:scale-105 transition-all duration-300"
              >
                Get Started Free
              </button>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-slate-800">
              <a href="#features" className="block text-slate-300 hover:text-white transition-colors py-2">Features</a>
              <a href="#how-it-works" className="block text-slate-300 hover:text-white transition-colors py-2">How It Works</a>
              <a href="#testimonials" className="block text-slate-300 hover:text-white transition-colors py-2">Testimonials</a>
              <button
                onClick={onGetStarted}
                className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl"
              >
                Get Started Free
              </button>
            </div>
          )}
        </div>
      </nav>

      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">Smart Financial Management</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Master Your Money<br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Achieve Your Goals
              </span>
            </h1>

            <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
              Take control of your finances with the proven 50/30/20 budgeting method.
              Smart analytics, automatic tracking, and beautiful insights that make budgeting effortless.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-500/70 hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                Start Free Today
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300">
                Watch Demo
              </button>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          <div className="relative mt-20">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none" />
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl"
              style={{
                transform: `translateY(${scrollY * 0.1}px)`,
                transition: 'transform 0.1s ease-out',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10" />
              <img
                src="/image.png"
                alt="BudgetFlow Dashboard"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Everything You Need to
              <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Succeed Financially
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Powerful features designed to make budgeting simple, automatic, and effective
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-emerald-500/50 transition-all duration-500 hover:scale-105"
                style={{ animationDelay: feature.delay }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 rounded-2xl transition-all duration-500" />

                <div className="relative">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{feature.description}</p>

                  <div className="mt-6 flex items-center text-emerald-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Learn more
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-emerald-950/10 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Three simple steps to transform your financial life
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-emerald-500/50 to-teal-500/50 -translate-y-1/2" />

            {[
              { step: '01', title: 'Create Account', desc: 'Sign up free in 30 seconds. No credit card required.' },
              { step: '02', title: 'Set Your Budget', desc: 'Enter your income and let our 50/30/20 rule do the magic.' },
              { step: '03', title: 'Track & Achieve', desc: 'Add transactions and watch your financial goals become reality.' },
            ].map((item, index) => (
              <div key={index} className="relative text-center">
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-2xl font-bold mb-6 shadow-xl shadow-emerald-500/50">
                  {item.step}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 blur-xl opacity-50 -z-10" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Loved by Thousands
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              See what our users are saying about their financial transformation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-slate-300 mb-6 leading-relaxed">"{testimonial.content}"</p>

                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/50"
                  />
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-slate-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />

            <div className="relative text-center">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                Ready to Transform Your<br />
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Financial Future?
                </span>
              </h2>
              <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                Join thousands of users who are already achieving their financial goals with BudgetFlow
              </p>

              <button
                onClick={onGetStarted}
                className="group px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-lg font-semibold rounded-xl shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-500/70 hover:scale-105 transition-all duration-300 inline-flex items-center gap-3"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="mt-6 text-slate-500 text-sm">
                No credit card required • Free forever plan • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">BudgetFlow</span>
              </div>
              <p className="text-slate-400 mb-6 max-w-sm">
                Master your finances with the proven 50/30/20 budgeting method. Smart, simple, and effective.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <Users className="w-5 h-5 text-slate-400" />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <Users className="w-5 h-5 text-slate-400" />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <Users className="w-5 h-5 text-slate-400" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-3">
                <li><a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Roadmap</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © 2024 BudgetFlow. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-slate-500 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-slate-500 hover:text-white transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

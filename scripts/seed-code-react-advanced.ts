#!/usr/bin/env bun
/**
 * Advanced React code examples — modern website patterns the model can reference.
 * Landing pages, dashboards, e-commerce, SaaS UI, animations, layouts.
 * Run: bun scripts/seed-code-react-advanced.ts
 */

import { assertBelief } from '../src/knowledge/beliefs.js'
import { ensureEntity } from '../src/knowledge/graph.js'
import { practiceSkill, addSkillNote } from '../src/growth/skills.js'

function seedCode(topic: string, examples: string[]) {
  console.log(`\n💻 Seeding: ${topic} (${examples.length} examples)`)
  ensureEntity(topic, 'technology', { seededAt: new Date().toISOString(), source: 'claude-react-advanced' })
  for (const ex of examples) assertBelief(ex, 'technical', `Code example for ${topic}`, 'claude-seeded')
  practiceSkill(topic, 'technology', true, `${examples.length} code examples seeded`)
}

// ════════════════════════════════════════════════════════════════════════
// MODERN LANDING PAGE COMPONENTS
// ════════════════════════════════════════════════════════════════════════

seedCode('React Landing Pages', [
  `Modern hero section with gradient text, animated background, and CTA:
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>
      <div className="relative z-10 text-center px-4 max-w-5xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm text-white/80 mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Now in public beta
        </div>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight">
          <span className="text-white">Build faster with</span>{" "}
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI-powered tools
          </span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Ship products 10x faster. Our platform handles the complexity so you can focus on what matters.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/signup" className="px-8 py-4 rounded-xl bg-white text-black font-semibold hover:bg-gray-100 transition-all hover:scale-105">
            Get Started Free
          </a>
          <a href="/demo" className="px-8 py-4 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/10 transition-all flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><polygon points="5,3 19,10 5,17" /></svg>
            Watch Demo
          </a>
        </div>
      </div>
    </section>
  );
}`,

  `Animated feature grid with icons and hover effects:
const features = [
  { icon: "⚡", title: "Lightning Fast", desc: "Built on edge infrastructure for sub-50ms response times globally." },
  { icon: "🔒", title: "Secure by Default", desc: "End-to-end encryption, SOC2 compliant, zero-trust architecture." },
  { icon: "📊", title: "Real-time Analytics", desc: "Track every metric that matters with live dashboards and alerts." },
  { icon: "🔌", title: "API First", desc: "RESTful and GraphQL APIs with SDKs for every major language." },
  { icon: "🤖", title: "AI Powered", desc: "Machine learning models that improve with every interaction." },
  { icon: "🌍", title: "Global Scale", desc: "Deploy to 30+ regions with automatic failover and load balancing." },
];

function FeatureGrid() {
  return (
    <section className="py-24 px-4 bg-gray-950">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Everything you need to ship</h2>
          <p className="mt-4 text-gray-400 max-w-xl mx-auto">Batteries included. No third-party tools required.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="group p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1">
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">{f.icon}</div>
              <h3 className="text-lg font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`,

  `Pricing section with toggle and highlighted plan:
"use client";
import { useState } from "react";

const plans = [
  { name: "Starter", monthly: 0, yearly: 0, features: ["1,000 requests/mo", "1 project", "Community support", "Basic analytics"], cta: "Start Free" },
  { name: "Pro", monthly: 29, yearly: 24, features: ["100,000 requests/mo", "Unlimited projects", "Priority support", "Advanced analytics", "Custom domains", "Team collaboration"], cta: "Start Trial", popular: true },
  { name: "Enterprise", monthly: 99, yearly: 84, features: ["Unlimited requests", "Unlimited everything", "24/7 phone support", "SLA guarantee", "SSO & SAML", "Dedicated account manager"], cta: "Contact Sales" },
];

function Pricing() {
  const [yearly, setYearly] = useState(false);
  return (
    <section className="py-24 px-4 bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold">Simple, transparent pricing</h2>
        <div className="mt-8 inline-flex items-center gap-3 p-1 rounded-full bg-gray-100 dark:bg-gray-800">
          <button onClick={() => setYearly(false)} className={\`px-4 py-2 rounded-full text-sm font-medium transition \${!yearly ? "bg-white dark:bg-gray-700 shadow" : "text-gray-500"}\`}>Monthly</button>
          <button onClick={() => setYearly(true)} className={\`px-4 py-2 rounded-full text-sm font-medium transition \${yearly ? "bg-white dark:bg-gray-700 shadow" : "text-gray-500"}\`}>
            Yearly <span className="text-green-500 text-xs ml-1">Save 20%</span>
          </button>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan.name} className={\`relative rounded-2xl p-8 \${plan.popular ? "bg-blue-600 text-white ring-2 ring-blue-600 scale-105" : "bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800"}\`}>
              {plan.popular && <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-500 text-white text-xs font-medium">Most Popular</div>}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">\${yearly ? plan.yearly : plan.monthly}</span>
                <span className={\`text-sm \${plan.popular ? "text-blue-100" : "text-gray-500"}\`}>/month</span>
              </div>
              <ul className="mt-6 space-y-3 text-left">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <svg className={\`w-4 h-4 flex-shrink-0 \${plan.popular ? "text-blue-200" : "text-green-500"}\`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button className={\`mt-8 w-full py-3 rounded-xl font-medium transition \${plan.popular ? "bg-white text-blue-600 hover:bg-blue-50" : "bg-blue-600 text-white hover:bg-blue-700"}\`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`,

  `Testimonial carousel with auto-scroll and avatars:
"use client";
import { useEffect, useState } from "react";

const testimonials = [
  { name: "Sarah Chen", role: "CTO at Vercel", avatar: "/avatars/sarah.jpg", text: "This tool cut our deploy time from 20 minutes to 30 seconds. Game changer." },
  { name: "Marcus Johnson", role: "Lead Engineer at Stripe", avatar: "/avatars/marcus.jpg", text: "The API is incredibly well-designed. We integrated it in a single afternoon." },
  { name: "Elena Rodriguez", role: "Founder at Acme", avatar: "/avatars/elena.jpg", text: "We switched from three different tools to just this one. Simpler and more powerful." },
];

function Testimonials() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setActive((i) => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12">Loved by developers</h2>
        <div className="relative h-48">
          {testimonials.map((t, i) => (
            <div key={t.name} className={\`absolute inset-0 transition-all duration-500 \${i === active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}\`}>
              <blockquote className="text-xl text-gray-700 dark:text-gray-300 italic">"{t.text}"</blockquote>
              <div className="mt-6 flex items-center justify-center gap-3">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full" />
                <div className="text-left">
                  <div className="font-medium text-sm">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={\`w-2 h-2 rounded-full transition-all \${i === active ? "bg-blue-600 w-6" : "bg-gray-300"}\`} />
          ))}
        </div>
      </div>
    </section>
  );
}`,

  `Modern footer with columns, newsletter, and social links:
function Footer() {
  const links = {
    Product: ["Features", "Pricing", "Changelog", "Docs", "API Reference"],
    Company: ["About", "Blog", "Careers", "Press", "Partners"],
    Legal: ["Privacy", "Terms", "Security", "GDPR"],
    Support: ["Help Center", "Community", "Status", "Contact"],
  };
  return (
    <footer className="bg-gray-950 text-gray-400 pt-16 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-white font-bold text-xl mb-4">Acme</h3>
            <p className="text-sm leading-relaxed">Build better products faster with our developer platform.</p>
            <div className="flex gap-3 mt-4">
              {["twitter", "github", "discord"].map((s) => (
                <a key={s} href={\`https://\${s}.com/acme\`} className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition">
                  <span className="text-xs">{s[0]?.toUpperCase()}</span>
                </a>
              ))}
            </div>
          </div>
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-white font-medium text-sm mb-4">{category}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}><a href="#" className="text-sm hover:text-white transition">{item}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs">2025 Acme Inc. All rights reserved.</p>
          <form className="flex gap-2">
            <input type="email" placeholder="Subscribe to updates" className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 outline-none w-64" />
            <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition">Subscribe</button>
          </form>
        </div>
      </div>
    </footer>
  );
}`,
])

// ════════════════════════════════════════════════════════════════════════
// DASHBOARD / SaaS UI COMPONENTS
// ════════════════════════════════════════════════════════════════════════

seedCode('React Dashboard UI', [
  `SaaS dashboard sidebar with active states and collapsible groups:
"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "grid" },
  { label: "Analytics", href: "/analytics", icon: "chart" },
  { group: "Management", items: [
    { label: "Users", href: "/users", icon: "users" },
    { label: "Products", href: "/products", icon: "box" },
    { label: "Orders", href: "/orders", icon: "cart" },
  ]},
  { group: "Settings", items: [
    { label: "General", href: "/settings", icon: "cog" },
    { label: "Billing", href: "/billing", icon: "card" },
    { label: "API Keys", href: "/api-keys", icon: "key" },
  ]},
];

function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <aside className="w-64 h-screen bg-gray-950 border-r border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-white font-bold text-lg">Acme Dashboard</h1>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item, i) => {
          if ("group" in item) {
            const isOpen = !collapsed[item.group];
            return (
              <div key={item.group}>
                <button onClick={() => setCollapsed(s => ({ ...s, [item.group!]: !s[item.group!] }))}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-300">
                  {item.group}
                  <span className={\`transition-transform \${isOpen ? "rotate-0" : "-rotate-90"}\`}>▾</span>
                </button>
                {isOpen && item.items.map((sub) => (
                  <Link key={sub.href} href={sub.href}
                    className={\`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition \${pathname === sub.href ? "bg-blue-600/10 text-blue-400" : "text-gray-400 hover:text-white hover:bg-gray-800"}\`}>
                    <span className="w-5 text-center">{sub.icon[0]}</span>
                    {sub.label}
                  </Link>
                ))}
              </div>
            );
          }
          return (
            <Link key={item.href} href={item.href!}
              className={\`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition \${pathname === item.href ? "bg-blue-600/10 text-blue-400" : "text-gray-400 hover:text-white hover:bg-gray-800"}\`}>
              <span className="w-5 text-center">{item.icon?.[0]}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">J</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white truncate">Joel Hernandez</div>
            <div className="text-xs text-gray-500 truncate">joel@acme.com</div>
          </div>
        </div>
      </div>
    </aside>
  );
}`,

  `Stats cards with sparkline trend and percentage change:
function StatsCards({ stats }: { stats: Array<{ label: string; value: string; change: number; data: number[] }> }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{stat.label}</span>
            <span className={\`text-xs font-medium px-2 py-0.5 rounded-full \${stat.change >= 0 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}\`}>
              {stat.change >= 0 ? "+" : ""}{stat.change}%
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold">{stat.value}</div>
          <div className="mt-3 flex items-end gap-0.5 h-8">
            {stat.data.map((v, i) => {
              const max = Math.max(...stat.data);
              const height = max > 0 ? (v / max) * 100 : 0;
              return (
                <div key={i} className={\`flex-1 rounded-sm transition-all \${stat.change >= 0 ? "bg-green-200 dark:bg-green-800" : "bg-red-200 dark:bg-red-800"}\`}
                  style={{ height: \`\${Math.max(height, 4)}%\` }} />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}`,

  `Data table with sorting, search, and pagination:
"use client";
import { useState, useMemo } from "react";

interface Column<T> { key: keyof T; label: string; sortable?: boolean; render?: (value: T[keyof T], row: T) => React.ReactNode }

function DataTable<T extends { id: string | number }>({ data, columns, pageSize = 10 }: { data: T[]; columns: Column<T>[]; pageSize?: number }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let result = data.filter((row) =>
      columns.some((col) => String(row[col.key]).toLowerCase().includes(search.toLowerCase()))
    );
    if (sortKey) {
      result = [...result].sort((a, b) => {
        const va = a[sortKey], vb = b[sortKey];
        const cmp = va < vb ? -1 : va > vb ? 1 : 0;
        return sortAsc ? cmp : -cmp;
      });
    }
    return result;
  }, [data, search, sortKey, sortAsc, columns]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pageData = filtered.slice(page * pageSize, (page + 1) * pageSize);

  function toggleSort(key: keyof T) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          placeholder="Search..." className="w-full sm:w-72 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              {columns.map((col) => (
                <th key={String(col.key)} onClick={() => col.sortable && toggleSort(col.key)}
                  className={\`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider \${col.sortable ? "cursor-pointer hover:text-gray-700 select-none" : ""}\`}>
                  {col.label} {sortKey === col.key && (sortAsc ? "↑" : "↓")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {pageData.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3 text-sm">
                    {col.render ? col.render(row[col.key], row) : String(row[col.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-sm text-gray-500">
        <span>{filtered.length} results</span>
        <div className="flex gap-1">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
            className="px-3 py-1 rounded border disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800">Prev</button>
          <span className="px-3 py-1">{page + 1} / {totalPages || 1}</span>
          <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
            className="px-3 py-1 rounded border disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-800">Next</button>
        </div>
      </div>
    </div>
  );
}`,

  `Modal/dialog component with animations and keyboard handling:
"use client";
import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl" };

function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div ref={overlayRef} onClick={(e) => e.target === overlayRef.current && onClose()}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.3 }}
            className={\`relative w-full \${sizes[size]} bg-white dark:bg-gray-900 rounded-2xl shadow-2xl\`}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition">
                <span className="text-gray-400">✕</span>
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}`,

  `Command palette / search modal (Cmd+K) like Vercel/Linear:
"use client";
import { useState, useEffect, useRef } from "react";

const commands = [
  { id: "dashboard", label: "Go to Dashboard", group: "Navigation", shortcut: "G D" },
  { id: "users", label: "Go to Users", group: "Navigation", shortcut: "G U" },
  { id: "settings", label: "Go to Settings", group: "Navigation", shortcut: "G S" },
  { id: "new-project", label: "Create New Project", group: "Actions", shortcut: "N P" },
  { id: "new-user", label: "Invite Team Member", group: "Actions" },
  { id: "theme", label: "Toggle Dark Mode", group: "Preferences" },
  { id: "docs", label: "Open Documentation", group: "Help" },
];

function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(true); setQuery(""); setSelected(0); }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  const filtered = commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));
  const groups = [...new Set(filtered.map((c) => c.group))];

  function execute(id: string) { setOpen(false); console.log("Execute:", id); }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center gap-3 px-4 border-b border-gray-200 dark:border-gray-800">
          <span className="text-gray-400">⌘</span>
          <input ref={inputRef} value={query} onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
            placeholder="Type a command or search..." className="flex-1 py-4 bg-transparent text-sm outline-none" />
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {groups.map((group) => (
            <div key={group}>
              <div className="px-3 py-1.5 text-xs font-medium text-gray-400 uppercase">{group}</div>
              {filtered.filter((c) => c.group === group).map((cmd) => {
                const idx = filtered.indexOf(cmd);
                return (
                  <button key={cmd.id} onClick={() => execute(cmd.id)}
                    onMouseEnter={() => setSelected(idx)}
                    className={\`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition \${idx === selected ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"}\`}>
                    {cmd.label}
                    {cmd.shortcut && <kbd className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{cmd.shortcut}</kbd>}
                  </button>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && <div className="py-8 text-center text-sm text-gray-400">No results found</div>}
        </div>
      </div>
    </div>
  );
}`,

  `Toast notification system with stacking and auto-dismiss:
"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ToastType = "success" | "error" | "info" | "warning";
interface Toast { id: string; message: string; type: ToastType }

const ToastContext = createContext<{ toast: (message: string, type?: ToastType) => void }>({ toast: () => {} });
export const useToast = () => useContext(ToastContext);

const icons: Record<ToastType, string> = { success: "✓", error: "✕", info: "ℹ", warning: "⚠" };
const colors: Record<ToastType, string> = {
  success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300",
  error: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300",
  info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-300",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100 }}
              className={\`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg \${colors[t.type]}\`}>
              <span className="text-lg">{icons[t.type]}</span>
              <span className="text-sm font-medium">{t.message}</span>
              <button onClick={() => setToasts((ts) => ts.filter((x) => x.id !== t.id))}
                className="ml-2 opacity-50 hover:opacity-100">✕</button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}`,
])

// ════════════════════════════════════════════════════════════════════════
// NEXT.JS APP PATTERNS
// ════════════════════════════════════════════════════════════════════════

seedCode('Next.js App Patterns', [
  `Next.js App Router layout with metadata, fonts, and providers:
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastProvider } from "@/components/toast";
import { ThemeProvider } from "@/components/theme";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "Acme Dashboard", template: "%s | Acme" },
  description: "Modern SaaS dashboard built with Next.js",
  openGraph: { images: ["/og.png"] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}`,

  `Next.js API route handler with Zod validation and error handling:
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const CreateProductSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.number().positive(),
  description: z.string().optional(),
  category: z.enum(["electronics", "clothing", "food", "other"]),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CreateProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const product = await db.product.create({ data: parsed.data });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || "1");
  const limit = Math.min(Number(searchParams.get("limit") || "20"), 100);
  const category = searchParams.get("category");

  const where = category ? { category } : {};
  const [products, total] = await Promise.all([
    db.product.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
    db.product.count({ where }),
  ]);

  return NextResponse.json({ data: products, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}`,

  `Next.js middleware for auth, rate limiting, and redirects:
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/api/auth"];
const RATE_LIMIT = new Map<string, { count: number; resetAt: number }>();

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limiting for API routes
  if (pathname.startsWith("/api")) {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const entry = RATE_LIMIT.get(ip);
    if (entry && entry.resetAt > now) {
      if (entry.count >= 100) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)) } });
      }
      entry.count++;
    } else {
      RATE_LIMIT.set(ip, { count: 1, resetAt: now + 60_000 });
    }
  }

  // Auth check for protected routes
  if (!PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    const token = request.cookies.get("session")?.value;
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };`,
])

console.log('\n✅ Advanced React code examples seeded!')
console.log('Ghost now has production patterns for: landing pages, dashboards, SaaS UI, Next.js')

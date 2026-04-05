#!/usr/bin/env bun
/**
 * React Mastery — exhaustive code examples for building production websites.
 * Every pattern a senior React dev uses daily.
 * Run: bun scripts/seed-code-react-mastery.ts
 */

import { assertBelief } from '../src/knowledge/beliefs.js'
import { ensureEntity } from '../src/knowledge/graph.js'
import { practiceSkill } from '../src/growth/skills.js'

function seed(topic: string, examples: string[]) {
  console.log(`\n💻 ${topic} (${examples.length})`)
  ensureEntity(topic, 'technology', { seededAt: new Date().toISOString(), source: 'claude-react-mastery' })
  for (const ex of examples) assertBelief(ex, 'technical', `Code: ${topic}`, 'claude-seeded')
  practiceSkill(topic, 'technology', true, `${examples.length} examples`)
}

// ════════════════════════════════════════════════════════════════════════
// ADVANCED ANIMATIONS & MICRO-INTERACTIONS
// ════════════════════════════════════════════════════════════════════════

seed('React Micro-Interactions', [
  `Button with press scale + ripple effect:
"use client";
import { motion } from "framer-motion";

function Button({ children, onClick, variant = "primary" }: { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "ghost" }) {
  const styles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800",
  };
  return (
    <motion.button onClick={onClick}
      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={\`relative overflow-hidden px-6 py-3 rounded-xl font-medium transition-colors \${styles[variant]}\`}>
      {children}
    </motion.button>
  );
}`,

  `Animated hamburger menu icon that morphs to X:
"use client";
import { motion } from "framer-motion";

function MenuToggle({ isOpen, toggle }: { isOpen: boolean; toggle: () => void }) {
  return (
    <button onClick={toggle} className="relative w-10 h-10 flex items-center justify-center">
      <motion.span animate={isOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -6 }}
        className="absolute w-6 h-0.5 bg-current" transition={{ duration: 0.2 }} />
      <motion.span animate={{ opacity: isOpen ? 0 : 1 }}
        className="absolute w-6 h-0.5 bg-current" transition={{ duration: 0.1 }} />
      <motion.span animate={isOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 6 }}
        className="absolute w-6 h-0.5 bg-current" transition={{ duration: 0.2 }} />
    </button>
  );
}`,

  `Animated tabs with sliding indicator:
"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

function AnimatedTabs({ tabs, defaultTab = 0 }: { tabs: Array<{ label: string; content: React.ReactNode }>; defaultTab?: number }) {
  const [active, setActive] = useState(defaultTab);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const el = tabRefs.current[active];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [active]);

  return (
    <div>
      <div className="relative border-b border-gray-200 dark:border-gray-800">
        <div className="flex gap-1">
          {tabs.map((tab, i) => (
            <button key={tab.label} ref={(el) => { tabRefs.current[i] = el; }}
              onClick={() => setActive(i)}
              className={\`px-4 py-3 text-sm font-medium transition-colors relative z-10 \${i === active ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}\`}>
              {tab.label}
            </button>
          ))}
        </div>
        <motion.div animate={{ left: indicator.left, width: indicator.width }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute bottom-0 h-0.5 bg-blue-600 rounded-full" />
      </div>
      <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }} className="pt-6">
        {tabs[active]?.content}
      </motion.div>
    </div>
  );
}`,

  `Animated accordion/FAQ with height auto-animation:
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Accordion({ items }: { items: Array<{ question: string; answer: string }> }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <button onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition">
            {item.question}
            <motion.span animate={{ rotate: openIndex === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
              ▾
            </motion.span>
          </button>
          <AnimatePresence>
            {openIndex === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
                <div className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.answer}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}`,

  `Typewriter text effect with cursor:
"use client";
import { useEffect, useState } from "react";

function Typewriter({ texts, speed = 50, deleteSpeed = 30, pauseTime = 2000 }: { texts: string[]; speed?: number; deleteSpeed?: number; pauseTime?: number }) {
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const currentText = texts[textIndex] || "";

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (charIndex < currentText.length) {
          setCharIndex(charIndex + 1);
        } else {
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        if (charIndex > 0) {
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          setTextIndex((textIndex + 1) % texts.length);
        }
      }
    }, isDeleting ? deleteSpeed : speed);
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex, texts, speed, deleteSpeed, pauseTime, currentText]);

  return (
    <span>
      {currentText.slice(0, charIndex)}
      <span className="animate-pulse text-blue-500">|</span>
    </span>
  );
}

// Usage: <h1>I build <Typewriter texts={["websites", "mobile apps", "AI tools", "games"]} /></h1>`,

  `Smooth counter animation that counts up on scroll:
"use client";
import { useEffect, useRef, useState } from "react";

function CountUp({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && !counted.current) {
        counted.current = true;
        const startTime = Date.now();
        const step = () => {
          const progress = Math.min((Date.now() - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
          setCount(Math.floor(eased * end));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// Usage: <CountUp end={10000} suffix="+" /> renders "10,000+"`,
])

// ════════════════════════════════════════════════════════════════════════
// MODERN NAVIGATION PATTERNS
// ════════════════════════════════════════════════════════════════════════

seed('React Navigation Patterns', [
  `Responsive navbar with mobile menu, blur backdrop, and active link:
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav className={\`fixed top-0 inset-x-0 z-50 transition-all duration-300 \${scrolled ? "bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50" : "bg-transparent"}\`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold">Joel H.</Link>
          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href}
                className={\`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors \${pathname === link.href ? "text-blue-600" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}\`}>
                {link.label}
                {pathname === link.href && (
                  <motion.div layoutId="navbar-indicator" className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 rounded-lg -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                )}
              </Link>
            ))}
          </div>
          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2">
            <span className="sr-only">Menu</span>
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>
      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 top-16 z-40 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 md:hidden">
            <div className="p-4 space-y-1">
              {links.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                  className={\`block px-4 py-3 rounded-lg text-sm font-medium \${pathname === link.href ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600" : "text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900"}\`}>
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}`,

  `Smooth scroll to section with offset for fixed navbar:
function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (element) {
    const navbarHeight = 80; // Height of fixed navbar
    const top = element.getBoundingClientRect().top + window.scrollY - navbarHeight;
    window.scrollTo({ top, behavior: "smooth" });
  }
}

// In navbar links:
<button onClick={() => scrollToSection("about")} className="...">About</button>
<button onClick={() => scrollToSection("projects")} className="...">Projects</button>

// In sections:
<section id="about" className="scroll-mt-20">...</section>
<section id="projects" className="scroll-mt-20">...</section>`,
])

// ════════════════════════════════════════════════════════════════════════
// COMPLETE SECTION COMPONENTS
// ════════════════════════════════════════════════════════════════════════

seed('React Section Components', [
  `Skills section with animated progress bars:
"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const skills = [
  { name: "React / Next.js", level: 95, color: "from-blue-500 to-cyan-500" },
  { name: "TypeScript", level: 90, color: "from-blue-600 to-indigo-600" },
  { name: "Node.js", level: 85, color: "from-green-500 to-emerald-500" },
  { name: "Python", level: 80, color: "from-yellow-500 to-orange-500" },
  { name: "C# / .NET", level: 85, color: "from-purple-500 to-violet-500" },
  { name: "Swift / iOS", level: 75, color: "from-orange-500 to-red-500" },
  { name: "Unity / Game Dev", level: 70, color: "from-gray-500 to-gray-700" },
  { name: "DevOps / AWS", level: 80, color: "from-amber-500 to-yellow-600" },
];

function SkillsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="skills" className="py-20 px-4">
      <div className="max-w-3xl mx-auto" ref={ref}>
        <h2 className="text-3xl font-bold mb-12 text-center">Skills & Expertise</h2>
        <div className="space-y-6">
          {skills.map((skill, i) => (
            <div key={skill.name}>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">{skill.name}</span>
                <span className="text-sm text-gray-500">{skill.level}%</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={inView ? { width: skill.level + "%" } : { width: 0 }}
                  transition={{ duration: 1, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className={\`h-full rounded-full bg-gradient-to-r \${skill.color}\`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}`,

  `Experience timeline with alternating sides and animations:
"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const experiences = [
  { year: "2024 - Present", role: "Senior Engineer", company: "Tech Corp", desc: "Led team of 8 engineers. Architected microservices platform serving 2M users." },
  { year: "2020 - 2024", role: "Full Stack Developer", company: "StartupX", desc: "Built React + Node.js platform from 0 to $5M ARR. Implemented CI/CD pipeline." },
  { year: "2016 - 2020", role: "Software Developer", company: "Agency Inc", desc: "Delivered 50+ client projects across web, mobile, and cloud platforms." },
  { year: "2012 - 2016", role: "Junior Developer", company: "First Job LLC", desc: "Started career building WordPress sites, grew into full-stack development." },
];

function ExperienceTimeline() {
  return (
    <section id="experience" className="py-20 px-4">
      <h2 className="text-3xl font-bold mb-16 text-center">Experience</h2>
      <div className="max-w-3xl mx-auto relative">
        {/* Vertical line */}
        <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800 -translate-x-1/2" />
        {experiences.map((exp, i) => {
          const ref = useRef(null);
          const inView = useInView(ref, { once: true, margin: "-50px" });
          const isLeft = i % 2 === 0;
          return (
            <motion.div key={exp.year} ref={ref}
              initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={\`relative mb-12 md:w-1/2 \${isLeft ? "md:pr-12 md:text-right" : "md:pl-12 md:ml-auto"}\`}>
              {/* Dot on timeline */}
              <div className={\`absolute top-2 w-3 h-3 rounded-full bg-blue-600 border-2 border-white dark:border-gray-950 \${isLeft ? "md:-right-1.5 -left-1.5 md:left-auto" : "-left-1.5 md:-left-1.5"}\`} />
              <div className="ml-6 md:ml-0 p-5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <span className="text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">{exp.year}</span>
                <h3 className="mt-3 font-semibold">{exp.role}</h3>
                <p className="text-sm text-gray-500">{exp.company}</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{exp.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}`,

  `Project showcase cards with hover video/image preview:
"use client";
import { useState } from "react";
import { motion } from "framer-motion";

const projects = [
  { title: "AI Dashboard", desc: "Real-time analytics platform with ML predictions", tech: ["React", "Python", "TensorFlow"], image: "/projects/ai-dash.jpg", link: "https://github.com/..." },
  { title: "E-commerce App", desc: "Full-stack store with Stripe payments and admin panel", tech: ["Next.js", "Prisma", "Stripe"], image: "/projects/ecom.jpg", link: "https://github.com/..." },
  { title: "Mobile Fitness", desc: "iOS app with workout tracking and health integrations", tech: ["Swift", "SwiftUI", "HealthKit"], image: "/projects/fitness.jpg", link: "https://github.com/..." },
];

function ProjectsSection() {
  return (
    <section id="projects" className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-4 text-center">Featured Projects</h2>
        <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">A selection of projects I've built across web, mobile, and AI.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <motion.a key={project.title} href={project.link} target="_blank"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1 }}
              className="group block rounded-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <img src={project.image} alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">{project.title}</h3>
                <p className="mt-1 text-sm text-gray-500 leading-relaxed">{project.desc}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <span key={t} className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{t}</span>
                  ))}
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}`,

  `Contact section with animated form and social links:
"use client";
import { useState } from "react";
import { motion } from "framer-motion";

function ContactSection() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.currentTarget);
    try {
      await fetch("/api/contact", { method: "POST", body: JSON.stringify(Object.fromEntries(form)), headers: { "Content-Type": "application/json" } });
      setStatus("sent");
    } catch { setStatus("error"); }
  }

  return (
    <section id="contact" className="py-20 px-4">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
        <p className="text-gray-500 mb-8">Have a project in mind? Let's talk.</p>
        {status === "sent" ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="p-8 rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-600">
            <div className="text-4xl mb-3">✓</div>
            <p className="font-medium">Message sent! I'll get back to you soon.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input name="name" required className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input name="email" type="email" required className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea name="message" rows={5} required className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition resize-none" />
            </div>
            <button type="submit" disabled={status === "sending"}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition">
              {status === "sending" ? "Sending..." : "Send Message"}
            </button>
          </form>
        )}
        <div className="mt-12 flex justify-center gap-4">
          {[
            { label: "GitHub", href: "https://github.com/joelhjames1", icon: "GH" },
            { label: "LinkedIn", href: "https://linkedin.com/in/joelhjames614", icon: "LI" },
            { label: "Email", href: "mailto:joel@example.com", icon: "@" },
          ].map((social) => (
            <a key={social.label} href={social.href} target="_blank" rel="noopener"
              className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 flex items-center justify-center transition text-sm font-bold">
              {social.icon}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}`,
])

// ════════════════════════════════════════════════════════════════════════
// ADVANCED UI PATTERNS
// ════════════════════════════════════════════════════════════════════════

seed('React Advanced UI Patterns', [
  `Image gallery with lightbox and keyboard navigation:
"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

function ImageGallery({ images }: { images: Array<{ src: string; alt: string; width: number; height: number }> }) {
  const [selected, setSelected] = useState<number | null>(null);

  const navigate = useCallback((dir: 1 | -1) => {
    if (selected === null) return;
    setSelected((selected + dir + images.length) % images.length);
  }, [selected, images.length]);

  useEffect(() => {
    if (selected === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "ArrowLeft") navigate(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [selected, navigate]);

  return (
    <>
      <div className="columns-2 md:columns-3 gap-4 space-y-4">
        {images.map((img, i) => (
          <motion.img key={img.src} src={img.src} alt={img.alt}
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelected(i)}
            className="w-full rounded-xl cursor-pointer hover:shadow-lg transition-shadow" />
        ))}
      </div>
      <AnimatePresence>
        {selected !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <button onClick={(e) => { e.stopPropagation(); navigate(-1); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-4xl">‹</button>
            <motion.img key={selected} src={images[selected]?.src} alt={images[selected]?.alt}
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
            <button onClick={(e) => { e.stopPropagation(); navigate(1); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-4xl">›</button>
            <div className="absolute bottom-4 text-white/60 text-sm">{selected + 1} / {images.length}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}`,

  `Infinite scroll with intersection observer:
"use client";
import { useEffect, useRef, useState, useCallback } from "react";

function useInfiniteScroll<T>(fetchPage: (page: number) => Promise<T[]>) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const newItems = await fetchPage(page);
    if (newItems.length === 0) setHasMore(false);
    else {
      setItems((prev) => [...prev, ...newItems]);
      setPage((p) => p + 1);
    }
    setLoading(false);
  }, [page, loading, hasMore, fetchPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) loadMore();
    }, { rootMargin: "200px" });
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  return { items, loading, hasMore, sentinelRef: observerRef };
}

// Usage:
function PostFeed() {
  const { items, loading, hasMore, sentinelRef } = useInfiniteScroll<Post>(
    async (page) => {
      const res = await fetch(\`/api/posts?page=\${page}&limit=10\`);
      return res.json();
    }
  );
  return (
    <div className="space-y-4">
      {items.map((post) => <PostCard key={post.id} post={post} />)}
      {loading && <div className="text-center py-4"><Spinner /></div>}
      {hasMore && <div ref={sentinelRef} />}
      {!hasMore && <p className="text-center text-gray-400 py-8">No more posts</p>}
    </div>
  );
}`,

  `Drag and drop sortable list:
"use client";
import { useState, useRef } from "react";
import { motion, Reorder } from "framer-motion";

function SortableList<T extends { id: string; label: string }>({ initialItems }: { initialItems: T[] }) {
  const [items, setItems] = useState(initialItems);

  return (
    <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2">
      {items.map((item) => (
        <Reorder.Item key={item.id} value={item}
          className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow"
          whileDrag={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
          <div className="flex items-center gap-3">
            <span className="text-gray-400">⠿</span>
            <span className="font-medium">{item.label}</span>
          </div>
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}`,
])

// ════════════════════════════════════════════════════════════════════════
// TAILWIND CSS UTILITIES & PATTERNS
// ════════════════════════════════════════════════════════════════════════

seed('Tailwind CSS Patterns', [
  `Custom Tailwind CSS v4 theme with design tokens:
/* index.css */
@import "tailwindcss";

@theme {
  --color-primary: #4285F4;
  --color-primary-dark: #3367D6;
  --color-primary-light: #8AB4F8;
  --color-accent: #FF6B6B;
  --color-surface: #FFFFFF;
  --color-surface-dark: #0A0A0B;
  --color-text: #1A1A2E;
  --color-text-dark: #E8E8ED;
  --color-muted: #6B7280;
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
}

/* Dark mode variant */
@custom-variant dark (&:where(.dark, .dark *));

/* Custom utilities */
@utility container-page {
  max-width: 1200px;
  margin-inline: auto;
  padding-inline: 1rem;
}

@utility text-gradient {
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}`,

  `Glassmorphism card, neumorphism card, and gradient border card in Tailwind:
/* Glassmorphism */
<div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg">
  Glass content here
</div>

/* Neumorphism (light mode only) */
<div className="bg-gray-100 rounded-2xl p-6 shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff]">
  Neumorphic content
</div>

/* Gradient border */
<div className="relative rounded-2xl p-px bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
  <div className="bg-white dark:bg-gray-950 rounded-[calc(1rem-1px)] p-6">
    Content with gradient border
  </div>
</div>

/* Animated gradient background */
<div className="relative overflow-hidden rounded-2xl">
  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-[gradient_3s_ease_infinite] bg-[length:200%_100%]" />
  <div className="relative p-6 text-white">
    Content over animated gradient
  </div>
</div>`,

  `Responsive grid patterns for common layouts:
/* Auto-fill responsive grid — items size themselves */
<div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-6">
  {items.map(item => <Card key={item.id} />)}
</div>

/* Bento grid — mixed sizes */
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
  <div className="col-span-2 row-span-2 rounded-2xl bg-blue-500" /> {/* Large */}
  <div className="rounded-2xl bg-gray-100" /> {/* Small */}
  <div className="rounded-2xl bg-gray-100" /> {/* Small */}
  <div className="col-span-2 rounded-2xl bg-gray-100" /> {/* Wide */}
</div>

/* Sidebar + content layout */
<div className="grid grid-cols-1 md:grid-cols-[260px_1fr] min-h-screen">
  <aside className="border-r p-4">Sidebar</aside>
  <main className="p-8">Content</main>
</div>

/* Full-page hero with content overlay */
<div className="grid grid-rows-[1fr_auto] min-h-screen">
  <div className="flex items-center justify-center">Hero content</div>
  <div className="py-4 text-center">Scroll indicator ↓</div>
</div>`,
])

// ════════════════════════════════════════════════════════════════════════
// REACT HOOKS PATTERNS
// ════════════════════════════════════════════════════════════════════════

seed('React Custom Hooks', [
  `useDebounce — debounce any value for search inputs:
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// Usage:
function SearchInput() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  useEffect(() => { if (debouncedQuery) searchAPI(debouncedQuery); }, [debouncedQuery]);
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}`,

  `useLocalStorage — persist state to localStorage:
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [stored, setStored] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : initialValue; }
    catch { return initialValue; }
  });
  const setValue = (value: T | ((prev: T) => T)) => {
    const newValue = value instanceof Function ? value(stored) : value;
    setStored(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };
  return [stored, setValue];
}

// Usage: const [theme, setTheme] = useLocalStorage("theme", "light");`,

  `useMediaQuery — responsive hooks for conditional rendering:
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);
  return matches;
}

// Usage:
const isMobile = useMediaQuery("(max-width: 768px)");
const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
return isMobile ? <MobileNav /> : <DesktopNav />;`,

  `useClickOutside — close dropdowns/modals when clicking outside:
function useClickOutside(ref: React.RefObject<HTMLElement>, handler: () => void) {
  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) handler();
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [ref, handler]);
}

// Usage:
function Dropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));
  return <div ref={ref}>{open && <DropdownMenu />}</div>;
}`,
])

console.log('\n✅ React Mastery code examples seeded!')
console.log('Ghost now has: micro-interactions, navigation, sections, advanced UI, Tailwind patterns, custom hooks')

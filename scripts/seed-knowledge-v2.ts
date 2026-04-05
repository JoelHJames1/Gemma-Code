#!/usr/bin/env bun
/**
 * Seed Ghost's knowledge base — Volume 2
 * Modern React, Advanced React, Beautiful UI, Advanced CSS, Security, Best Practices
 * Run: bun scripts/seed-knowledge-v2.ts
 */

import { assertBelief } from '../src/knowledge/beliefs.js'
import { ensureEntity, addRelation } from '../src/knowledge/graph.js'
import { practiceSkill, addSkillNote } from '../src/growth/skills.js'

function seedTopic(
  topic: string,
  domain: string,
  concepts: string[],
  subConcepts: Array<{ name: string; type: string; relation: string }> = [],
) {
  console.log(`\n📚 Seeding: ${topic} (${concepts.length} concepts)`)

  ensureEntity(topic, 'technology', {
    seededAt: new Date().toISOString(),
    source: 'claude-expert-knowledge-v2',
    conceptCount: String(concepts.length),
  })

  for (const concept of concepts) {
    assertBelief(concept, 'technical', `Expert knowledge on ${topic}`, 'claude-seeded')
  }

  for (const sub of subConcepts) {
    ensureEntity(sub.name, sub.type as any)
    addRelation(sub.name, sub.type as any, topic, 'technology', sub.relation as any, `${sub.name} ${sub.relation} ${topic}`, 0.9, 'claude-seeded')
  }

  practiceSkill(topic, domain, true, `Expert knowledge seeded: ${concepts.length} concepts`)
  addSkillNote(topic, `Deep knowledge seeded by Claude (v2). Covers advanced patterns, production techniques, and modern best practices.`)
}

// ════════════════════════════════════════════════════════════════════════
// MODERN REACT (DEEP DIVE)
// ════════════════════════════════════════════════════════════════════════

seedTopic('Modern React Patterns', 'technology', [
  // App Router & Server Components
  'Next.js App Router (app/ directory) is the modern standard. Pages Router (pages/) is legacy. All new projects should use App Router.',
  'Server Components are the default in App Router. They run on the server, have zero JS bundle cost, and can directly query databases.',
  'Client Components need "use client" at the top of the file. Only add it when you need useState, useEffect, onClick, or browser APIs.',
  'Server Actions are async functions with "use server" that run on the server but can be called from client components like regular functions.',
  'Server Actions replace API routes for mutations: async function createUser(formData: FormData) { "use server"; await db.insert(formData); }',
  'Streaming with Suspense: wrap slow components in <Suspense fallback={<Skeleton />}>. The shell renders instantly, content streams in.',
  'Loading.tsx files in App Router automatically wrap the page in Suspense. error.tsx catches errors. layout.tsx persists across navigations.',
  'Parallel routes (@modal, @sidebar) render multiple pages simultaneously in the same layout. Used for modals and split views.',
  'Intercepting routes (.) allow showing a modal on navigation but a full page on direct URL access. Instagram-style photo modals.',
  'generateMetadata() exports dynamic SEO metadata per page. Better than next/head. Supports async data fetching for titles.',
  'Route handlers (route.ts) replace API routes. Export GET, POST, PUT, DELETE functions. Can stream responses with ReadableStream.',

  // Data fetching
  'fetch() in Server Components is automatically deduplicated and cached by Next.js. No need for React Query on the server.',
  'Revalidation: fetch(url, { next: { revalidate: 60 } }) refreshes cached data every 60 seconds. ISR without rebuild.',
  'revalidatePath("/products") and revalidateTag("products") trigger on-demand revalidation from Server Actions.',
  'TanStack Query is for client-side server state: caching, background refetching, optimistic updates, infinite scroll pagination.',
  'Prefetching with queryClient.prefetchQuery() loads data before the user navigates. Feels instant.',
  'Optimistic updates: update the UI immediately, then reconcile with the server response. useMutation({ onMutate: optimisticUpdate }).',

  // State patterns
  'URL as state: use searchParams for filters, sorting, pagination. Shareable, bookmarkable, survives refresh. nuqs library makes it easy.',
  'Form state with useFormStatus() and useFormState() — React 19 primitives for Server Action forms. No external library needed.',
  'useOptimistic() (React 19) manages optimistic state during async transitions. Built-in, no library needed.',
  'useTransition() marks state updates as non-urgent. The UI stays responsive during expensive re-renders.',
  'Zustand for global client state: tiny API, no providers, works outside React. const useStore = create(set => ({ ... })).',
  'Jotai for atomic state: each atom is independent. Compose atoms together. No single store. Scales better than Zustand for complex state.',
  'Never store derived data in state. Compute it during render: const total = items.reduce((s, i) => s + i.price, 0).',

  // Component patterns
  'Compound components share implicit state via Context: <Tabs><Tabs.List><Tabs.Trigger>A</Tabs.Trigger></Tabs.List><Tabs.Content>...</Tabs.Content></Tabs>',
  'Render props for flexible rendering: <DataTable data={users} renderRow={(user) => <UserRow user={user} />} />',
  'Polymorphic components with "as" prop: <Button as="a" href="/home">Home</Button> renders an anchor tag with button styles.',
  'Headless components provide logic without UI: Radix UI, Headless UI, React Aria. You control 100% of the markup and styling.',
  'Slot pattern: pass components as props for flexible composition: <Card header={<Title />} footer={<Actions />}>content</Card>',
], [
  { name: 'Next.js App Router', type: 'technology', relation: 'part_of' },
  { name: 'Server Components', type: 'concept', relation: 'part_of' },
  { name: 'Server Actions', type: 'concept', relation: 'part_of' },
  { name: 'TanStack Query', type: 'technology', relation: 'uses' },
  { name: 'Zustand', type: 'technology', relation: 'uses' },
  { name: 'Jotai', type: 'technology', relation: 'uses' },
  { name: 'Radix UI', type: 'technology', relation: 'uses' },
])

// ════════════════════════════════════════════════════════════════════════
// ADVANCED REACT
// ════════════════════════════════════════════════════════════════════════

seedTopic('Advanced React', 'technology', [
  // Performance
  'React Compiler (React 19+) auto-memoizes components and values. Manual useMemo/useCallback becomes unnecessary in most cases.',
  'Code splitting with React.lazy() and dynamic import(): const Chart = lazy(() => import("./Chart")). Wrap in Suspense.',
  'Route-based splitting is automatic in Next.js. Each page is a separate bundle. Use dynamic() for heavy component-level splitting.',
  'Virtualization renders only visible items: @tanstack/react-virtual for lists, react-window for grids. Essential for 1000+ items.',
  'React DevTools Profiler shows exactly which components re-rendered and why. Always profile before optimizing.',
  'Avoid inline object/array literals in JSX props: <Comp style={{color: "red"}} /> creates a new object every render. Extract to constant or useMemo.',
  'Key prop resets component state entirely. Change key to force remount: <Form key={userId} /> resets when user changes.',
  'React.memo() skips re-render if props are shallowly equal. Only useful for expensive components that receive the same props often.',
  'Debouncing expensive updates: use useDeferredValue(searchTerm) to keep typing responsive while search results update in the background.',

  // Error handling
  'Error Boundaries catch render errors. Use react-error-boundary: <ErrorBoundary fallback={<Error />}><App /></ErrorBoundary>.',
  'onError callback in Error Boundary sends errors to monitoring (Sentry, LogRocket). Never swallow errors silently.',
  'Suspense + Error Boundary together: Suspense handles loading, ErrorBoundary handles failures. Nest them: ErrorBoundary > Suspense > Component.',
  'Global error handler: window.addEventListener("unhandledrejection") catches async errors that escape boundaries.',

  // Testing
  'React Testing Library: test user behavior, not implementation. getByRole, getByText, not getByTestId.',
  'userEvent over fireEvent: userEvent.click() simulates real user behavior (focus, mousedown, mouseup, click). fireEvent is synthetic.',
  'Mock Service Worker (MSW) intercepts network requests at the service worker level. Tests hit real fetch() code, not mocked functions.',
  'Snapshot tests are brittle and low-value. Prefer explicit assertions: expect(screen.getByText("Welcome")).toBeInTheDocument().',
  'Test custom hooks with renderHook() from @testing-library/react. Wrap in providers if hooks use Context.',
  'Playwright or Cypress for E2E tests. Playwright is faster and supports multiple browsers. Test critical user flows, not every page.',

  // Architecture
  'Feature-based folder structure: src/features/auth/, src/features/dashboard/ — each feature has its own components, hooks, utils.',
  'Barrel exports (index.ts) per feature: export { LoginForm } from "./LoginForm". Clean imports: import { LoginForm } from "@/features/auth".',
  'Path aliases in tsconfig: "@/*" maps to "src/*". Eliminates ../../../ imports. Next.js supports this natively.',
  'Separation of server and client: server/ folder for Server Components and Actions, client/ for interactive components.',
  'API layer abstraction: src/lib/api.ts wraps fetch with auth headers, error handling, typing. Components never call fetch directly.',
  'Environment-specific config: NEXT_PUBLIC_ prefix for client-safe vars. Server-only vars stay on the server. Never expose secrets to the client.',
], [
  { name: 'React Testing Library', type: 'technology', relation: 'uses' },
  { name: 'MSW', type: 'technology', relation: 'uses' },
  { name: 'Playwright', type: 'technology', relation: 'uses' },
  { name: 'React Compiler', type: 'concept', relation: 'part_of' },
])

// ════════════════════════════════════════════════════════════════════════
// BEAUTIFUL INTERFACES IN REACT
// ════════════════════════════════════════════════════════════════════════

seedTopic('Beautiful React UI', 'technology', [
  // Design systems
  'shadcn/ui is not a component library — it copies components into your project. You own the code. Built on Radix UI + Tailwind.',
  'Radix UI provides unstyled, accessible primitives: Dialog, Dropdown, Tooltip, Tabs. You add your own styling on top.',
  'A design system needs: consistent spacing scale (4px base), color palette with semantic tokens, typography scale, and component variants.',
  'Design tokens: abstract values like --color-primary, --space-4, --radius-md. Change tokens to theme the entire app.',
  'Dark mode: use CSS custom properties that swap on [data-theme="dark"]. Tailwind dark: modifier handles this. Persist preference in localStorage.',

  // Layout
  'CSS Grid for 2D layouts (rows AND columns): grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)) for responsive cards.',
  'Flexbox for 1D layouts (row OR column): justify-content for main axis, align-items for cross axis. gap replaces margin hacks.',
  'Container queries (@container) style based on parent size, not viewport. Perfect for reusable components that work at any width.',
  'The holy grail layout: CSS Grid with grid-template-rows: auto 1fr auto — header, stretchy content, footer. Zero hacks.',
  'Responsive without breakpoints: use fluid typography (clamp), auto-fill grids, and flex-wrap. Breakpoints are a last resort.',

  // Animation
  'Framer Motion is the standard React animation library: <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} />.',
  'AnimatePresence wraps elements that mount/unmount to animate enter/exit transitions. Essential for route transitions and modals.',
  'Layout animations: layoutId prop on motion components. Elements smoothly animate position/size when they move in the DOM.',
  'Spring physics over duration-based: spring animations feel natural. Framer Motion uses springs by default.',
  'CSS transitions for simple hover/focus states. Framer Motion for complex orchestrated animations. Don\'t over-animate — subtle wins.',
  'View Transitions API (experimental): document.startViewTransition() for smooth page transitions. Works with Next.js App Router.',
  'Skeleton screens are better than spinners. Match the layout shape. Users perceive skeletons as faster loading.',
  'Micro-interactions: button press scales down slightly (scale: 0.97), form success has a subtle checkmark animation. These details matter.',

  // Typography & color
  'Typographic scale: use a ratio (1.25 major third). Sizes: 0.8rem, 1rem, 1.25rem, 1.563rem, 1.953rem. Consistent rhythm.',
  'Line height: 1.5 for body text, 1.2 for headings. Max line width: 65-75 characters (max-w-prose in Tailwind).',
  'Color: start with one primary color. Use HSL to generate shades: same hue, vary saturation and lightness. 50-950 scale like Tailwind.',
  'Contrast ratio: 4.5:1 minimum for normal text, 3:1 for large text. Use browser DevTools to check. Accessibility is non-negotiable.',
  'Gradients done right: subtle gradients on backgrounds (not text). Use radial gradients for glows. Mesh gradients for modern hero sections.',

  // Polish
  'Focus-visible outlines: :focus-visible instead of :focus. Shows outline for keyboard users, hides for mouse. Tailwind: focus-visible:ring-2.',
  'Smooth scrolling: scroll-behavior: smooth on html. But respect prefers-reduced-motion: @media (prefers-reduced-motion: reduce).',
  'Toast notifications: sonner library or react-hot-toast. Stack from bottom, auto-dismiss, swipe to close. Never use alert().',
  'Loading states: disable buttons during submission, show inline spinners, use optimistic UI where possible.',
  'Empty states are UI: don\'t show a blank page when there\'s no data. Show an illustration, a message, and a call to action.',
  'Responsive images: use next/image with sizes prop. WebP/AVIF format. Lazy loading below the fold. Blur placeholder for perceived speed.',
  'Glass morphism: backdrop-filter: blur(10px) with semi-transparent background. Use sparingly — on cards over images or hero sections.',
], [
  { name: 'shadcn/ui', type: 'technology', relation: 'uses' },
  { name: 'Radix UI', type: 'technology', relation: 'uses' },
  { name: 'Framer Motion', type: 'technology', relation: 'uses' },
  { name: 'Tailwind CSS', type: 'technology', relation: 'uses' },
  { name: 'sonner', type: 'technology', relation: 'uses' },
])

// ════════════════════════════════════════════════════════════════════════
// ADVANCED CSS
// ════════════════════════════════════════════════════════════════════════

seedTopic('Advanced CSS', 'technology', [
  // Modern CSS features
  'CSS nesting is native (2023+): .card { .title { font-size: 1.5rem } } — no preprocessor needed. Supported in all modern browsers.',
  ':has() selector: .card:has(.image) styles cards that contain images. Parent selector CSS has wanted for 20 years. Game changer.',
  'CSS container queries: @container (min-width: 400px) { ... } — components respond to their container, not the viewport.',
  'CSS Layers (@layer): control specificity without !important. @layer base, components, utilities. Later layers win.',
  'Logical properties: margin-inline-start instead of margin-left. Works for RTL languages automatically.',
  'color-mix(): mix colors in CSS. color-mix(in srgb, var(--primary) 80%, black) creates shades without Sass.',
  'Subgrid: grid-template-columns: subgrid — child grids align to parent grid tracks. Perfect for card layouts with aligned content.',
  'Scroll-driven animations: animation-timeline: scroll() — animations tied to scroll position, pure CSS, no JavaScript.',
  'Anchor positioning: position-anchor and anchor() function position elements relative to other elements. Tooltips and popovers without JS.',
  'text-wrap: balance — distributes text evenly across lines for headings. No more orphaned single words on the last line.',
  'View Transitions: ::view-transition-old and ::view-transition-new pseudo-elements for smooth page transitions in MPAs and SPAs.',

  // Layout mastery
  'Grid auto-placement: grid-auto-flow: dense fills gaps in the grid. Masonry-like layouts without JavaScript.',
  'Named grid areas: grid-template-areas: "header header" "nav main" "nav footer". Most readable layout syntax.',
  'Aspect ratio: aspect-ratio: 16/9 replaces the padding-top hack. Works on any element.',
  'Scroll snap: scroll-snap-type: x mandatory on the container, scroll-snap-align: start on children. Native carousel, no library.',
  'position: sticky with top: 0 for sticky headers. Combine with z-index and backdrop-filter: blur() for modern sticky nav.',
  'Flexbox gap is universally supported. Stop using margin hacks for spacing between flex items.',

  // Tailwind CSS deep
  'Tailwind JIT compiles only the classes you use. Bundle is typically 5-10KB gzipped regardless of how many utilities exist.',
  'Tailwind arbitrary values: w-[calc(100%-2rem)], bg-[#1a1a2e], grid-cols-[200px_1fr]. Escape hatch when utilities don\'t cover it.',
  'Tailwind @apply in CSS files extracts repeated utility patterns: @apply flex items-center gap-2. Use sparingly — prefer component abstraction.',
  'Tailwind plugins extend the framework: require("tailwindcss-animate") adds animation utilities. Write custom plugins for design system tokens.',
  'cn() utility (clsx + tailwind-merge): merges Tailwind classes safely. cn("p-4 bg-red-500", className) — user className overrides defaults.',
  'Tailwind group and peer modifiers: group-hover:opacity-100 shows child on parent hover. peer-focus:ring-2 styles sibling on focus.',
  'Tailwind responsive: sm:, md:, lg: are mobile-first (min-width). Design mobile first, add complexity for larger screens.',

  // Performance
  'content-visibility: auto — browser skips rendering off-screen content. Massive performance win for long pages.',
  'will-change: transform hints the browser to optimize for upcoming animation. Remove after animation completes.',
  'Prefer transform and opacity for animations — they run on the compositor thread, avoiding layout/paint. Never animate width/height.',
  'CSS containment: contain: layout paint — tells the browser this element\'s rendering is independent. Reduces layout recalculation scope.',
  '@font-face with font-display: swap shows fallback text immediately while the custom font loads. Prevents invisible text.',
  'Prefer system font stack for body text: font-family: system-ui, -apple-system, sans-serif. Fastest possible load, native feel.',
], [
  { name: 'CSS Grid', type: 'concept', relation: 'part_of' },
  { name: 'CSS Nesting', type: 'concept', relation: 'part_of' },
  { name: 'Container Queries', type: 'concept', relation: 'part_of' },
  { name: 'Tailwind CSS', type: 'technology', relation: 'uses' },
])

// ════════════════════════════════════════════════════════════════════════
// CODE SECURITY
// ════════════════════════════════════════════════════════════════════════

seedTopic('Code Security', 'technology', [
  // Input validation
  'Never trust client input. Validate everything on the server side. Client validation is for UX, server validation is for security.',
  'Use allowlists over denylists: define what IS allowed, not what IS NOT. Denylists always miss something.',
  'Zod or Joi for runtime schema validation. Define the shape, validate on entry. reject anything that doesn\'t match.',
  'File upload security: validate MIME type AND file extension AND magic bytes. Limit file size. Store outside webroot. Never execute uploads.',
  'URL validation: check protocol (only allow https:), parse with URL constructor, reject if it resolves to internal IPs (SSRF prevention).',

  // Injection attacks
  'SQL injection: ALWAYS use parameterized queries. db.query("SELECT * FROM users WHERE id = $1", [userId]). Never concatenate strings.',
  'ORMs (Prisma, EF Core, SQLAlchemy) parameterize by default but raw query escape hatches are still vulnerable. Audit them.',
  'XSS (Cross-Site Scripting): React and modern frameworks auto-escape JSX output. Danger: dangerouslySetInnerHTML, v-html, [innerHTML].',
  'Stored XSS is worse than reflected — malicious script saved in DB affects all users who view that content. Sanitize on write AND render.',
  'Content Security Policy (CSP) header: restricts which scripts can run. script-src \'self\' blocks inline scripts and third-party injection.',
  'Command injection: never pass user input to exec(), spawn(), or system(). If unavoidable, use allowlist of permitted commands.',
  'Path traversal: ../../../etc/passwd — validate file paths, resolve to absolute, confirm they start with the expected directory.',
  'Template injection: user input in server-side templates (Jinja2, EJS) can execute code. Always escape or use sandboxed rendering.',

  // Authentication
  'Password hashing: use bcrypt (cost factor 12+) or Argon2id. NEVER use MD5, SHA-256, or plain SHA for passwords.',
  'Salt is included automatically by bcrypt/Argon2. Never implement your own salting. Don\'t roll your own crypto.',
  'JWT: store in httpOnly, secure, sameSite=strict cookies — NOT localStorage. localStorage is accessible to any XSS.',
  'JWT should be short-lived (15 min). Use refresh tokens (longer-lived, stored server-side) to issue new JWTs.',
  'Multi-factor authentication (MFA): TOTP (authenticator apps) is more secure than SMS. Offer WebAuthn/passkeys for best security.',
  'Rate limit login attempts: 5 failures → 15 min lockout per IP + per account. Prevents brute force.',
  'OAuth 2.0 + PKCE for third-party auth. Never implement OAuth implicit flow — it\'s deprecated and insecure.',

  // Session & data
  'CSRF protection: SameSite=Strict cookies prevent most CSRF. Add CSRF tokens for legacy browser support.',
  'CORS: set Access-Control-Allow-Origin to specific domains, never wildcard (*) with credentials. Validate the Origin header.',
  'HTTPS everywhere. No exceptions. HSTS header (Strict-Transport-Security: max-age=31536000) prevents downgrade attacks.',
  'Encrypt sensitive data at rest (AES-256-GCM) and in transit (TLS 1.3). Database-level encryption for PII.',
  'Secrets management: never commit secrets to git. Use environment variables, HashiCorp Vault, AWS Secrets Manager, or .env files (gitignored).',
  'Principle of least privilege: services and users get minimum required permissions. Database users should never have DROP TABLE.',
  'Dependency scanning: npm audit, Snyk, Dependabot. Known vulnerabilities in dependencies are the most common attack vector.',
  'Security headers: X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Referrer-Policy: strict-origin-when-cross-origin.',
  'Logging for security: log authentication events, authorization failures, input validation failures. Never log passwords or tokens.',
  'Prepared for breach: have an incident response plan. Encrypt data so breaches expose ciphertext. Rotate secrets regularly.',
], [
  { name: 'OWASP Top 10', type: 'concept', relation: 'part_of' },
  { name: 'CSP', type: 'concept', relation: 'part_of' },
  { name: 'JWT', type: 'concept', relation: 'part_of' },
  { name: 'OAuth 2.0', type: 'concept', relation: 'part_of' },
  { name: 'bcrypt', type: 'technology', relation: 'uses' },
])

// ════════════════════════════════════════════════════════════════════════
// BEST PRACTICES (GENERAL)
// ════════════════════════════════════════════════════════════════════════

seedTopic('Software Best Practices', 'technology', [
  // Code quality
  'Naming: variables describe what they hold (userEmail), functions describe what they do (calculateTotal), booleans are questions (isActive, hasPermission).',
  'Functions should do one thing, take few arguments (ideally 0-2), and fit on one screen. If you need a comment to explain it, extract a function.',
  'Early returns reduce nesting: if (!user) return null; — handle edge cases first, then the happy path at the base level.',
  'Avoid boolean parameters: createUser(true) is unclear. Use named options: createUser({ sendEmail: true }) or separate functions.',
  'Magic numbers and strings: extract to named constants. const MAX_RETRIES = 3 is readable. retry(3) is not.',
  'Dead code is a liability. Delete it. Git has the history if you need it back. Commented-out code is dead code.',
  'Consistent formatting is non-negotiable. Use Prettier (JS/TS), Ruff (Python), dotnet-format (C#). Automate in CI. Zero debates.',
  'Code reviews: review the design first, then correctness, then style. Approve with minor comments. Don\'t block on nitpicks.',

  // Git
  'Commit messages: imperative mood ("Add user auth"), explain why not what. The diff shows what. The message explains intent.',
  'Small, focused commits. Each commit should be a single logical change. "Fix login bug" not "Fix bugs and add features and update deps".',
  'Feature branches: one feature per branch. Keep them short-lived (1-3 days). Long-lived branches accumulate painful merge conflicts.',
  'Never force push to main/master. Protect main with branch rules: require PR reviews, passing CI, no direct pushes.',
  'Conventional commits: feat:, fix:, chore:, docs:, refactor:. Enables automatic changelogs and semantic versioning.',
  'Rebase for clean linear history on feature branches. Merge commits on main to preserve PR context.',

  // Error handling
  'Fail fast: validate inputs at the boundary, throw/return early. Don\'t pass invalid data deep into the system.',
  'Use custom error types with codes: class NotFoundError extends Error { code = "NOT_FOUND" }. Catch specific errors, not all.',
  'Never swallow errors: catch (e) {} is a bug waiting to happen. At minimum, log it. Prefer catch (e) { logger.error(e); throw e; }.',
  'User-facing errors should be helpful: "Email already registered. Try logging in." Not "Error 409" or "Something went wrong."',
  'Retry transient failures (network timeouts, 503s) with exponential backoff. Don\'t retry permanent failures (400, 401, 404).',
  'Circuit breaker: after N failures to an external service, stop calling it for a cooldown period. Prevents cascade failures.',

  // Documentation
  'README: what the project does, how to run it, how to contribute. If setup takes more than 3 commands, automate it.',
  'Code comments explain WHY, not WHAT. The code tells you what it does. Comments explain non-obvious decisions and business rules.',
  'API documentation: OpenAPI/Swagger for REST, generated from code (not hand-written). Code IS the source of truth.',
  'Architecture Decision Records (ADRs): short documents explaining WHY a technical decision was made. Context, decision, consequences.',
  'Runbooks for ops: step-by-step instructions for common incidents. "When X happens, do Y." Written before the incident, not during.',

  // Development workflow
  'Local development should be one command: docker compose up, or bun dev, or make dev. If it takes a wiki page, fix the setup.',
  'Environment parity: dev, staging, and production should be as similar as possible. Same database engine, same OS, same configs.',
  'Feature flags: deploy code to production disabled, enable for specific users, then roll out gradually. Decouple deploy from release.',
  'Trunk-based development: everyone commits to main (or very short-lived branches). CI runs on every commit. Deploy multiple times per day.',
  'Monitoring: if you can\'t see it, you can\'t fix it. Metrics (latency, error rate, throughput), logs (structured), alerts (actionable).',
  'On-call: define severity levels, response time SLAs, escalation paths. Automate alerts. Reduce noise — every alert should be actionable.',
  'Post-mortems: blameless analysis after incidents. Timeline, root cause, what went well, action items. Share with the whole team.',
  'Technical debt is a choice, not an accident. Track it. Pay it down deliberately. Don\'t let it accumulate silently.',
], [
  { name: 'Prettier', type: 'technology', relation: 'uses' },
  { name: 'Git', type: 'technology', relation: 'uses' },
  { name: 'Docker', type: 'technology', relation: 'uses' },
  { name: 'Feature Flags', type: 'concept', relation: 'part_of' },
])

// ════════════════════════════════════════════════════════════════════════
// DONE
// ════════════════════════════════════════════════════════════════════════

console.log('\n✅ Knowledge seeding v2 complete!')
console.log('Topics: Modern React, Advanced React, Beautiful UI, Advanced CSS, Security, Best Practices')

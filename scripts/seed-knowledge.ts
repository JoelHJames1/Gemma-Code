#!/usr/bin/env bun
/**
 * Seed Ghost's knowledge base with expert-level knowledge from Claude.
 * Run: bun scripts/seed-knowledge.ts
 */

import { assertBelief } from '../src/knowledge/beliefs.js'
import { ensureEntity, addRelation } from '../src/knowledge/graph.js'
import { practiceSkill, addSkillNote } from '../src/growth/skills.js'

// ── Helper ──────────────────────────────────────────────────────────────

function seedTopic(
  topic: string,
  domain: string,
  concepts: string[],
  subConcepts: Array<{ name: string; type: string; relation: string }> = [],
) {
  console.log(`\n📚 Seeding: ${topic} (${concepts.length} concepts)`)

  ensureEntity(topic, 'technology', {
    seededAt: new Date().toISOString(),
    source: 'claude-expert-knowledge',
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
  addSkillNote(topic, `Comprehensive knowledge seeded by Claude. Covers fundamentals, patterns, best practices, and architecture.`)
}

// ════════════════════════════════════════════════════════════════════════
// MODERN PYTHON
// ════════════════════════════════════════════════════════════════════════

seedTopic('Python', 'technology', [
  // Core language
  'Python is a dynamically-typed, interpreted, high-level language emphasizing readability through significant whitespace.',
  'Python supports multiple paradigms: procedural, object-oriented, and functional programming.',
  'Python uses duck typing — if it walks like a duck and quacks like a duck, it is a duck. Check behavior, not type.',
  'Type hints (PEP 484) add optional static typing: def greet(name: str) -> str. Enforced by mypy, not runtime.',
  'f-strings (f"Hello {name}") are the modern way to format strings. Avoid .format() and % formatting in new code.',
  'List comprehensions [x*2 for x in items if x > 0] are idiomatic Python. Prefer them over map/filter for readability.',
  'Dictionary comprehensions {k: v for k, v in pairs} and set comprehensions {x for x in items} follow the same pattern.',
  'Generators (yield) produce values lazily, saving memory. Use for large datasets: def count(): yield from range(1000000).',
  'Context managers (with statement) ensure cleanup. Use for files, locks, DB connections: with open("f") as f: ...',
  'Decorators (@decorator) wrap functions to add behavior. Common: @property, @staticmethod, @classmethod, @functools.cache.',
  'Dataclasses (@dataclass) generate __init__, __repr__, __eq__ automatically. Modern replacement for manual __init__ boilerplate.',
  'The walrus operator (:=) assigns and returns in one expression: if (n := len(items)) > 10: print(n).',
  'match/case (Python 3.10+) is structural pattern matching, not just switch/case. Can destructure objects and sequences.',
  'Asyncio provides async/await for concurrent I/O. Use for network calls, not CPU work. async def fetch(): await response.',

  // Modern best practices
  'Use pathlib.Path instead of os.path for file operations. It is object-oriented and cross-platform.',
  'Use virtual environments (venv or uv) for every project. Never install packages globally.',
  'uv is the modern Python package manager — 10-100x faster than pip, written in Rust. Replaces pip, pip-tools, and virtualenv.',
  'pyproject.toml is the modern project config standard (PEP 621). Replaces setup.py, setup.cfg, and requirements.txt.',
  'Ruff is the modern linter and formatter — replaces flake8, black, isort in one tool. Written in Rust, extremely fast.',
  'Use pytest for testing. Fixtures, parametrize, and plugins make it far superior to unittest.',
  'Type narrowing with isinstance() checks helps both mypy and runtime safety.',
  'Never use mutable default arguments: def f(items=[]). Use def f(items=None): items = items or [].',
  'Use enumerate() instead of range(len()). Use zip() to iterate multiple sequences in parallel.',
  'EAFP (Easier to Ask Forgiveness than Permission): use try/except, not if/else checks before operations.',

  // Architecture
  'Clean architecture in Python: domain logic has zero dependencies on frameworks, DB, or I/O.',
  'Dependency injection in Python: pass dependencies as constructor arguments, not global imports.',
  'The Repository pattern abstracts data access behind an interface. Domain code never imports SQLAlchemy directly.',
  'Use Pydantic for data validation and serialization. BaseModel classes validate on construction automatically.',
  'FastAPI is the modern Python web framework — async, type-safe, auto-generates OpenAPI docs from type hints.',
  'Django is batteries-included: ORM, admin, auth, migrations built in. Best for traditional web apps with DB-heavy backends.',
  'SQLAlchemy 2.0 uses the new typed query interface. Session.execute(select(User).where(User.id == 1)) is the modern pattern.',
  'Alembic handles database migrations for SQLAlchemy. Always use migrations, never create_all() in production.',
  'Celery handles background tasks and job queues. Use with Redis or RabbitMQ as the message broker.',
  'Structured logging with structlog or python-json-logger. Never use print() for logging in production.',
  'Environment variables for configuration. Use pydantic-settings or python-dotenv. Never hardcode secrets.',
], [
  { name: 'FastAPI', type: 'technology', relation: 'part_of' },
  { name: 'Django', type: 'technology', relation: 'part_of' },
  { name: 'Pydantic', type: 'technology', relation: 'uses' },
  { name: 'SQLAlchemy', type: 'technology', relation: 'uses' },
  { name: 'pytest', type: 'technology', relation: 'uses' },
  { name: 'Ruff', type: 'technology', relation: 'uses' },
  { name: 'uv', type: 'technology', relation: 'uses' },
])

// ════════════════════════════════════════════════════════════════════════
// MODERN REACT
// ════════════════════════════════════════════════════════════════════════

seedTopic('React', 'technology', [
  // Core concepts
  'React is a JavaScript library for building user interfaces using a component-based, declarative model.',
  'Components are functions that return JSX. Class components are legacy — always use function components with hooks.',
  'JSX is syntax sugar for React.createElement(). It looks like HTML but compiles to JavaScript function calls.',
  'Props flow down (parent to child), events flow up (child to parent via callbacks). This is one-way data flow.',
  'State is local mutable data inside a component. Use useState for simple values, useReducer for complex state logic.',
  'useEffect handles side effects (API calls, subscriptions, DOM manipulation). Always specify dependencies array.',
  'useEffect cleanup: return a function to unsubscribe/cancel. Prevents memory leaks on unmount.',
  'useMemo memoizes expensive computations. useCallback memoizes functions. Only use when profiling shows a real perf issue.',
  'useRef holds a mutable value that persists across renders without causing re-renders. Also used for DOM element access.',
  'Custom hooks extract reusable stateful logic: function useDebounce(value, delay) { ... }. Must start with "use".',
  'React.StrictMode in development renders components twice to detect side effects. Does nothing in production.',
  'Keys in lists must be stable, unique identifiers. Never use array index as key if the list can reorder.',

  // Modern patterns
  'Server Components (RSC) run on the server, have zero client JS bundle cost, and can directly access databases.',
  'Client Components use "use client" directive. Only use when you need interactivity, state, or browser APIs.',
  'Suspense wraps async operations and shows fallback UI while loading. Works with lazy() and server components.',
  'React Server Actions allow calling server functions directly from client components without API routes.',
  'Composition over props: pass components as children or render props instead of deeply nested conditional props.',
  'Compound components pattern: <Select><Select.Option>A</Select.Option></Select> — related components share implicit state.',
  'Container/Presentational split: containers handle data/logic, presentational components are pure UI with props.',
  'Error Boundaries catch render errors in child components. Use class component with componentDidCatch or react-error-boundary library.',

  // State management
  'useState for local UI state. Context for theme/auth. Zustand or Jotai for shared client state. TanStack Query for server state.',
  'TanStack Query (React Query) manages server state: caching, refetching, pagination, optimistic updates. Replaces manual useEffect fetching.',
  'Zustand is a minimal state manager: const useStore = create((set) => ({ count: 0, inc: () => set(s => ({ count: s.count + 1 })) })).',
  'Context is for low-frequency updates (theme, auth, locale). Do NOT use it as a global state manager — it re-renders all consumers.',

  // Performance
  'React.lazy() and dynamic import() for code splitting. Wrap in Suspense for loading states.',
  'Virtualization (react-window, TanStack Virtual) for long lists. Only renders visible items in the viewport.',
  'Avoid creating objects/arrays inline in JSX props — they create new references every render, breaking memoization.',
  'React DevTools Profiler identifies unnecessary re-renders. Profile before optimizing — premature optimization is the root of evil.',

  // Ecosystem
  'Next.js is the dominant React framework: SSR, SSG, ISR, API routes, App Router with server components.',
  'Tailwind CSS is the dominant styling approach in React. Utility-first classes, no CSS files, tree-shaken in production.',
  'TypeScript is non-negotiable in modern React. Define prop types with interfaces, not PropTypes.',
  'Zod for runtime schema validation. Pair with TypeScript: const schema = z.object({ name: z.string() }); type User = z.infer<typeof schema>.',
  'React Hook Form for form handling. Uncontrolled by default (performance), integrates with Zod for validation.',
], [
  { name: 'Next.js', type: 'technology', relation: 'uses' },
  { name: 'TypeScript', type: 'technology', relation: 'uses' },
  { name: 'Tailwind CSS', type: 'technology', relation: 'uses' },
  { name: 'TanStack Query', type: 'technology', relation: 'uses' },
  { name: 'Zustand', type: 'technology', relation: 'uses' },
  { name: 'Zod', type: 'technology', relation: 'uses' },
])

// ════════════════════════════════════════════════════════════════════════
// C# AND .NET
// ════════════════════════════════════════════════════════════════════════

seedTopic('C#', 'technology', [
  // Core language
  'C# is a strongly-typed, object-oriented language by Microsoft. Runs on .NET runtime (cross-platform since .NET Core).',
  'C# uses value types (struct, int, bool — stack allocated) and reference types (class, string — heap allocated).',
  'Nullable reference types (C# 8+) make null-safety explicit: string? means nullable, string means non-null by default.',
  'Pattern matching in C# supports type patterns, property patterns, positional patterns, and switch expressions.',
  'Records (C# 9+) are immutable reference types with value equality: record Person(string Name, int Age);',
  'record struct provides value-type records for performance-critical immutable data.',
  'Primary constructors (C# 12+): class Service(ILogger logger) — parameters available throughout the class body.',
  'Collection expressions (C# 12+): int[] nums = [1, 2, 3]; replaces new[] syntax. Works with List, Span, arrays.',
  'async/await is the standard for all I/O operations. Never use .Result or .Wait() — causes deadlocks.',
  'LINQ (Language Integrated Query) queries collections declaratively: items.Where(x => x.Age > 18).Select(x => x.Name).',
  'Span<T> and Memory<T> provide zero-allocation slicing of arrays and strings. Critical for high-performance code.',
  'IAsyncEnumerable<T> enables async streaming: await foreach (var item in GetItemsAsync()) { ... }.',
  'Dispose pattern: implement IDisposable for unmanaged resources. Use "using" statement for automatic cleanup.',
  'Generics with constraints: where T : class, IComparable<T>, new() — constrain type parameters for safety.',
  'Extension methods add functionality to existing types without modifying them: public static int WordCount(this string s).',

  // Modern .NET
  '.NET 8+ is the current LTS. Use .NET 8 or later for all new projects. .NET Framework is legacy — do not use.',
  'Minimal APIs in ASP.NET Core: app.MapGet("/api/items", () => Results.Ok(items)); — no controllers needed for simple endpoints.',
  'Dependency injection is built into ASP.NET Core. Register services in Program.cs: builder.Services.AddScoped<IUserService, UserService>();',
  'The Options pattern binds configuration sections to strongly-typed classes: builder.Services.Configure<SmtpSettings>(config.GetSection("Smtp")).',
  'Middleware pipeline in ASP.NET Core: app.UseAuthentication(); app.UseAuthorization(); Order matters.',
  'Entity Framework Core is the standard ORM. Code-first with migrations. Use AsNoTracking() for read-only queries.',
  'EF Core interceptors allow cross-cutting concerns (audit logging, soft delete) without polluting entity logic.',
  'MediatR implements the Mediator pattern for CQRS: commands and queries are separate objects with handlers.',
  'FluentValidation separates validation rules from models: RuleFor(x => x.Email).NotEmpty().EmailAddress();',
  'Polly provides resilience patterns: retry, circuit breaker, timeout, bulkhead. Essential for HTTP client calls.',
  'Serilog is the modern structured logging library. Log.Information("Processed {@Order}", order) — structured, not string interpolation.',
  'Health checks: builder.Services.AddHealthChecks().AddSqlServer(connectionString); — built into ASP.NET Core.',

  // Architecture
  'Clean Architecture in .NET: Domain → Application → Infrastructure → Presentation. Inner layers never reference outer.',
  'The CQRS pattern separates read and write operations. Commands mutate state, Queries return data. Different models for each.',
  'Domain-Driven Design (DDD): Entities have identity, Value Objects have equality by value, Aggregates enforce invariants.',
  'The Repository pattern in .NET wraps EF Core DbContext behind an interface for testability.',
  'Unit of Work pattern: group multiple repository operations in a single transaction. EF Core DbContext is already a Unit of Work.',
  'Result pattern instead of exceptions for expected failures: Result<User> instead of throwing UserNotFoundException.',
  'Vertical Slice Architecture: organize by feature, not by layer. Each feature has its own handler, validator, and model.',
  'Background services with IHostedService or BackgroundService for long-running tasks, queue processing, scheduled jobs.',
], [
  { name: 'ASP.NET Core', type: 'technology', relation: 'part_of' },
  { name: 'Entity Framework Core', type: 'technology', relation: 'uses' },
  { name: 'MediatR', type: 'technology', relation: 'uses' },
  { name: 'Serilog', type: 'technology', relation: 'uses' },
  { name: 'Polly', type: 'technology', relation: 'uses' },
  { name: 'FluentValidation', type: 'technology', relation: 'uses' },
])

// ════════════════════════════════════════════════════════════════════════
// SOFTWARE ARCHITECTURE (GENERAL)
// ════════════════════════════════════════════════════════════════════════

seedTopic('Software Architecture', 'technology', [
  // Principles
  'SOLID: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.',
  'Single Responsibility: a class should have one reason to change. Not "one thing" — one axis of change.',
  'Dependency Inversion: high-level modules depend on abstractions, not concrete implementations. Inject interfaces.',
  'DRY (Don\'t Repeat Yourself) applies to knowledge, not code. Three similar lines is better than a premature abstraction.',
  'YAGNI (You Aren\'t Gonna Need It): don\'t build features until they are actually needed. Fight speculative abstractions.',
  'Composition over inheritance: prefer combining small objects over deep inheritance hierarchies.',
  'Separation of concerns: each module addresses a distinct concern. UI doesn\'t know about DB. DB doesn\'t know about HTTP.',
  'The Rule of Three: don\'t abstract until you see the pattern three times. First time just do it, second note it, third abstract.',

  // Patterns
  'Repository pattern: abstracts data access behind a collection-like interface. Domain never imports database libraries.',
  'Factory pattern: encapsulates object creation logic. Use when construction is complex or varies by context.',
  'Strategy pattern: define a family of algorithms, encapsulate each one, make them interchangeable at runtime.',
  'Observer/Event pattern: decouple producers from consumers. Publishers emit events, subscribers react independently.',
  'Middleware/Pipeline pattern: chain handlers that each process and pass to the next. Used in HTTP frameworks and message processing.',
  'Circuit Breaker: stops calling a failing service after threshold failures. Prevents cascade failures in distributed systems.',
  'CQRS: Command Query Responsibility Segregation. Separate read models (optimized for queries) from write models (enforce business rules).',
  'Event Sourcing: store state changes as a sequence of events, not current state. Enables full audit trail and temporal queries.',
  'Saga pattern: manage distributed transactions across services using a sequence of local transactions with compensating actions.',

  // API Design
  'REST: resources as nouns, HTTP methods as verbs. GET /users, POST /users, PUT /users/1, DELETE /users/1.',
  'API versioning: URL path (/v1/users), header (Accept-Version: v1), or query param (?version=1). Be consistent.',
  'Pagination: cursor-based (?after=abc123) is more reliable than offset-based (?page=2) for large, changing datasets.',
  'Rate limiting protects APIs. Return 429 Too Many Requests with Retry-After header. Implement with token bucket or sliding window.',
  'Idempotency: design API operations so they can be safely retried. PUT and DELETE are naturally idempotent. POST needs idempotency keys.',
  'GraphQL excels when clients need flexible queries across related data. REST excels for simple CRUD with caching.',

  // System Design
  'Horizontal scaling: add more instances behind a load balancer. Requires stateless services and externalized session/cache.',
  'Caching: CDN for static assets, Redis for application cache, HTTP cache headers for API responses. Cache invalidation is the hard part.',
  'Message queues (RabbitMQ, Kafka, SQS) decouple services and handle async workloads. Essential for resilience.',
  'Database: use PostgreSQL as the default. Add Redis for caching, Elasticsearch for search, S3 for files. Don\'t use one DB for everything.',
  'Microservices are for organizational scaling (separate teams), not technical scaling. Start monolithic, split when you need to.',
  'The strangler fig pattern: incrementally replace a legacy system by routing requests to new services one endpoint at a time.',
  'Observability: metrics (Prometheus), logs (structured JSON), traces (OpenTelemetry). All three are needed, not just logs.',
  'Infrastructure as Code (Terraform, Pulumi): version-controlled, reproducible infrastructure. Never click-ops in production.',
  'CI/CD: automate build, test, and deploy. Every commit to main should be deployable. Feature flags over long-lived branches.',
  'Zero-downtime deployments: blue-green or rolling deployments. Database migrations must be backwards-compatible.',
], [
  { name: 'SOLID', type: 'concept', relation: 'part_of' },
  { name: 'CQRS', type: 'concept', relation: 'part_of' },
  { name: 'REST', type: 'concept', relation: 'part_of' },
  { name: 'Microservices', type: 'concept', relation: 'part_of' },
  { name: 'CI/CD', type: 'concept', relation: 'part_of' },
  { name: 'PostgreSQL', type: 'technology', relation: 'uses' },
  { name: 'Redis', type: 'technology', relation: 'uses' },
])

// ════════════════════════════════════════════════════════════════════════
// ADVANCED PROGRAMMING CONCEPTS
// ════════════════════════════════════════════════════════════════════════

seedTopic('Advanced Programming', 'technology', [
  // Concurrency
  'Concurrency is not parallelism. Concurrency is structuring code to handle multiple tasks. Parallelism is executing them simultaneously.',
  'Race conditions occur when multiple threads access shared state without synchronization. Use locks, atomics, or immutable data.',
  'Deadlocks happen when two threads each hold a lock the other needs. Prevent by always acquiring locks in the same order.',
  'Actor model (Erlang, Akka): each actor has private state and communicates via messages. No shared mutable state.',
  'Event loops (Node.js, Python asyncio) handle concurrency with a single thread. I/O operations yield control, not block.',
  'Thread pools amortize thread creation cost. Use for CPU-bound work. Size = number of CPU cores for compute tasks.',

  // Type Systems
  'Static typing catches errors at compile time. Dynamic typing catches them at runtime. Both are valid tradeoffs.',
  'Algebraic data types: sum types (A | B, tagged unions) and product types (A & B, structs). Enable exhaustive matching.',
  'Generics enable type-safe code reuse: function identity<T>(x: T): T works for any type without losing type info.',
  'Variance: covariance (Cat[] extends Animal[]), contravariance (Consumer<Animal> extends Consumer<Cat>). Matters for generic collections.',

  // Performance
  'Big O notation: O(1) constant, O(log n) binary search, O(n) linear, O(n log n) sorting, O(n²) nested loops. Know the complexity of your data structures.',
  'Hash maps provide O(1) average lookup. Trees provide O(log n) with ordering. Choose based on access pattern.',
  'Memory locality matters more than algorithm complexity for small N. Array iteration beats linked list traversal due to CPU cache.',
  'Profiling before optimizing. Measure with real data. The bottleneck is almost never where you think it is.',
  'Connection pooling for databases: creating connections is expensive (TCP handshake, auth). Reuse them.',
  'N+1 query problem: fetching a list then querying each item individually. Fix with JOIN, eager loading, or DataLoader.',

  // Security
  'Never trust user input. Validate on the server side even if validated on the client. Client validation is UX, server validation is security.',
  'SQL injection: use parameterized queries, never string concatenation. ORMs handle this automatically.',
  'XSS (Cross-Site Scripting): escape HTML output. Modern frameworks (React, Angular) escape by default.',
  'CSRF (Cross-Site Request Forgery): use anti-forgery tokens for state-changing requests. SameSite cookies help.',
  'Authentication: use bcrypt or Argon2 for password hashing. Never SHA-256 or MD5 for passwords. Use JWT or session tokens.',
  'HTTPS everywhere. No exceptions. Use HSTS headers. Redirect HTTP to HTTPS.',
  'Secrets management: never commit secrets to git. Use environment variables, vault systems, or cloud secret managers.',

  // Testing
  'Test pyramid: many unit tests (fast, isolated), fewer integration tests (real dependencies), few E2E tests (slow, brittle).',
  'Unit tests test behavior, not implementation. Test what a function does, not how it does it.',
  'Mocking is for external dependencies (APIs, databases), not for internal code. Over-mocking makes tests brittle.',
  'Test-Driven Development (TDD): write the test first, watch it fail, write minimal code to pass, refactor. Red-Green-Refactor.',
  'Property-based testing generates random inputs to find edge cases your examples missed. Use Hypothesis (Python) or fast-check (JS).',
  'Integration tests should hit real databases with test containers, not mocks. Mocks can diverge from real behavior.',
])

// ════════════════════════════════════════════════════════════════════════
// TYPESCRIPT
// ════════════════════════════════════════════════════════════════════════

seedTopic('TypeScript', 'technology', [
  'TypeScript is a superset of JavaScript that adds static types. It compiles to JavaScript and runs anywhere JS runs.',
  'Use strict mode ("strict": true in tsconfig). It enables all strict type-checking options. Non-negotiable.',
  'Prefer interface over type for object shapes. Use type for unions, intersections, and mapped types.',
  'Discriminated unions: type Shape = { kind: "circle"; r: number } | { kind: "square"; s: number }. Switch on kind for exhaustive handling.',
  'Use unknown instead of any for values of uncertain type. unknown requires type narrowing before use.',
  'Generics constrain without losing type info: function first<T>(arr: T[]): T | undefined { return arr[0]; }',
  'Utility types: Partial<T>, Required<T>, Pick<T, K>, Omit<T, K>, Record<K, V>, ReturnType<T>. Know them all.',
  'Zod infers TypeScript types from runtime schemas: type User = z.infer<typeof UserSchema>. Single source of truth.',
  'as const makes literals readonly and narrows types: const dirs = ["N", "S"] as const; type Dir = typeof dirs[number].',
  'Enums are problematic in TypeScript. Prefer union types: type Status = "active" | "inactive" over enum Status { Active, Inactive }.',
  'Template literal types: type Route = `/api/${string}` constrains strings to match patterns at compile time.',
  'Use satisfies operator (TS 5+) to validate a type without widening: const config = { port: 3000 } satisfies Config.',
  'Never use @ts-ignore. Use @ts-expect-error if you must suppress — it errors when the suppression becomes unnecessary.',
  'Module resolution: use "moduleResolution": "bundler" or "nodenext" in tsconfig. "node" is legacy.',
])

// ═══════════════════════════════════════════════════════════════════════
// DONE
// ════════════════════════════════════════════════════════════════════════

console.log('\n✅ Knowledge seeding complete!')
console.log('Run ghost and ask it to build something.\n')

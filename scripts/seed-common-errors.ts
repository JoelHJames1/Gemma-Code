#!/usr/bin/env bun
/**
 * Pre-seed the error database with common errors and their fixes.
 * Ghost starts knowing the solutions instead of discovering them.
 * Run: bun scripts/seed-common-errors.ts
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

interface ErrorEntry {
  id: string
  error: string
  errorKey: string
  tool: string
  context: string
  solution: string
  occurrences: number
  confidence: number
  firstSeen: string
  lastSeen: string
}

const storePath = join(homedir(), '.local', 'share', 'ghost-code', 'errors.json')

function normalizeError(error: string): string {
  return error
    .replace(/\/[\w./-]+/g, '<PATH>')
    .replace(/v?\d+\.\d+(\.\d+)?/g, '<VER>')
    .replace(/[0-9a-f]{8,}/gi, '<HASH>')
    .replace(/:\d{4,5}/g, ':<PORT>')
    .replace(/\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/g, '<TIME>')
    .replace(/@[\w/-]+/g, '@<PKG>')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .slice(0, 200)
}

function addError(error: string, tool: string, context: string, solution: string): ErrorEntry {
  return {
    id: `err_seed_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    error,
    errorKey: normalizeError(error),
    tool,
    context,
    solution,
    occurrences: 5, // Pre-seeded as "seen many times"
    confidence: 0.85, // High confidence — these are known good fixes
    firstSeen: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
  }
}

const errors: ErrorEntry[] = []

// ════════════════════════════════════════════════════════════════════════
// NPM / NODE.JS ERRORS
// ══════════════���═════════════════════════════════════════════════════════

errors.push(addError(
  'npm error could not determine executable to run',
  'Bash',
  'npx tailwindcss init -p',
  'Tailwind CSS v4 removed the init command. Use: npm install -D @tailwindcss/vite, then import "@tailwindcss/vite" in vite.config.ts and add @import "tailwindcss" to your CSS file.',
))

errors.push(addError(
  'ENOENT: no such file or directory, open package.json',
  'Bash',
  'npm install',
  'No package.json in current directory. Run "npm init -y" first, or cd into the project directory.',
))

errors.push(addError(
  'npm ERR! ERESOLVE unable to resolve dependency tree',
  'Bash',
  'npm install',
  'Dependency conflict. Try: npm install --legacy-peer-deps, or check which packages have conflicting peer dependencies and resolve them.',
))

errors.push(addError(
  'npm ERR! code EACCES permission denied',
  'Bash',
  'npm install -g',
  'Permission error with global installs. Never use sudo with npm. Fix: mkdir ~/.npm-global && npm config set prefix ~/.npm-global, then add ~/.npm-global/bin to PATH.',
))

errors.push(addError(
  'Error: Cannot find module',
  'Bash',
  'node/bun run',
  'Module not found. Run "npm install" to install dependencies. If it is a local file, check the import path (case-sensitive on Linux/Mac). Use .js extension in ESM imports.',
))

errors.push(addError(
  'SyntaxError: Cannot use import statement outside a module',
  'Bash',
  'node script.js',
  'File uses ESM imports but Node is running in CommonJS mode. Fix: add "type": "module" to package.json, or rename file to .mjs, or use "require" instead.',
))

errors.push(addError(
  'ERR_MODULE_NOT_FOUND',
  'Bash',
  'node/bun run',
  'ESM module not found. In ESM, you must include the file extension in imports: import { x } from "./utils.js" not "./utils". Also check tsconfig moduleResolution.',
))

errors.push(addError(
  'EADDRINUSE: address already in use',
  'Bash',
  'npm run dev',
  'Port already in use. Find and kill the process: lsof -i :<port> | grep LISTEN, then kill -9 <PID>. Or use a different port: PORT=3001 npm run dev.',
))

errors.push(addError(
  'digital envelope routines::unsupported',
  'Bash',
  'npm run build',
  'OpenSSL 3.0 breaking change in Node 17+. Fix: set NODE_OPTIONS=--openssl-legacy-provider, or better: upgrade the project dependencies to versions that support OpenSSL 3.',
))

// ════════════════════════════════════════════════════════════════════════
// REACT / NEXT.JS ERRORS
// ═��═══════════════════════════��═══════════════════════════════════���══════

errors.push(addError(
  'Error: Hydration failed because the initial UI does not match what was rendered on the server',
  'Bash',
  'next dev',
  'Hydration mismatch — server and client rendered different HTML. Common causes: using Date.now() or Math.random() in render, browser extensions injecting HTML, incorrect nesting (p inside p, div inside p). Fix: use useEffect for client-only values, check HTML nesting.',
))

errors.push(addError(
  'Error: Event handlers cannot be passed to Client Component props',
  'Bash',
  'next dev/build',
  'Passing onClick/onChange to a Server Component. Fix: add "use client" directive at the top of the component file that uses event handlers, state, or effects.',
))

errors.push(addError(
  "Error: useState only works in Client Components. Add the 'use client' directive",
  'Bash',
  'next dev',
  'Using hooks (useState, useEffect, etc.) in a Server Component. Fix: add "use client" as the very first line of the file.',
))

errors.push(addError(
  'Module not found: Can\'t resolve \'@/' ,
  'Bash',
  'next build',
  'Path alias not configured. Add to tsconfig.json: { "compilerOptions": { "paths": { "@/*": ["./src/*"] } } }. Next.js reads this automatically.',
))

errors.push(addError(
  'TypeError: fetch failed',
  'Bash',
  'next dev',
  'Fetch failed in Server Component — usually the API server is not running, URL is wrong, or there is a network issue. Check the URL, ensure the API is up, and try adding { cache: "no-store" } to bypass caching.',
))

errors.push(addError(
  'Error: Unsupported Server Component type: undefined',
  'Bash',
  'next dev',
  'A Server Component is importing something that does not exist or is not properly exported. Check the import — the named export might be misspelled or the file might have a default export instead.',
))

// ════════════════════════════════════════════════════════════════════════
// TYPESCRIPT ERRORS
// ════════════════════════════════════════════════════════════════════════

errors.push(addError(
  'TS2307: Cannot find module or its corresponding type declarations',
  'Bash',
  'tsc/next build',
  'Missing type declarations. Install types: npm install -D @types/<package>. If it is a local file, check the path. If no types exist, create a declarations.d.ts: declare module "package-name".',
))

errors.push(addError(
  'TS2345: Argument of type \'string\' is not assignable to parameter of type',
  'Bash',
  'tsc',
  'Type mismatch. The value is a string but the function expects a specific type. Fix: use type assertion (value as SpecificType) if you are sure, or validate and narrow the type first.',
))

errors.push(addError(
  'TS18046: \'xxx\' is of type \'unknown\'',
  'Bash',
  'tsc',
  'Caught error is typed as unknown in TypeScript. Fix: use type narrowing: if (error instanceof Error) { error.message } or cast: (error as Error).message.',
))

// ════════════════════════════════════════════════════════════════════════
// GIT ERRORS
// ════════════════════���═════════════════════════════════��═════════════════

errors.push(addError(
  'fatal: not a git repository',
  'Bash',
  'git status',
  'Not in a git repo. Run "git init" to create one, or cd to the correct directory.',
))

errors.push(addError(
  'error: failed to push some refs to',
  'Bash',
  'git push',
  'Remote has changes you do not have locally. Run "git pull --rebase origin main" first, resolve any conflicts, then push again.',
))

errors.push(addError(
  'CONFLICT (content): Merge conflict in',
  'Bash',
  'git pull/merge',
  'Merge conflict. Open the conflicted files, look for <<<<<<< HEAD markers, choose the correct version, remove the markers, then git add and git commit.',
))

errors.push(addError(
  'fatal: refusing to merge unrelated histories',
  'Bash',
  'git pull',
  'Local and remote repos have no common ancestor. Fix: git pull --allow-unrelated-histories. This usually happens when you init locally and also create a repo on GitHub with a README.',
))

// ════════════════════���═══════════════════════════════════════════════════
// PYTHON ERRORS
// ═════════════��══════════════════════════════════════════════════════════

errors.push(addError(
  'ModuleNotFoundError: No module named',
  'Bash',
  'python run',
  'Python package not installed. Run: pip install <package> (or uv pip install). Make sure you are in the correct virtual environment: source .venv/bin/activate.',
))

errors.push(addError(
  'command not found: python',
  'Bash',
  'python',
  'Python not in PATH. On macOS, use "python3" instead of "python". Or create an alias: alias python=python3. For projects, use a virtual environment.',
))

errors.push(addError(
  'IndentationError: unexpected indent',
  'Bash',
  'python run',
  'Mixed tabs and spaces, or incorrect indentation level. Fix: configure editor to use 4 spaces (not tabs) for Python. Run: python -tt script.py to check.',
))

errors.push(addError(
  'error: externally-managed-environment',
  'Bash',
  'pip install',
  'Python 3.12+ on macOS/Linux prevents global pip installs. Fix: use a virtual environment: python3 -m venv .venv && source .venv/bin/activate && pip install <package>. Or use uv: uv pip install <package>.',
))

// ═══════════════════════════════��════════════════════════════════════════
// C# / .NET ERRORS
// ════════════════════════════════════════════════════════════════════════

errors.push(addError(
  'The SDK \'Microsoft.NET.Sdk.Web\' specified could not be found',
  'Bash',
  'dotnet build',
  '.NET SDK not installed or wrong version. Install from https://dotnet.microsoft.com/download. Check installed SDKs: dotnet --list-sdks. Use global.json to pin the SDK version.',
))

errors.push(addError(
  'error CS0246: The type or namespace name could not be found',
  'Bash',
  'dotnet build',
  'Missing using directive or NuGet package. Add the correct using statement, or install the package: dotnet add package <PackageName>.',
))

errors.push(addError(
  'Unable to find a project to run',
  'Bash',
  'dotnet run',
  'No .csproj file in the current directory. cd to the project directory that contains the .csproj file, or specify: dotnet run --project path/to/Project.csproj.',
))

// ═════════���═════════════════════════���════════════════════════════════════
// SWIFT / XCODE ERRORS
// ════════════════════════════════════════════════════════════════════════

errors.push(addError(
  'No such module',
  'Bash',
  'swift build / xcodebuild',
  'Swift package not resolved. Run: swift package resolve, or in Xcode: File → Packages → Resolve Package Versions. If using SPM, check Package.swift dependencies.',
))

errors.push(addError(
  'Command PhaseScriptExecution failed with a nonzero exit code',
  'Bash',
  'xcodebuild',
  'A build phase script failed. Check Build Phases in Xcode for custom scripts. Common cause: CocoaPods "pod install" needed, or signing issues. Clean build folder: Cmd+Shift+K.',
))

// ═══���════════════════════════════════════════════════════════════════════
// DOCKER ERRORS
// ════════════════════════════════════════════════════���═══════════════════

errors.push(addError(
  'docker: Cannot connect to the Docker daemon',
  'Bash',
  'docker run',
  'Docker Desktop is not running. Start Docker Desktop from Applications, or run: open -a Docker. Wait a few seconds for it to initialize.',
))

errors.push(addError(
  'no matching manifest for linux/arm64/v8',
  'Bash',
  'docker pull',
  'Image not available for Apple Silicon (ARM). Fix: use --platform linux/amd64 for x86 emulation, or find an ARM-compatible image variant.',
))

errors.push(addError(
  'Error response from daemon: Conflict. The container name is already in use',
  'Bash',
  'docker run',
  'Container name already exists. Remove it: docker rm <name>, or use a different name, or add --rm flag to auto-remove on exit.',
))

// ═══════════════════════════════���════════════════════════════════════════
// FILE SYSTEM ERRORS
// ═══════════════════���════════════════════════════════════════════════════

errors.push(addError(
  'ENOENT: no such file or directory',
  'Read',
  'Read file',
  'File does not exist at the specified path. Check: is the path correct? Is the casing right (macOS is case-insensitive but Linux is not)? Use Glob to find the actual file location.',
))

errors.push(addError(
  'EACCES: permission denied',
  'Write',
  'Write file',
  'No write permission. Check file permissions: ls -la <path>. Fix: chmod u+w <file>, or check if the directory is read-only. Never use sudo — fix the permissions instead.',
))

errors.push(addError(
  'EISDIR: illegal operation on a directory',
  'Read',
  'Read directory',
  'Tried to read a directory as a file. Use Bash "ls" or Glob to list directory contents instead of Read.',
))

// ════════════════════════════════════════════════════════════════════════
// DATABASE ERRORS
// ════════════════════════════════════════════════════════════════════════

errors.push(addError(
  'ECONNREFUSED 127.0.0.1:5432',
  'Bash',
  'database connection',
  'PostgreSQL is not running. Start it: brew services start postgresql (macOS), or sudo systemctl start postgresql (Linux), or docker compose up -d postgres.',
))

errors.push(addError(
  'relation does not exist',
  'Bash',
  'database query',
  'Table not found in PostgreSQL. Run migrations: npx prisma migrate dev, or python manage.py migrate, or dotnet ef database update. The schema might not have been applied.',
))

errors.push(addError(
  'ECONNREFUSED 127.0.0.1:6379',
  'Bash',
  'redis connection',
  'Redis is not running. Start it: brew services start redis (macOS), or docker run -d -p 6379:6379 redis, or sudo systemctl start redis.',
))

// ════════════════════════════════════════════════════════════════════════
// VITE / BUILD TOOL ERRORS
// ══════════════��═════════════════════════════════════════════════════════

errors.push(addError(
  '[vite] Internal server error: Failed to resolve import',
  'Bash',
  'vite dev',
  'Import path cannot be resolved. Check: file exists, extension is correct (.ts not .tsx or vice versa), path aliases configured in vite.config.ts resolve.alias.',
))

errors.push(addError(
  'RollupError: Could not resolve',
  'Bash',
  'vite build',
  'Build-time import resolution failed. The package might be missing from dependencies (npm install it), or it is a Node.js builtin being used in browser code (need a polyfill or remove it).',
))

// Save to disk
const dir = join(homedir(), '.local', 'share', 'ghost-code')
if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

let store = { errors: [] as ErrorEntry[] }
try {
  if (existsSync(storePath)) store = JSON.parse(readFileSync(storePath, 'utf-8'))
} catch {}

// Merge — don't duplicate
const existingKeys = new Set(store.errors.map(e => e.errorKey))
let added = 0
for (const err of errors) {
  if (!existingKeys.has(err.errorKey)) {
    store.errors.push(err)
    added++
  }
}

writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf-8')
console.log(`\n✅ Seeded ${added} common error fixes (${store.errors.length} total in database)`)
console.log('Ghost now knows solutions for: npm, React, Next.js, TypeScript, Git, Python, C#, Swift, Docker, databases, Vite')

#!/usr/bin/env bun
/**
 * Seed Ghost with WORKING CODE EXAMPLES — the model can reference these
 * when building projects. This is few-shot prompting via the knowledge base.
 * Run: bun scripts/seed-code-examples.ts
 */

import { assertBelief } from '../src/knowledge/beliefs.js'
import { ensureEntity, addRelation } from '../src/knowledge/graph.js'
import { practiceSkill, addSkillNote } from '../src/growth/skills.js'

function seedCode(topic: string, examples: string[]) {
  console.log(`\n💻 Seeding: ${topic} (${examples.length} code examples)`)
  ensureEntity(topic, 'technology', {
    seededAt: new Date().toISOString(),
    source: 'claude-code-examples',
    exampleCount: String(examples.length),
  })
  for (const example of examples) {
    assertBelief(example, 'technical', `Code example for ${topic}`, 'claude-seeded')
  }
  practiceSkill(topic, 'technology', true, `Code examples seeded: ${examples.length}`)
}

// ════════════════════════════════════════════════════════════════════════
// MODERN REACT — FULL WORKING EXAMPLES
// ════════════════════════════════════════════════════════════════════════

seedCode('React Code Examples', [
  // Server Component + data fetching
  `React Server Component with async data fetching (Next.js App Router):
async function ProductPage({ params }: { params: { id: string } }) {
  const product = await db.product.findUnique({ where: { id: params.id } });
  if (!product) notFound();
  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold">{product.name}</h1>
      <p className="text-gray-600 mt-2">{product.description}</p>
      <p className="text-2xl font-semibold mt-4">\${product.price}</p>
      <AddToCartButton productId={product.id} />
    </main>
  );
}`,

  // Client Component with state
  `React Client Component with useState and form handling:
"use client";
import { useState } from "react";

export function AddToCartButton({ productId }: { productId: string }) {
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    setAdding(true);
    await fetch("/api/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });
    setAdding(false);
  }

  return (
    <div className="flex items-center gap-4 mt-6">
      <select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}
        className="border rounded-lg px-3 py-2">
        {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
      <button onClick={handleAdd} disabled={adding}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
        {adding ? "Adding..." : "Add to Cart"}
      </button>
    </div>
  );
}`,

  // Server Action for form mutation
  `React Server Action for form submissions (Next.js):
"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const CreatePostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10),
});

export async function createPost(formData: FormData) {
  const parsed = CreatePostSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
  });
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  await db.post.create({ data: parsed.data });
  revalidatePath("/posts");
  redirect("/posts");
}`,

  // Custom hook with TanStack Query
  `Custom React hook with TanStack Query for data fetching:
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => fetch("/api/products").then((r) => r.json()),
    staleTime: 60_000,
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetch(\`/api/products/\${id}\`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}`,

  // Zustand store
  `Zustand store for global client state:
import { create } from "zustand";

interface CartStore {
  items: Array<{ id: string; name: string; price: number; qty: number }>;
  addItem: (item: { id: string; name: string; price: number }) => void;
  removeItem: (id: string) => void;
  total: () => number;
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item) => set((state) => {
    const existing = state.items.find((i) => i.id === item.id);
    if (existing) {
      return { items: state.items.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i) };
    }
    return { items: [...state.items, { ...item, qty: 1 }] };
  }),
  removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  total: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
}));`,

  // Beautiful card component with Tailwind
  `Beautiful product card with Tailwind CSS, hover effects, and responsive design:
function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300">
      <div className="aspect-square overflow-hidden">
        <img src={product.image} alt={product.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-gray-900 truncate">{product.name}</h3>
          <span className="text-sm font-medium text-blue-600">\${product.price}</span>
        </div>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
        <div className="mt-4 flex gap-2">
          {product.tags.map((tag) => (
            <span key={tag} className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">{tag}</span>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-4 bg-gradient-to-t from-black/60 to-transparent">
        <button className="w-full rounded-lg bg-white py-2 text-sm font-medium hover:bg-gray-100 transition">
          Quick View
        </button>
      </div>
    </div>
  );
}`,

  // Responsive layout with grid
  `Responsive grid layout with auto-fill and beautiful spacing:
function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Store</h1>
          <nav className="flex gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-900 transition">Products</a>
            <a href="#" className="hover:text-gray-900 transition">Categories</a>
            <a href="#" className="hover:text-gray-900 transition">Cart (3)</a>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </main>
    </div>
  );
}`,

  // Framer Motion animation
  `Framer Motion page transition and staggered list animation:
import { motion, AnimatePresence } from "framer-motion";

function AnimatedList({ items }: { items: Item[] }) {
  return (
    <AnimatePresence mode="popLayout">
      {items.map((item, i) => (
        <motion.div key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 25 }}
          layout
          className="p-4 bg-white rounded-xl shadow-sm border hover:border-blue-200 transition-colors">
          <h3 className="font-medium">{item.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}`,

  // Form with React Hook Form + Zod
  `Form validation with React Hook Form + Zod:
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "At least 8 characters"),
  name: z.string().min(2, "Name required"),
});
type FormData = z.infer<typeof schema>;

export function SignupForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    await fetch("/api/signup", { method: "POST", body: JSON.stringify(data) });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input {...register("name")} className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input {...register("email")} type="email" className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input {...register("password")} type="password" className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
        {isSubmitting ? "Creating account..." : "Sign Up"}
      </button>
    </form>
  );
}`,

  // Dark mode with Tailwind
  `Dark mode toggle with Tailwind and localStorage persistence:
"use client";
import { useEffect, useState } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(saved === "dark" || (!saved && prefersDark));
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <button onClick={() => setDark(!dark)}
        className="fixed top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:scale-110 transition-transform">
        {dark ? "☀️" : "🌙"}
      </button>
      {children}
    </div>
  );
}`,
])

// ════════════════════════════════════════════════════════════════════════
// PYTHON CODE EXAMPLES
// ════════════════════════════════════════════════════════════════════════

seedCode('Python Code Examples', [
  // FastAPI endpoint
  `FastAPI REST endpoint with Pydantic validation and error handling:
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr

app = FastAPI()

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    age: int = Field(ge=0, le=150)

class UserResponse(BaseModel):
    id: int
    name: str
    email: str

@app.post("/users", response_model=UserResponse, status_code=201)
async def create_user(user: UserCreate):
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    result = await db.users.insert_one(user.model_dump())
    return UserResponse(id=result.inserted_id, **user.model_dump())

@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(**user)`,

  // SQLAlchemy 2.0 with async
  `SQLAlchemy 2.0 async with repository pattern:
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import select, String

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(200), unique=True)

engine = create_async_engine("postgresql+asyncpg://user:pass@localhost/db")
SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, user_id: int) -> User | None:
        result = await self.session.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def create(self, name: str, email: str) -> User:
        user = User(name=name, email=email)
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user`,

  // Pytest with fixtures
  `Pytest with fixtures, parametrize, and async testing:
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c

@pytest.fixture
async def test_user(client: AsyncClient):
    response = await client.post("/users", json={"name": "Test", "email": "test@example.com", "age": 25})
    return response.json()

@pytest.mark.asyncio
async def test_create_user(client: AsyncClient):
    response = await client.post("/users", json={"name": "Alice", "email": "alice@example.com", "age": 30})
    assert response.status_code == 201
    assert response.json()["name"] == "Alice"

@pytest.mark.asyncio
async def test_duplicate_email(client: AsyncClient, test_user):
    response = await client.post("/users", json={"name": "Bob", "email": test_user["email"], "age": 25})
    assert response.status_code == 409

@pytest.mark.parametrize("age,expected_status", [(-1, 422), (0, 201), (150, 201), (151, 422)])
@pytest.mark.asyncio
async def test_age_validation(client: AsyncClient, age, expected_status):
    response = await client.post("/users", json={"name": "Test", "email": f"test{age}@example.com", "age": age})
    assert response.status_code == expected_status`,

  // Python dataclass + clean architecture
  `Python clean architecture with dataclasses and dependency injection:
from dataclasses import dataclass
from abc import ABC, abstractmethod

@dataclass(frozen=True)
class Order:
    id: str
    user_id: str
    items: list[dict]
    total: float
    status: str = "pending"

class OrderRepository(ABC):
    @abstractmethod
    async def save(self, order: Order) -> None: ...
    @abstractmethod
    async def find_by_id(self, order_id: str) -> Order | None: ...

class PaymentGateway(ABC):
    @abstractmethod
    async def charge(self, amount: float, token: str) -> bool: ...

class CreateOrderUseCase:
    def __init__(self, repo: OrderRepository, payment: PaymentGateway):
        self.repo = repo
        self.payment = payment

    async def execute(self, user_id: str, items: list[dict], payment_token: str) -> Order:
        total = sum(item["price"] * item["qty"] for item in items)
        charged = await self.payment.charge(total, payment_token)
        if not charged:
            raise ValueError("Payment failed")
        order = Order(id=generate_id(), user_id=user_id, items=items, total=total, status="confirmed")
        await self.repo.save(order)
        return order`,
])

// ════════════════════════════════════════════════════════════════════════
// C# / .NET CODE EXAMPLES
// ════════════════════════════════════════════════════════════════════════

seedCode('C# Code Examples', [
  // Minimal API
  `ASP.NET Core Minimal API with validation and error handling:
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddDbContext<AppDbContext>(o => o.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

var app = builder.Build();

app.MapGet("/api/users/{id:int}", async (int id, IUserService service) =>
{
    var user = await service.GetByIdAsync(id);
    return user is not null ? Results.Ok(user) : Results.NotFound();
});

app.MapPost("/api/users", async (CreateUserRequest request, IUserService service) =>
{
    if (string.IsNullOrWhiteSpace(request.Email))
        return Results.BadRequest("Email required");
    var user = await service.CreateAsync(request);
    return Results.Created($"/api/users/{user.Id}", user);
});

app.Run();

record CreateUserRequest(string Name, string Email);
record UserResponse(int Id, string Name, string Email);`,

  // Entity Framework with repository
  `Entity Framework Core repository with async and specification pattern:
public class AppDbContext : DbContext
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Product>(e =>
        {
            e.HasKey(p => p.Id);
            e.Property(p => p.Name).HasMaxLength(200).IsRequired();
            e.Property(p => p.Price).HasPrecision(18, 2);
            e.HasIndex(p => p.Name);
        });
    }
}

public class ProductRepository : IProductRepository
{
    private readonly AppDbContext _db;
    public ProductRepository(AppDbContext db) => _db = db;

    public async Task<Product?> GetByIdAsync(int id)
        => await _db.Products.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);

    public async Task<List<Product>> SearchAsync(string query, int page = 1, int pageSize = 20)
        => await _db.Products.AsNoTracking()
            .Where(p => EF.Functions.ILike(p.Name, $"%{query}%"))
            .OrderBy(p => p.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

    public async Task<Product> CreateAsync(Product product)
    {
        _db.Products.Add(product);
        await _db.SaveChangesAsync();
        return product;
    }
}`,

  // MediatR CQRS
  `CQRS with MediatR — command and query separation:
// Query
public record GetProductQuery(int Id) : IRequest<ProductResponse?>;

public class GetProductHandler : IRequestHandler<GetProductQuery, ProductResponse?>
{
    private readonly IProductRepository _repo;
    public GetProductHandler(IProductRepository repo) => _repo = repo;

    public async Task<ProductResponse?> Handle(GetProductQuery request, CancellationToken ct)
    {
        var product = await _repo.GetByIdAsync(request.Id);
        return product is null ? null : new ProductResponse(product.Id, product.Name, product.Price);
    }
}

// Command
public record CreateProductCommand(string Name, decimal Price) : IRequest<ProductResponse>;

public class CreateProductValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Price).GreaterThan(0);
    }
}

public class CreateProductHandler : IRequestHandler<CreateProductCommand, ProductResponse>
{
    private readonly IProductRepository _repo;
    public CreateProductHandler(IProductRepository repo) => _repo = repo;

    public async Task<ProductResponse> Handle(CreateProductCommand request, CancellationToken ct)
    {
        var product = new Product { Name = request.Name, Price = request.Price };
        await _repo.CreateAsync(product);
        return new ProductResponse(product.Id, product.Name, product.Price);
    }
}`,
])

// ════════════════════════════════════════════════════════════════════════
// SWIFT / iOS CODE EXAMPLES
// ════════════════════════════════════════════════════════════════════════

seedCode('Swift Code Examples', [
  `SwiftUI list with navigation, search, and pull-to-refresh:
struct ProductListView: View {
    @StateObject private var viewModel = ProductViewModel()
    @State private var searchText = ""

    var filteredProducts: [Product] {
        searchText.isEmpty ? viewModel.products
            : viewModel.products.filter { $0.name.localizedCaseInsensitiveContains(searchText) }
    }

    var body: some View {
        NavigationStack {
            List(filteredProducts) { product in
                NavigationLink(value: product) {
                    HStack(spacing: 12) {
                        AsyncImage(url: product.imageURL) { image in
                            image.resizable().aspectRatio(contentMode: .fill)
                        } placeholder: { Color.gray.opacity(0.2) }
                        .frame(width: 60, height: 60)
                        .clipShape(RoundedRectangle(cornerRadius: 8))

                        VStack(alignment: .leading, spacing: 4) {
                            Text(product.name).font(.headline)
                            Text("$\\(product.price, specifier: \"%.2f\")").foregroundStyle(.blue)
                        }
                    }
                    .padding(.vertical, 4)
                }
            }
            .navigationTitle("Products")
            .searchable(text: $searchText, prompt: "Search products")
            .refreshable { await viewModel.loadProducts() }
            .navigationDestination(for: Product.self) { ProductDetailView(product: $0) }
        }
        .task { await viewModel.loadProducts() }
    }
}`,

  `SwiftUI MVVM ViewModel with async/await and error handling:
@MainActor
class ProductViewModel: ObservableObject {
    @Published var products: [Product] = []
    @Published var isLoading = false
    @Published var error: String?

    private let service: ProductService

    init(service: ProductService = .shared) {
        self.service = service
    }

    func loadProducts() async {
        isLoading = true
        error = nil
        do {
            products = try await service.fetchProducts()
        } catch {
            self.error = error.localizedDescription
        }
        isLoading = false
    }

    func deleteProduct(_ product: Product) async {
        do {
            try await service.delete(id: product.id)
            products.removeAll { $0.id == product.id }
        } catch {
            self.error = "Failed to delete: \\(error.localizedDescription)"
        }
    }
}`,
])

// ════════════════════════════════════════════════════════════════════════
// ANDROID / KOTLIN CODE EXAMPLES
// ════════════════════════════════════════════════════════════════════════

seedCode('Kotlin Android Code Examples', [
  `Jetpack Compose screen with ViewModel, LazyColumn, and Material 3:
@Composable
fun ProductListScreen(viewModel: ProductViewModel = hiltViewModel()) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Products") },
                actions = {
                    IconButton(onClick = { viewModel.refresh() }) {
                        Icon(Icons.Default.Refresh, "Refresh")
                    }
                }
            )
        }
    ) { padding ->
        when (val state = uiState) {
            is UiState.Loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
            is UiState.Error -> Column(Modifier.fillMaxSize().padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text("Error: \${state.message}", color = MaterialTheme.colorScheme.error)
                Button(onClick = { viewModel.refresh() }) { Text("Retry") }
            }
            is UiState.Success -> LazyColumn(contentPadding = padding) {
                items(state.products, key = { it.id }) { product ->
                    ProductCard(product = product, onDelete = { viewModel.delete(it) })
                }
            }
        }
    }
}

@Composable
fun ProductCard(product: Product, onDelete: (Product) -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            AsyncImage(model = product.imageUrl, contentDescription = product.name,
                modifier = Modifier.size(56.dp).clip(RoundedCornerShape(8.dp)))
            Column(Modifier.weight(1f).padding(start = 12.dp)) {
                Text(product.name, style = MaterialTheme.typography.titleMedium)
                Text("$\${product.price}", color = MaterialTheme.colorScheme.primary)
            }
            IconButton(onClick = { onDelete(product) }) {
                Icon(Icons.Default.Delete, "Delete", tint = MaterialTheme.colorScheme.error)
            }
        }
    }
}`,

  `Kotlin ViewModel with StateFlow and repository pattern:
@HiltViewModel
class ProductViewModel @Inject constructor(
    private val repository: ProductRepository
) : ViewModel() {

    sealed class UiState {
        object Loading : UiState()
        data class Success(val products: List<Product>) : UiState()
        data class Error(val message: String) : UiState()
    }

    private val _uiState = MutableStateFlow<UiState>(UiState.Loading)
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    init { refresh() }

    fun refresh() {
        viewModelScope.launch {
            _uiState.value = UiState.Loading
            try {
                val products = repository.getAll()
                _uiState.value = UiState.Success(products)
            } catch (e: Exception) {
                _uiState.value = UiState.Error(e.message ?: "Unknown error")
            }
        }
    }

    fun delete(product: Product) {
        viewModelScope.launch {
            try {
                repository.delete(product.id)
                refresh()
            } catch (e: Exception) {
                _uiState.value = UiState.Error("Delete failed: \${e.message}")
            }
        }
    }
}`,
])

// ════════════════════════════════════════════════════════════════════════
// UNITY C# CODE EXAMPLES
// ════════════════════════════════════════════════════════════════════════

seedCode('Unity Code Examples', [
  `Unity player controller with smooth movement, jumping, and ground detection:
using UnityEngine;

[RequireComponent(typeof(CharacterController))]
public class PlayerController : MonoBehaviour
{
    [Header("Movement")]
    [SerializeField] private float moveSpeed = 6f;
    [SerializeField] private float sprintMultiplier = 1.6f;
    [SerializeField] private float jumpHeight = 1.2f;
    [SerializeField] private float gravity = -20f;
    [SerializeField] private float turnSmoothTime = 0.1f;

    [Header("Ground Check")]
    [SerializeField] private Transform groundCheck;
    [SerializeField] private float groundDistance = 0.3f;
    [SerializeField] private LayerMask groundMask;

    private CharacterController controller;
    private Vector3 velocity;
    private bool isGrounded;
    private float turnSmoothVelocity;
    private Transform cam;

    void Start()
    {
        controller = GetComponent<CharacterController>();
        cam = Camera.main.transform;
        Cursor.lockState = CursorLockMode.Locked;
    }

    void Update()
    {
        isGrounded = Physics.CheckSphere(groundCheck.position, groundDistance, groundMask);
        if (isGrounded && velocity.y < 0) velocity.y = -2f;

        float h = Input.GetAxisRaw("Horizontal");
        float v = Input.GetAxisRaw("Vertical");
        Vector3 direction = new Vector3(h, 0f, v).normalized;

        if (direction.magnitude >= 0.1f)
        {
            float targetAngle = Mathf.Atan2(direction.x, direction.z) * Mathf.Rad2Deg + cam.eulerAngles.y;
            float angle = Mathf.SmoothDampAngle(transform.eulerAngles.y, targetAngle, ref turnSmoothVelocity, turnSmoothTime);
            transform.rotation = Quaternion.Euler(0f, angle, 0f);

            Vector3 moveDir = Quaternion.Euler(0f, targetAngle, 0f) * Vector3.forward;
            float speed = moveSpeed * (Input.GetKey(KeyCode.LeftShift) ? sprintMultiplier : 1f);
            controller.Move(moveDir.normalized * speed * Time.deltaTime);
        }

        if (Input.GetButtonDown("Jump") && isGrounded)
            velocity.y = Mathf.Sqrt(jumpHeight * -2f * gravity);

        velocity.y += gravity * Time.deltaTime;
        controller.Move(velocity * Time.deltaTime);
    }
}`,

  `Unity object pooling system for bullets/particles:
using System.Collections.Generic;
using UnityEngine;

public class ObjectPool<T> where T : Component
{
    private readonly T prefab;
    private readonly Transform parent;
    private readonly Queue<T> pool = new();

    public ObjectPool(T prefab, int initialSize, Transform parent = null)
    {
        this.prefab = prefab;
        this.parent = parent;
        for (int i = 0; i < initialSize; i++)
        {
            var obj = Object.Instantiate(prefab, parent);
            obj.gameObject.SetActive(false);
            pool.Enqueue(obj);
        }
    }

    public T Get(Vector3 position, Quaternion rotation)
    {
        T obj = pool.Count > 0 ? pool.Dequeue() : Object.Instantiate(prefab, parent);
        obj.transform.SetPositionAndRotation(position, rotation);
        obj.gameObject.SetActive(true);
        return obj;
    }

    public void Return(T obj)
    {
        obj.gameObject.SetActive(false);
        pool.Enqueue(obj);
    }
}

// Usage:
public class BulletSpawner : MonoBehaviour
{
    [SerializeField] private Bullet bulletPrefab;
    private ObjectPool<Bullet> bulletPool;

    void Start() => bulletPool = new ObjectPool<Bullet>(bulletPrefab, 50);

    public void Fire(Vector3 origin, Vector3 direction)
    {
        var bullet = bulletPool.Get(origin, Quaternion.LookRotation(direction));
        bullet.Init(direction, () => bulletPool.Return(bullet));
    }
}`,

  `Unity ScriptableObject for game data (items, skills, stats):
using UnityEngine;

[CreateAssetMenu(fileName = "NewWeapon", menuName = "Game/Weapon")]
public class WeaponData : ScriptableObject
{
    [Header("Info")]
    public string weaponName;
    public string description;
    public Sprite icon;
    public GameObject prefab;

    [Header("Stats")]
    public float damage = 10f;
    public float fireRate = 0.5f;
    public float range = 50f;
    public int magazineSize = 30;
    public float reloadTime = 2f;

    [Header("Effects")]
    public AudioClip fireSound;
    public AudioClip reloadSound;
    public GameObject muzzleFlash;
    public GameObject impactEffect;

    public float DPS => damage * (1f / fireRate);
}`,
])

// ════════════════════════════════════════════════════════════════════════
// THREE.JS CODE EXAMPLES
// ════════════════════════════════════════════════════════════════════════

seedCode('Three.js Code Examples', [
  `React Three Fiber interactive 3D scene with lighting and controls:
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Float, Text3D, Center } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function SpinningBox({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  useFrame((_, delta) => { ref.current.rotation.y += delta * 0.5; });

  return (
    <mesh ref={ref} position={position}
      onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.2 : 1}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "#ff6b6b" : "#4285F4"} roughness={0.3} metalness={0.5} />
    </mesh>
  );
}

export default function Scene() {
  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }} shadows>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow
          shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <SpinningBox position={[-2, 0, 0]} />
        </Float>
        <SpinningBox position={[0, 0, 0]} />
        <SpinningBox position={[2, 0, 0]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>
        <Environment preset="city" />
        <OrbitControls enableDamping />
      </Canvas>
    </div>
  );
}`,

  `Three.js custom shader material with animated gradient:
import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useRef } from "react";

const GradientMaterial = shaderMaterial(
  { uTime: 0, uColor1: new THREE.Color("#4285F4"), uColor2: new THREE.Color("#ff6b6b") },
  // Vertex shader
  \`varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }\`,
  // Fragment shader
  \`uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  varying vec2 vUv;
  void main() {
    float wave = sin(vUv.x * 3.14 + uTime) * 0.5 + 0.5;
    vec3 color = mix(uColor1, uColor2, wave * vUv.y);
    gl_FragColor = vec4(color, 1.0);
  }\`
);
extend({ GradientMaterial });

function AnimatedSphere() {
  const ref = useRef<any>();
  useFrame((state) => { ref.current.uTime = state.clock.elapsedTime; });
  return (
    <mesh>
      <sphereGeometry args={[1, 64, 64]} />
      <gradientMaterial ref={ref} />
    </mesh>
  );
}`,
])

// ════════════════════════════════════════════════════════════════════════
// TYPESCRIPT / NODE.JS CODE EXAMPLES
// ════════════════════════════════════════════════════════════════════════

seedCode('TypeScript Code Examples', [
  `Type-safe API client with generics and error handling:
type ApiResponse<T> = { data: T; status: number } | { error: string; status: number };

class ApiClient {
  constructor(private baseUrl: string, private token?: string) {}

  private async request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.token) headers["Authorization"] = \`Bearer \${this.token}\`;

    try {
      const res = await fetch(\`\${this.baseUrl}\${path}\`, { ...options, headers: { ...headers, ...options.headers as Record<string, string> } });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        return { error: body.message || res.statusText, status: res.status };
      }
      const data = await res.json() as T;
      return { data, status: res.status };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Network error", status: 0 };
    }
  }

  get<T>(path: string) { return this.request<T>(path); }
  post<T>(path: string, body: unknown) { return this.request<T>(path, { method: "POST", body: JSON.stringify(body) }); }
  put<T>(path: string, body: unknown) { return this.request<T>(path, { method: "PUT", body: JSON.stringify(body) }); }
  delete<T>(path: string) { return this.request<T>(path, { method: "DELETE" }); }
}

// Usage:
const api = new ApiClient("https://api.example.com", "my-token");
const result = await api.get<User[]>("/users");
if ("data" in result) console.log(result.data);
else console.error(result.error);`,

  `Express-like middleware pattern in TypeScript:
type Context = { req: Request; res: Response; state: Record<string, unknown> };
type Middleware = (ctx: Context, next: () => Promise<void>) => Promise<void>;

function compose(middlewares: Middleware[]): Middleware {
  return async (ctx, next) => {
    let index = -1;
    async function dispatch(i: number): Promise<void> {
      if (i <= index) throw new Error("next() called multiple times");
      index = i;
      const fn = i === middlewares.length ? next : middlewares[i];
      if (fn) await fn(ctx, () => dispatch(i + 1));
    }
    await dispatch(0);
  };
}

// Middlewares
const logger: Middleware = async (ctx, next) => {
  const start = Date.now();
  await next();
  console.log(\`\${ctx.req.method} \${ctx.req.url} - \${Date.now() - start}ms\`);
};

const auth: Middleware = async (ctx, next) => {
  const token = ctx.req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) { ctx.res = new Response("Unauthorized", { status: 401 }); return; }
  ctx.state.userId = verifyToken(token);
  await next();
};`,
])

// ════════════════════════════════════════════════════════════════════════
// CSS EXAMPLES
// ════════════════════════════════════════════════════════════════════════

seedCode('CSS Code Examples', [
  `Beautiful glassmorphism card with modern CSS:
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.glass-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
}`,

  `CSS Grid responsive dashboard layout with named areas:
.dashboard {
  display: grid;
  grid-template-areas:
    "sidebar header header"
    "sidebar main   aside"
    "sidebar footer footer";
  grid-template-columns: 260px 1fr 300px;
  grid-template-rows: 64px 1fr 48px;
  min-height: 100vh;
  gap: 0;
}
.sidebar { grid-area: sidebar; background: #0f172a; color: white; padding: 20px; }
.header  { grid-area: header; background: white; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; padding: 0 24px; }
.main    { grid-area: main; padding: 24px; overflow-y: auto; background: #f8fafc; }
.aside   { grid-area: aside; padding: 24px; border-left: 1px solid #e2e8f0; }
.footer  { grid-area: footer; background: white; border-top: 1px solid #e2e8f0; display: flex; align-items: center; padding: 0 24px; }

@media (max-width: 1024px) {
  .dashboard { grid-template-areas: "header" "main" "footer"; grid-template-columns: 1fr; grid-template-rows: 64px 1fr 48px; }
  .sidebar, .aside { display: none; }
}`,

  `Smooth scroll-driven animation with CSS only:
@keyframes fade-in {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}

.scroll-reveal {
  animation: fade-in linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 50%;
}

/* Fluid typography — scales smoothly between breakpoints */
h1 { font-size: clamp(2rem, 5vw + 1rem, 4.5rem); line-height: 1.1; letter-spacing: -0.02em; }
h2 { font-size: clamp(1.5rem, 3vw + 0.5rem, 3rem); line-height: 1.2; }
p  { font-size: clamp(1rem, 1vw + 0.75rem, 1.25rem); line-height: 1.7; max-width: 65ch; }`,
])

console.log('\n✅ Code examples seeding complete!')
console.log('Ghost now has working code for: React, Python, C#, Swift, Kotlin, Unity, Three.js, TypeScript, CSS')

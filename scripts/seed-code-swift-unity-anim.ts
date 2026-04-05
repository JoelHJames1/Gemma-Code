#!/usr/bin/env bun
/**
 * Code examples: Modern SwiftUI, iOS animations, advanced Unity C#, modern web animations
 * Run: bun scripts/seed-code-swift-unity-anim.ts
 */

import { assertBelief } from '../src/knowledge/beliefs.js'
import { ensureEntity } from '../src/knowledge/graph.js'
import { practiceSkill } from '../src/growth/skills.js'

function seedCode(topic: string, examples: string[]) {
  console.log(`\n💻 Seeding: ${topic} (${examples.length} examples)`)
  ensureEntity(topic, 'technology', { seededAt: new Date().toISOString(), source: 'claude-code-v5' })
  for (const ex of examples) assertBelief(ex, 'technical', `Code example for ${topic}`, 'claude-seeded')
  practiceSkill(topic, 'technology', true, `${examples.length} code examples seeded`)
}

// ════════════════════════════════════════════════════════════════════════
// MODERN SWIFTUI — COMPLETE APP PATTERNS
// ════════════════════════════════════════════════════════════════════════

seedCode('Modern SwiftUI Code', [
  `SwiftUI app with TabView, custom tab bar, and sheet navigation:
@main
struct MyApp: App {
    @StateObject private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            TabView(selection: $appState.selectedTab) {
                HomeView()
                    .tabItem { Label("Home", systemImage: "house.fill") }
                    .tag(Tab.home)
                ExploreView()
                    .tabItem { Label("Explore", systemImage: "safari.fill") }
                    .tag(Tab.explore)
                ProfileView()
                    .tabItem { Label("Profile", systemImage: "person.fill") }
                    .tag(Tab.profile)
            }
            .tint(.blue)
            .environmentObject(appState)
        }
    }
}

enum Tab: String { case home, explore, profile }

@MainActor
class AppState: ObservableObject {
    @Published var selectedTab: Tab = .home
    @Published var isAuthenticated = false
    @Published var user: User?
}`,

  `SwiftUI modern card layout with AsyncImage, gradients, and haptics:
struct EventCard: View {
    let event: Event
    @State private var isPressed = false

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Hero image with gradient overlay
            ZStack(alignment: .bottomLeading) {
                AsyncImage(url: event.imageURL) { phase in
                    switch phase {
                    case .success(let image):
                        image.resizable().aspectRatio(contentMode: .fill)
                    case .failure:
                        Color.gray.overlay(Image(systemName: "photo").foregroundStyle(.white))
                    default:
                        Color.gray.opacity(0.2).overlay(ProgressView())
                    }
                }
                .frame(height: 200)
                .clipped()

                LinearGradient(colors: [.clear, .black.opacity(0.7)], startPoint: .top, endPoint: .bottom)

                VStack(alignment: .leading, spacing: 4) {
                    Text(event.category.uppercased())
                        .font(.caption2).fontWeight(.bold)
                        .padding(.horizontal, 8).padding(.vertical, 4)
                        .background(.ultraThinMaterial, in: Capsule())
                    Text(event.title)
                        .font(.title3).fontWeight(.bold).foregroundStyle(.white)
                }
                .padding()
            }

            // Details
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 12) {
                    Label(event.date.formatted(.dateTime.month().day()), systemImage: "calendar")
                    Label(event.location, systemImage: "mappin")
                }
                .font(.caption).foregroundStyle(.secondary)

                Text(event.description)
                    .font(.subheadline).foregroundStyle(.secondary)
                    .lineLimit(2)

                HStack {
                    // Attendee avatars overlapping
                    HStack(spacing: -8) {
                        ForEach(event.attendees.prefix(3), id: \\.self) { avatar in
                            AsyncImage(url: avatar) { $0.resizable() } placeholder: { Color.gray }
                                .frame(width: 28, height: 28)
                                .clipShape(Circle())
                                .overlay(Circle().stroke(.white, lineWidth: 2))
                        }
                        if event.attendeeCount > 3 {
                            Text("+\\(event.attendeeCount - 3)")
                                .font(.caption2).fontWeight(.medium)
                                .frame(width: 28, height: 28)
                                .background(Color.blue.opacity(0.1), in: Circle())
                        }
                    }
                    Spacer()
                    Text("$\\(event.price, specifier: "%.0f")")
                        .font(.headline).foregroundStyle(.blue)
                }
            }
            .padding()
        }
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .shadow(color: .black.opacity(0.08), radius: 12, y: 4)
        .scaleEffect(isPressed ? 0.97 : 1.0)
        .animation(.spring(response: 0.3), value: isPressed)
        .onTapGesture {
            let impact = UIImpactFeedbackGenerator(style: .light)
            impact.impactOccurred()
        }
        .onLongPressGesture(minimumDuration: .infinity, pressing: { isPressed = $0 }, perform: {})
    }
}`,

  `SwiftUI custom animated pull-to-refresh with Lottie-style animation:
struct RefreshableScrollView<Content: View>: View {
    let onRefresh: () async -> Void
    @ViewBuilder let content: () -> Content
    @State private var isRefreshing = false
    @State private var pullOffset: CGFloat = 0
    private let threshold: CGFloat = 80

    var body: some View {
        ScrollView {
            GeometryReader { geo in
                Color.clear.preference(
                    key: ScrollOffsetKey.self,
                    value: geo.frame(in: .named("scroll")).minY
                )
            }
            .frame(height: 0)

            // Refresh indicator
            if pullOffset > 10 {
                HStack(spacing: 12) {
                    Circle()
                        .trim(from: 0, to: min(pullOffset / threshold, 1.0))
                        .stroke(Color.blue, style: StrokeStyle(lineWidth: 2.5, lineCap: .round))
                        .frame(width: 24, height: 24)
                        .rotationEffect(.degrees(isRefreshing ? 360 : 0))
                        .animation(isRefreshing ? .linear(duration: 1).repeatForever(autoreverses: false) : .default, value: isRefreshing)
                    if isRefreshing {
                        Text("Updating...").font(.caption).foregroundStyle(.secondary)
                    }
                }
                .frame(height: pullOffset > threshold ? 60 : pullOffset)
                .transition(.opacity)
            }

            content()
        }
        .coordinateSpace(name: "scroll")
        .onPreferenceChange(ScrollOffsetKey.self) { offset in
            pullOffset = max(0, offset)
            if offset > threshold && !isRefreshing {
                Task {
                    isRefreshing = true
                    let impact = UIImpactFeedbackGenerator(style: .medium)
                    impact.impactOccurred()
                    await onRefresh()
                    withAnimation { isRefreshing = false }
                }
            }
        }
    }
}

struct ScrollOffsetKey: PreferenceKey {
    static var defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) { value = nextValue() }
}`,

  `SwiftUI network layer with async/await, Codable, and interceptors:
actor NetworkClient {
    static let shared = NetworkClient()
    private let session = URLSession.shared
    private var token: String?

    func setToken(_ token: String) { self.token = token }

    func request<T: Codable>(_ endpoint: Endpoint) async throws -> T {
        var request = URLRequest(url: endpoint.url)
        request.httpMethod = endpoint.method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token { request.setValue("Bearer \\(token)", forHTTPHeaderField: "Authorization") }
        if let body = endpoint.body { request.httpBody = try JSONEncoder().encode(body) }

        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse else { throw APIError.invalidResponse }

        switch http.statusCode {
        case 200...299:
            return try JSONDecoder().decode(T.self, from: data)
        case 401:
            throw APIError.unauthorized
        case 404:
            throw APIError.notFound
        default:
            let message = try? JSONDecoder().decode(ErrorResponse.self, from: data)
            throw APIError.server(http.statusCode, message?.error ?? "Unknown error")
        }
    }
}

enum APIError: LocalizedError {
    case invalidResponse, unauthorized, notFound
    case server(Int, String)

    var errorDescription: String? {
        switch self {
        case .unauthorized: return "Please log in again"
        case .notFound: return "Resource not found"
        case .server(let code, let msg): return "Server error (\\(code)): \\(msg)"
        default: return "Something went wrong"
        }
    }
}

struct Endpoint {
    let path: String
    let method: HTTPMethod = .get
    let body: (any Encodable)? = nil

    var url: URL { URL(string: "https://api.example.com\\(path)")! }

    enum HTTPMethod: String { case get = "GET", post = "POST", put = "PUT", delete = "DELETE" }

    static func getUsers() -> Endpoint { Endpoint(path: "/users") }
    static func createUser(_ user: CreateUserRequest) -> Endpoint { Endpoint(path: "/users", method: .post, body: user) }
}`,

  `SwiftUI animation examples — matched geometry, spring, keyframe:
struct AnimatedCardStack: View {
    @Namespace private var animation
    @State private var selectedCard: Card?

    var body: some View {
        ZStack {
            // Grid of cards
            if selectedCard == nil {
                ScrollView {
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 160))], spacing: 16) {
                        ForEach(cards) { card in
                            CardThumbnail(card: card)
                                .matchedGeometryEffect(id: card.id, in: animation)
                                .onTapGesture {
                                    withAnimation(.spring(response: 0.4, dampingFraction: 0.8)) {
                                        selectedCard = card
                                    }
                                }
                        }
                    }
                    .padding()
                }
            }

            // Expanded detail
            if let card = selectedCard {
                CardDetail(card: card)
                    .matchedGeometryEffect(id: card.id, in: animation)
                    .transition(.asymmetric(insertion: .opacity, removal: .opacity))
                    .onTapGesture {
                        withAnimation(.spring(response: 0.35, dampingFraction: 0.85)) {
                            selectedCard = nil
                        }
                    }
            }
        }
    }
}

// Keyframe animation for bouncy entrance
struct BouncyEntrance: View {
    @State private var animate = false

    var body: some View {
        Text("Hello!")
            .font(.largeTitle.bold())
            .keyframeAnimator(initialValue: AnimationValues(), trigger: animate) { content, value in
                content
                    .scaleEffect(value.scale)
                    .offset(y: value.yOffset)
                    .opacity(value.opacity)
            } keyframes: { _ in
                KeyframeTrack(\\.scale) {
                    SpringKeyframe(1.2, duration: 0.3, spring: .snappy)
                    SpringKeyframe(0.9, duration: 0.2, spring: .snappy)
                    SpringKeyframe(1.0, duration: 0.2, spring: .snappy)
                }
                KeyframeTrack(\\.yOffset) {
                    SpringKeyframe(-20, duration: 0.3, spring: .bouncy)
                    SpringKeyframe(0, duration: 0.3, spring: .bouncy)
                }
                KeyframeTrack(\\.opacity) {
                    LinearKeyframe(1.0, duration: 0.2)
                }
            }
            .onAppear { animate = true }
    }
}

struct AnimationValues {
    var scale: CGFloat = 0.5
    var yOffset: CGFloat = 50
    var opacity: Double = 0
}`,
])

// ════════════════════════════════════════════════════════════════════════
// ADVANCED UNITY C# — COMPLETE SYSTEMS
// ════════════════════════════════════════════════════════════════════════

seedCode('Advanced Unity C# Code', [
  `Unity state machine for enemy AI with patrol, chase, attack, and flee:
using UnityEngine;
using UnityEngine.AI;

public class EnemyAI : MonoBehaviour
{
    [Header("References")]
    [SerializeField] private NavMeshAgent agent;
    [SerializeField] private Animator animator;
    [SerializeField] private Transform[] patrolPoints;

    [Header("Settings")]
    [SerializeField] private float detectionRange = 15f;
    [SerializeField] private float attackRange = 2f;
    [SerializeField] private float attackCooldown = 1.5f;
    [SerializeField] private float fleeHealthThreshold = 20f;

    private Transform player;
    private EnemyState state = EnemyState.Patrol;
    private int patrolIndex;
    private float lastAttackTime;
    private float health = 100f;

    private static readonly int AnimSpeed = Animator.StringToHash("Speed");
    private static readonly int AnimAttack = Animator.StringToHash("Attack");

    enum EnemyState { Patrol, Chase, Attack, Flee }

    void Start()
    {
        player = GameObject.FindGameObjectWithTag("Player")?.transform;
        GoToNextPatrolPoint();
    }

    void Update()
    {
        float distToPlayer = player ? Vector3.Distance(transform.position, player.position) : float.MaxValue;
        animator.SetFloat(AnimSpeed, agent.velocity.magnitude / agent.speed);

        switch (state)
        {
            case EnemyState.Patrol:
                if (distToPlayer < detectionRange) { state = EnemyState.Chase; break; }
                if (!agent.pathPending && agent.remainingDistance < 0.5f) GoToNextPatrolPoint();
                break;

            case EnemyState.Chase:
                if (health < fleeHealthThreshold) { state = EnemyState.Flee; break; }
                if (distToPlayer > detectionRange * 1.5f) { state = EnemyState.Patrol; GoToNextPatrolPoint(); break; }
                if (distToPlayer < attackRange) { state = EnemyState.Attack; break; }
                agent.SetDestination(player.position);
                break;

            case EnemyState.Attack:
                agent.SetDestination(transform.position); // Stop moving
                transform.LookAt(new Vector3(player.position.x, transform.position.y, player.position.z));
                if (distToPlayer > attackRange * 1.2f) { state = EnemyState.Chase; break; }
                if (Time.time - lastAttackTime > attackCooldown)
                {
                    animator.SetTrigger(AnimAttack);
                    lastAttackTime = Time.time;
                    // Damage dealt via animation event
                }
                break;

            case EnemyState.Flee:
                Vector3 fleeDir = (transform.position - player.position).normalized;
                agent.SetDestination(transform.position + fleeDir * 10f);
                if (distToPlayer > detectionRange * 2f) { state = EnemyState.Patrol; GoToNextPatrolPoint(); }
                break;
        }
    }

    void GoToNextPatrolPoint()
    {
        if (patrolPoints.Length == 0) return;
        agent.SetDestination(patrolPoints[patrolIndex].position);
        patrolIndex = (patrolIndex + 1) % patrolPoints.Length;
    }

    public void TakeDamage(float amount)
    {
        health -= amount;
        if (health <= 0) Die();
        else if (state == EnemyState.Patrol) state = EnemyState.Chase;
    }

    void Die()
    {
        animator.SetTrigger("Die");
        agent.enabled = false;
        enabled = false;
        Destroy(gameObject, 3f);
    }
}`,

  `Unity inventory system with ScriptableObject items and UI:
using System;
using System.Collections.Generic;
using UnityEngine;

[CreateAssetMenu(fileName = "NewItem", menuName = "Game/Item")]
public class ItemData : ScriptableObject
{
    public string itemName;
    public string description;
    public Sprite icon;
    public ItemType type;
    public int maxStack = 99;
    public bool isConsumable;

    [Header("Stats")]
    public float healthRestore;
    public float damage;
    public float armor;

    public enum ItemType { Weapon, Armor, Consumable, Material, Quest }
}

[Serializable]
public class InventorySlot
{
    public ItemData item;
    public int quantity;

    public InventorySlot(ItemData item, int quantity)
    {
        this.item = item;
        this.quantity = quantity;
    }
}

public class Inventory : MonoBehaviour
{
    [SerializeField] private int maxSlots = 24;
    private List<InventorySlot> slots = new();

    public event Action OnInventoryChanged;

    public IReadOnlyList<InventorySlot> Slots => slots;

    public bool AddItem(ItemData item, int amount = 1)
    {
        // Try to stack with existing slot
        var existing = slots.Find(s => s.item == item && s.quantity < item.maxStack);
        if (existing != null)
        {
            int canAdd = Mathf.Min(amount, item.maxStack - existing.quantity);
            existing.quantity += canAdd;
            amount -= canAdd;
        }

        // Add to new slots if needed
        while (amount > 0 && slots.Count < maxSlots)
        {
            int toAdd = Mathf.Min(amount, item.maxStack);
            slots.Add(new InventorySlot(item, toAdd));
            amount -= toAdd;
        }

        OnInventoryChanged?.Invoke();
        return amount == 0; // True if all items were added
    }

    public bool RemoveItem(ItemData item, int amount = 1)
    {
        for (int i = slots.Count - 1; i >= 0 && amount > 0; i--)
        {
            if (slots[i].item != item) continue;
            int removed = Mathf.Min(amount, slots[i].quantity);
            slots[i].quantity -= removed;
            amount -= removed;
            if (slots[i].quantity <= 0) slots.RemoveAt(i);
        }
        OnInventoryChanged?.Invoke();
        return amount == 0;
    }

    public int GetItemCount(ItemData item) => slots.FindAll(s => s.item == item).Sum(s => s.quantity);
    public bool HasItem(ItemData item, int amount = 1) => GetItemCount(item) >= amount;
    public bool IsFull => slots.Count >= maxSlots && slots.TrueForAll(s => s.quantity >= s.item.maxStack);
}`,

  `Unity save/load system with JSON serialization:
using System;
using System.IO;
using UnityEngine;

[Serializable]
public class SaveData
{
    public string playerName;
    public Vector3Serializable playerPosition;
    public float health;
    public float stamina;
    public int level;
    public int experience;
    public float playTime;
    public string[] inventoryItemIds;
    public int[] inventoryQuantities;
    public string currentScene;
    public string saveDate;
}

[Serializable]
public struct Vector3Serializable
{
    public float x, y, z;
    public Vector3Serializable(Vector3 v) { x = v.x; y = v.y; z = v.z; }
    public Vector3 ToVector3() => new(x, y, z);
}

public static class SaveSystem
{
    private static string SavePath => Path.Combine(Application.persistentDataPath, "saves");

    public static void Save(SaveData data, string slotName = "autosave")
    {
        Directory.CreateDirectory(SavePath);
        data.saveDate = DateTime.Now.ToString("yyyy-MM-dd HH:mm");
        string json = JsonUtility.ToJson(data, true);
        string path = Path.Combine(SavePath, slotName + ".json");
        File.WriteAllText(path, json);
        Debug.Log($"Game saved to {path}");
    }

    public static SaveData Load(string slotName = "autosave")
    {
        string path = Path.Combine(SavePath, slotName + ".json");
        if (!File.Exists(path)) { Debug.LogWarning("No save file found"); return null; }
        string json = File.ReadAllText(path);
        return JsonUtility.FromJson<SaveData>(json);
    }

    public static bool SaveExists(string slotName = "autosave")
        => File.Exists(Path.Combine(SavePath, slotName + ".json"));

    public static void DeleteSave(string slotName = "autosave")
    {
        string path = Path.Combine(SavePath, slotName + ".json");
        if (File.Exists(path)) File.Delete(path);
    }

    public static string[] GetSaveSlots()
    {
        if (!Directory.Exists(SavePath)) return Array.Empty<string>();
        var files = Directory.GetFiles(SavePath, "*.json");
        return Array.ConvertAll(files, f => Path.GetFileNameWithoutExtension(f));
    }
}`,

  `Unity dialogue system with ScriptableObject conversations:
using System;
using System.Collections.Generic;
using UnityEngine;

[CreateAssetMenu(fileName = "NewDialogue", menuName = "Game/Dialogue")]
public class DialogueData : ScriptableObject
{
    public string characterName;
    public Sprite portrait;
    public DialogueNode[] nodes;
}

[Serializable]
public class DialogueNode
{
    public string text;
    [TextArea(2, 4)] public string fullText;
    public DialogueChoice[] choices;
    public int nextNodeIndex = -1; // -1 = end dialogue
    public string triggerEvent; // Optional event to fire
}

[Serializable]
public class DialogueChoice
{
    public string text;
    public int nextNodeIndex;
    public string requiredFlag; // Only show if player has this flag
}

public class DialogueManager : MonoBehaviour
{
    public static DialogueManager Instance { get; private set; }

    public event Action<DialogueNode, string, Sprite> OnNodeDisplayed;
    public event Action<DialogueChoice[]> OnChoicesDisplayed;
    public event Action OnDialogueEnded;

    private DialogueData currentDialogue;
    private int currentNodeIndex;
    private HashSet<string> flags = new();

    void Awake() => Instance = this;

    public void StartDialogue(DialogueData dialogue)
    {
        currentDialogue = dialogue;
        currentNodeIndex = 0;
        DisplayCurrentNode();
    }

    public void AdvanceDialogue()
    {
        var node = currentDialogue.nodes[currentNodeIndex];
        if (node.nextNodeIndex < 0 || node.nextNodeIndex >= currentDialogue.nodes.Length)
        {
            EndDialogue();
            return;
        }
        currentNodeIndex = node.nextNodeIndex;
        DisplayCurrentNode();
    }

    public void SelectChoice(int choiceIndex)
    {
        var node = currentDialogue.nodes[currentNodeIndex];
        if (choiceIndex < node.choices.Length)
        {
            currentNodeIndex = node.choices[choiceIndex].nextNodeIndex;
            DisplayCurrentNode();
        }
    }

    private void DisplayCurrentNode()
    {
        var node = currentDialogue.nodes[currentNodeIndex];
        if (!string.IsNullOrEmpty(node.triggerEvent)) flags.Add(node.triggerEvent);

        OnNodeDisplayed?.Invoke(node, currentDialogue.characterName, currentDialogue.portrait);

        var available = new List<DialogueChoice>();
        foreach (var choice in node.choices)
        {
            if (string.IsNullOrEmpty(choice.requiredFlag) || flags.Contains(choice.requiredFlag))
                available.Add(choice);
        }
        if (available.Count > 0) OnChoicesDisplayed?.Invoke(available.ToArray());
    }

    private void EndDialogue()
    {
        currentDialogue = null;
        OnDialogueEnded?.Invoke();
    }

    public void SetFlag(string flag) => flags.Add(flag);
    public bool HasFlag(string flag) => flags.Contains(flag);
}`,

  `Unity camera system with smooth follow, orbit, and zoom:
using UnityEngine;

public class CameraController : MonoBehaviour
{
    [Header("Target")]
    [SerializeField] private Transform target;
    [SerializeField] private Vector3 offset = new(0, 5, -8);

    [Header("Orbit")]
    [SerializeField] private float orbitSpeed = 150f;
    [SerializeField] private float minVerticalAngle = -20f;
    [SerializeField] private float maxVerticalAngle = 60f;

    [Header("Zoom")]
    [SerializeField] private float zoomSpeed = 5f;
    [SerializeField] private float minZoom = 3f;
    [SerializeField] private float maxZoom = 15f;

    [Header("Smoothing")]
    [SerializeField] private float positionSmooth = 8f;
    [SerializeField] private float rotationSmooth = 10f;

    [Header("Collision")]
    [SerializeField] private LayerMask collisionMask;
    [SerializeField] private float collisionRadius = 0.3f;

    private float horizontalAngle;
    private float verticalAngle = 25f;
    private float currentZoom;
    private float targetZoom;

    void Start()
    {
        currentZoom = targetZoom = offset.magnitude;
        Cursor.lockState = CursorLockMode.Locked;
    }

    void LateUpdate()
    {
        if (!target) return;

        // Input
        horizontalAngle += Input.GetAxis("Mouse X") * orbitSpeed * Time.deltaTime;
        verticalAngle -= Input.GetAxis("Mouse Y") * orbitSpeed * Time.deltaTime;
        verticalAngle = Mathf.Clamp(verticalAngle, minVerticalAngle, maxVerticalAngle);
        targetZoom -= Input.GetAxis("Mouse ScrollWheel") * zoomSpeed;
        targetZoom = Mathf.Clamp(targetZoom, minZoom, maxZoom);
        currentZoom = Mathf.Lerp(currentZoom, targetZoom, Time.deltaTime * 10f);

        // Calculate desired position
        Quaternion rotation = Quaternion.Euler(verticalAngle, horizontalAngle, 0);
        Vector3 desiredPosition = target.position + rotation * new Vector3(0, 0, -currentZoom) + Vector3.up * 2f;

        // Camera collision — pull camera closer if something is between camera and target
        Vector3 dirToCamera = (desiredPosition - target.position).normalized;
        float maxDistance = Vector3.Distance(target.position, desiredPosition);
        if (Physics.SphereCast(target.position + Vector3.up, collisionRadius, dirToCamera, out RaycastHit hit, maxDistance, collisionMask))
        {
            desiredPosition = hit.point - dirToCamera * collisionRadius;
        }

        // Smooth follow
        transform.position = Vector3.Lerp(transform.position, desiredPosition, Time.deltaTime * positionSmooth);
        Quaternion lookRotation = Quaternion.LookRotation(target.position + Vector3.up * 1.5f - transform.position);
        transform.rotation = Quaternion.Slerp(transform.rotation, lookRotation, Time.deltaTime * rotationSmooth);
    }
}`,
])

// ════════════════════════════════════════════════════════════════════════
// MODERN WEB ANIMATIONS (Framer Motion + CSS)
// ════════════════════════════════════════════════════════════════════════

seedCode('Modern Web Animations', [
  `Framer Motion page transitions with shared layout animations:
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const pageVariants = {
  initial: { opacity: 0, y: 8, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, filter: "blur(4px)", transition: { duration: 0.2 } },
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit">
        {children}
      </motion.div>
    </AnimatePresence>
  );
}`,

  `Scroll-triggered reveal animation with stagger:
"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

function RevealOnScroll({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

function StaggeredSection({ items }: { items: Array<{ title: string; desc: string }> }) {
  return (
    <section className="py-20 px-4">
      <RevealOnScroll>
        <h2 className="text-4xl font-bold text-center mb-16">How it Works</h2>
      </RevealOnScroll>
      <div className="max-w-4xl mx-auto grid gap-12">
        {items.map((item, i) => (
          <RevealOnScroll key={item.title} delay={i * 0.15}>
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-lg flex-shrink-0">
                {i + 1}
              </div>
              <div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  );
}`,

  `Animated counter / number ticker with spring physics:
"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform, useInView } from "framer-motion";

function AnimatedNumber({ value, duration = 2 }: { value: number; duration?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    if (isInView) spring.set(value);
  }, [isInView, value, spring]);

  return <motion.span ref={ref}>{display}</motion.span>;
}

function StatsSection() {
  return (
    <section className="py-20 bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
        {[
          { value: 10000, label: "Active Users", suffix: "+" },
          { value: 99.9, label: "Uptime", suffix: "%" },
          { value: 500, label: "Companies", suffix: "+" },
          { value: 50, label: "Countries", suffix: "" },
        ].map((stat) => (
          <div key={stat.label}>
            <div className="text-4xl lg:text-5xl font-bold text-blue-400">
              <AnimatedNumber value={stat.value} />{stat.suffix}
            </div>
            <div className="mt-2 text-sm text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}`,

  `Magnetic button with cursor-following effect:
"use client";
import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

function MagneticButton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });

  function handleMouse(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
  }

  function handleLeave() { x.set(0); y.set(0); }

  return (
    <motion.button ref={ref} style={{ x: springX, y: springY }}
      onMouseMove={handleMouse} onMouseLeave={handleLeave}
      whileTap={{ scale: 0.95 }}
      className={\`relative px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold overflow-hidden group \${className}\`}>
      <span className="relative z-10">{children}</span>
      <motion.div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.button>
  );
}`,
])

console.log('\n✅ SwiftUI + Unity + Animations code seeded!')

# Week 4 Capstone: Enterprise AI Platform - Implementation Guide

## 🎯 Project Overview

**Duration:** 16-20 hours (Weekend)  
**Goal:** Build a production-ready Enterprise AI Platform with multi-agent collaboration and RAG capabilities

---

## Project Structure

```
enterprise-ai-platform/
├── backend/
│   ├── src/
│   │   ├── agents/          # Multi-agent system
│   │   ├── rag/             # Document processing & QA
│   │   ├── api/             # REST & WebSocket APIs
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Auth, validation, rate limiting
│   │   ├── utils/           # Helpers, logging, metrics
│   │   └── index.ts         # Entry point
│   ├── tests/
│   ├── uploads/             # Temporary file storage
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom hooks
│   │   ├── api/             # API client
│   │   ├── types/           # TypeScript types
│   │   └── App.tsx
│   └── package.json
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   └── USER_GUIDE.md
└── README.md
```

---

## Day 1 (Saturday): Backend Implementation

### **Phase 1: Setup & Architecture (1 hour)**

#### **Initialize Project**

```bash
# Create structure
mkdir -p enterprise-ai-platform/{backend,frontend,docker,docs}
cd enterprise-ai-platform/backend

# Initialize
npm init -y
npm install express cors helmet compression
npm install @langchain/openai @langchain/langgraph
npm install redis socket.io jsonwebtoken bcrypt winston
npm install -D typescript @types/node @types/express ts-node nodemon
```

#### **Configuration Files**

**`backend/tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true
  }
}
```

**`backend/.env.example`:**
```env
# API Keys
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here

# Database
REDIS_URL=redis://localhost:6379
PINECONE_API_KEY=your_key_here

# Auth
JWT_SECRET=your_secret_here

# Monitoring
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_key_here
```

---

### **Phase 2: Multi-Agent System (3 hours)**

#### **Base Agent Architecture**

**`backend/src/agents/base-agent.ts`:**
```typescript
// PSEUDO CODE
interface AgentConfig {
  name, description, systemPrompt, model, temperature
}

interface AgentResult {
  success, output, metadata, error?
}

abstract class BaseAgent {
  constructor(config: AgentConfig)
  
  abstract async execute(input: string, context?: any): Promise<AgentResult>
  
  protected async chat(messages): Promise<string> {
    // Call LLM with messages
    // Return response
  }
  
  getName(), getDescription()
}
```

#### **Specialized Agents**

**`backend/src/agents/research-agent.ts`:**
```typescript
// PSEUDO CODE
class ResearchAgent extends BaseAgent {
  constructor() {
    super({
      name: 'Research Agent',
      description: 'Conducts research',
      systemPrompt: 'You are a research specialist...',
      temperature: 0.3
    })
  }
  
  async execute(topic: string, context?: any): Promise<AgentResult> {
    // Build research prompt with topic and constraints
    // Call LLM to gather information
    // Return structured research findings
    return {
      success: true,
      output: researchFindings,
      metadata: { topic, timestamp, agent: this.getName() }
    }
  }
}
```

**`backend/src/agents/writer-agent.ts`:**
```typescript
// PSEUDO CODE
class WriterAgent extends BaseAgent {
  constructor() {
    super({
      name: 'Writer Agent',
      description: 'Creates content',
      systemPrompt: 'You are a content writer...',
      temperature: 0.7
    })
  }
  
  async execute(instruction: string, context?: any): Promise<AgentResult> {
    // Get research from context if available
    // Build writing prompt with style, length requirements
    // Generate content
    return { success: true, output: content, metadata: {...} }
  }
}
```

**`backend/src/agents/code-agent.ts`:**
```typescript
// PSEUDO CODE
class CodeAgent extends BaseAgent {
  constructor() {
    super({
      name: 'Code Agent',
      systemPrompt: 'You are a software engineer...',
      temperature: 0.2,
      model: 'gpt-4'
    })
  }
  
  async execute(task: string, context?: any): Promise<AgentResult> {
    // Extract language, framework from context
    // Generate code with documentation
    // Include usage examples
    return { success: true, output: code, metadata: {...} }
  }
}
```

**`backend/src/agents/review-agent.ts`:**
```typescript
// PSEUDO CODE
class ReviewAgent extends BaseAgent {
  async execute(content: string, context?: any): Promise<AgentResult> {
    // Review content against criteria
    // Provide quality score (1-10)
    // List strengths and improvements
    // Return approval status (APPROVED/NEEDS_REVISION)
    
    approved = response.includes('APPROVED') && !response.includes('NEEDS_REVISION')
    
    return { 
      success: true, 
      output: review, 
      metadata: { approved, timestamp, ... }
    }
  }
}
```

#### **Supervisor/Orchestrator**

**`backend/src/agents/supervisor.ts`:**
```typescript
// PSEUDO CODE
class SupervisorAgent {
  private agents: Map<string, BaseAgent>
  private coordinator: ChatOpenAI
  
  constructor() {
    this.agents = new Map([
      ['research', new ResearchAgent()],
      ['writer', new WriterAgent()],
      ['code', new CodeAgent()],
      ['review', new ReviewAgent()]
    ])
  }
  
  async execute(task: string, taskType?: string) {
    // 1. Plan workflow based on task
    workflow = await this.planWorkflow(task, taskType)
    
    // 2. Execute agents in sequence
    results = []
    for (agentName of workflow) {
      agent = this.agents.get(agentName)
      
      // Build context from previous results
      context = this.buildContext(results, agentName)
      
      // Execute agent
      result = await agent.execute(task, context)
      results.push(result)
      
      // Check if review failed and needs iteration
      if (agentName === 'review' && !result.metadata.approved) {
        // Could trigger revision workflow
      }
    }
    
    return {
      success: true,
      output: results[results.length - 1].output,
      workflow: workflow.map(name => agents.get(name).getName())
    }
  }
  
  private async planWorkflow(task: string, taskType?: string) {
    if (taskType === 'research') return ['research']
    if (taskType === 'code') return ['code', 'review']
    if (taskType === 'write') return ['research', 'writer', 'review']
    
    // Auto-detect using LLM
    prompt = `Determine agent workflow for: ${task}
    Available: research, writer, code, review
    Return comma-separated list: `
    
    response = await coordinator.invoke(prompt)
    return response.split(',').map(s => s.trim())
  }
  
  getAvailableAgents() {
    return Array.from(agents.values()).map(a => ({
      name: a.getName(),
      description: a.getDescription()
    }))
  }
}
```

---

### **Phase 3: RAG System (2.5 hours)**

#### **Document Processing**

**`backend/src/rag/document-processor.ts`:**
```typescript
// PSEUDO CODE
interface ProcessedDocument {
  id, fileName, chunks: Document[], metadata
}

class DocumentProcessor {
  private textSplitter: RecursiveCharacterTextSplitter
  
  constructor() {
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200
    })
  }
  
  async processFile(filePath: string, fileName: string): Promise<ProcessedDocument> {
    // Read file content
    content = await fs.readFile(filePath, 'utf-8')
    
    // Generate unique ID
    docId = `doc-${timestamp}-${randomString}`
    
    // Split into chunks
    chunks = await textSplitter.createDocuments([content], [{
      docId, fileName, uploadedAt: timestamp
    }])
    
    return {
      id: docId,
      fileName,
      chunks,
      metadata: {
        processedAt: timestamp,
        chunkCount: chunks.length,
        originalSize: content.length
      }
    }
  }
  
  async processText(text: string, metadata?: any) {
    return await textSplitter.createDocuments([text], [metadata])
  }
}
```

#### **Vector Store Management**

**`backend/src/rag/vector-store.ts`:**
```typescript
// PSEUDO CODE
class VectorStoreManager {
  private embeddings: OpenAIEmbeddings
  private stores: Map<string, VectorStore>
  private defaultStore: VectorStore
  
  constructor() {
    this.embeddings = new OpenAIEmbeddings({
      modelName: 'text-embedding-3-small'
    })
  }
  
  async initialize() {
    this.defaultStore = new MemoryVectorStore(this.embeddings)
    // Or: this.defaultStore = await PineconeStore.initialize(...)
  }
  
  async addDocuments(documents: Document[], storeId = 'default') {
    store = this.stores.get(storeId) || this.defaultStore
    
    if (!store) {
      store = await VectorStore.fromDocuments(documents, embeddings)
      this.stores.set(storeId, store)
    } else {
      await store.addDocuments(documents)
    }
  }
  
  async search(query: string, k = 5, storeId = 'default') {
    store = this.stores.get(storeId) || this.defaultStore
    return await store.similaritySearch(query, k)
  }
  
  async searchWithScores(query: string, k = 5, storeId = 'default') {
    store = this.stores.get(storeId) || this.defaultStore
    return await store.similaritySearchWithScore(query, k)
  }
  
  async deleteStore(storeId: string) {
    this.stores.delete(storeId)
  }
}
```

#### **QA Chain**

**`backend/src/rag/qa-chain.ts`:**
```typescript
// PSEUDO CODE
interface QAResult {
  answer: string
  sources: Array<{ content, metadata, score }>
  query: string
}

class QAChain {
  private vectorStore: VectorStoreManager
  private llm: ChatOpenAI
  
  constructor(vectorStore: VectorStoreManager) {
    this.vectorStore = vectorStore
    this.llm = new ChatOpenAI({ modelName: 'gpt-3.5-turbo', temperature: 0 })
  }
  
  async query(question: string, storeId = 'default'): Promise<QAResult> {
    // 1. Retrieve relevant documents
    relevantDocs = await vectorStore.searchWithScores(question, 5, storeId)
    
    // 2. Build context with citations
    context = relevantDocs.map((doc, idx) => 
      `[${idx + 1}] ${doc.pageContent}`
    ).join('\n\n')
    
    // 3. Create prompt
    prompt = `Answer the question based on the following context.
    If the context doesn't contain the answer, say so.
    Cite sources using [1], [2], etc.
    
    Context: ${context}
    Question: ${question}
    Answer:`
    
    // 4. Generate answer
    answer = await llm.invoke(prompt)
    
    return {
      answer,
      sources: relevantDocs.map((doc, score, idx) => ({
        content: doc.pageContent,
        metadata: doc.metadata,
        score
      })),
      query: question
    }
  }
  
  async queryWithExpansion(question: string, storeId = 'default') {
    // Generate alternative query phrasings
    expansions = await this.expandQuery(question)
    
    // Retrieve for each query variant
    allDocs = []
    for (query of [question, ...expansions]) {
      docs = await vectorStore.search(query, 3, storeId)
      allDocs.push(...docs)
    }
    
    // Deduplicate and re-rank
    uniqueDocs = this.deduplicateAndRank(allDocs)
    
    // Generate answer using top docs
    return this.generateAnswer(question, uniqueDocs)
  }
}
```

---

### **Phase 4: API Layer (2.5 hours)**

#### **Server Setup**

**`backend/src/api/server.ts`:**
```typescript
// PSEUDO CODE
import express, cors, helmet, compression
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

app = express()
httpServer = createServer(app)
io = new SocketIOServer(httpServer, { cors: { origin: '*' } })

// Middleware
app.use(helmet())
app.use(cors())
app.use(compression())
app.use(express.json())

// Initialize services
vectorStore = new VectorStoreManager()
await vectorStore.initialize()

documentProcessor = new DocumentProcessor()
qaChain = new QAChain(vectorStore)
supervisor = new SupervisorAgent()

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/agents', agentRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/chat', chatRoutes)

// WebSocket for streaming
io.on('connection', (socket) => {
  socket.on('chat-stream', async (data) => {
    // Stream LLM responses in real-time
    stream = await llm.stream(data.message)
    for await (chunk of stream) {
      socket.emit('chat-chunk', { content: chunk })
    }
    socket.emit('chat-done')
  })
})

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    uptime: process.uptime(),
    timestamp: new Date()
  })
})

// Error handling
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: err.message })
})

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

#### **Authentication Middleware**

**`backend/src/middleware/auth.ts`:**
```typescript
// PSEUDO CODE
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

class AuthService {
  generateToken(user: User): string {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    )
  }
  
  verifyToken(token: string): User | null {
    try {
      return jwt.verify(token, JWT_SECRET)
    } catch {
      return null
    }
  }
  
  async hashPassword(password: string): string {
    return await bcrypt.hash(password, 10)
  }
  
  async verifyPassword(password: string, hash: string): boolean {
    return await bcrypt.compare(password, hash)
  }
}

// Middleware
async function authenticate(req, res, next) {
  token = req.headers.authorization?.replace('Bearer ', '')
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  user = authService.verifyToken(token)
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid token' })
  }
  
  req.user = user
  next()
}
```

#### **Rate Limiting**

**`backend/src/middleware/rate-limit.ts`:**
```typescript
// PSEUDO CODE
import { RateLimiterRedis } from 'rate-limiter-flexible'

rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  points: 10,        // requests
  duration: 60,      // per 60 seconds
})

async function rateLimitMiddleware(req, res, next) {
  identifier = req.user?.id || req.ip
  
  try {
    await rateLimiter.consume(identifier)
    next()
  } catch {
    res.status(429).json({ 
      error: 'Too many requests',
      retryAfter: 60
    })
  }
}
```

#### **API Routes**

**`backend/src/api/routes/agents.ts`:**
```typescript
// PSEUDO CODE
router = express.Router()

// List available agents
router.get('/', authenticate, (req, res) => {
  agents = supervisor.getAvailableAgents()
  res.json({ agents })
})

// Execute agent workflow
router.post('/execute', authenticate, rateLimitMiddleware, async (req, res) => {
  { task, taskType, agentNames } = req.body
  
  if (!task) {
    return res.status(400).json({ error: 'Task required' })
  }
  
  try {
    result = await supervisor.execute(task, taskType)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Execute specific agent
router.post('/:agentName/execute', authenticate, async (req, res) => {
  { agentName } = req.params
  { input, context } = req.body
  
  agent = getAgentByName(agentName)
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' })
  }
  
  result = await agent.execute(input, context)
  res.json(result)
})
```

**`backend/src/api/routes/documents.ts`:**
```typescript
// PSEUDO CODE
import multer from 'multer'

upload = multer({ dest: 'uploads/' })
router = express.Router()

// Upload document
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }
  
  try {
    // Process document
    processed = await documentProcessor.processFile(
      req.file.path,
      req.file.originalname
    )
    
    // Add to vector store
    await vectorStore.addDocuments(processed.chunks, req.user.id)
    
    // Clean up temp file
    await fs.unlink(req.file.path)
    
    res.json({
      success: true,
      documentId: processed.id,
      chunks: processed.metadata.chunkCount
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// List user's documents
router.get('/', authenticate, async (req, res) => {
  // Get from database or metadata store
  documents = await getDocumentsByUser(req.user.id)
  res.json({ documents })
})

// Delete document
router.delete('/:docId', authenticate, async (req, res) => {
  { docId } = req.params
  
  // Verify ownership
  doc = await getDocument(docId)
  if (doc.userId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  
  // Delete from vector store
  await vectorStore.deleteDocument(docId)
  
  res.json({ success: true })
})
```

**`backend/src/api/routes/chat.ts`:**
```typescript
// PSEUDO CODE
router = express.Router()

// Regular chat (with optional RAG)
router.post('/', authenticate, rateLimitMiddleware, async (req, res) => {
  { message, useRAG, storeId } = req.body
  
  if (!message) {
    return res.status(400).json({ error: 'Message required' })
  }
  
  try {
    if (useRAG) {
      // Query using RAG
      result = await qaChain.query(message, storeId || req.user.id)
      res.json({
        answer: result.answer,
        sources: result.sources
      })
    } else {
      // Direct LLM chat
      response = await llm.invoke(message)
      res.json({ answer: response.content })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Streaming chat
router.post('/stream', authenticate, async (req, res) => {
  { message } = req.body
  
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  
  try {
    stream = await llm.stream(message)
    
    for await (chunk of stream) {
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`)
    }
    
    res.write('data: [DONE]\n\n')
    res.end()
  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`)
    res.end()
  }
})

// Chat history
router.get('/history', authenticate, async (req, res) => {
  history = await getChatHistory(req.user.id, { limit: 50 })
  res.json({ history })
})
```

---

### **Phase 5: Monitoring & Services (1 hour)**

**`backend/src/services/monitoring.ts`:**
```typescript
// PSEUDO CODE
import { Client } from 'langsmith'
import winston from 'winston'

// Logger
logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
})

// Metrics tracker
class MetricsService {
  private metrics = {
    requests: 0,
    errors: 0,
    latencies: [],
    costs: 0
  }
  
  trackRequest() {
    this.metrics.requests++
  }
  
  trackError() {
    this.metrics.errors++
  }
  
  trackLatency(ms: number) {
    this.metrics.latencies.push(ms)
  }
  
  trackCost(cost: number) {
    this.metrics.costs += cost
  }
  
  getMetrics() {
    return {
      totalRequests: this.metrics.requests,
      totalErrors: this.metrics.errors,
      avgLatency: average(this.metrics.latencies),
      totalCost: this.metrics.costs,
      uptime: process.uptime()
    }
  }
}

// LangSmith integration
langsmithClient = new Client({ apiKey: LANGCHAIN_API_KEY })

function traceable(fn: Function, metadata: any) {
  return async (...args) => {
    runId = generateRunId()
    
    try {
      // Start trace
      await langsmithClient.createRun({
        id: runId,
        name: metadata.name,
        inputs: args,
        metadata
      })
      
      // Execute function
      result = await fn(...args)
      
      // End trace
      await langsmithClient.updateRun(runId, {
        outputs: result,
        endTime: Date.now()
      })
      
      return result
    } catch (error) {
      // Log error to LangSmith
      await langsmithClient.updateRun(runId, {
        error: error.message,
        endTime: Date.now()
      })
      throw error
    }
  }
}
```

**`backend/src/services/cache.ts`:**
```typescript
// PSEUDO CODE
import { createClient } from 'redis'

class CacheService {
  private redis: RedisClient
  private ttl = 3600 // 1 hour
  
  async connect() {
    this.redis = createClient({ url: REDIS_URL })
    await this.redis.connect()
  }
  
  private generateKey(prefix: string, params: any): string {
    return `${prefix}:${JSON.stringify(params)}`
  }
  
  async get<T>(prefix: string, params: any): Promise<T | null> {
    key = this.generateKey(prefix, params)
    cached = await this.redis.get(key)
    
    if (cached) {
      logger.info(`Cache hit: ${key}`)
      return JSON.parse(cached)
    }
    
    return null
  }
  
  async set(prefix: string, params: any, value: any) {
    key = this.generateKey(prefix, params)
    await this.redis.setEx(key, this.ttl, JSON.stringify(value))
    logger.info(`Cached: ${key}`)
  }
  
  async invalidate(prefix: string, params?: any) {
    if (params) {
      key = this.generateKey(prefix, params)
      await this.redis.del(key)
    } else {
      // Delete all keys with prefix
      keys = await this.redis.keys(`${prefix}:*`)
      if (keys.length > 0) {
        await this.redis.del(keys)
      }
    }
  }
}
```

---

## Day 2 (Sunday): Frontend & Deployment

### **Phase 6: Frontend Setup (1 hour)**

```bash
cd ../frontend
npm create vite@latest . -- --template react-ts
npm install axios socket.io-client react-markdown
npm install @headlessui/react @heroicons/react
npm install react-dropzone react-hot-toast
```

### **Phase 7: Frontend Components (3 hours)**

**`frontend/src/api/client.ts`:**
```typescript
// PSEUDO CODE
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

class APIClient {
  private token: string | null = null
  
  setToken(token: string) {
    this.token = token
    localStorage.setItem('auth_token', token)
  }
  
  getToken(): string | null {
    return this.token || localStorage.getItem('auth_token')
  }
  
  private async request(method, endpoint, data?) {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`
      },
      data
    }
    
    response = await axios(config)
    return response.data
  }
  
  // Auth
  async login(email, password) {
    data = await this.request('POST', '/auth/login', { email, password })
    this.setToken(data.token)
    return data
  }
  
  // Agents
  async getAgents() {
    return await this.request('GET', '/agents')
  }
  
  async executeAgent(task, taskType?) {
    return await this.request('POST', '/agents/execute', { task, taskType })
  }
  
  // Documents
  async uploadDocument(file: File) {
    formData = new FormData()
    formData.append('file', file)
    
    return await axios.post(`${API_BASE_URL}/documents/upload`, formData, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    })
  }
  
  async getDocuments() {
    return await this.request('GET', '/documents')
  }
  
  // Chat
  async chat(message, useRAG = false) {
    return await this.request('POST', '/chat', { message, useRAG })
  }
}

export default new APIClient()
```

**`frontend/src/components/Chat.tsx`:**
```typescript
// PSEUDO CODE
import { useState, useEffect, useRef } from 'react'
import api from '../api/client'
import io from 'socket.io-client'

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: any[]
}

function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [useRAG, setUseRAG] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const socketRef = useRef<Socket>()
  
  useEffect(() => {
    // Connect to WebSocket
    socketRef.current = io(API_URL)
    
    socketRef.current.on('chat-chunk', (data) => {
      // Append chunk to current message
      setMessages(prev => {
        const last = prev[prev.length - 1]
        if (last.role === 'assistant') {
          return [
            ...prev.slice(0, -1),
            { ...last, content: last.content + data.content }
          ]
        }
        return [...prev, { role: 'assistant', content: data.content }]
      })
    })
    
    return () => socketRef.current?.disconnect()
  }, [])
  
  async function handleSend() {
    if (!input.trim()) return
    
    // Add user message
    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    
    try {
      if (streaming) {
        // Use WebSocket for streaming
        socketRef.current.emit('chat-stream', { message: input })
      } else {
        // Regular API call
        const response = await api.chat(input, useRAG)
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.answer,
          sources: response.sources
        }])
      }
    } catch (error) {
      console.error(error)
      // Show error toast
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="content">{msg.content}</div>
            {msg.sources && (
              <div className="sources">
                <h4>Sources:</h4>
                {msg.sources.map((source, i) => (
                  <div key={i} className="source">
                    [{i + 1}] {source.content.substring(0, 100)}...
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="input-area">
        <label>
          <input
            type="checkbox"
            checked={useRAG}
            onChange={(e) => setUseRAG(e.target.checked)}
          />
          Use RAG (search documents)
        </label>
        
        <label>
          <input
            type="checkbox"
            checked={streaming}
            onChange={(e) => setStreaming(e.target.checked)}
          />
          Stream responses
        </label>
        
        <div className="input-row">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
          />
          <button onClick={handleSend} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

**`frontend/src/components/DocumentUpload.tsx`:**
```typescript
// PSEUDO CODE
import { useDropzone } from 'react-dropzone'
import api from '../api/client'
import toast from 'react-hot-toast'

function DocumentUpload() {
  const [documents, setDocuments] = useState([])
  const [uploading, setUploading] = useState(false)
  
  useEffect(() => {
    loadDocuments()
  }, [])
  
  async function loadDocuments() {
    const docs = await api.getDocuments()
    setDocuments(docs.documents)
  }
  
  async function handleUpload(files: File[]) {
    setUploading(true)
    
    for (const file of files) {
      try {
        const response = await api.uploadDocument(file)
        toast.success(`Uploaded: ${file.name}`)
        await loadDocuments()
      } catch (error) {
        toast.error(`Failed to upload: ${file.name}`)
      }
    }
    
    setUploading(false)
  }
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleUpload,
    accept: {
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/pdf': ['.pdf']
    }
  })
  
  return (
    <div className="document-upload">
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        <p>
          {isDragActive
            ? 'Drop files here...'
            : 'Drag files here or click to select'}
        </p>
      </div>
      
      <div className="document-list">
        <h3>Uploaded Documents</h3>
        {documents.map(doc => (
          <div key={doc.id} className="document-item">
            <span>{doc.fileName}</span>
            <span>{doc.chunks} chunks</span>
            <button onClick={() => handleDelete(doc.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**`frontend/src/components/AgentSelector.tsx`:**
```typescript
// PSEUDO CODE
import { useState, useEffect } from 'react'
import api from '../api/client'

function AgentSelector() {
  const [agents, setAgents] = useState([])
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [task, setTask] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    loadAgents()
  }, [])
  
  async function loadAgents() {
    const response = await api.getAgents()
    setAgents(response.agents)
  }
  
  async function handleExecute() {
    setLoading(true)
    
    try {
      const response = await api.executeAgent(task, selectedAgent)
      setResult(response)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="agent-selector">
      <h2>Execute Agent Workflow</h2>
      
      <div className="agent-list">
        {agents.map(agent => (
          <div
            key={agent.name}
            className={`agent-card ${selectedAgent === agent.name ? 'selected' : ''}`}
            onClick={() => setSelectedAgent(agent.name)}
          >
            <h3>{agent.name}</h3>
            <p>{agent.description}</p>
          </div>
        ))}
      </div>
      
      <div className="task-input">
        <textarea
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Describe your task..."
          rows={5}
        />
        <button onClick={handleExecute} disabled={loading || !task}>
          {loading ? 'Executing...' : 'Execute Workflow'}
        </button>
      </div>
      
      {result && (
        <div className="result">
          <h3>Result:</h3>
          <p><strong>Workflow:</strong> {result.workflow.join(' → ')}</p>
          <div className="output">{result.output}</div>
        </div>
      )}
    </div>
  )
}
```

**`frontend/src/components/MetricsPanel.tsx`:**
```typescript
// PSEUDO CODE
import { useState, useEffect } from 'react'

function MetricsPanel() {
  const [metrics, setMetrics] = useState(null)
  
  useEffect(() => {
    loadMetrics()
    const interval = setInterval(loadMetrics, 5000)
    return () => clearInterval(interval)
  }, [])
  
  async function loadMetrics() {
    const response = await fetch('/api/metrics')
    const data = await response.json()
    setMetrics(data)
  }
  
  if (!metrics) return <div>Loading metrics...</div>
  
  return (
    <div className="metrics-panel">
      <h2>System Metrics</h2>
      
      <div className="metric-grid">
        <div className="metric-card">
          <h3>Total Requests</h3>
          <p className="value">{metrics.totalRequests}</p>
        </div>
        
        <div className="metric-card">
          <h3>Avg Response Time</h3>
          <p className="value">{metrics.avgLatency.toFixed(2)} ms</p>
        </div>
        
        <div className="metric-card">
          <h3>Error Rate</h3>
          <p className="value">
            {((metrics.totalErrors / metrics.totalRequests) * 100).toFixed(2)}%
          </p>
        </div>
        
        <div className="metric-card">
          <h3>Total Cost</h3>
          <p className="value">${metrics.totalCost.toFixed(4)}</p>
        </div>
        
        <div className="metric-card">
          <h3>Uptime</h3>
          <p className="value">{formatUptime(metrics.uptime)}</p>
        </div>
      </div>
    </div>
  )
}
```

**`frontend/src/App.tsx`:**
```typescript
// PSEUDO CODE
import { useState } from 'react'
import Chat from './components/Chat'
import DocumentUpload from './components/DocumentUpload'
import AgentSelector from './components/AgentSelector'
import MetricsPanel from './components/MetricsPanel'

function App() {
  const [activeTab, setActiveTab] = useState('chat')
  
  return (
    <div className="app">
      <header>
        <h1>Enterprise AI Platform</h1>
        <nav>
          <button
            className={activeTab === 'chat' ? 'active' : ''}
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </button>
          <button
            className={activeTab === 'documents' ? 'active' : ''}
            onClick={() => setActiveTab('documents')}
          >
            Documents
          </button>
          <button
            className={activeTab === 'agents' ? 'active' : ''}
            onClick={() => setActiveTab('agents')}
          >
            Agents
          </button>
          <button
            className={activeTab === 'metrics' ? 'active' : ''}
            onClick={() => setActiveTab('metrics')}
          >
            Metrics
          </button>
        </nav>
      </header>
      
      <main>
        {activeTab === 'chat' && <Chat />}
        {activeTab === 'documents' && <DocumentUpload />}
        {activeTab === 'agents' && <AgentSelector />}
        {activeTab === 'metrics' && <MetricsPanel />}
      </main>
    </div>
  )
}
```

---

### **Phase 8: Docker & Deployment (2 hours)**

**`docker/Dockerfile.backend`:**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache dumb-init
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s CMD node -e "require('http').get('http://localhost:3000/health')"
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
```

**`docker/Dockerfile.frontend`:**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**`docker/docker-compose.yml`:**
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ../backend
      dockerfile: ../docker/Dockerfile.backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - redis
    restart: unless-stopped

  frontend:
    build:
      context: ../frontend
      dockerfile: ../docker/Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped

volumes:
  redis-data:
```

---

### **Phase 9: Testing (2 hours)**

**`backend/tests/agents.test.ts`:**
```typescript
// PSEUDO CODE
import { ResearchAgent, WriterAgent, SupervisorAgent } from '../src/agents'

describe('Agent System', () => {
  describe('ResearchAgent', () => {
    test('should conduct research on topic', async () => {
      agent = new ResearchAgent()
      result = await agent.execute('Machine learning basics')
      
      expect(result.success).toBe(true)
      expect(result.output).toContain('machine learning')
      expect(result.metadata.agent).toBe('Research Agent')
    })
  })
  
  describe('SupervisorAgent', () => {
    test('should execute multi-agent workflow', async () => {
      supervisor = new SupervisorAgent()
      result = await supervisor.execute(
        'Write an article about AI',
        'write'
      )
      
      expect(result.success).toBe(true)
      expect(result.workflow).toContain('Research Agent')
      expect(result.workflow).toContain('Writer Agent')
    })
  })
})
```

**`backend/tests/rag.test.ts`:**
```typescript
// PSEUDO CODE
import { DocumentProcessor, VectorStoreManager, QAChain } from '../src/rag'

describe('RAG System', () => {
  test('should process documents', async () => {
    processor = new DocumentProcessor()
    result = await processor.processText('Sample document content')
    
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].pageContent).toBeDefined()
  })
  
  test('should retrieve relevant documents', async () => {
    vectorStore = new VectorStoreManager()
    await vectorStore.initialize()
    
    docs = [{ pageContent: 'AI is transforming industries' }]
    await vectorStore.addDocuments(docs)
    
    results = await vectorStore.search('artificial intelligence', 1)
    expect(results.length).toBeGreaterThan(0)
  })
  
  test('should answer questions with citations', async () => {
    vectorStore = new VectorStoreManager()
    qaChain = new QAChain(vectorStore)
    
    result = await qaChain.query('What is AI?')
    
    expect(result.answer).toBeDefined()
    expect(result.sources).toBeDefined()
  })
})
```

**`backend/tests/api.test.ts`:**
```typescript
// PSEUDO CODE
import request from 'supertest'
import app from '../src/api/server'

describe('API Endpoints', () => {
  test('GET /health should return 200', async () => {
    response = await request(app).get('/health')
    expect(response.status).toBe(200)
    expect(response.body.status).toBe('ok')
  })
  
  test('POST /api/chat should require authentication', async () => {
    response = await request(app)
      .post('/api/chat')
      .send({ message: 'Hello' })
    
    expect(response.status).toBe(401)
  })
  
  test('POST /api/agents/execute should work with valid token', async () => {
    token = getValidToken()
    
    response = await request(app)
      .post('/api/agents/execute')
      .set('Authorization', `Bearer ${token}`)
      .send({ task: 'Research AI', taskType: 'research' })
    
    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
  })
})
```

---

### **Phase 10: Documentation (1 hour)**

**`README.md`:**
```markdown
# Enterprise AI Platform

Production-ready multi-agent AI system with RAG capabilities.

## Features

- 🤖 **Multi-Agent System**: Research, Writer, Code, Review agents
- 📚 **RAG System**: Document upload, semantic search, Q&A with citations
- 🔐 **Secure API**: JWT authentication, rate limiting, input validation
- 📊 **Monitoring**: LangSmith integration, metrics, logging
- 💬 **Real-time Chat**: Streaming responses, WebSocket support
- 🚀 **Production Ready**: Docker, health checks, error handling

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- OpenAI API key

### Installation

```bash
# Clone repository
git clone <your-repo>
cd enterprise-ai-platform

# Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys

# Setup frontend
cd ../frontend
npm install

# Run with Docker
docker-compose up -d
```

### Access
- Frontend: http://localhost
- Backend API: http://localhost:3000
- Health Check: http://localhost:3000/health

## Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (React)                │
├─────────────────────────────────────────┤
│         Backend API (Express)           │
├─────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐            │
│  │  Agents  │  │   RAG    │            │
│  └──────────┘  └──────────┘            │
├─────────────────────────────────────────┤
│         Services & Monitoring           │
├─────────────────────────────────────────┤
│  Redis  │  Vector DB  │  LangSmith     │
└─────────────────────────────────────────┘
```

## API Documentation

See [API.md](docs/API.md)

## Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md)

## License

MIT
```

**`docs/API.md`:**
```markdown
# API Documentation

## Authentication

All endpoints (except `/health`) require JWT authentication.

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

Response:
```json
{
  "token": "jwt-token-here",
  "user": { "id": "...", "email": "..." }
}
```

## Agents

### List Agents
```http
GET /api/agents
Authorization: Bearer {token}
```

### Execute Workflow
```http
POST /api/agents/execute
Authorization: Bearer {token}
Content-Type: application/json

{
  "task": "Research machine learning",
  "taskType": "research"
}
```

## Documents

### Upload Document
```http
POST /api/documents/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [binary data]
```

### List Documents
```http
GET /api/documents
Authorization: Bearer {token}
```

## Chat

### Send Message
```http
POST /api/chat
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "What is AI?",
  "useRAG": true
}
```

### Stream Chat
```http
POST /api/chat/stream
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "Explain quantum computing"
}
```

Returns: Server-Sent Events stream
```

---

## Final Checklist

### **Backend (Must Have)**
- [ ] ✅ Base agent class with 4+ specialized agents
- [ ] ✅ Supervisor orchestrating agent workflows
- [ ] ✅ Document processor (supports TXT, MD, PDF)
- [ ] ✅ Vector store integration (Pinecone or Memory)
- [ ] ✅ QA chain with citations
- [ ] ✅ REST API with authentication
- [ ] ✅ WebSocket for streaming
- [ ] ✅ Rate limiting
- [ ] ✅ Error handling
- [ ] ✅ Logging (Winston)
- [ ] ✅ LangSmith integration

### **Frontend (Must Have)**
- [ ] ✅ Chat interface with streaming
- [ ] ✅ Document upload component
- [ ] ✅ Agent selector
- [ ] ✅ Metrics dashboard
- [ ] ✅ Responsive design

### **Testing (Must Have)**
- [ ] ✅ Unit tests for agents
- [ ] ✅ Unit tests for RAG system
- [ ] ✅ API integration tests
- [ ] ✅ 50%+ code coverage

### **Deployment (Must Have)**
- [ ] ✅ Dockerfile for backend
- [ ] ✅ Dockerfile for frontend
- [ ] ✅ Docker Compose configuration
- [ ] ✅ Environment variables documented

### **Documentation (Must Have)**
- [ ] ✅ README with setup instructions
- [ ] ✅ API documentation
- [ ] ✅ Architecture diagram
- [ ] ✅ Code comments

### **Bonus Features**
- [ ] 🌟 Kubernetes deployment
- [ ] 🌟 CI/CD pipeline
- [ ] 🌟 Advanced caching (Redis)
- [ ] 🌟 Performance monitoring dashboard
- [ ] 🌟 Multi-user support

---

## Time Breakdown

| Phase | Task | Duration |
|-------|------|----------|
| 1 | Setup & Architecture | 1h |
| 2 | Multi-Agent System | 3h |
| 3 | RAG System | 2.5h |
| 4 | API Layer | 2.5h |
| 5 | Monitoring | 1h |
| **Saturday Total** | | **10h** |
| 6 | Frontend Setup | 1h |
| 7 | React Components | 3h |
| 8 | Docker & Deployment | 2h |
| 9 | Testing | 2h |
| 10 | Documentation | 1h |
| **Sunday Total** | | **9h** |
| **Grand Total** | | **19h** |

---

## Success Criteria

**Minimum Viable Product (MVP):**
- ✅ Multi-agent system executes tasks end-to-end
- ✅ RAG retrieves relevant information from uploaded documents
- ✅ Frontend allows chat and document upload
- ✅ API secured with authentication
- ✅ Basic tests passing
- ✅ Runs via Docker Compose

**Production Ready:**
- ✅ All MVP criteria
- ✅ Comprehensive error handling
- ✅ Performance optimized (< 2s response time)
- ✅ Monitoring and logging operational
- ✅ 70%+ test coverage
- ✅ Complete documentation
- ✅ Deployed to cloud (AWS/GCP/Azure)

---

**You're now ready to build your capstone project! Focus on getting the MVP working first, then add advanced features. Good luck! 🚀**
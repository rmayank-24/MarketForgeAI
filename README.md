# MarketForgeAI 🚀

**AI-Powered Marketing Launch Kit Generator**

MarketForgeAI is a comprehensive AI-driven platform that generates complete marketing launch kits for any product idea. It combines advanced AI agents with document intelligence to create market analysis, product descriptions, ad copy, social media content, and automated scheduling.

## 🎯 What It Does

- **Market Research**: AI-powered market analysis with competitor insights
- **Product Copy**: Compelling e-commerce product descriptions
- **Ad Copy**: Attention-grabbing social media advertisements
- **Social Media Strategy**: 5-day content calendar with optimized posts
- **Document Intelligence**: Upload PDFs/Docs for enhanced context
- **Google Calendar Integration**: Auto-schedule posts to your calendar
- **User Authentication**: Secure login with history tracking

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/ui** for beautiful components
- **Zustand** for state management
- **React Router** for navigation
- **Axios** for API calls

### Backend
- **FastAPI** for high-performance API
- **Python 3.11** runtime
- **Supabase** for authentication and database
- **LangChain** for AI agent orchestration
- **Groq** for LLM inference (Llama3-70b)
- **Tavily** for web search
- **Google APIs** for calendar integration
- **FAISS** for vector storage and retrieval

### AI & ML
- **LangChain Agents** for specialized tasks
- **RAG (Retrieval-Augmented Generation)** for document intelligence
- **Vector Embeddings** with FAISS for semantic search
- **Multi-agent System** with distinct roles:
  - Market Researcher
  - Product Copywriter
  - Ad Copy Specialist
  - Social Media Strategist
  - Content Scheduler

## 🚀 Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (via Supabase)
- Groq API Key
- Tavily API Key
- Google Cloud Console credentials

### 1. Clone & Setup

```bash
# Clone the repository
git clone <repository-url>
cd MarketForgeAI

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm install
```

### 2. Environment Variables

Create `backend/.env`:
```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI APIs
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
```

### 3. Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run these SQL commands in the SQL editor:

```sql
-- Launch kits table
CREATE TABLE launch_kits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_idea TEXT NOT NULL,
    market_analysis TEXT NOT NULL,
    product_copy TEXT NOT NULL,
    ad_copy TEXT NOT NULL,
    social_posts JSONB NOT NULL,
    schedule JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Google credentials table
CREATE TABLE user_google_credentials (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    refresh_token TEXT,
    token_uri TEXT NOT NULL,
    client_id TEXT NOT NULL,
    client_secret TEXT NOT NULL,
    scopes TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE launch_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_google_credentials ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own launch kits" ON launch_kits
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own google credentials" ON user_google_credentials
    FOR ALL USING (auth.uid() = user_id);
```

### 4. Run Development Servers

```bash
# Terminal 1: Backend
cd backend
python main.py
# Backend runs on http://localhost:8000

# Terminal 2: Frontend
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

## 🐳 Docker Setup (Alternative)

```bash
# Build and run with Docker
docker build -t marketforgeai .
docker run -p 8000:8000 --env-file backend/.env marketforgeai
```

## 📁 Project Structure

```
MarketForgeAI/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── agents.py            # AI agent definitions
│   ├── requirements.txt     # Python dependencies
│   └── tests/
│       └── test_main.py     # Backend tests
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # Main React component
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── api/             # API client
│   │   └── state/           # State management
│   ├── package.json         # Frontend dependencies
│   └── vite.config.ts       # Vite configuration
├── Dockerfile               # Container configuration
└── README.md               # This file
```

## 🎯 Usage Guide

### 1. Authentication
- Sign up with email/password
- Verify email via Supabase
- Login to access the dashboard

### 2. Generate Launch Kit
1. **Enter Product Idea**: Describe your product concept
2. **Upload Documents** (Optional): Add PDF/DOC files for context
3. **Generate**: AI creates comprehensive marketing materials
4. **Review Results**: View market analysis, copy, and social posts

### 3. Schedule Content
1. **Connect Google Calendar**: Authorize calendar access
2. **Schedule Posts**: Automatically schedule 5-day content calendar
3. **Manage History**: View and regenerate previous kits

## 🔧 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login

### Launch Kit Generation
- `POST /api/v1/generate-launch-kit` - Generate marketing kit
- `GET /api/v1/history` - Get user's generation history
- `GET /api/v1/history/{kit_id}` - Get specific kit details

### Google Calendar Integration
- `GET /api/v1/auth/google/authorize` - Start Google OAuth
- `GET /api/v1/auth/google/callback` - OAuth callback
- `POST /api/v1/schedule/{kit_id}` - Schedule posts to calendar

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest test_main.py -v

# Frontend tests
cd frontend
npm run test
```

## 🚀 Deployment Options

### Local Development
- Backend: `python main.py`
- Frontend: `npm run dev`

### Production Deployment
- **Backend**: Deploy to Railway, Render, or Heroku
- **Frontend**: Deploy to Vercel, Netlify, or GitHub Pages
- **Database**: Use Supabase hosted database

## 🔐 Security Features

- JWT token authentication
- Row-level security in PostgreSQL
- HTTPS enforcement in production
- Input validation and sanitization
- Rate limiting (configurable)
- CORS protection

## 🛠️ Troubleshooting

### Common Issues

**Backend won't start**
```bash
# Check Python version
python --version  # Should be 3.11+

# Install dependencies
pip install -r requirements.txt

# Check environment variables
echo $GROQ_API_KEY  # Should show your API key
```

**Frontend won't connect to backend**
```bash
# Check CORS settings in main.py
# Ensure backend URL is correct in frontend/src/api/client.ts
```

**Database connection issues**
```bash
# Check Supabase credentials
# Ensure RLS policies are configured
# Verify network connectivity
```

### Getting Help

1. Check the browser console for frontend errors
2. Check the terminal output for backend errors
3. Verify all environment variables are set
4. Ensure all API keys are valid and active

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [LangChain](https://langchain.com) for AI orchestration
- Powered by [Groq](https://groq.com) for lightning-fast inference
- Database by [Supabase](https://supabase.com)
- UI components by [Shadcn/ui](https://ui.shadcn.com)
- Icons by [Lucide React](https://lucide.dev)

---

**MarketForgeAI** - Transform your product ideas into complete marketing campaigns with the power of AI! 🚀

# Scolo Compliance Platform - Run Instructions

## Quick Start

Run both backend and frontend with a single command:
```bash
./start.sh
```

This will:
1. Start the backend API on http://localhost:8005
2. Start the Next.js frontend on http://localhost:3000
3. Handle all dependencies automatically

## Manual Start (Alternative)

### Backend
```bash
cd backend
source .venv/bin/activate  # Or create: python -m venv .venv
pip install -r requirements.txt
uvicorn src.api.main:app --port 8005 --reload
```

### Frontend
```bash
cd web
npm install
npm run dev
```

## Testing the Search

1. Open http://localhost:3000 in your browser
2. You'll be redirected to `/projects/new` if no projects exist
3. In the command bar at the bottom, enter an entity name like:
   - "Donald Trump" (will trigger adverse media alerts)
   - "Vladimir Putin" (will trigger sanctions alerts)
   - "Acme Corp"
   - Any other name or company

4. Press Enter or click the send button
5. Watch as the investigation runs with visual feedback on the canvas

## Available Tools

The system now includes 17+ compliance tools:

### Compliance Tools
- **Adverse Media**: Searches news for negative coverage
- **Sanctions Check**: OFAC SDN, UN, EU sanctions lists
- **PEP Screening**: Politically exposed persons check
- **Geographic Risk**: Country/jurisdiction risk assessment
- **Business Registry**: Company registration lookup
- **UBO Lookup**: Ultimate beneficial owner identification

### HR/Background Tools
- **Employment Verification**: Employment history checks
- **Education Verification**: Educational credential verification

### Legal Tools
- **Court Records**: Federal and state court record search
- **Property Records**: Property ownership search
- **Corporate Filings**: SEC and state filing search

### Digital/OSINT Tools
- **Phone Lookup**: Carrier and location lookup
- **Email Lookup**: Email validation and breach check
- **Social Media**: Social profile discovery
- **Domain WHOIS**: Domain registration lookup
- **IP Geolocation**: IP address geolocation
- **Crypto Trace**: Cryptocurrency wallet activity

## Troubleshooting

### Backend Issues
- Check if port 8005 is available: `lsof -i:8005`
- Verify Python environment: `python --version` (needs 3.11+)
- Check backend logs for errors

### Frontend Issues
- Check if port 3000 is available: `lsof -i:3000`
- Clear Next.js cache: `rm -rf web/.next`
- Check browser console for errors

### Database Issues
- The app uses local SQLite database at `web/local.db`
- To reset: `rm web/local.db` and restart

## How It Works

1. **Frontend** (Next.js): User enters entity name in command bar
2. **Backend API** starts investigation project and returns project ID
3. **SSE Stream**: Frontend connects to `/api/projects/{id}/stream`
4. **Claude Agent**: Backend runs compliance tools via Claude API
5. **Real-time Updates**: Results stream back via SSE to update canvas
6. **Visual Canvas**: React Flow displays entity → tools → findings graph

## API Keys Required

Set these in `backend/.env`:
```
ANTHROPIC_API_KEY=your_key_here
WEAVE_PROJECT=optional_wandb_project
```

The tools currently use simulated data for testing. To use real APIs, update the tool implementations in `backend/src/tools/`.
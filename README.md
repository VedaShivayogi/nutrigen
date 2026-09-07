# NutriGen AI

An AI-assisted nutrition app: track weight/water/exercise, search foods for nutrition breakdowns, generate AI meal plans, and chat with an AI nutrition coach. React (Vite) frontend + Flask backend + Firebase.

---

## How to Run

**Backend**

```bash
cd "Final Deliverables/server"
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Runs at `http://localhost:5000`. Requires a `.env` file (see below) — without it the server won't start.

**Frontend**

```bash
cd "Final Deliverables/client"
npm install
npm run dev
```

Runs at `http://localhost:5173`. Requires a `.env` with:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

**Admin panel:** `http://localhost:5173/admin/login` — views every user's full history.

**Backend `.env` required values:**
| Variable | Source |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Firebase Console → Project Settings → Service Accounts → Generate new private key (paste the whole downloaded JSON as one line) |
| `JWT_SECRET` | Any long random string you generate yourself |
| `USDA_API_KEY` | https://fdc.nal.usda.gov/api-key-signup.html |
| `GOOGLE_API_KEY` | https://aistudio.google.com/apikey |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Your choice (defaults to `veda` / `08072002`) |

---

## Tech Stack

**Frontend:** React 18, Vite, React Router, Redux Toolkit, Tailwind CSS, Framer Motion (animations), Recharts (charts), Axios.

**Backend:** Flask 3, Flask-CORS, Firebase Admin SDK, LangChain (`langchain-google-genai`), PyJWT.

**Database/Auth:** Firebase Firestore (data), custom JWT (HS256) issued by the Flask backend for session auth — this is _not_ Firebase Authentication, it's a hand-rolled login/JWT system that happens to store users in Firestore.

---

## APIs Used

| Purpose                              | API                                                 | Auth needed      |
| ------------------------------------ | --------------------------------------------------- | ---------------- |
| AI chat coach & meal plan generation | Google Gemini (`gemini-flash-latest`) via LangChain | `GOOGLE_API_KEY` |
| Food/nutrition data                  | USDA FoodData Central                               | `USDA_API_KEY`   |
| Food photos                          | Foodish API (free, no key)                          | none             |
| User data storage                    | Firebase Firestore                                  | service account  |

---

## "Algorithms" Used — and What's Actually Happening

Being precise here, since this gets overstated a lot in student projects:

- **No custom ML model, no RAG, no vector database, no embeddings, no fine-tuning.** There is no retrieval step anywhere in the codebase — nothing fetches documents/chunks to feed the LLM as context. If you present this as RAG, that would be inaccurate.
- **Meal planning & chat = plain LLM prompting.** A system prompt (with the user's goals/preferences) is sent straight to Gemini via LangChain's `ChatGoogleGenerativeAI`, and the model's text response is used directly. This is prompt engineering, not an "algorithm" in the CS-textbook sense.
- **Streak calculation** (`/api/streak`) — plain date-difference logic in Python, not ML.
- **Auth** — HS256-signed JWTs, checked on each request via a `@requires_auth` decorator.
- **Food image matching** — simple keyword-to-category string matching (e.g. "rice" → Foodish's "rice" category), not any kind of image recognition.

If your assignment specifically requires RAG or a trained model, this project doesn't currently have one — that would be a genuine feature addition (e.g., embedding a nutrition knowledge base with a vector store like FAISS/Pinecone and retrieving relevant chunks before the Gemini call), not something already present to just describe.

---

## Advantages

- Fast to stand up — no model training/hosting, just API calls to Gemini and USDA.
- Real-time, personalized-feeling responses from an actual LLM rather than static rules.
- Firestore gives free-tier real-time data storage with no server-side DB ops to manage.
- Clean separation: any LLM provider could be swapped in since LangChain abstracts the model call.

## Disadvantages

- **No RAG** means the AI coach can't ground its answers in a specific, verified nutrition knowledge base — it's relying on Gemini's general training, so it can be wrong or generic, especially on niche nutrition science.
- **No conversation memory beyond what's sent per request** — check `chat.py` for how much history is actually passed; if it's just the current message, the "coach" won't remember earlier turns in a session.
- Hand-rolled JWT auth (not Firebase Auth) means you're responsible for all the security hardening (token expiry, refresh, revocation) yourself.
- Free-tier dependencies (Foodish image API, USDA rate limits, Gemini free-tier quotas) can degrade or fail under load or on cold starts.
- Nutrient scaling assumes USDA's "per 100g" convention, which isn't strictly true for all `dataType`s (e.g. some branded foods report per serving) — quantity-scaled values can be slightly off for those items.

## Limitations

- Not a medical/dietary advice tool — Gemini's output isn't reviewed by a nutritionist and shouldn't be treated as clinical guidance.
- Single-region Firestore, no offline support, no caching layer — every screen re-fetches from the network.
- Admin panel has zero role-based access control beyond one shared username/password — not suitable for multi-admin production use as-is.
- No automated tests in the repo.

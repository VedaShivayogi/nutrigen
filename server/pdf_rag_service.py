import os
import json
import re
import shutil
import numpy as np
from pypdf import PdfReader
from sklearn.feature_extraction.text import TfidfVectorizer
import faiss

# Try importing LangChain Google GenAI
try:
    from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
    HAS_GOOGLE_GENAI = True
except ImportError:
    HAS_GOOGLE_GENAI = False

GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
STORAGE_DIR = os.path.join(os.path.dirname(__file__), 'storage')
UPLOADS_DIR = os.path.join(STORAGE_DIR, 'uploads')
VECTORSTORE_DIR = os.path.join(STORAGE_DIR, 'vectorstores')
META_FILE = os.path.join(STORAGE_DIR, 'pdf_metadata.json')

os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(VECTORSTORE_DIR, exist_ok=True)

NOT_FOUND_RESPONSE = "Answer not found in the uploaded PDF."

# Multi-user local vector store manager
class RAGStore:
    def __init__(self):
        self.user_stores = {} # user_id -> dict of chunks & faiss index

    def _get_user_meta(self, user_id):
        if not os.path.exists(META_FILE):
            return {}
        try:
            with open(META_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get(user_id, {})
        except Exception:
            return {}

    def _save_user_meta(self, user_id, meta):
        all_meta = {}
        if os.path.exists(META_FILE):
            try:
                with open(META_FILE, 'r', encoding='utf-8') as f:
                    all_meta = json.load(f)
            except Exception:
                all_meta = {}
        all_meta[user_id] = meta
        with open(META_FILE, 'w', encoding='utf-8') as f:
            json.dump(all_meta, f, indent=2)

    def extract_pdf_pages(self, file_path, filename, pdf_id):
        """Extract text page by page from PDF using PyPDF."""
        chunks = []
        reader = PdfReader(file_path)
        total_pages = len(reader.pages)

        for page_num, page in enumerate(reader.pages, start=1):
            text = page.extract_text() or ''
            text = text.strip()
            if not text:
                continue

            # Split large pages into ~500 char passages with overlap
            words = text.split()
            chunk_size = 120
            overlap = 20

            if len(words) <= chunk_size:
                chunks.append({
                    'pdf_id': pdf_id,
                    'filename': filename,
                    'page': page_num,
                    'text': text
                })
            else:
                for i in range(0, len(words), chunk_size - overlap):
                    sub_words = words[i:i + chunk_size]
                    sub_text = ' '.join(sub_words).strip()
                    if len(sub_text) > 30:
                        chunks.append({
                            'pdf_id': pdf_id,
                            'filename': filename,
                            'page': page_num,
                            'text': sub_text
                        })

        return total_pages, chunks

    def process_and_add_pdfs(self, user_id, file_tuples):
        """
        file_tuples: list of (file_path, filename, pdf_id)
        """
        user_meta = self._get_user_meta(user_id)
        added_pdfs = []

        for file_path, filename, pdf_id in file_tuples:
            total_pages, chunks = self.extract_pdf_pages(file_path, filename, pdf_id)
            user_meta[pdf_id] = {
                'pdf_id': pdf_id,
                'filename': filename,
                'file_path': file_path,
                'total_pages': total_pages,
                'chunks_count': len(chunks),
                'chunks': chunks
            }
            added_pdfs.append({
                'pdf_id': pdf_id,
                'filename': filename,
                'total_pages': total_pages,
                'chunks_count': len(chunks)
            })

        self._save_user_meta(user_id, user_meta)
        self.rebuild_vector_store(user_id)
        return added_pdfs

    def get_user_pdfs(self, user_id):
        user_meta = self._get_user_meta(user_id)
        result = []
        for pdf_id, info in user_meta.items():
            result.append({
                'pdf_id': pdf_id,
                'filename': info['filename'],
                'total_pages': info['total_pages'],
                'chunks_count': info['chunks_count']
            })
        return result

    def delete_pdf(self, user_id, pdf_id):
        user_meta = self._get_user_meta(user_id)
        if pdf_id in user_meta:
            pdf_info = user_meta.pop(pdf_id)
            if os.path.exists(pdf_info.get('file_path', '')):
                try:
                    os.remove(pdf_info['file_path'])
                except Exception:
                    pass
            self._save_user_meta(user_id, user_meta)
            self.rebuild_vector_store(user_id)
            return True
        return False

    def rebuild_vector_store(self, user_id):
        """Build FAISS vector index for user's uploaded PDF chunks."""
        user_meta = self._get_user_meta(user_id)
        all_chunks = []
        for pdf_id, info in user_meta.items():
            all_chunks.extend(info.get('chunks', []))

        if not all_chunks:
            self.user_stores[user_id] = None
            return

        texts = [c['text'] for c in all_chunks]
        
        # Build TF-IDF vectorizer + FAISS index for high-precision retrieval
        vectorizer = TfidfVectorizer(stop_words='english', max_features=4096)
        matrix = vectorizer.fit_transform(texts).toarray().astype(np.float32)

        # Normalize vectors for Cosine Similarity in FAISS
        faiss.normalize_L2(matrix)
        dim = matrix.shape[1]

        index = faiss.IndexFlatIP(dim) # Inner product = cosine similarity on normalized vectors
        index.add(matrix)

        self.user_stores[user_id] = {
            'chunks': all_chunks,
            'vectorizer': vectorizer,
            'index': index
        }

    def search_similar_chunks(self, user_id, query, top_k=4):
        """Retrieve top-K matching PDF passages using FAISS similarity search."""
        store = self.user_stores.get(user_id)
        if not store:
            self.rebuild_vector_store(user_id)
            store = self.user_stores.get(user_id)

        if not store or not store.get('index'):
            return []

        vectorizer = store['vectorizer']
        index = store['index']
        chunks = store['chunks']

        query_vec = vectorizer.transform([query]).toarray().astype(np.float32)
        norm = np.linalg.norm(query_vec)
        if norm > 0:
            query_vec = query_vec / norm

        scores, indices = index.search(query_vec, min(top_k, len(chunks)))

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx >= 0 and idx < len(chunks):
                # Cosine similarity threshold for relevance
                if score >= 0.08:
                    results.append({
                        'score': float(score),
                        'chunk': chunks[idx]
                    })

        return results

rag_store = RAGStore()

def answer_pdf_question(user_id, question, chat_history=None):
    """
    RAG QA Execution:
    1. Search vector database (FAISS).
    2. If no context found or score too low -> return "Answer not found in the uploaded PDF."
    3. Call LLM with strict context-only system prompt.
    4. Attach PDF Name + Page Number citations.
    """
    user_pdfs = rag_store.get_user_pdfs(user_id)
    if not user_pdfs:
        return {
            "answer": "No PDFs uploaded yet. Please upload one or more PDF files to ask questions.",
            "citations": []
        }

    matches = rag_store.search_similar_chunks(user_id, question, top_k=5)

    if not matches:
        return {
            "answer": NOT_FOUND_RESPONSE,
            "citations": []
        }

    context_blocks = []
    citations = []
    seen_citations = set()

    for idx, match in enumerate(matches, start=1):
        c = match['chunk']
        fn = c['filename']
        pg = c['page']
        txt = c['text']

        context_blocks.append(f"[Excerpt {idx} | File: {fn} | Page: {pg}]\n{txt}")

        cit_key = f"{fn}_p{pg}"
        if cit_key not in seen_citations:
            seen_citations.add(cit_key)
            citations.append({
                "filename": fn,
                "page": pg,
                "snippet": txt[:180] + "..." if len(txt) > 180 else txt
            })

    context_str = "\n\n".join(context_blocks)

    # Use Google Gemini / LLM if available, otherwise direct extraction response
    if GOOGLE_API_KEY:
        try:
            from AI.chat import get_ai_response
            
            system_prompt = f"""You are an AI PDF Question Answering Assistant.
Answer the user's question strictly using ONLY the provided document excerpts below.
DO NOT use any external knowledge or information not contained in these excerpts.
If the answer is NOT explicitly present in the provided document excerpts, you MUST respond with EXACTLY:
"{NOT_FOUND_RESPONSE}"

Document Excerpts:
{context_str}

User Question: {question}

Response Instructions:
1. If the answer is in the excerpts, provide a clear, concise answer.
2. At the end of your answer, reference the PDF name and page number where the information was found (e.g., "[Source: filename.pdf - Page X]").
3. If not found in the excerpts, output ONLY: "{NOT_FOUND_RESPONSE}"
"""

            response_text = get_ai_response([{"role": "user", "content": system_prompt}])
            response_text = response_text.strip()

            if NOT_FOUND_RESPONSE.lower() in response_text.lower() and len(response_text) < 60:
                return {
                    "answer": NOT_FOUND_RESPONSE,
                    "citations": []
                }

            return {
                "answer": response_text,
                "citations": citations
            }
        except Exception as e:
            print("LLM call error, using strict context fallback:", e)

    # Context match fallback if LLM is unavailable
    best_text = matches[0]['chunk']['text']
    fn = matches[0]['chunk']['filename']
    pg = matches[0]['chunk']['page']
    
    return {
        "answer": f"{best_text}\n\n[Source: {fn} - Page {pg}]",
        "citations": citations
    }

import os
import json
import firebase_admin
from firebase_admin import credentials, firestore, auth
from dotenv import load_dotenv

load_dotenv()

def build_credentials():
    """
    Supports three ways of providing Firebase credentials:
    1. GOOGLE_APPLICATION_CREDENTIALS pointing to a JSON key file
    2. A local JSON file named 'firebase-service-account.json' or 'serviceAccountKey.json' (easiest for development)
    3. Individual FIREBASE_* env vars (private key must use literal \n)
    """
    # 1. Check environment variable path
    json_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if json_path and os.path.exists(json_path):
        return credentials.Certificate(json_path)

    # 2. Check for local default JSON file names in working directory, script directory, or parent directory
    default_files = ["firebase-service-account.json", "serviceAccountKey.json"]
    for filename in default_files:
        if os.path.exists(filename):
            return credentials.Certificate(filename)
        # Check relative to script location (server/)
        script_dir = os.path.dirname(os.path.abspath(__file__))
        script_dir_file = os.path.join(script_dir, filename)
        if os.path.exists(script_dir_file):
            return credentials.Certificate(script_dir_file)
        # Check relative to parent directory (workspace root)
        parent_dir_file = os.path.join(os.path.dirname(script_dir), filename)
        if os.path.exists(parent_dir_file):
            return credentials.Certificate(parent_dir_file)

    # 3. Fallback to individual environment variables
    private_key = os.getenv("FIREBASE_PRIVATE_KEY", "")
    if not private_key or "YOUR_PRIVATE_KEY" in private_key:
        raise ValueError(
            "FIREBASE_PRIVATE_KEY is missing or still set to the placeholder. "
            "Please paste your real key into .env or place your Firebase service account JSON "
            "file inside the server directory as 'firebase-service-account.json'."
        )

    # Convert literal \n sequences into real newlines
    private_key = private_key.replace("\\n", "\n")

    firebase_credentials = {
        "type": "service_account",
        "project_id": os.getenv("FIREBASE_PROJECT_ID"),
        "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
        "private_key": private_key,
        "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
        "client_id": os.getenv("FIREBASE_CLIENT_ID"),
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_CERT_URL"),
        "universe_domain": "googleapis.com",
    }

    return credentials.Certificate(firebase_credentials)


# ===== Local Mock Firestore & Auth for Offline Development =====
class MockDocument:
    def __init__(self, data=None, exists=True):
        self._data = data or {}
        self.exists = exists

    def get(self):
        return self

    def to_dict(self):
        return self._data

class MockDocumentRef:
    def __init__(self, doc_path, mock_db):
        self.doc_path = doc_path
        self.mock_db = mock_db

    def get(self):
        data = self.mock_db.get_data(self.doc_path)
        return MockDocument(data, exists=(data is not None))

    def set(self, data, merge=False):
        self.mock_db.set_data(self.doc_path, data)

    def update(self, data):
        existing = self.mock_db.get_data(self.doc_path) or {}
        existing.update(data)
        self.mock_db.set_data(self.doc_path, existing)

    def collection(self, collection_name):
        return MockCollectionRef(f"{self.doc_path}/{collection_name}", self.mock_db)

class MockCollectionRef:
    def __init__(self, collection_path, mock_db):
        self.collection_path = collection_path
        self.mock_db = mock_db

    def document(self, doc_id=None):
        if not doc_id:
            import uuid
            doc_id = str(uuid.uuid4())
        return MockDocumentRef(f"{self.collection_path}/{doc_id}", self.mock_db)

    def stream(self):
        docs = []
        for path, data in self.mock_db.data.items():
            if path.startswith(self.collection_path + "/"):
                subpath = path[len(self.collection_path) + 1:]
                if "/" not in subpath:
                    docs.append(MockDocument(data, exists=True))
        return docs

    def order_by(self, field):
        return self

    def limit(self, count):
        return self

def sanitize_in_place(data):
    if isinstance(data, dict):
        for k, v in list(data.items()):
            if v == firestore.SERVER_TIMESTAMP:
                from datetime import datetime
                data[k] = datetime.utcnow().isoformat() + "Z"
            else:
                sanitize_in_place(v)
    elif isinstance(data, list):
        for item in data:
            sanitize_in_place(item)
    return data

class MockFirestore:
    def __init__(self, filepath="mock_db.json"):
        server_dir = os.path.dirname(os.path.abspath(__file__))
        self.filepath = os.path.join(server_dir, filepath)
        self.data = {}
        if os.path.exists(self.filepath):
            try:
                with open(self.filepath, "r") as f:
                    self.data = json.load(f)
            except Exception:
                pass

    def save(self):
        try:
            with open(self.filepath, "w") as f:
                json.dump(self.data, f)
        except Exception:
            pass

    def collection(self, collection_name):
        return MockCollectionRef(collection_name, self)

    def get_data(self, path):
        return self.data.get(path)

    def set_data(self, path, data):
        self.data[path] = sanitize_in_place(data)
        self.save()

class MockUser:
    def __init__(self, uid, email, display_name=None):
        self.uid = uid
        self.email = email
        self.display_name = display_name or email.split("@")[0]

class MockAuth:
    def __init__(self, mock_db):
        self.mock_db = mock_db

    def create_user(self, email, password=None, display_name=None, uid=None):
        if not uid:
            import uuid
            uid = str(uuid.uuid4())
        user = MockUser(uid, email, display_name)
        users = self.mock_db.get_data("auth_users") or {}
        users[email] = {"uid": uid, "email": email, "display_name": display_name}
        self.mock_db.set_data("auth_users", users)
        return user

    def get_user_by_email(self, email):
        users = self.mock_db.get_data("auth_users") or {}
        if email in users:
            u = users[email]
            return MockUser(u["uid"], u["email"], u.get("display_name"))
        raise Exception("User not found")

    def create_custom_token(self, uid, additional_claims=None):
        # Return a space-free token to avoid header split/truncation issues
        return f"mocktoken-{uid}"

    def verify_id_token(self, id_token):
        if id_token.startswith("mocktoken-"):
            uid = id_token.replace("mocktoken-", "")
            return {"uid": uid, "email": f"{uid}@example.com", "role": "admin" if uid.lower() in ["veda", "ved"] else "user"}
        
        # Force logout for deprecated/stale truncated mock tokens
        if id_token.startswith('{"uid":') or 'uid' in id_token:
            raise ValueError("Invalid mock token format")
            
        try:
            return json.loads(id_token)
        except Exception:
            return {"uid": id_token, "email": f"{id_token}@example.com", "role": "admin" if id_token.lower() in ["veda", "ved"] else "user"}


try:
    cred = build_credentials()
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    from firebase_admin import auth as firebase_auth
    auth = firebase_auth
    print("Firebase initialized successfully.")
except Exception as e:
    print(f"\n[WARNING] Firebase initialization failed: {e}")
    print("Starting NutriGen in OFFLINE MOCK MODE. Data will be saved locally to 'server/mock_db.json'.")
    print("No actual Firebase service account is required for this mode.\n")
    db = MockFirestore()
    auth = MockAuth(db)


def create_custom_token(uid: str, additional_claims: dict = None):
    return auth.create_custom_token(uid, additional_claims)


def verify_custom_token(id_token: str):
    return auth.verify_id_token(id_token)
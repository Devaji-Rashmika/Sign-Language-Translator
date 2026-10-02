import logging
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
import pymongo
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from backend.config import settings

logger = logging.getLogger("isl_backend")

# In-Memory Fallback Collection Simulator for 100% Reliability
class MemoryCollection:
    def __init__(self, name: str):
        self.name = name
        self.documents: List[Dict[str, Any]] = []

    def insert_one(self, doc: Dict[str, Any]):
        doc_copy = dict(doc)
        if "_id" not in doc_copy:
            doc_copy["_id"] = str(uuid.uuid4())
        self.documents.append(doc_copy)
        class InsertResult:
            inserted_id = doc_copy["_id"]
        return InsertResult()

    def insert_many(self, docs: List[Dict[str, Any]]):
        ids = []
        for d in docs:
            res = self.insert_one(d)
            ids.append(res.inserted_id)
        class InsertManyResult:
            inserted_ids = ids
        return InsertManyResult()

    def find_one(self, query: Dict[str, Any] = None) -> Optional[Dict[str, Any]]:
        query = query or {}
        for doc in self.documents:
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                return dict(doc)
        return None

    def find(self, query: Dict[str, Any] = None, sort: List = None, limit: int = 0):
        query = query or {}
        results = []
        for doc in self.documents:
            match = True
            for k, v in query.items():
                if k == "$or" and isinstance(v, list):
                    or_match = False
                    for subquery in v:
                        if all(doc.get(sk) == sv for sk, sv in subquery.items()):
                            or_match = True
                            break
                    if not or_match:
                        match = False
                        break
                elif doc.get(k) != v:
                    match = False
                    break
            if match:
                results.append(dict(doc))
        if sort:
            for field, order in reversed(sort):
                results.sort(key=lambda x: x.get(field, ""), reverse=(order == -1))
        if limit and limit > 0:
            results = results[:limit]
        return results

    def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        for doc in self.documents:
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                if "$set" in update:
                    doc.update(update["$set"])
                class UpdateResult:
                    matched_count = 1
                    modified_count = 1
                return UpdateResult()
        class EmptyUpdateResult:
            matched_count = 0
            modified_count = 0
        return EmptyUpdateResult()

    def delete_one(self, query: Dict[str, Any]):
        for i, doc in enumerate(self.documents):
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                del self.documents[i]
                class DelResult:
                    deleted_count = 1
                return DelResult()
        class EmptyDelResult:
            deleted_count = 0
        return EmptyDelResult()

    def delete_many(self, query: Dict[str, Any] = None):
        query = query or {}
        before = len(self.documents)
        if not query:
            self.documents.clear()
            count = before
        else:
            self.documents = [
                d for d in self.documents
                if not all(d.get(k) == v for k, v in query.items())
            ]
            count = before - len(self.documents)
        class DelResult:
            deleted_count = count
        return DelResult()

    def count_documents(self, query: Dict[str, Any] = None) -> int:
        return len(self.find(query))

    def distinct(self, field: str) -> List[Any]:
        vals = set()
        for doc in self.documents:
            if field in doc:
                vals.add(doc[field])
        return list(vals)


class DatabaseManager:
    def __init__(self):
        self.is_connected = False
        self.client = None
        self.db = None
        self._collections = {}

    def connect(self):
        try:
            # Attempt to connect to real MongoDB with short server timeout
            self.client = pymongo.MongoClient(
                settings.MONGO_URI,
                serverSelectionTimeoutMS=1500
            )
            self.client.admin.command('ping')
            self.db = self.client[settings.DATABASE_NAME]
            self.is_connected = True
            logger.info(f"Connected successfully to MongoDB at {settings.MONGO_URI}")
            print(f"[MongoDB] Successfully connected to live MongoDB database '{settings.DATABASE_NAME}'")
        except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
            self.is_connected = False
            self.client = None
            self.db = None
            logger.warning(f"Could not connect to MongoDB server ({e}). Utilizing high-performance In-Memory collection storage.")
            print(f"[MongoDB] Local daemon not responding. Running with In-Memory MongoDB Collections Engine.")

    def get_collection(self, name: str):
        if self.is_connected and self.db is not None:
            return self.db[name]
        if name not in self._collections:
            self._collections[name] = MemoryCollection(name)
        return self._collections[name]

db_manager = DatabaseManager()

# Helper accessors for all required collections
def get_users_col():
    return db_manager.get_collection("users")

def get_vocabulary_col():
    return db_manager.get_collection("vocabulary")

def get_sign_sequences_col():
    return db_manager.get_collection("sign_sequences")

def get_translation_sessions_col():
    return db_manager.get_collection("translation_sessions")

def get_translation_history_col():
    return db_manager.get_collection("translation_history")

def get_practice_results_col():
    return db_manager.get_collection("practice_results")

def get_model_metadata_col():
    return db_manager.get_collection("model_metadata")

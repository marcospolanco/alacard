import psycopg2
from psycopg2.extras import RealDictCursor
from app.core.config import settings
from typing import List, Dict, Any, Optional
import json

class Database:
    def __init__(self):
        # Parse DATABASE_URL in format: postgresql://user:password@host:port/database
        if settings.DATABASE_URL.startswith("postgresql://"):
            url = settings.DATABASE_URL[len("postgresql://"):]  # Remove 'postgresql://'

            if "@" in url:
                credentials, host_port_db = url.split("@", 1)  # Split only on first @

                # Remove any leading slashes from credentials
                credentials = credentials.lstrip("/")

                if ":" in credentials:
                    user, password = credentials.split(":", 1)  # Split only on first :

                    if "/" in host_port_db:
                        host_port, database = host_port_db.split("/", 1)  # Split only on first /

                        if ":" in host_port:
                            host, port = host_port.split(":", 1)
                            port = int(port)
                        else:
                            host = host_port
                            port = 5432

                        self.connection_params = {
                            "host": host,
                            "database": database,
                            "user": user,
                            "password": password,
                            "port": port
                        }
                    else:
                        raise ValueError("Invalid DATABASE_URL format - missing database")
                else:
                    raise ValueError("Invalid DATABASE_URL format - missing password separator")
            else:
                raise ValueError("Invalid DATABASE_URL format - missing credentials separator")
        else:
            raise ValueError("DATABASE_URL must start with 'postgresql://'")

    def get_connection(self):
        return psycopg2.connect(**self.connection_params, cursor_factory=RealDictCursor)

    def execute_query(self, query: str, params: Optional[tuple] = None) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute(query, params)
                if query.strip().upper().startswith('SELECT'):
                    return cur.fetchall()
                conn.commit()
                return [{"affected_rows": cur.rowcount}]
        finally:
            conn.close()

    def execute_single_query(self, query: str, params: Optional[tuple] = None) -> Optional[Dict[str, Any]]:
        conn = self.get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute(query, params)
                result = cur.fetchone()
                conn.commit()
                return dict(result) if result else None
        finally:
            conn.close()

# Global database instance
db = Database()
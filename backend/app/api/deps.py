import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import decode_access_token

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> str:
    """Require a valid admin JWT. Returns the admin username (subject).

    Missing/invalid token -> 403 Forbidden (admin-only action).
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin authentication required"
        )
    try:
        payload = decode_access_token(credentials.credentials)
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Invalid or expired token"
        )

    subject = payload.get("sub")
    if not subject:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid token payload")
    return subject

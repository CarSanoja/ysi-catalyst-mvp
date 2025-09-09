from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.session import SessionLocal
from app.models.user import User

# Security scheme
security = HTTPBearer()

def get_db() -> Generator:
    """
    Dependency to get database session
    """
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Get current user from JWT token (optional - for MVP testing)
    Returns None if no valid token provided
    """
    if not credentials:
        return None
    
    try:
        payload = jwt.decode(
            credentials.credentials, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        user_id: int = payload.get("sub")
        if user_id is None:
            return None
    except JWTError:
        return None
    
    user = db.query(User).filter(User.id == user_id).first()
    return user

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current user from JWT token (required)
    Raises HTTP 401 if no valid token provided
    """
    try:
        payload = jwt.decode(
            credentials.credentials, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials", 
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    return user

def get_current_superuser(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current superuser (for admin endpoints)
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user

# MVP Testing: Create a mock user dependency for development
def get_current_user_mock() -> User:
    """
    Mock user for MVP testing - creates a test user
    Replace this with proper authentication in production
    """
    from app.db.session import SessionLocal
    
    db = SessionLocal()
    try:
        # Try to get existing test user
        test_user = db.query(User).filter(User.email == "test@ysi.org").first()
        
        if not test_user:
            # Create test user if doesn't exist
            test_user = User(
                email="test@ysi.org",
                hashed_password="$2b$12$test_hash_for_development",
                full_name="Test User",
                role="admin",
                is_active=True,
                is_superuser=True
            )
            db.add(test_user)
            db.commit()
            db.refresh(test_user)
        
        return test_user
    finally:
        db.close()

# For MVP development, use mock user by default
# In production, replace get_current_user_mock with get_current_user
def get_current_user_mvp() -> User:
    """
    MVP user dependency - uses mock user for development
    Switch to get_current_user for production
    """
    return get_current_user_mock()
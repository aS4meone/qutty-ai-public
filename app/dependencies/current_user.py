from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security.auth_bearer import JWTBearer
from app.dependencies.database.database import get_db
from app.models.all_models import User


async def get_current_user(db: Session = Depends(get_db),
                           token: str = Depends(JWTBearer(expected_token_type="access"))):
    username: str = token.get("sub")
    if username is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Could not validate credentials")
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

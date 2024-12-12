from datetime import datetime
from uuid import UUID

from fastapi import Depends, HTTPException, APIRouter
from pydantic import BaseModel, UUID4
from sqlalchemy.orm import Session

from app.dependencies.current_user import get_current_user
from app.dependencies.database.database import get_db
from app.models.all_models import User, TestResult

router = APIRouter(tags=["Doctor"], prefix='/doctor')


class TestResultResponse(BaseModel):
    id: UUID4
    patient_name: str
    created_at: datetime
    status: str


@router.get("/test-results", response_model=list[TestResultResponse])
def get_test_results_for_current_user(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    test_results = db.query(TestResult).filter(TestResult.user_id == current_user.id).all()

    if not test_results:
        raise HTTPException(status_code=404, detail="No test results found for the current user")

    return test_results


@router.get("/test-result/{test_result_id}")
def get_test_result_by_uuid(
        test_result_id: UUID,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    test_result = db.query(TestResult).filter(
        TestResult.id == test_result_id,
        TestResult.user_id == current_user.id
    ).first()

    if not test_result:
        raise HTTPException(status_code=404, detail="Test result not found")

    has_gestures = test_result.gestures_result
    if not has_gestures:
        print("ffaafaf")

    if test_result.status == "CREATED":
        return {"message": "Test is not complete"}
    return test_result


class CreateTestAttemptInput(BaseModel):
    patient_name: str
    patient_birth_date: datetime
    patient_phone_number: str


@router.post("/create_test_attempt/")
async def create_test_attempt(input_data: CreateTestAttemptInput, db: Session = Depends(get_db),
                              current_user: User = Depends(get_current_user)):
    new_test_result = TestResult(
        user_id=current_user.id,
        patient_name=input_data.patient_name,
        patient_birth_date=input_data.patient_birth_date,
        patient_phone_number=input_data.patient_phone_number,
        status="CREATED"
    )

    db.add(new_test_result)
    db.commit()
    db.refresh(new_test_result)

    return {"test_id": new_test_result.id}

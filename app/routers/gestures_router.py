from typing import List
from uuid import UUID

from fastapi import APIRouter, Form, UploadFile, File, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.dependencies.database.database import get_db
from app.models.all_models import TestResult
from app.utils.ai_integration import correct_count

router = APIRouter(tags=['Gestures'])


class GestureResponse(BaseModel):
    id: int
    gesture: str


class GesturesResult(BaseModel):
    gestures: List[GestureResponse]


@router.post("/classify-gestures/{uuid}")
async def recognize_gestures(
        uuid: UUID,
        strict: int = Form(...),
        group_size: int = Form(...),
        test_number: int = Form(...),
        gesture_names: str = Form(...),
        images: List[UploadFile] = File(...),
        db: Session = Depends(get_db)):
    gesture_names_list = gesture_names.split(',')
    strict_bool = strict == 1

    result = correct_count(gesture_names_list, images, strict=strict_bool, group_size=group_size)

    try:
        # Поиск записи в базе данных по UUID
        test_result = db.query(TestResult).filter(TestResult.id == uuid).first()
        if not test_result:
            raise HTTPException(status_code=404, detail="Test result not found")

        if test_number == 1:
            test_result.first_test = result

        if test_number == 2:
            test_result.second_test = result

        if test_number == 3:
            test_result.third_test = result

        # Если это четвертый тест, суммируем все результаты
        if test_number == 4:
            test_result.fourth_test = result
            total_result = sum([
                test_result.first_test or 0,
                test_result.second_test or 0,
                test_result.third_test or 0,
                result
            ])
            test_result.gestures_result = total_result

        db.commit()

    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    return {"result": result, "test_number": test_number}

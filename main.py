import json
from pathlib import Path
from typing import List, Dict

from pydantic import BaseModel, UUID4
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.core.security.tokens import create_access_token
from app.dependencies.current_user import get_current_user
from app.dependencies.database.database import get_db
from app.models.all_models import TestResult, User
from app.routers.doctor_router import router as DoctorRouter
from app.routers.gestures_router import router as GesturesRouter
from app.utils.answers import load_answers, process_selected_answers

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(DoctorRouter)
app.include_router(GesturesRouter)


@app.get("/get_test/")
async def get_module_data():
    try:
        json_file_path = Path(__file__).parent / "mocktest.json"
        with open(json_file_path, "r", encoding="utf-8") as file:
            data = json.load(file)
        return data
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Module data file not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error decoding JSON data")


class UserCreate(BaseModel):
    username: str
    password: str
    name: str
    role: str


class UserLogin(BaseModel):
    username: str
    password: str


def get_user(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()


@app.post("/register/")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    new_user = User(username=user.username, password=user.password, name=user.name, role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully"}


@app.post("/login/")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = get_user(db, username=user.username)
    if not db_user or db_user.password != user.password:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    token = create_access_token(data={"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}


class SubmitTestResultInput(BaseModel):
    selectedAnswerIds: List[int]
    height: float
    weight: float


@app.get("/test_result/{uuid}")
async def get_test_result(uuid: UUID4, db: Session = Depends(get_db)):
    test_result = db.query(TestResult).filter(TestResult.id == uuid).first()
    if not test_result:
        raise HTTPException(status_code=404, detail="TestResult not found")

    if test_result.status == "CREATED":
        return {"message": "Created"}
    elif test_result.status == "COMPLETE":
        result = {
            "patient_name": test_result.patient_name,
            "patient_birth_date": test_result.patient_birth_date,
            "patient_phone_number": test_result.patient_phone_number,
            "recommendation_for_user": test_result.recommendation_for_user,
            "nfr_points": test_result.nfr_points,
            "kfr_points": test_result.kfr_points,
            "symptoms_points": test_result.symptoms_points,
            "height": test_result.height,
            "weight": test_result.weight,
            "gestures_result": test_result.gestures_result,
            "created_at": test_result.created_at
        }
        return result
    raise HTTPException(status_code=500, detail="Unexcpected error")


@app.post("/submit/{uuid}")
async def submit_test_result(uuid: UUID4, input_data: SubmitTestResultInput, db: Session = Depends(get_db)):
    try:
        test_result = db.query(TestResult).filter(TestResult.id == uuid).first()
        if not test_result:
            raise HTTPException(status_code=404, detail="TestResult not found")

        if test_result.complaints:
            raise HTTPException(status_code=400, detail="Test result already submitted")

        answers_data = load_answers()
        selected_answers = [answer for answer in answers_data if answer['answer_id'] in input_data.selectedAnswerIds]

        result = process_selected_answers(selected_answers)

        # Обновляем существующий TestResult
        for key, value in result.items():
            setattr(test_result, key, value)

        test_result.height = input_data.height
        test_result.weight = input_data.weight
        test_result.status = "COMPLETE"
        db.commit()
        db.refresh(test_result)

        return result
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


class DiagnosisRequest(BaseModel):
    diagnosis: str


@app.post("/diagnosis/{uuid}")
async def update_diagnosis(
        uuid: str,
        diagnosis_data: DiagnosisRequest,
        db: Session = Depends(get_db),
        current_user: Dict = Depends(get_current_user)
):
    test_result = db.query(TestResult).filter(TestResult.id == uuid).first()
    if not test_result:
        raise HTTPException(status_code=404, detail="Test result not found")

    test_result.diagnosis = diagnosis_data.diagnosis
    db.commit()

    return {"status": "success", "message": "Diagnosis updated successfully"}


class DegreeRequest(BaseModel):
    degree: str


@app.post("/degree/{uuid}")
async def update_diagnosis(
        uuid: str,
        degree_data: DegreeRequest,
        db: Session = Depends(get_db),
        current_user: Dict = Depends(get_current_user)
):
    test_result = db.query(TestResult).filter(TestResult.id == uuid).first()
    if not test_result:
        raise HTTPException(status_code=404, detail="Test result not found")

    test_result.degree = degree_data.degree
    db.commit()

    return {"status": "success", "message": "Degree updated successfully"}

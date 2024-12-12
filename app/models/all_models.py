from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

from app.dependencies.database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=False)

    test_results = relationship("TestResult", back_populates="user")


class TestResult(Base):
    __tablename__ = "test_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    patient_name = Column(String, nullable=True)
    patient_birth_date = Column(DateTime, nullable=True)
    patient_phone_number = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, nullable=False)
    diagnosis = Column(String, nullable=True)
    degree = Column(String, nullable=True)

    complaints = Column(ARRAY(String), nullable=True)
    recommendation_for_user = Column(ARRAY(String), nullable=True)
    recommendation_for_doctor = Column(ARRAY(String), nullable=True)
    am = Column(ARRAY(String), nullable=True)
    av = Column(ARRAY(String), nullable=True)
    sp = Column(ARRAY(String), nullable=True)
    nfr_points = Column(Integer, nullable=True)
    kfr_points = Column(Integer, nullable=True)
    symptoms_points = Column(Integer, nullable=True)
    first_test = Column(Integer, nullable=True)
    second_test = Column(Integer, nullable=True)
    third_test = Column(Integer, nullable=True)
    fourth_test = Column(Integer, nullable=True)
    gestures_result = Column(Integer, nullable=True)
    height = Column(Float, nullable=True)
    weight = Column(Float, nullable=True)

    user = relationship("User", back_populates="test_results")

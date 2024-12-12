from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.patient_model import Patient


def update_patient_in_db(db: Session, id: int, test_number: int, correct_count: int):
    patient = db.query(Patient).filter(Patient.id == id).first()

    if patient:
        if test_number == 1:
            patient.first_test = correct_count
        elif test_number == 2:
            patient.second_test = correct_count
        elif test_number == 3:
            patient.third_test = correct_count
        elif test_number == 4:
            patient.fourth_test = correct_count
        elif test_number == 5:
            patient.fifth_test = correct_count
        elif test_number == 6:
            patient.sixth_test = correct_count
        else:
            raise HTTPException(status_code=404, detail=f"Test number {test_number} not found.")
    else:
        raise HTTPException(status_code=404, detail=f"User with {id} id not found.")

    db.commit()
    return {"id": id, "name": patient.name, "test_number": test_number, "correct_count": correct_count}

import json
from typing import Dict, Set, List, Any

from fastapi import HTTPException


def load_answers():
    with open("app/utils/data/mockanswers.json", "r", encoding="utf-8") as file:
        return json.load(file)["answers"]


def process_selected_answers(selected_answers: List[Dict[str, Any]]) -> Dict[str, Any]:
    if not selected_answers:
        raise HTTPException(status_code=404, detail="No answers found for the provided IDs.")

    unique_fields: Dict[str, Set[str]] = {
        'complaints': set(),
        'recommendation_for_user': set(),
        'recommendation_for_doctor': set(),
        'am': set(),
        'av': set(),
        'sp': set()
    }

    total_points = {
        'nfr_points': 0,
        'kfr_points': 0,
        'symptoms_points': 0
    }

    for answer in selected_answers:
        for field in unique_fields:
            if answer.get(field):
                unique_fields[field].add(answer[field])

        for point_type in total_points:
            total_points[point_type] += answer.get(point_type, 0)

    result = {
        **{field: list(values) for field, values in unique_fields.items()},
        **total_points
    }

    return result

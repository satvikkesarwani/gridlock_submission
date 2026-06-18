import math
from numbers import Integral, Real

import pytest
from fastapi.testclient import TestClient

from backend.api.main import app


client = TestClient(app)

VALID_PAYLOAD = {
    "event_cause": "public_event",
    "priority": "High",
    "hour_of_day": 20,
    "is_weekend": True,
    "requires_road_closure": True,
    "attendance": "45,000",
}


def assert_json_safe(value):
    if isinstance(value, dict):
        for nested in value.values():
            assert_json_safe(nested)
        return
    if isinstance(value, list):
        for nested in value:
            assert_json_safe(nested)
        return
    if isinstance(value, float):
        assert math.isfinite(value)
    assert not type(value).__module__.startswith("numpy")


def test_root_contract():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to EventFlow AI API"}


def test_live_status_contract_repeated():
    for _ in range(5):
        response = client.get("/api/live-status")
        assert response.status_code == 200
        data = response.json()
        assert_json_safe(data)
        assert isinstance(data["travel_time_index"], Real)
        assert 1.8 <= data["travel_time_index"] <= 2.5
        assert isinstance(data["avg_speed"], Integral)
        assert isinstance(data["active_incidents"], Integral)
        assert data["dms_status"] == "Broadcasting"
        assert len(data["clearance_forecast"]) == 5
        assert all({"time", "congestion"} <= set(point) for point in data["clearance_forecast"])


def test_debrief_contract():
    response = client.get("/api/debrief")
    assert response.status_code == 200
    data = response.json()
    assert_json_safe(data)
    assert {"target_delay", "actual_delay", "variance", "delay_hours"} <= set(data)
    assert len(data["plan_vs_actual"]) == 6
    assert len(data["variance_metrics"]) == 4
    assert len(data["shap_importance"]) == 4


@pytest.mark.parametrize(
    "payload",
    [
        VALID_PAYLOAD,
        {
            "event_cause": "vehicle_breakdown",
            "priority": "Low",
            "hour_of_day": 0,
            "is_weekend": False,
            "requires_road_closure": False,
        },
        {
            "event_cause": "political_rally",
            "priority": "High",
            "hour_of_day": 23,
            "is_weekend": True,
            "requires_road_closure": True,
            "attendance": "1000000",
        },
        {
            "event_cause": "unexpected_category",
            "priority": "Unknown",
            "hour_of_day": 12,
            "is_weekend": False,
            "requires_road_closure": False,
            "attendance": "not-a-number",
            "extra_field": "ignored by API model",
        },
    ],
)
def test_post_endpoints_accept_valid_and_edge_payloads(payload):
    for path in ("/api/simulate", "/api/clearance-risk"):
        response = client.post(path, json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert_json_safe(data)


def test_simulate_contract_and_resource_shape():
    response = client.post("/api/simulate", json=VALID_PAYLOAD)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data["predicted_delay_mins"], Real)
    assert math.isfinite(data["predicted_delay_mins"])
    assert data["predicted_delay_mins"] > 0
    assert set(data["resources"]) == {
        "sworn_staff",
        "volunteers",
        "barricades",
        "diversions",
        "relief_factor",
        "estimated_budget",
    }


def test_clearance_risk_contract_and_ordering():
    response = client.post("/api/clearance-risk", json=VALID_PAYLOAD)
    assert response.status_code == 200
    data = response.json()
    assert data["optimistic_p10_mins"] <= data["expected_clearance_mins"] <= data["pessimistic_p90_mins"]
    assert data["optimistic_p10_mins"] >= 0


@pytest.mark.parametrize(
    "payload",
    [
        {},
        {"event_cause": "public_event"},
        {**VALID_PAYLOAD, "hour_of_day": -1},
        {**VALID_PAYLOAD, "hour_of_day": 24},
        {**VALID_PAYLOAD, "hour_of_day": 999999},
        {**VALID_PAYLOAD, "hour_of_day": None},
        {**VALID_PAYLOAD, "requires_road_closure": None},
        {**VALID_PAYLOAD, "is_weekend": None},
    ],
)
def test_post_endpoints_reject_invalid_payloads(payload):
    for path in ("/api/simulate", "/api/clearance-risk"):
        response = client.post(path, json=payload)
        assert response.status_code == 422
        assert_json_safe(response.json())


def test_repeated_ml_requests_are_stable_and_successful():
    delays = []
    for hour in [6, 9, 12, 18, 22]:
        payload = {**VALID_PAYLOAD, "hour_of_day": hour}
        response = client.post("/api/simulate", json=payload)
        assert response.status_code == 200
        delays.append(response.json()["predicted_delay_mins"])
    assert len(set(delays)) > 1


def test_websocket_live_status_contract():
    with client.websocket_connect("/api/ws/live-status") as websocket:
        data = websocket.receive_json()
    assert_json_safe(data)
    assert {"travel_time_index", "avg_speed", "active_incidents", "clearance_forecast"} <= set(data)
    assert len(data["clearance_forecast"]) == 5

import math

from backend.api.main import clearance_range_model, impact_model
from backend.ml_components.model_pipeline import ResourceOptimizer


def test_model_artifacts_load_from_backend_runtime():
    assert impact_model.is_fitted
    assert clearance_range_model.is_fitted


def test_impact_predictions_are_finite_and_vary_by_input():
    scenarios = [
        ("public_event", "High", 20, True, True),
        ("vehicle_breakdown", "Low", 3, False, False),
        ("accident", "High", 9, False, True),
    ]
    predictions = [impact_model.predict(*scenario) for scenario in scenarios]
    assert all(isinstance(value, float) for value in predictions)
    assert all(math.isfinite(value) and value > 0 for value in predictions)
    assert len(set(predictions)) > 1


def test_clearance_range_predictions_are_finite_ordered_and_json_safe():
    result = clearance_range_model.predict("public_event", "High", 20, True, True)
    assert type(result["optimistic_p10_mins"]) is float
    assert type(result["expected_clearance_mins"]) is float
    assert type(result["pessimistic_p90_mins"]) is float
    assert result["optimistic_p10_mins"] <= result["expected_clearance_mins"] <= result["pessimistic_p90_mins"]
    assert all(math.isfinite(value) for value in result.values())


def test_resource_optimizer_handles_attendance_edges():
    normal = ResourceOptimizer.recommend("public_event", "High", True, "45,000")
    invalid = ResourceOptimizer.recommend("public_event", "High", True, "not-a-number")
    large = ResourceOptimizer.recommend("political_rally", "High", True, "1000000")
    assert normal["sworn_staff"] > invalid["sworn_staff"]
    assert large["sworn_staff"] > normal["sworn_staff"]
    assert all(value >= 0 for value in normal.values())

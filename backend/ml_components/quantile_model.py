"""Clearance-time RANGE model (quantile regression).

The regressor in model_pipeline.py answers "how long, on average?" with one number.
Operators triaging an incident also want "how confident, and what's the worst case?"
This model answers with three numbers -- an optimistic (P10), expected (P50) and
pessimistic (P90) clearance time -- by training three LightGBM models, each tuned to
predict a different point of the duration distribution ("quantile regression").

Why this instead of survival analysis: survival models need a trustworthy "incident
still open at time T" timestamp for unfinished incidents. This dataset's only
candidate (modified_datetime) is a record-edit time, not a real last-seen time
(median 5.7 min after start), so survival estimates come out miscalibrated. Quantile
regression needs only the incidents that actually closed -- which we have -- and the
research literature uses it specifically for incident-duration prediction intervals.

Plain-English glossary:
  - "quantile" : the P90 model is trained so that ~90% of real durations fall below
                 its prediction. P50 is the median (half above, half below).
  - "calibrated": when we say P10-P90, ~80% of real incidents should land in that band.
                  Measured coverage here is ~73%.
"""
import os
import pickle
import warnings
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from lightgbm import LGBMRegressor

try:  # script vs. package import (see survival_model.py)
    from model_pipeline import (TrafficImpactModel, CATEGORICAL_FEATURES,
                                NUMERIC_FEATURES, FEATURES, DURATION_CAP_MINS)
except ModuleNotFoundError:
    from ml_components.model_pipeline import (TrafficImpactModel, CATEGORICAL_FEATURES,
                                              NUMERIC_FEATURES, FEATURES, DURATION_CAP_MINS)

warnings.filterwarnings('ignore')

QUANTILES = {'p10': 0.10, 'p50': 0.50, 'p90': 0.90}
DATA = os.path.join(os.path.dirname(__file__), '../../dataset/'
                    'Astram event data_anonymized - Astram event data_anonymizedb40ac87 (1).csv')


def _make_estimator(alpha):
    pre = ColumnTransformer([
        ('cat', OneHotEncoder(handle_unknown='ignore'), CATEGORICAL_FEATURES),
        ('num', StandardScaler(), NUMERIC_FEATURES),
    ])
    reg = LGBMRegressor(objective='quantile', alpha=alpha, n_estimators=300,
                        learning_rate=0.05, max_depth=5, verbose=-1, random_state=42)
    return Pipeline([('prep', pre), ('reg', reg)])


class ClearanceRangeModel:
    def __init__(self):
        self.models = {}  # name -> fitted pipeline
        self.model_path = os.path.join(os.path.dirname(__file__), 'quantile_model.pkl')
        self.is_fitted = False

    def train(self, path=DATA):
        helper = TrafficImpactModel()
        df = helper.preprocess_data(pd.read_csv(path, low_memory=False))
        X = df[FEATURES]
        y = df['duration_mins']
        if DURATION_CAP_MINS:
            y = y.clip(upper=DURATION_CAP_MINS)
        print(f"Training quantile models on {len(X)} observed incidents...")
        for name, alpha in QUANTILES.items():
            self.models[name] = _make_estimator(alpha).fit(X, y)
            print(f"  fitted {name} (alpha={alpha})")
        self.is_fitted = True
        with open(self.model_path, 'wb') as f:
            pickle.dump(self.models, f)
        print(f"Saved {self.model_path}")

    def load(self):
        if os.path.exists(self.model_path):
            with open(self.model_path, 'rb') as f:
                self.models = pickle.load(f)
            self.is_fitted = True
            return True
        return False

    def predict(self, event_cause, priority, hour_of_day, is_weekend, requires_road_closure,
                event_type='unplanned', corridor='Non-corridor', veh_type='unknown', month=6):
        if not self.is_fitted and not self.load():
            raise RuntimeError("Quantile model not trained. Run quantile_model.py first.")

        ts = pd.Timestamp(year=2024, month=month, day=15, hour=int(hour_of_day), tz='UTC')
        row = pd.DataFrame([{
            'start_datetime': ts, 'event_cause': event_cause, 'priority': priority,
            'event_type': event_type, 'corridor': corridor, 'veh_type': veh_type,
            'requires_road_closure': bool(requires_road_closure),
        }])
        row = TrafficImpactModel._engineer_features(row)
        row['is_weekend'] = int(is_weekend)
        X = row[FEATURES]

        preds = {name: float(model.predict(X)[0]) for name, model in self.models.items()}
        # Quantile models are trained independently, so enforce P10 <= P50 <= P90.
        p10, p50, p90 = np.sort([preds['p10'], preds['p50'], preds['p90']])
        return {
            'expected_clearance_mins': round(p50, 1),
            'optimistic_p10_mins': round(max(p10, 0), 1),
            'pessimistic_p90_mins': round(p90, 1),
        }


if __name__ == "__main__":
    ClearanceRangeModel().train()

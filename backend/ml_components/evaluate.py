"""Reproducible evaluation for the TrafficImpactModel.

Reports dataset coverage + 5-fold cross-validated MAE / R^2 so model changes
can be compared honestly (a single train/test split is too noisy here).

Run from the backend/ dir (libomp must be importable, see project memory):
    export DYLD_LIBRARY_PATH="$(pwd)/venv/lib/python3.9/site-packages/sklearn/.dylibs"
    ./venv/bin/python ml_components/evaluate.py
"""
import os
import warnings
import numpy as np
import pandas as pd
from sklearn.model_selection import cross_validate, KFold
from sklearn.metrics import make_scorer, r2_score

from model_pipeline import TrafficImpactModel, FEATURES, DURATION_CAP_MINS

warnings.filterwarnings('ignore')

DATA = os.path.join(os.path.dirname(__file__), '../../dataset/'
                    'Astram event data_anonymized - Astram event data_anonymizedb40ac87 (1).csv')


def main():
    model = TrafficImpactModel()
    raw = pd.read_csv(DATA, low_memory=False)
    df = model.preprocess_data(raw)

    print("=== DATA COVERAGE ===")
    print(f"  raw rows                : {len(raw)}")
    pct = 100 * len(df) / len(raw)
    print(f"  usable (have clearance) : {len(df)}  ({pct:.0f}%)")
    print(f"  right-censored (dropped): {len(raw) - len(df)}  <- no closed_datetime; "
          "survival analysis could recover these")

    X = df[FEATURES]
    y = df['duration_mins']
    if DURATION_CAP_MINS:
        y = y.clip(upper=DURATION_CAP_MINS)

    r2log = make_scorer(lambda yt, yp: r2_score(np.log1p(yt), np.log1p(np.clip(yp, 0, None))))
    cv = KFold(n_splits=5, shuffle=True, random_state=42)
    res = cross_validate(model.model, X, y, cv=cv,
                         scoring={'mae': 'neg_mean_absolute_error', 'r2': 'r2', 'r2log': r2log})

    print("\n=== 5-FOLD CROSS-VALIDATION ===")
    print(f"  MAE      : {-res['test_mae'].mean():5.1f} +/- {res['test_mae'].std():4.1f} min")
    print(f"  R2 (raw) : {res['test_r2'].mean():5.3f} +/- {res['test_r2'].std():.3f}")
    print(f"  R2 (log) : {res['test_r2log'].mean():5.3f} +/- {res['test_r2log'].std():.3f}")


if __name__ == "__main__":
    main()

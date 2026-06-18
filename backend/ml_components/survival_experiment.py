"""Experiment: survival analysis vs. the regressor for clearance-time prediction.

The production regressor (model_pipeline.py) can only train on rows that have an
end time (~34% of the log). The other rows are *right-censored* (incident still
active, or end time never recorded) -- they carry information ("lasted at least N
minutes") that a survival model can use. This script trains Random Survival Forest
and Cox PH on ALL usable rows and compares the concordance index (C-index) against
the regressor on the same held-out set.

C-index: probability the model ranks a pair of incidents in the correct duration
order. 0.5 = random, 1.0 = perfect. It is the standard metric for censored data
and lets us compare the regressor and the survival models on equal footing.

Run from backend/ (libomp must be importable -- see project memory):
    export DYLD_LIBRARY_PATH="$(pwd)/venv/lib/python3.9/site-packages/sklearn/.dylibs"
    ./venv/bin/python ml_components/survival_experiment.py
"""
import os
import warnings
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sksurv.ensemble import RandomSurvivalForest
from sksurv.linear_model import CoxPHSurvivalAnalysis
from sksurv.metrics import concordance_index_censored

from model_pipeline import TrafficImpactModel, CATEGORICAL_FEATURES, NUMERIC_FEATURES, FEATURES

warnings.filterwarnings('ignore')

DATA = os.path.join(os.path.dirname(__file__), '../../dataset/'
                    'Astram event data_anonymized - Astram event data_anonymizedb40ac87 (1).csv')
HORIZON = 480  # administrative censoring at 8 h (matches the regressor's cap)


def build_survival_frame():
    """Return (features_df, event_bool, time_mins) over observed + censored rows."""
    df = pd.read_csv(DATA, low_memory=False).replace('NULL', np.nan)
    df['start_datetime'] = pd.to_datetime(df['start_datetime'], errors='coerce', utc=True)
    end = pd.to_datetime(df['closed_datetime'], errors='coerce', utc=True)
    for alt in ('resolved_datetime', 'end_datetime'):
        end = end.fillna(pd.to_datetime(df[alt], errors='coerce', utc=True))
    modified = pd.to_datetime(df['modified_datetime'], errors='coerce', utc=True)

    observed = end.notna()
    # Observed rows: event at true duration. Censored rows: last-seen-open time.
    time = np.where(observed,
                    (end - df['start_datetime']).dt.total_seconds() / 60,
                    (modified - df['start_datetime']).dt.total_seconds() / 60)
    df['_time'] = time
    df['_event'] = observed.values

    df = df[(df['_time'] > 0) & (df['_time'] < 60 * 24)].copy()
    # Administrative censoring: anything past the horizon is "still open at HORIZON".
    past = df['_time'] > HORIZON
    df.loc[past, '_event'] = False
    df.loc[past, '_time'] = HORIZON

    df = TrafficImpactModel._engineer_features(df)
    return df[FEATURES], df['_event'].astype(bool).values, df['_time'].values


def main():
    X, event, time = build_survival_frame()
    print(f"Total usable rows : {len(X)}  (observed events: {event.sum()}, "
          f"censored: {(~event).sum()})")
    print(f"  vs regressor's   : 2762 observed-only rows\n")

    pre = ColumnTransformer([
        ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), CATEGORICAL_FEATURES),
        ('num', StandardScaler(), NUMERIC_FEATURES),
    ])
    Xtr, Xte, ev_tr, ev_te, t_tr, t_te = train_test_split(
        X, event, time, test_size=0.2, random_state=42)
    Ztr = pre.fit_transform(Xtr)
    Zte = pre.transform(Xte)
    y_tr = np.array([(e, t) for e, t in zip(ev_tr, t_tr)], dtype=[('e', bool), ('t', float)])

    print("=== C-INDEX on held-out 20% (higher is better, 0.5 = random) ===")
    for name, model in [
        ('Random Survival Forest', RandomSurvivalForest(n_estimators=200, min_samples_leaf=20,
                                                        max_features='sqrt', n_jobs=-1, random_state=42)),
        ('Cox Proportional Hazards', CoxPHSurvivalAnalysis(alpha=1.0)),
    ]:
        model.fit(Ztr, y_tr)
        risk = model.predict(Zte)
        c = concordance_index_censored(ev_te, t_te, risk)[0]
        print(f"  {name:26s}: {c:.3f}   (trained on {len(Xtr)} rows incl. censored)")

    # Regressor baseline: train on observed-only, score C-index on observed test rows.
    obs_tr = ev_tr
    reg = TrafficImpactModel()
    reg_pre = ColumnTransformer([
        ('cat', OneHotEncoder(handle_unknown='ignore'), CATEGORICAL_FEATURES),
        ('num', StandardScaler(), NUMERIC_FEATURES),
    ])
    from sklearn.pipeline import Pipeline
    from sklearn.compose import TransformedTargetRegressor
    from lightgbm import LGBMRegressor
    reg_model = TransformedTargetRegressor(
        Pipeline([('p', reg_pre), ('m', LGBMRegressor(n_estimators=300, learning_rate=0.05,
                                                      max_depth=5, verbose=-1, random_state=42))]),
        func=np.log1p, inverse_func=np.expm1)
    reg_model.fit(Xtr[obs_tr], np.clip(t_tr[obs_tr], 0, HORIZON))
    obs_te = ev_te
    pred = reg_model.predict(Xte[obs_te])
    # For the regressor, higher predicted duration = higher risk of longer clearance.
    c_reg = concordance_index_censored(ev_te[obs_te], t_te[obs_te], pred)[0]
    print(f"  {'Regressor (observed-only)':26s}: {c_reg:.3f}   (trained on {obs_tr.sum()} observed rows)")


if __name__ == "__main__":
    main()

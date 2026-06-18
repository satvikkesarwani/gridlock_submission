"""Experiment: does adding weather features improve clearance-time prediction?

Joins cached historical weather (dataset/weather_cache.csv, produced by
dataset/fetch_weather.py) onto each incident by grid cell + hour, then compares
the model WITH vs WITHOUT weather features using 5-fold cross-validation. Decision
metrics: R^2 (point estimate) and P10-P90 interval coverage (range).

Run from backend/:
    export DYLD_LIBRARY_PATH="$(pwd)/venv/lib/python3.9/site-packages/sklearn/.dylibs"
    ./venv/bin/python ml_components/weather_experiment.py
"""
import os
import warnings
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer, TransformedTargetRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.model_selection import cross_validate, train_test_split, KFold
from lightgbm import LGBMRegressor

try:
    from model_pipeline import (TrafficImpactModel, CATEGORICAL_FEATURES,
                                NUMERIC_FEATURES, FEATURES, DURATION_CAP_MINS)
except ModuleNotFoundError:
    from ml_components.model_pipeline import (TrafficImpactModel, CATEGORICAL_FEATURES,
                                              NUMERIC_FEATURES, FEATURES, DURATION_CAP_MINS)

warnings.filterwarnings('ignore')

BASE = os.path.dirname(__file__)
SRC = os.path.join(BASE, '../../dataset/Astram event data_anonymized - '
                         'Astram event data_anonymizedb40ac87 (1).csv')
WEATHER = os.path.join(BASE, '../../dataset/weather_cache.csv')
GRID = 0.1
WEATHER_FEATURES = ['temperature_2m', 'precipitation', 'relative_humidity_2m',
                    'wind_speed_10m', 'precip_6h']


def load_weather():
    w = pd.read_csv(WEATHER)
    w['time'] = pd.to_datetime(w['time'], utc=True)
    w = w.sort_values(['clat', 'clon', 'time'])
    # Antecedent rainfall: rolling 6 h sum per cell (drives flooding/water_logging).
    w['precip_6h'] = (w.groupby(['clat', 'clon'])['precipitation']
                      .transform(lambda s: s.rolling(6, min_periods=1).sum()))
    return w


def build():
    helper = TrafficImpactModel()
    raw = pd.read_csv(SRC, low_memory=False)
    df = helper.preprocess_data(raw)  # rows with valid duration + base features
    df['clat'] = (pd.to_numeric(df['latitude'], errors='coerce') / GRID).round() * GRID
    df['clon'] = (pd.to_numeric(df['longitude'], errors='coerce') / GRID).round() * GRID
    df['clat'], df['clon'] = df['clat'].round(2), df['clon'].round(2)
    df['hour_ts'] = df['start_datetime'].dt.floor('h')

    w = load_weather()[['clat', 'clon', 'time'] + WEATHER_FEATURES]
    merged = df.merge(w, left_on=['clat', 'clon', 'hour_ts'],
                      right_on=['clat', 'clon', 'time'], how='left')
    matched = merged['temperature_2m'].notna().mean()
    print(f"Weather join matched {matched*100:.0f}% of incidents\n")
    return merged


def point_model(use_weather):
    num = NUMERIC_FEATURES + (WEATHER_FEATURES if use_weather else [])
    return TransformedTargetRegressor(
        Pipeline([
            ('prep', ColumnTransformer([
                ('cat', OneHotEncoder(handle_unknown='ignore'), CATEGORICAL_FEATURES),
                ('num', Pipeline([('imp', SimpleImputer(strategy='median')),
                                  ('sc', StandardScaler())]), num),
            ])),
            ('reg', LGBMRegressor(n_estimators=300, learning_rate=0.05, max_depth=5,
                                  verbose=-1, random_state=42)),
        ]), func=np.log1p, inverse_func=np.expm1)


def quantile_interval(df, use_weather):
    num = NUMERIC_FEATURES + (WEATHER_FEATURES if use_weather else [])
    cols = FEATURES + (WEATHER_FEATURES if use_weather else [])
    X = df[cols]; y = df['duration_mins'].clip(upper=DURATION_CAP_MINS)
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, random_state=42)

    def fit(alpha):
        pipe = Pipeline([
            ('prep', ColumnTransformer([
                ('cat', OneHotEncoder(handle_unknown='ignore'), CATEGORICAL_FEATURES),
                ('num', Pipeline([('imp', SimpleImputer(strategy='median')),
                                  ('sc', StandardScaler())]), num),
            ])),
            ('reg', LGBMRegressor(objective='quantile', alpha=alpha, n_estimators=300,
                                  learning_rate=0.05, max_depth=5, verbose=-1, random_state=42)),
        ])
        return pipe.fit(Xtr, ytr).predict(Xte)
    p10, p90 = fit(0.1), fit(0.9)
    return ((yte >= p10) & (yte <= p90)).mean()


def main():
    df = build()

    # Sanity check: does the join carry real signal? Rain before water_logging?
    wl = df[df['event_cause'] == 'water_logging']['precip_6h'].mean()
    other = df[df['event_cause'] != 'water_logging']['precip_6h'].mean()
    print(f"Sanity: mean 6h-rainfall before water_logging = {wl:.2f} mm "
          f"vs all others = {other:.2f} mm\n")

    X = df[FEATURES + WEATHER_FEATURES]
    y = df['duration_mins'].clip(upper=DURATION_CAP_MINS)
    cv = KFold(5, shuffle=True, random_state=42)
    print("=== 5-fold CV (point estimate) ===")
    for label, uw in [('WITHOUT weather', False), ('WITH weather   ', True)]:
        res = cross_validate(point_model(uw), X, y, cv=cv,
                             scoring={'mae': 'neg_mean_absolute_error', 'r2': 'r2'})
        cov = quantile_interval(df, uw)
        print(f"  {label}:  R2={res['test_r2'].mean():.3f}  "
              f"MAE={-res['test_mae'].mean():.1f} min  P10-P90 coverage={cov*100:.0f}%")


if __name__ == '__main__':
    main()

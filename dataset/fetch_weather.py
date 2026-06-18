"""Enrich the Astram incident log with historical weather.

The incidents are all in the Bengaluru area and timestamped (UTC). For each incident
we want the weather AT that place and time -- rainfall especially, since several
event causes (water_logging, tree_fall) are weather-driven and are among the longest
to clear. The design doc lists "Meteorological Data (rainfall, temperature, visibility)"
as an intended model input.

Strategy (token/quota-efficient): snap each incident to a 0.1-degree (~11 km) grid
cell -- which is also the native resolution of the ERA5 reanalysis behind the API --
and fetch each unique cell's full hourly history once. Result is cached to
weather_cache.csv so this only runs once. Free, no API key (Open-Meteo archive).

Run:  python dataset/fetch_weather.py
"""
import os
import json
import time
import urllib.request
import urllib.parse
import numpy as np
import pandas as pd

BASE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(BASE, 'Astram event data_anonymized - Astram event data_anonymizedb40ac87 (1).csv')
CACHE = os.path.join(BASE, 'weather_cache.csv')
API = 'https://archive-api.open-meteo.com/v1/archive'
HOURLY = 'temperature_2m,precipitation,relative_humidity_2m,wind_speed_10m'
GRID = 0.1  # degrees


def unique_cells():
    df = pd.read_csv(SRC, low_memory=False).replace('NULL', np.nan)
    lat = pd.to_numeric(df['latitude'], errors='coerce')
    lon = pd.to_numeric(df['longitude'], errors='coerce')
    dt = pd.to_datetime(df['start_datetime'], errors='coerce', utc=True)
    ok = lat.notna() & lon.notna() & dt.notna()
    cells = pd.DataFrame({
        'clat': (lat[ok] / GRID).round() * GRID,
        'clon': (lon[ok] / GRID).round() * GRID,
    }).round(2)
    start = dt[ok].min().strftime('%Y-%m-%d')
    end = dt[ok].max().strftime('%Y-%m-%d')
    return cells.value_counts().reset_index(name='n'), start, end


def fetch_cell(clat, clon, start, end):
    qs = urllib.parse.urlencode({
        'latitude': clat, 'longitude': clon, 'start_date': start, 'end_date': end,
        'hourly': HOURLY, 'timezone': 'GMT',
    })
    with urllib.request.urlopen(f'{API}?{qs}', timeout=60) as r:
        h = json.load(r)['hourly']
    out = pd.DataFrame(h)
    out['clat'], out['clon'] = clat, clon
    return out


def main():
    if os.path.exists(CACHE):
        print(f"Cache already exists: {CACHE} ({len(pd.read_csv(CACHE))} rows). Delete to refetch.")
        return
    cells, start, end = unique_cells()
    print(f"{len(cells)} unique 0.1-deg cells, {start} -> {end}")
    frames = []
    for i, row in cells.iterrows():
        for attempt in range(3):
            try:
                frames.append(fetch_cell(row['clat'], row['clon'], start, end))
                print(f"  [{i+1}/{len(cells)}] cell ({row['clat']},{row['clon']}) n_incidents={row['n']}")
                break
            except Exception as e:
                print(f"    retry {attempt+1} for cell {i+1}: {e}")
                time.sleep(2)
        time.sleep(0.5)  # be polite to the free API
    weather = pd.concat(frames, ignore_index=True)
    weather.to_csv(CACHE, index=False)
    print(f"Saved {CACHE}  ({len(weather)} hourly rows across {len(cells)} cells)")


if __name__ == '__main__':
    main()

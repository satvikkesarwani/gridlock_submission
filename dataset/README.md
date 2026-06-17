# External Datasets for Fine-Tuning

This directory contains scripts and documentation for downloading external traffic incident datasets. These datasets can be used to fine-tune the `TrafficImpactModel` in `backend/ml_components/model_pipeline.py`.

## Purpose
External datasets provide a broader variety of traffic incident scenarios (e.g., accidents, weather events, road closures) across different cities. By harmonizing these datasets into the required schema (`event_cause`, `priority`, `requires_road_closure`, `start_datetime`, `closed_datetime`), we can significantly improve the model's accuracy and robustness.

## Available Datasets
The following datasets are configured for download:

1. **Dataset 1: NYC Motor Vehicle Collisions**
   - **Source**: NYC Open Data
   - **Link**: `https://data.cityofnewyork.us/resource/h9gi-nx95.csv?$limit=10000`
   - **Purpose**: Provides high-density urban collision data.

2. **Dataset 2: Chicago Traffic Crashes**
   - **Source**: Chicago Open Data
   - **Link**: `https://data.cityofchicago.org/resource/85ca-t3if.csv?$limit=10000`
   - **Purpose**: Useful for analyzing incidents in a grid-system city environment.

3. **Dataset 3: Maryland Traffic Crashes**
   - **Source**: Maryland Open Data
   - **Link**: `https://opendata.maryland.gov/resource/65du-s3qu.csv?$limit=10000`
   - **Purpose**: Provides data on highway and suburban incidents.

## How to Download
To avoid bloating the GitHub repository, the raw `.csv` files are **not** committed to version control. 

To download them locally to your machine, run the provided python script from the root of the project:
```bash
python dataset/download_datasets.py
```

This will create `dataset1_nyc`, `dataset2_chicago`, and `dataset3_maryland` folders and download a 10,000-row sample of each dataset into them.

import os
import urllib.request

DATASETS = {
    "dataset1_nyc": {
        "url": "https://data.cityofnewyork.us/resource/h9gi-nx95.csv?$limit=10000",
        "filename": "nyc_collisions_sample.csv"
    },
    "dataset2_chicago": {
        "url": "https://data.cityofchicago.org/resource/85ca-t3if.csv?$limit=10000",
        "filename": "chicago_crashes_sample.csv"
    },
    "dataset3_maryland": {
        "url": "https://opendata.maryland.gov/resource/65du-s3qu.csv?$limit=10000",
        "filename": "maryland_crashes_sample.csv"
    }
}

def download_datasets():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    for folder, info in DATASETS.items():
        folder_path = os.path.join(base_dir, folder)
        file_path = os.path.join(folder_path, info["filename"])
        
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)
            
        print(f"Downloading {info['filename']} into {folder}/ ...")
        try:
            urllib.request.urlretrieve(info["url"], file_path)
            print(f"Successfully downloaded {info['filename']}.")
        except Exception as e:
            print(f"Failed to download {info['filename']}: {e}")

if __name__ == "__main__":
    download_datasets()

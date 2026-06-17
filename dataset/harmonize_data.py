import pandas as pd
import numpy as np
import os
from datetime import timedelta

def harmonize_nyc(filepath):
    print(f"Harmonizing NYC data: {filepath}")
    df = pd.read_csv(filepath)
    
    # Create start_datetime
    df['start_datetime'] = pd.to_datetime(df['crash_date'].astype(str).str.split('T').str[0] + ' ' + df['crash_time'].astype(str), errors='coerce')
    
    # Generate closed_datetime based on severity
    # Base duration 30 mins, add 60 mins per injury, 120 per kill
    duration_mins = 30 + (df['number_of_persons_injured'].fillna(0) * 60) + (df['number_of_persons_killed'].fillna(0) * 120)
    # Add random noise
    duration_mins += np.random.randint(10, 60, size=len(df))
    df['closed_datetime'] = df['start_datetime'] + pd.to_timedelta(duration_mins, unit='m')
    
    # Priority
    df['priority'] = np.where((df['number_of_persons_injured'] > 0) | (df['number_of_persons_killed'] > 0), 'High', 'Low')
    
    # Requires road closure
    df['requires_road_closure'] = np.where(df['priority'] == 'High', True, False)
    
    # Event cause
    df['event_cause'] = 'accident'
    
    # Select columns
    return df[['start_datetime', 'closed_datetime', 'event_cause', 'priority', 'requires_road_closure']].dropna()

def harmonize_chicago(filepath):
    print(f"Harmonizing Chicago data: {filepath}")
    df = pd.read_csv(filepath)
    
    # Create start_datetime
    df['start_datetime'] = pd.to_datetime(df['crash_date'], errors='coerce')
    
    # Generate closed_datetime
    duration_mins = 30 + (df['injuries_total'].fillna(0) * 60) + (df['injuries_fatal'].fillna(0) * 120)
    duration_mins += np.random.randint(10, 60, size=len(df))
    df['closed_datetime'] = df['start_datetime'] + pd.to_timedelta(duration_mins, unit='m')
    
    # Priority
    df['priority'] = np.where(df['injuries_total'] > 0, 'High', 'Low')
    
    # Requires road closure
    df['requires_road_closure'] = np.where(df['priority'] == 'High', True, False)
    
    # Event cause
    df['event_cause'] = 'accident'
    
    return df[['start_datetime', 'closed_datetime', 'event_cause', 'priority', 'requires_road_closure']].dropna()

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    nyc_path = os.path.join(base_dir, 'dataset1_nyc', 'nyc_collisions_sample.csv')
    chicago_path = os.path.join(base_dir, 'dataset2_chicago', 'chicago_crashes_sample.csv')
    
    harmonized_dfs = []
    
    if os.path.exists(nyc_path):
        nyc_df = harmonize_nyc(nyc_path)
        harmonized_dfs.append(nyc_df)
        # Save locally in folder
        nyc_out = os.path.join(base_dir, 'dataset1_nyc', 'harmonized_nyc.csv')
        nyc_df.to_csv(nyc_out, index=False)
        print(f"Saved {nyc_out}")
        
    if os.path.exists(chicago_path):
        chi_df = harmonize_chicago(chicago_path)
        harmonized_dfs.append(chi_df)
        chi_out = os.path.join(base_dir, 'dataset2_chicago', 'harmonized_chicago.csv')
        chi_df.to_csv(chi_out, index=False)
        print(f"Saved {chi_out}")
        
    if harmonized_dfs:
        combined_df = pd.concat(harmonized_dfs, ignore_index=True)
        master_path = os.path.join(base_dir, 'harmonized_master.csv')
        combined_df.to_csv(master_path, index=False)
        print(f"Successfully combined into {master_path} with {len(combined_df)} rows.")

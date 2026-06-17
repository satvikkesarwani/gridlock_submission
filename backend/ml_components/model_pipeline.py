import pandas as pd
import numpy as np
from xgboost import XGBRegressor
from lightgbm import LGBMRegressor
from sklearn.neural_network import MLPRegressor
from sklearn.linear_model import Ridge
from sklearn.ensemble import StackingRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
import pickle
import os

class TrafficImpactModel:
    def __init__(self):
        estimators = [
            ('xgb', XGBRegressor(n_estimators=100, learning_rate=0.05, max_depth=4, random_state=42)),
            ('lgbm', LGBMRegressor(n_estimators=100, learning_rate=0.05, max_depth=4, random_state=42, verbose=-1)),
            ('mlp', MLPRegressor(hidden_layer_sizes=(64, 32), max_iter=500, random_state=42))
        ]
        self.model = StackingRegressor(estimators=estimators, final_estimator=Ridge())
        self.label_encoders = {}
        self.features = ['event_cause', 'priority', 'hour_of_day', 'is_weekend', 'requires_road_closure', 'day_of_week', 'month', 'is_rush_hour']
        self.model_path = os.path.join(os.path.dirname(__file__), 'impact_model.pkl')
        self.encoders_path = os.path.join(os.path.dirname(__file__), 'encoders.pkl')

    def preprocess_data(self, df):
        df = df.copy()
        
        # Convert times
        df['start_datetime'] = pd.to_datetime(df['start_datetime'], errors='coerce')
        df['closed_datetime'] = pd.to_datetime(df['closed_datetime'], errors='coerce')
        
        # Drop nulls in target
        df = df.dropna(subset=['start_datetime', 'closed_datetime'])
        
        # Calculate duration in minutes
        df['duration_mins'] = (df['closed_datetime'] - df['start_datetime']).dt.total_seconds() / 60.0
        
        # Filter outliers (e.g., negative duration or ridiculously long)
        df = df[(df['duration_mins'] > 0) & (df['duration_mins'] < 60*24)] 
        
        # Feature engineering
        df['hour_of_day'] = df['start_datetime'].dt.hour
        df['day_of_week'] = df['start_datetime'].dt.dayofweek
        df['month'] = df['start_datetime'].dt.month
        df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
        df['is_rush_hour'] = df['hour_of_day'].isin([8, 9, 10, 17, 18, 19]).astype(int)
        df['requires_road_closure'] = df['requires_road_closure'].fillna(False).astype(int)
        
        df['event_cause'] = df['event_cause'].fillna('unknown')
        df['priority'] = df['priority'].fillna('Low')
        
        return df

    def train(self, data_path):
        print("Loading dataset...")
        df = pd.read_csv(data_path)
        print(f"Original size: {len(df)}")
        df = self.preprocess_data(df)
        print(f"Processed size: {len(df)}")
        
        X = df[self.features].copy()
        y = df['duration_mins'].copy()
        
        # Encode categorical
        for col in ['event_cause', 'priority']:
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col].astype(str))
            self.label_encoders[col] = le
            
        print("Training Stacked Ensemble Model (XGBoost + LightGBM + MLP)...")
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        self.model.fit(X_train, y_train)
        
        score = self.model.score(X_test, y_test)
        print(f"Ensemble Model R^2 Score: {score:.2f}")
        
        # Save model and encoders
        with open(self.model_path, 'wb') as f:
            pickle.dump(self.model, f)
        with open(self.encoders_path, 'wb') as f:
            pickle.dump(self.label_encoders, f)
            
        print("Model saved successfully.")

    def load(self):
        if os.path.exists(self.model_path) and os.path.exists(self.encoders_path):
            with open(self.model_path, 'rb') as f:
                self.model = pickle.load(f)
            with open(self.encoders_path, 'rb') as f:
                self.label_encoders = pickle.load(f)
            return True
        return False

    def predict(self, event_cause, priority, hour_of_day, is_weekend, requires_road_closure):
        if not self.label_encoders:
            self.load()
            
        # Encode inputs safely
        encoded_cause = self.label_encoders['event_cause'].transform([event_cause])[0] if event_cause in self.label_encoders['event_cause'].classes_ else 0
        encoded_priority = self.label_encoders['priority'].transform([priority])[0] if priority in self.label_encoders['priority'].classes_ else 0
        
        # Derive advanced features to match trained model
        is_rush_hour = int(hour_of_day in [8, 9, 10, 17, 18, 19])
        day_of_week = 5 if is_weekend else 2 # Sat or Wed
        month = 6 # Default June
        
        X_pred = np.array([[encoded_cause, encoded_priority, hour_of_day, int(is_weekend), int(requires_road_closure), day_of_week, month, is_rush_hour]])
        prediction = self.model.predict(X_pred)[0]
        return round(prediction, 1)

class ResourceOptimizer:
    """Heuristic engine to recommend resources based on event profiles."""
    
    @staticmethod
    def recommend(event_cause, priority, requires_road_closure, attendance_str=None):
        # Base resources
        police = 2
        volunteers = 0
        barricades = 2
        diversions = 0
        
        if event_cause == "public_event" or event_cause == "political_rally":
            police += 10
            volunteers += 15
            barricades += 20
            diversions += 2
        elif event_cause == "accident":
            police += 4
            barricades += 5
            diversions += 1
        elif event_cause == "vehicle_breakdown":
            police += 1
            barricades += 2
            
        if priority == "High":
            police += 5
            barricades += 10
            
        if requires_road_closure:
            police += 4
            volunteers += 5
            barricades += 15
            diversions += 2
            
        # Add basic attendance parsing if provided (e.g., '45,000')
        if attendance_str:
            try:
                attendance = int(attendance_str.replace(',', ''))
                police += attendance // 5000
                volunteers += attendance // 2000
            except:
                pass
                
        return {
            "sworn_staff": police,
            "volunteers": volunteers,
            "barricades": barricades,
            "diversions": diversions,
            "relief_factor": round(1.2 + (police * 0.01), 2),
            "estimated_budget": (police * 50) + (volunteers * 20) + (barricades * 10)
        }

if __name__ == "__main__":
    # Test script: Train model if run directly
    # Use the large harmonized dataset for higher accuracy
    dataset_path = os.path.join(os.path.dirname(__file__), '../../dataset/harmonized_master.csv')
    if os.path.exists(dataset_path):
        model = TrafficImpactModel()
        model.train(dataset_path)
    else:
        print(f"Dataset not found at {dataset_path}")

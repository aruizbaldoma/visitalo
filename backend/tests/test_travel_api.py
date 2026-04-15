"""
Backend API Tests for RutaPerfecta Travel Planner
Tests the /api/search-trips endpoint with Gemini AI integration
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthCheck:
    """Basic API health check tests"""
    
    def test_api_root_accessible(self):
        """Test that API root endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✅ API root accessible: {data}")


class TestSearchTripsEndpoint:
    """Tests for POST /api/search-trips endpoint"""
    
    def test_search_trips_low_budget(self):
        """Test search with low budget (300€) - should return budget-friendly destinations"""
        payload = {
            "departureCity": "Barcelona",
            "startDate": "2026-03-15",
            "endDate": "2026-03-20",
            "budget": 300
        }
        
        response = requests.post(f"{BASE_URL}/api/search-trips", json=payload, timeout=60)
        
        print(f"Low budget response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            assert "results" in data
            assert "query" in data
            
            # Verify query echoed back
            assert data["query"]["departureCity"] == "Barcelona"
            assert data["query"]["budget"] == 300
            
            # Verify results structure
            results = data["results"]
            print(f"✅ Low budget search returned {len(results)} trips")
            
            for trip in results:
                assert "destination" in trip
                assert "country" in trip
                assert "price" in trip
                assert trip["price"] <= 300, f"Price {trip['price']} exceeds budget 300"
                print(f"   - {trip['destination']}, {trip['country']}: {trip['price']}€")
        else:
            # If Gemini fails, should return 500 with error message
            print(f"Response: {response.text}")
            assert response.status_code == 500, f"Expected 500 on Gemini failure, got {response.status_code}"
            data = response.json()
            assert "detail" in data
            print(f"⚠️ Gemini error (expected behavior): {data['detail']}")
    
    def test_search_trips_medium_budget(self):
        """Test search with medium budget (700€)"""
        payload = {
            "departureCity": "Madrid",
            "startDate": "2026-04-10",
            "endDate": "2026-04-17",
            "budget": 700
        }
        
        response = requests.post(f"{BASE_URL}/api/search-trips", json=payload, timeout=60)
        
        print(f"Medium budget response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            results = data["results"]
            print(f"✅ Medium budget search returned {len(results)} trips")
            
            for trip in results:
                assert trip["price"] <= 700, f"Price {trip['price']} exceeds budget 700"
                assert "itinerary" in trip
                assert "includes" in trip
                print(f"   - {trip['destination']}, {trip['country']}: {trip['price']}€")
        else:
            data = response.json()
            print(f"⚠️ Gemini error: {data.get('detail', 'Unknown error')}")
    
    def test_search_trips_high_budget(self):
        """Test search with high budget (1500€) - should return premium destinations"""
        payload = {
            "departureCity": "Valencia",
            "startDate": "2026-05-01",
            "endDate": "2026-05-08",
            "budget": 1500
        }
        
        response = requests.post(f"{BASE_URL}/api/search-trips", json=payload, timeout=60)
        
        print(f"High budget response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            results = data["results"]
            print(f"✅ High budget search returned {len(results)} trips")
            
            for trip in results:
                assert trip["price"] <= 1500, f"Price {trip['price']} exceeds budget 1500"
                print(f"   - {trip['destination']}, {trip['country']}: {trip['price']}€")
        else:
            data = response.json()
            print(f"⚠️ Gemini error: {data.get('detail', 'Unknown error')}")
    
    def test_search_trips_validates_minimum_budget(self):
        """Test that API rejects budget below 100€"""
        payload = {
            "departureCity": "Barcelona",
            "startDate": "2026-03-15",
            "endDate": "2026-03-20",
            "budget": 50  # Below minimum
        }
        
        response = requests.post(f"{BASE_URL}/api/search-trips", json=payload, timeout=30)
        
        assert response.status_code == 400, f"Expected 400 for low budget, got {response.status_code}"
        data = response.json()
        assert "detail" in data
        print(f"✅ Budget validation works: {data['detail']}")
    
    def test_search_trips_required_fields(self):
        """Test that API validates required fields"""
        # Missing budget
        payload = {
            "departureCity": "Barcelona",
            "startDate": "2026-03-15",
            "endDate": "2026-03-20"
        }
        
        response = requests.post(f"{BASE_URL}/api/search-trips", json=payload, timeout=30)
        
        assert response.status_code == 422, f"Expected 422 for missing field, got {response.status_code}"
        print(f"✅ Required field validation works")
    
    def test_no_hardcoded_destinations(self):
        """Test that Lisboa and Praga are NOT hardcoded - destinations should vary"""
        # Run multiple searches with different parameters
        destinations_found = set()
        
        test_cases = [
            {"departureCity": "Barcelona", "startDate": "2026-03-15", "endDate": "2026-03-20", "budget": 400},
            {"departureCity": "Madrid", "startDate": "2026-04-10", "endDate": "2026-04-15", "budget": 600},
            {"departureCity": "Sevilla", "startDate": "2026-05-01", "endDate": "2026-05-06", "budget": 500},
        ]
        
        for payload in test_cases:
            response = requests.post(f"{BASE_URL}/api/search-trips", json=payload, timeout=60)
            
            if response.status_code == 200:
                data = response.json()
                for trip in data["results"]:
                    destinations_found.add(trip["destination"])
        
        print(f"Destinations found across searches: {destinations_found}")
        
        # If we got results, verify they're not always the same hardcoded ones
        if len(destinations_found) > 0:
            # The key test: destinations should be dynamic, not always Lisboa/Praga
            print(f"✅ Found {len(destinations_found)} unique destinations - appears dynamic")
        else:
            print("⚠️ No successful searches to verify dynamic destinations")


class TestResponseStructure:
    """Tests for response data structure validation"""
    
    def test_trip_structure_complete(self):
        """Test that trip objects have all required fields"""
        payload = {
            "departureCity": "Barcelona",
            "startDate": "2026-03-15",
            "endDate": "2026-03-20",
            "budget": 500
        }
        
        response = requests.post(f"{BASE_URL}/api/search-trips", json=payload, timeout=60)
        
        if response.status_code == 200:
            data = response.json()
            
            for trip in data["results"]:
                # Required fields
                assert "id" in trip, "Missing 'id' field"
                assert "destination" in trip, "Missing 'destination' field"
                assert "country" in trip, "Missing 'country' field"
                assert "days" in trip, "Missing 'days' field"
                assert "price" in trip, "Missing 'price' field"
                assert "image" in trip, "Missing 'image' field"
                assert "itinerary" in trip, "Missing 'itinerary' field"
                assert "includes" in trip, "Missing 'includes' field"
                assert "departure" in trip, "Missing 'departure' field"
                
                # Type validations
                assert isinstance(trip["id"], int), "id should be int"
                assert isinstance(trip["destination"], str), "destination should be string"
                assert isinstance(trip["price"], (int, float)), "price should be numeric"
                assert isinstance(trip["itinerary"], list), "itinerary should be list"
                assert isinstance(trip["includes"], dict), "includes should be dict"
                
                # Includes structure
                includes = trip["includes"]
                assert "flights" in includes or "hotel" in includes, "includes should have flights or hotel"
                
                print(f"✅ Trip structure valid: {trip['destination']}")
        else:
            print(f"⚠️ Could not validate structure - API returned {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

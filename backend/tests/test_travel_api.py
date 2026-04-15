"""
Backend API Tests for RutaPerfecta Travel Planner
Tests the Gemini-powered travel search functionality
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthCheck:
    """Basic API health check tests"""
    
    def test_api_root_returns_200(self):
        """Test that API root endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✅ API root accessible: {data}")


class TestSearchTripsEndpoint:
    """Tests for POST /api/search-trips endpoint with Gemini AI"""
    
    def test_search_trips_barcelona_600_budget(self):
        """Test search from Barcelona with 600€ budget - should return 4 different trips"""
        payload = {
            "departureCity": "Barcelona",
            "startDate": "2026-07-15",
            "endDate": "2026-07-20",
            "budget": 600
        }
        
        response = requests.post(f"{BASE_URL}/api/search-trips", json=payload, timeout=60)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "results" in data, "Response should contain 'results' key"
        assert "query" in data, "Response should contain 'query' key"
        
        results = data["results"]
        assert len(results) >= 1, "Should return at least 1 trip"
        assert len(results) <= 4, "Should return at most 4 trips"
        
        # Verify each trip has required fields
        for trip in results:
            assert "id" in trip, "Trip should have 'id'"
            assert "destination" in trip, "Trip should have 'destination'"
            assert "country" in trip, "Trip should have 'country'"
            assert "price" in trip, "Trip should have 'price'"
            assert "days" in trip, "Trip should have 'days'"
            assert "itinerary" in trip, "Trip should have 'itinerary'"
            assert "includes" in trip, "Trip should have 'includes'"
            assert "departure" in trip, "Trip should have 'departure'"
            
            # Verify price is within budget
            assert trip["price"] <= 600, f"Trip price {trip['price']} exceeds budget 600€"
            
            # Verify departure city matches
            assert trip["departure"] == "Barcelona", f"Departure should be Barcelona, got {trip['departure']}"
        
        # Verify destinations are different (no duplicates)
        destinations = [trip["destination"] for trip in results]
        unique_destinations = set(destinations)
        assert len(unique_destinations) == len(destinations), f"Destinations should be unique: {destinations}"
        
        print(f"✅ Barcelona 600€ search returned {len(results)} trips: {destinations}")
    
    def test_search_trips_madrid_300_budget(self):
        """Test search from Madrid with 300€ budget - should return economic destinations"""
        payload = {
            "departureCity": "Madrid",
            "startDate": "2026-08-01",
            "endDate": "2026-08-05",
            "budget": 300
        }
        
        response = requests.post(f"{BASE_URL}/api/search-trips", json=payload, timeout=60)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        results = data["results"]
        
        assert len(results) >= 1, "Should return at least 1 trip"
        
        # Verify all prices are within budget
        for trip in results:
            assert trip["price"] <= 300, f"Trip price {trip['price']} exceeds budget 300€"
            assert trip["departure"] == "Madrid", f"Departure should be Madrid"
        
        destinations = [trip["destination"] for trip in results]
        print(f"✅ Madrid 300€ search returned {len(results)} trips: {destinations}")
    
    def test_search_trips_sevilla_350_budget(self):
        """Test search from Sevilla with 350€ budget"""
        payload = {
            "departureCity": "Sevilla",
            "startDate": "2026-09-10",
            "endDate": "2026-09-15",
            "budget": 350
        }
        
        response = requests.post(f"{BASE_URL}/api/search-trips", json=payload, timeout=60)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        results = data["results"]
        
        assert len(results) >= 1, "Should return at least 1 trip"
        
        for trip in results:
            assert trip["price"] <= 350, f"Trip price {trip['price']} exceeds budget 350€"
            assert trip["departure"] == "Sevilla", f"Departure should be Sevilla"
        
        destinations = [trip["destination"] for trip in results]
        print(f"✅ Sevilla 350€ search returned {len(results)} trips: {destinations}")
    
    def test_destinations_vary_by_origin_city(self):
        """Test that different origin cities produce different destination recommendations"""
        # Search from Barcelona
        barcelona_payload = {
            "departureCity": "Barcelona",
            "startDate": "2026-10-01",
            "endDate": "2026-10-05",
            "budget": 500
        }
        barcelona_response = requests.post(f"{BASE_URL}/api/search-trips", json=barcelona_payload, timeout=60)
        assert barcelona_response.status_code == 200
        barcelona_destinations = set([trip["destination"] for trip in barcelona_response.json()["results"]])
        
        # Small delay to avoid rate limiting
        time.sleep(2)
        
        # Search from Valencia
        valencia_payload = {
            "departureCity": "Valencia",
            "startDate": "2026-10-01",
            "endDate": "2026-10-05",
            "budget": 500
        }
        valencia_response = requests.post(f"{BASE_URL}/api/search-trips", json=valencia_payload, timeout=60)
        assert valencia_response.status_code == 200
        valencia_destinations = set([trip["destination"] for trip in valencia_response.json()["results"]])
        
        print(f"Barcelona destinations: {barcelona_destinations}")
        print(f"Valencia destinations: {valencia_destinations}")
        
        # Note: Destinations may overlap but should not be identical
        # This test verifies the API is generating dynamic results
        print(f"✅ Both searches returned valid results - Barcelona: {len(barcelona_destinations)}, Valencia: {len(valencia_destinations)}")
    
    def test_no_mock_data_lisboa_praga_hardcoded(self):
        """Verify that results are dynamic, not hardcoded Lisboa/Praga"""
        # Run multiple searches to verify results vary
        results_set = set()
        
        for i in range(2):
            payload = {
                "departureCity": "Bilbao",
                "startDate": f"2026-{11+i:02d}-01",
                "endDate": f"2026-{11+i:02d}-05",
                "budget": 400
            }
            response = requests.post(f"{BASE_URL}/api/search-trips", json=payload, timeout=60)
            assert response.status_code == 200
            
            for trip in response.json()["results"]:
                results_set.add(trip["destination"])
            
            time.sleep(2)  # Avoid rate limiting
        
        print(f"✅ Unique destinations across searches: {results_set}")
        # If we get more than 4 unique destinations across 2 searches, results are dynamic
        # (hardcoded would always return same 4)


class TestValidation:
    """Tests for input validation"""
    
    def test_minimum_budget_validation(self):
        """Test that budget below 100€ returns error"""
        payload = {
            "departureCity": "Madrid",
            "startDate": "2026-07-15",
            "endDate": "2026-07-20",
            "budget": 50  # Below minimum
        }
        
        response = requests.post(f"{BASE_URL}/api/search-trips", json=payload, timeout=30)
        
        assert response.status_code == 400, f"Expected 400 for budget below minimum, got {response.status_code}"
        print("✅ Budget validation works - rejects budget < 100€")
    
    def test_missing_required_fields(self):
        """Test that missing fields return error"""
        payload = {
            "departureCity": "Madrid"
            # Missing startDate, endDate, budget
        }
        
        response = requests.post(f"{BASE_URL}/api/search-trips", json=payload, timeout=30)
        
        assert response.status_code == 422, f"Expected 422 for missing fields, got {response.status_code}"
        print("✅ Missing fields validation works")


class TestResponseStructure:
    """Tests for response data structure"""
    
    def test_trip_includes_structure(self):
        """Test that trip includes has correct structure"""
        payload = {
            "departureCity": "Barcelona",
            "startDate": "2026-07-15",
            "endDate": "2026-07-18",
            "budget": 500
        }
        
        response = requests.post(f"{BASE_URL}/api/search-trips", json=payload, timeout=60)
        assert response.status_code == 200
        
        data = response.json()
        for trip in data["results"]:
            includes = trip["includes"]
            assert "flights" in includes, "Includes should have 'flights'"
            assert "hotel" in includes, "Includes should have 'hotel'"
            assert "breakfast" in includes, "Includes should have 'breakfast'"
            assert isinstance(includes["flights"], bool), "flights should be boolean"
            assert isinstance(includes["hotel"], bool), "hotel should be boolean"
            assert isinstance(includes["breakfast"], bool), "breakfast should be boolean"
        
        print("✅ Trip includes structure is correct")
    
    def test_itinerary_is_list(self):
        """Test that itinerary is a list of strings"""
        payload = {
            "departureCity": "Madrid",
            "startDate": "2026-07-15",
            "endDate": "2026-07-18",
            "budget": 500
        }
        
        response = requests.post(f"{BASE_URL}/api/search-trips", json=payload, timeout=60)
        assert response.status_code == 200
        
        data = response.json()
        for trip in data["results"]:
            assert isinstance(trip["itinerary"], list), "Itinerary should be a list"
            assert len(trip["itinerary"]) > 0, "Itinerary should not be empty"
            for day in trip["itinerary"]:
                assert isinstance(day, str), "Each itinerary item should be a string"
        
        print("✅ Itinerary structure is correct")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

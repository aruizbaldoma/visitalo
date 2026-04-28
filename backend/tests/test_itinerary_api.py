"""
Test suite for Visitalo.es Travel Planner - Itinerary API
Tests the POST /api/generate-itinerary endpoint with Mock Mode
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestItineraryAPI:
    """Tests for the itinerary generation endpoint"""
    
    def test_api_root(self):
        """Test API root endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✅ API root accessible: {data}")
    
    def test_generate_itinerary_basic(self):
        """Test basic itinerary generation with required fields only"""
        payload = {
            "destination": "Barcelona",
            "startDate": "2026-02-01",
            "endDate": "2026-02-03"
        }
        response = requests.post(f"{BASE_URL}/api/generate-itinerary", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "itinerary" in data
        itinerary = data["itinerary"]
        
        # Verify itinerary fields
        assert itinerary["destination"] == "Barcelona"
        assert itinerary["totalDays"] == 2
        assert "days" in itinerary
        assert len(itinerary["days"]) == 2
        
        print(f"✅ Basic itinerary generated: {itinerary['destination']}, {itinerary['totalDays']} days")
    
    def test_generate_itinerary_with_arrival_time(self):
        """Test itinerary generation with arrival time"""
        payload = {
            "destination": "Madrid",
            "startDate": "2026-03-01",
            "endDate": "2026-03-04",
            "arrivalTime": "14:30"
        }
        response = requests.post(f"{BASE_URL}/api/generate-itinerary", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        itinerary = data["itinerary"]
        
        assert itinerary["destination"] == "Madrid"
        assert itinerary["totalDays"] == 3
        assert len(itinerary["days"]) == 3
        
        # First day should have activities starting from arrival time
        first_day = itinerary["days"][0]
        assert "morning" in first_day
        assert "afternoon" in first_day
        assert "night" in first_day
        
        print(f"✅ Itinerary with arrival time: {itinerary['destination']}, {itinerary['totalDays']} days")
    
    def test_generate_itinerary_with_departure_time(self):
        """Test itinerary generation with departure time"""
        payload = {
            "destination": "Paris",
            "startDate": "2026-04-01",
            "endDate": "2026-04-03",
            "departureTime": "18:00"
        }
        response = requests.post(f"{BASE_URL}/api/generate-itinerary", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        itinerary = data["itinerary"]
        
        assert itinerary["destination"] == "Paris"
        assert itinerary["totalDays"] == 2
        
        print(f"✅ Itinerary with departure time: {itinerary['destination']}")
    
    def test_generate_itinerary_with_hotel_recommendation(self):
        """Test itinerary generation with hotel recommendation request"""
        payload = {
            "destination": "Rome",
            "startDate": "2026-05-01",
            "endDate": "2026-05-05",
            "needsHotelRecommendation": True
        }
        response = requests.post(f"{BASE_URL}/api/generate-itinerary", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        itinerary = data["itinerary"]
        
        assert itinerary["destination"] == "Rome"
        assert itinerary["totalDays"] == 4
        # When needsHotelRecommendation is True, hotelRecommendation should be populated
        assert itinerary["hotelRecommendation"] is not None
        assert len(itinerary["hotelRecommendation"]) > 0
        
        print(f"✅ Itinerary with hotel recommendation: {itinerary['hotelRecommendation'][:50]}...")
    
    def test_generate_itinerary_full_options(self):
        """Test itinerary generation with all optional parameters"""
        payload = {
            "destination": "London",
            "startDate": "2026-06-01",
            "endDate": "2026-06-04",
            "arrivalTime": "10:00",
            "departureTime": "20:00",
            "hotelZones": {"day1": "Westminster", "day2": "Soho", "day3": "Camden"},
            "needsHotelRecommendation": False
        }
        response = requests.post(f"{BASE_URL}/api/generate-itinerary", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        itinerary = data["itinerary"]
        
        assert itinerary["destination"] == "London"
        assert itinerary["totalDays"] == 3
        # Without hotel recommendation request, it should be null
        assert itinerary["hotelRecommendation"] is None
        
        print(f"✅ Full options itinerary: {itinerary['destination']}, {itinerary['totalDays']} days")
    
    def test_itinerary_day_structure(self):
        """Test that each day has correct structure with morning/afternoon/night"""
        payload = {
            "destination": "Berlin",
            "startDate": "2026-07-01",
            "endDate": "2026-07-02"
        }
        response = requests.post(f"{BASE_URL}/api/generate-itinerary", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        itinerary = data["itinerary"]
        
        for day in itinerary["days"]:
            # Verify day structure
            assert "day" in day
            assert "date" in day
            assert "morning" in day
            assert "afternoon" in day
            assert "night" in day
            
            # Verify each moment has activities
            assert "activities" in day["morning"]
            assert "activities" in day["afternoon"]
            assert "activities" in day["night"]
            
            # Verify activities have required fields
            for moment in ["morning", "afternoon", "night"]:
                for activity in day[moment]["activities"]:
                    assert "time" in activity
                    assert "title" in activity
                    assert "description" in activity
                    assert "location" in activity
                    assert "duration" in activity
        
        print(f"✅ Day structure verified for {len(itinerary['days'])} days")
    
    def test_activity_has_price_and_provider(self):
        """Test that activities have price and provider for marketplace"""
        payload = {
            "destination": "Amsterdam",
            "startDate": "2026-08-01",
            "endDate": "2026-08-02"
        }
        response = requests.post(f"{BASE_URL}/api/generate-itinerary", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        itinerary = data["itinerary"]
        
        activities_with_price = 0
        activities_with_provider = 0
        activities_with_id = 0
        
        for day in itinerary["days"]:
            for moment in ["morning", "afternoon", "night"]:
                for activity in day[moment]["activities"]:
                    if "price" in activity and activity["price"] is not None:
                        activities_with_price += 1
                        assert isinstance(activity["price"], (int, float))
                        assert activity["price"] >= 0
                    
                    if "provider" in activity and activity["provider"] is not None:
                        activities_with_provider += 1
                        assert activity["provider"] in ["Civitatis", "Viator", "GetYourGuide"]
                    
                    if "activityId" in activity:
                        activities_with_id += 1
        
        # Most activities should have price and provider (marketplace feature)
        assert activities_with_price > 0, "No activities have prices"
        assert activities_with_provider > 0, "No activities have providers"
        assert activities_with_id > 0, "No activities have IDs"
        
        print(f"✅ Activities with price: {activities_with_price}, provider: {activities_with_provider}, ID: {activities_with_id}")
    
    def test_mock_mode_header(self):
        """Test that X-Mock-Mode header is returned"""
        payload = {
            "destination": "Vienna",
            "startDate": "2026-09-01",
            "endDate": "2026-09-02"
        }
        response = requests.post(f"{BASE_URL}/api/generate-itinerary", json=payload)
        
        assert response.status_code == 200
        
        # Check for mock mode header
        mock_mode = response.headers.get('X-Mock-Mode')
        assert mock_mode is not None
        assert mock_mode in ['true', 'false']
        
        print(f"✅ Mock mode header: {mock_mode}")
    
    def test_invalid_request_missing_destination(self):
        """Test error handling for missing destination"""
        payload = {
            "startDate": "2026-10-01",
            "endDate": "2026-10-02"
        }
        response = requests.post(f"{BASE_URL}/api/generate-itinerary", json=payload)
        
        # Should return 422 for validation error
        assert response.status_code == 422
        print(f"✅ Validation error for missing destination: {response.status_code}")
    
    def test_invalid_request_missing_dates(self):
        """Test error handling for missing dates"""
        payload = {
            "destination": "Prague"
        }
        response = requests.post(f"{BASE_URL}/api/generate-itinerary", json=payload)
        
        # Should return 422 for validation error
        assert response.status_code == 422
        print(f"✅ Validation error for missing dates: {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

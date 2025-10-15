#!/usr/bin/env python3
import requests
import json

# Shapers data with proper mappings
shapers_data = [
    {
        "name": "Priyanka",
        "email": "priyanka@globalshaper.com",
        "region": "Mumbai Hub",
        "focus_area": "Ecosystem Partners",
        "bio": "Youth & Social Innovation contributor focused on building bridges across sectors and regions.",
        "organization": "Global Shapers Community",
        "position": "Shaper",
        "phone": "+91 98765 43210",
        "website": "https://globalshaper.com/priyanka",
        "linkedin_url": "https://linkedin.com/in/priyanka-global",
        "photo": "shapers/priyanka.jpg"
    },
    {
        "name": "Rocio",
        "email": "rocio@globalshaper.com",
        "region": "São Paulo Hub",
        "focus_area": "Ecosystem Partners",
        "bio": "Works on cross-sector partnerships to strengthen youth-led social innovation ecosystems.",
        "organization": "Global Shapers Community",
        "position": "Shaper",
        "phone": "+55 11 99999-8888",
        "website": "https://globalshaper.com/rocio",
        "linkedin_url": "https://linkedin.com/in/rocio-global",
        "photo": "shapers/rocio.jpg"
    },
    {
        "name": "Natalia",
        "email": "natalia@globalshaper.com",
        "region": "Bogotá Hub",
        "focus_area": "Access to Capital",
        "bio": "Focus on inclusive, early-stage finance models for emerging adult social innovators.",
        "organization": "Global Shapers Community",
        "position": "Shaper",
        "phone": "+57 300 555 7777",
        "website": "https://globalshaper.com/natalia",
        "linkedin_url": "https://linkedin.com/in/natalia-global",
        "photo": "shapers/natalia.jpg"
    },
    {
        "name": "Muhammad Hassan Dajana",
        "email": "muhammad.hassan@globalshaper.com",
        "region": "Amman Hub",
        "focus_area": "Access to Capital",
        "bio": "Advances equitable funding pathways and capital ladders for youth-led ventures.",
        "organization": "Global Shapers Community",
        "position": "Shaper",
        "phone": "+962 77 123 4567",
        "website": "https://globalshaper.com/muhammad-hassan",
        "linkedin_url": "https://linkedin.com/in/muhammad-hassan-global",
        "photo": "shapers/muhammad-hassan.jpg"
    },
    {
        "name": "Shawn",
        "email": "shawn@globalshaper.com",
        "region": "Toronto Hub",
        "focus_area": "Access to Capital",
        "bio": "Designs flexible, risk-tolerant capital instruments for youth changemakers.",
        "organization": "Global Shapers Community",
        "position": "Shaper",
        "phone": "+1 416 555 0123",
        "website": "https://globalshaper.com/shawn",
        "linkedin_url": "https://linkedin.com/in/shawn-global",
        "photo": "shapers/shawn.jpg"
    },
    {
        "name": "Carlos",
        "email": "carlos@globalshaper.com",
        "region": "Mexico City Hub",
        "focus_area": "Wellbeing & Recognition",
        "bio": "Centers mental health and power-shifting recognition within youth innovation ecosystems.",
        "organization": "Global Shapers Community",
        "position": "Shaper",
        "phone": "+52 55 1234 5678",
        "website": "https://globalshaper.com/carlos",
        "linkedin_url": "https://linkedin.com/in/carlos-global",
        "photo": "shapers/carlos.jpg"
    },
    {
        "name": "Faisal",
        "email": "faisal@globalshaper.com",
        "region": "Dubai Hub",
        "focus_area": "Ecosystem Partners",
        "bio": "Builds strategic partnerships and facilitates cross-regional collaboration for social innovation.",
        "organization": "Global Shapers Community",
        "position": "Shaper",
        "phone": "+971 50 123 4567",
        "website": "https://globalshaper.com/faisal",
        "linkedin_url": "https://linkedin.com/in/faisal-global",
        "photo": "shapers/faisal.jpg"
    },
    {
        "name": "Priyal",
        "email": "priyal@globalshaper.com",
        "region": "Delhi Hub",
        "focus_area": "Access to Capital",
        "bio": "Builds blended-finance approaches and first-cheque pathways for young founders.",
        "organization": "Global Shapers Community",
        "position": "Shaper",
        "phone": "+91 98765 11111",
        "website": "https://globalshaper.com/priyal",
        "linkedin_url": "https://linkedin.com/in/priyal-global",
        "photo": "shapers/priyal.jpg"
    },
    {
        "name": "Nyashadzaishe",
        "email": "nyashadzaishe@globalshaper.com",
        "region": "Harare Hub",
        "focus_area": "Ecosystem Partners",
        "bio": "Leads cross-sector dialogues and maps 'who-does-what' to reduce ecosystem fragmentation.",
        "organization": "Global Shapers Community",
        "position": "Shaper",
        "phone": "+263 77 123 4567",
        "website": "https://globalshaper.com/nyashadzaishe",
        "linkedin_url": "https://linkedin.com/in/nyashadzaishe-global",
        "photo": "shapers/nyashadzaishe.jpg"
    },
    {
        "name": "Penelope",
        "email": "penelope@globalshaper.com",
        "region": "Athens Hub",
        "focus_area": "Access to Capital",
        "bio": "Works on youth-friendly instruments like microgrants and revenue-based advances.",
        "organization": "Global Shapers Community",
        "position": "Shaper",
        "phone": "+30 69 1234 5678",
        "website": "https://globalshaper.com/penelope",
        "linkedin_url": "https://linkedin.com/in/penelope-global",
        "photo": "shapers/penelope.jpg"
    },
    {
        "name": "Paul",
        "email": "paul@globalshaper.com",
        "region": "Lagos Hub",
        "focus_area": "Ecosystem Partners",
        "bio": "Builds bridges with public institutions and corporate allies for scalable pilots.",
        "organization": "Global Shapers Community",
        "position": "Shaper",
        "phone": "+234 80 1234 5678",
        "website": "https://globalshaper.com/paul",
        "linkedin_url": "https://linkedin.com/in/paul-global",
        "photo": "shapers/paul.jpg"
    },
    {
        "name": "Scott",
        "email": "scott@globalshaper.com",
        "region": "Sydney Hub",
        "focus_area": "Wellbeing & Recognition",
        "bio": "Advocates for mental health support and recognition frameworks for young social entrepreneurs.",
        "organization": "Global Shapers Community",
        "position": "Shaper",
        "phone": "+61 4 1234 5678",
        "website": "https://globalshaper.com/scott",
        "linkedin_url": "https://linkedin.com/in/scott-global",
        "photo": "shapers/scott.jpg"
    },
    {
        "name": "Joel",
        "email": "joel@globalshaper.com",
        "region": "Manila Hub",
        "focus_area": "Ecosystem Partners",
        "bio": "Coordinates multi-stakeholder coalitions and procurement pathways for youth-led solutions.",
        "organization": "Global Shapers Community",
        "position": "Shaper",
        "phone": "+63 917 123 4567",
        "website": "https://globalshaper.com/joel",
        "linkedin_url": "https://linkedin.com/in/joel-global",
        "photo": "shapers/joel.jpg"
    },
    {
        "name": "Wan",
        "email": "wan@globalshaper.com",
        "region": "Singapore Hub",
        "focus_area": "Ecosystem Partners",
        "bio": "Designs convenings and navigation tools to reduce founder overload and improve program fit.",
        "organization": "Global Shapers Community",
        "position": "Shaper",
        "phone": "+65 9123 4567",
        "website": "https://globalshaper.com/wan",
        "linkedin_url": "https://linkedin.com/in/wan-global",
        "photo": "shapers/wan.jpg"
    },
    {
        "name": "Malak",
        "email": "malak@globalshaper.com",
        "region": "Cairo Hub",
        "focus_area": "Access to Capital",
        "bio": "Advocates for policy recognition and capital access pathways for emerging adults (16–29).",
        "organization": "Global Shapers Community",
        "position": "Shaper",
        "phone": "+20 10 1234 5678",
        "website": "https://globalshaper.com/malak",
        "linkedin_url": "https://linkedin.com/in/malak-global",
        "photo": "shapers/malak.jpg"
    }
]

API_BASE_URL = "http://localhost:8080/api/v1"

def create_shaper(shaper_data):
    """Create a single shaper using the API"""
    try:
        response = requests.post(
            f"{API_BASE_URL}/shapers",
            json=shaper_data,
            headers={"Content-Type": "application/json"}
        )

        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print(f"✅ Created shaper: {shaper_data['name']} - {shaper_data['region']}")
                return True
            else:
                print(f"❌ API error for {shaper_data['name']}: {result.get('message', 'Unknown error')}")
                return False
        else:
            print(f"❌ HTTP error for {shaper_data['name']}: {response.status_code} - {response.text}")
            return False

    except Exception as e:
        print(f"❌ Exception creating {shaper_data['name']}: {str(e)}")
        return False

def main():
    print("🚀 Starting to create Global Shapers...")
    print(f"Total shapers to create: {len(shapers_data)}")
    print("-" * 50)

    created_count = 0
    failed_count = 0

    for shaper in shapers_data:
        if create_shaper(shaper):
            created_count += 1
        else:
            failed_count += 1

    print("-" * 50)
    print(f"📊 Results:")
    print(f"   ✅ Created: {created_count}")
    print(f"   ❌ Failed: {failed_count}")
    print(f"   📝 Total: {len(shapers_data)}")

    if created_count > 0:
        print(f"\n🎉 Successfully created {created_count} Global Shapers!")
        print("   Check the Shapers Network in your frontend to see them.")

if __name__ == "__main__":
    main()
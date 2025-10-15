#!/usr/bin/env python3
"""
Test schema parsing to diagnose the issue
"""

import json
from langchain_core.output_parsers import PydanticOutputParser
from app.schemas.insights import ExtractedInsightSchemaExpanded

# Create parser
parser = PydanticOutputParser(pydantic_object=ExtractedInsightSchemaExpanded)

# Get format instructions
format_instructions = parser.get_format_instructions()

print("="*80)
print("FORMAT INSTRUCTIONS SENT TO LLM:")
print("="*80)
print(format_instructions)
print("\n")

# Test data in new format
test_json = {
    "main_theme": "Youth Entrepreneurship Challenges",
    "subthemes": ["Funding access", "Mentorship"],
    "key_actors": ["John Doe"],
    "general_perception": "neutral",
    "proposed_actions": ["Create grants"],
    "challenges": ["Lack of capital"],
    "opportunities": ["Growing ecosystem"],
    "pillar_analysis": {
        "access_to_capital": {
            "problems": [
                {
                    "insight_text": "Young entrepreneurs struggle to access seed funding",
                    "supporting_quotes": [
                        "Many of us can't get even basic startup capital",
                        "Banks require collateral we don't have"
                    ],
                    "context": "Discussed in funding session"
                }
            ],
            "proposals": [
                {
                    "insight_text": "Create micro-grant programs for youth",
                    "supporting_quotes": [
                        "We need small grants without strict requirements"
                    ],
                    "context": "Proposed solution"
                }
            ]
        }
    },
    "network_analysis": {}
}

print("="*80)
print("TEST JSON (New Format with Evidence):")
print("="*80)
print(json.dumps(test_json, indent=2))
print("\n")

# Try to parse
try:
    json_str = json.dumps(test_json)
    result = parser.parse(json_str)
    print("="*80)
    print("✅ PARSING SUCCESSFUL!")
    print("="*80)
    print(f"Result type: {type(result)}")
    print(f"Pillar analysis type: {type(result.pillar_analysis)}")
    if result.pillar_analysis:
        for pillar, data in result.pillar_analysis.items():
            print(f"\nPillar: {pillar}")
            print(f"  Problems: {len(data.problems)}")
            print(f"  Proposals: {len(data.proposals)}")
            if data.problems:
                print(f"  First problem: {data.problems[0].insight_text}")
                print(f"  Supporting quotes: {len(data.problems[0].supporting_quotes)}")
except Exception as e:
    print("="*80)
    print("❌ PARSING FAILED!")
    print("="*80)
    print(f"Error: {str(e)}")
    print(f"Error type: {type(e).__name__}")
    import traceback
    traceback.print_exc()

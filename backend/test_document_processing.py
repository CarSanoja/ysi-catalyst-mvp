#!/usr/bin/env python3
"""
Test document processing to see the exact error
"""

import asyncio
import os
from app.utils.langraph.insight_agent import create_insight_agent

# Sample document text
SAMPLE_TEXT = """
Meeting Notes: Youth Entrepreneurship Discussion
Date: October 15, 2025

Key Participants:
- Maria Rodriguez (Social Enterprise Founder)
- Ahmed Hassan (Tech Startup CEO)
- Sarah Chen (Venture Capital Analyst)

Main Discussion Points:

Access to Funding:
Maria shared: "We desperately need early-stage capital that doesn't require traditional collateral. Many young entrepreneurs from underserved communities simply can't access seed funding because banks demand assets we don't have."

Ahmed added: "The investor landscape is heavily skewed towards established networks. If you don't know someone in Silicon Valley or similar hubs, it's nearly impossible to get your foot in the door."

Sarah proposed: "What if we created a micro-grant program specifically for youth-led initiatives? Grants between $5,000-$25,000 with simplified application processes could make a huge difference."

Mental Health Challenges:
Ahmed mentioned: "The pressure is overwhelming. I've been close to burnout multiple times, and there's no support system for founders dealing with mental health issues."

Maria agreed: "Loneliness is a major issue. You're making life-altering decisions daily, but there's no one who truly understands what you're going through."

Proposed Solutions:
Sarah suggested: "Every funding program should include mental health support as a standard component - counseling vouchers, peer support groups, whatever founders need."

Ahmed proposed: "We need protected time built into funding agreements. Investors should understand that founders need breaks to avoid burning out."

Recognition and Visibility:
Maria expressed frustration: "We get invited to panels and speaking events, but it's often just tokenism. We speak, take photos, but rarely get actual decision-making power or seats at important tables."

Ahmed concurred: "Recognition should translate to real opportunities - board positions, advisory roles, procurement contracts. Not just visibility for visibility's sake."

Action Items:
- Explore micro-grant pilot program for Q1 2026
- Develop mental health support framework for startup accelerators
- Create policy recommendations for meaningful youth recognition
"""

async def main():
    print("="*80)
    print("TESTING DOCUMENT PROCESSING WITH NEW QUOTE EXTRACTION")
    print("="*80)
    print()

    # Create agent with expanded schema
    agent = create_insight_agent(use_expanded_schema=True)

    print("Processing document...")
    print()

    try:
        # Extract insights
        insights = agent.extract_insights(
            text=SAMPLE_TEXT,
            context="Test document for quote extraction"
        )

        print("="*80)
        print("✅ EXTRACTION SUCCESSFUL!")
        print("="*80)
        print()
        print(f"Main Theme: {insights.main_theme}")
        print(f"Key Actors: {', '.join(insights.key_actors[:3])}")
        print(f"Perception: {insights.general_perception}")
        print()

        # Check pillar analysis
        if insights.pillar_analysis:
            print("PILLAR ANALYSIS:")
            print("-" * 80)
            for pillar, data in insights.pillar_analysis.items():
                print(f"\n{pillar.upper()}:")
                print(f"  Problems: {len(data.problems)}")
                print(f"  Proposals: {len(data.proposals)}")

                if data.problems:
                    print(f"\n  First Problem:")
                    prob = data.problems[0]
                    print(f"    Text: {prob.insight_text[:80]}...")
                    print(f"    Quotes ({len(prob.supporting_quotes)}):")
                    for i, quote in enumerate(prob.supporting_quotes, 1):
                        print(f"      {i}. \"{quote[:60]}...\"")

                if data.proposals:
                    print(f"\n  First Proposal:")
                    prop = data.proposals[0]
                    print(f"    Text: {prop.insight_text[:80]}...")
                    print(f"    Quotes ({len(prop.supporting_quotes)}):")
                    for i, quote in enumerate(prop.supporting_quotes, 1):
                        print(f"      {i}. \"{quote[:60]}...\"")
        else:
            print("⚠️  No pillar analysis generated")

    except Exception as e:
        print("="*80)
        print("❌ EXTRACTION FAILED!")
        print("="*80)
        print(f"Error: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        print()
        print("Full traceback:")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    # Set OpenAI API key
    if not os.getenv("OPENAI_API_KEY"):
        print("⚠️  Warning: OPENAI_API_KEY not set")

    asyncio.run(main())

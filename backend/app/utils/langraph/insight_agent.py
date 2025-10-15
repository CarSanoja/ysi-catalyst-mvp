"""
LangGraph Agent for Insight Extraction
Global Shapers Platform - YSI
"""

import os
from typing import Any, Dict
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.output_parsers import PydanticOutputParser
from app.schemas.insights import ExtractedInsightSchema, ExtractedInsightSchemaExpanded


class InsightExtractionAgent:
    """
    LangGraph agent specialized in extracting insights from Global Shapers meeting notes and documents
    """

    def __init__(self, use_expanded_schema: bool = True):
        self.model = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.1,
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.use_expanded_schema = use_expanded_schema
        schema_class = ExtractedInsightSchemaExpanded if use_expanded_schema else ExtractedInsightSchema
        self.parser = PydanticOutputParser(pydantic_object=schema_class)

    def create_system_prompt(self) -> str:
        """Create the system prompt for the insight extraction agent"""

        base_prompt = """You are an expert analyst for the Global Shapers Community, part of the World Economic Forum's Young Global Leaders initiative.

Your role is to analyze meeting notes, workshop summaries, and discussion documents to extract key insights that help Global Shapers understand:

1. MAIN THEMES: What are the primary topics being discussed?
2. SUBTHEMES: What specific aspects or subtopics are being explored?
3. KEY ACTORS: Who are the important people, organizations, or stakeholders mentioned?
4. SENTIMENT: What is the overall tone - positive, neutral, or negative?
5. PROPOSED ACTIONS: What concrete steps, solutions, or recommendations are suggested?
6. CHALLENGES: What problems, obstacles, or difficulties are identified?
7. OPPORTUNITIES: What positive possibilities, openings, or potential benefits are discussed?

CONTEXT ABOUT GLOBAL SHAPERS:
- Young leaders (20-30 years old) working on local and global challenges
- Focus areas include: Climate Action, Education, Innovation, Capital Access, Recognition, Wellbeing
- Work in hubs around the world, collaborating on community-driven initiatives
- Often discuss funding challenges, mentorship needs, and scaling social impact

ANALYSIS GUIDELINES:
- Be concise but comprehensive in your analysis
- Focus on actionable insights that can help Global Shapers improve their work
- Identify both explicit and implicit themes
- Pay attention to regional/cultural contexts when mentioned
- Look for patterns around funding, mentorship, policy, and community building
- Extract specific names of people and organizations when mentioned
- Be objective in sentiment analysis

CRITICAL SECURITY GUIDELINES:
- ONLY extract information that is explicitly mentioned or clearly implied in the text
- If a field cannot be substantiated with evidence from the text, leave it empty rather than making assumptions
- Do NOT fill in gaps with generic or fabricated content
- For pillar analysis: ONLY include problems and proposals that are directly supported by the text
- If insufficient information exists for a pillar, leave that pillar's analysis empty
- Use phrases like "not mentioned", "insufficient information", or "not addressed" when appropriate
- Prioritize accuracy over completeness - empty fields are better than inaccurate ones"""

        if self.use_expanded_schema:
            expanded_instructions = """

YSI FRAMEWORK - DETAILED PILLAR ANALYSIS:
When generating the pillar_analysis section, categorize insights into these 4 core YSI pillars:

🔹 ACCESS TO CAPITAL (access_to_capital):
Problems: Focus on funding gaps, geographic inequities, bureaucratic barriers, financial precarity affecting young entrepreneurs
Proposals: Risk-tolerant financing instruments, blended capital approaches, policy frameworks for social enterprises

🔹 ECOSYSTEM SUPPORT (ecosystem_support):
Problems: Fragmented landscapes, navigation burden, limited networks, program overlap, institutional instability
Proposals: Ecosystem mapping, cross-sector dialogue, multi-year capacity support, enabling structures

🔹 MENTAL HEALTH (mental_health):
Problems: Burnout, isolation, financial stress, stigma, inadequate support systems
Proposals: Embedded wellbeing services, peer support, safe-to-fail environments, normalized failure culture

🔹 RECOGNITION (recognition):
Problems: Tokenistic visibility, legitimacy gaps, lack of policy recognition, unclear pathways
Proposals: Power-transferring recognition, policy frameworks, evidence-backed showcases, goal-setting support

DETAILED ANALYSIS REQUIREMENTS:
- For each pillar that's relevant to the text, provide 2-6 detailed problem statements (each 10-40 words)
- For each pillar that's relevant to the text, provide 2-6 concrete proposals (each 10-40 words)
- Include contextual details like geographic factors, institutional dynamics, systemic barriers
- Focus on specificity over generality - avoid vague statements
- Connect problems to root causes and proposals to implementation pathways
- If a pillar isn't relevant to the text, leave it empty rather than forcing content

CRITICAL: EVIDENCE-BACKED INSIGHTS WITH EXACT QUOTES
For EVERY problem and proposal you identify, you MUST:

1. **Extract Exact Quotes (Verbatim):**
   - Identify 1-3 quotes from the source document that directly support your insight
   - Copy the quotes WORD-FOR-WORD, exactly as they appear in the original text
   - Use quotation marks or clear indicators that this is verbatim text
   - Quotes should be specific sentences or phrases, not just keywords
   - Each quote should be 5-50 words long (complete thoughts/sentences preferred)

2. **Quote Selection Guidelines:**
   - Choose quotes that are EXPLICIT evidence for the problem/proposal
   - Prefer direct statements over implied meanings
   - If multiple people express the same idea, include the most clear/compelling quote
   - Quotes should stand alone and be understandable out of context

3. **What Counts as an Exact Quote:**
   ✅ GOOD: "Many young entrepreneurs in rural areas struggle to access even basic seed funding"
   ✅ GOOD: "The pressure to succeed is overwhelming and there's no one to talk to"
   ❌ BAD: "funding challenges" (too vague, not a complete thought)
   ❌ BAD: Paraphrasing or summarizing - must be EXACT words from the text

STRICT EVIDENCE REQUIREMENTS FOR PILLAR ANALYSIS:
- ONLY include problems/proposals that have DIRECT QUOTES from the source text
- Every insight MUST include at least 1 supporting quote (ideally 2-3)
- Do NOT create insights that cannot be supported with verbatim quotes
- If you cannot find exact quotes for a problem/proposal, DO NOT include it
- Each problem/proposal must be traceable back to specific quoted statements
- When in doubt, err on the side of leaving fields empty rather than making assumptions

EXAMPLE FORMAT for each insight:
{
  "insight_text": "Geographic access to funding varies significantly based on location",
  "supporting_quotes": [
    "Young entrepreneurs in rural Ethiopia face major barriers to seed capital",
    "Location determines whether you can even meet with potential investors"
  ],
  "context": "Discussed by multiple participants from emerging markets"
}"""

            base_prompt += expanded_instructions

        base_prompt += """

RESPONSE FORMAT:
You must respond with a structured JSON object that matches the exact schema provided.
All fields are required, but arrays can be empty if no relevant information is found.
"""

        return base_prompt

    def extract_insights(self, text: str, context: str = ""):
        """
        Extract insights from the provided text using the LangGraph agent

        Args:
            text: The input text to analyze
            context: Additional context about the text source

        Returns:
            ExtractedInsightSchema or ExtractedInsightSchemaExpanded: Structured insights extracted from the text
        """

        # Create the system prompt and append format instructions (avoid .format() due to JSON braces)
        system_prompt = self.create_system_prompt() + "\n\n" + self.parser.get_format_instructions()

        # Create the human prompt with text and context
        human_prompt = f"""Please analyze the following text and extract insights according to your role:

CONTEXT: {context if context else "No additional context provided"}

TEXT TO ANALYZE:
{text}

Provide your analysis in the specified JSON format."""

        # Create messages
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=human_prompt)
        ]

        # Get response from the model
        try:
            response = self.model.invoke(messages)

            # Parse the response using the Pydantic parser
            insights = self.parser.parse(response.content)

            return insights

        except Exception as e:
            # Fallback in case of parsing errors
            raise ValueError(f"Failed to extract insights: {str(e)}")

    def validate_text_length(self, text: str) -> bool:
        """Validate that text is within acceptable length limits"""
        return 10 <= len(text) <= 50000

    def preprocess_text(self, text: str) -> str:
        """Clean and preprocess text before analysis"""
        # Remove excessive whitespace
        text = " ".join(text.split())

        # Basic cleaning
        text = text.strip()

        return text


# Factory function to create the agent
def create_insight_agent(use_expanded_schema: bool = True) -> InsightExtractionAgent:
    """Factory function to create an insight extraction agent"""
    return InsightExtractionAgent(use_expanded_schema=use_expanded_schema)


# Convenience function for direct usage
async def extract_insights_from_text(text: str, context: str = "", use_expanded: bool = True):
    """
    High-level function to extract insights from text

    Args:
        text: Text to analyze
        context: Additional context
        use_expanded: Whether to use the expanded schema with pillar analysis

    Returns:
        ExtractedInsightSchema or ExtractedInsightSchemaExpanded: Extracted insights
    """
    agent = create_insight_agent(use_expanded_schema=use_expanded)

    # Validate input
    if not agent.validate_text_length(text):
        raise ValueError("Text length must be between 10 and 50,000 characters")

    # Preprocess text
    clean_text = agent.preprocess_text(text)

    # Extract insights
    insights = agent.extract_insights(clean_text, context)

    return insights
"""
LangGraph Agent for Network Analysis
Specialized in extracting stakeholder networks and relationships
Global Shapers Platform - YSI
"""

import os
from typing import Any, Dict
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.output_parsers import PydanticOutputParser
from app.schemas.networks import NetworkAnalysisSchema


class NetworkAnalysisAgent:
    """
    LangGraph agent specialized in extracting stakeholder networks and relationships
    from Global Shapers meeting notes and documents
    """

    def __init__(self):
        self.model = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.1,
            api_key=os.getenv("OPENAI_API_KEY")
        )
        self.parser = PydanticOutputParser(pydantic_object=NetworkAnalysisSchema)

    def create_network_prompt(self) -> str:
        """Create the system prompt for network analysis"""

        prompt = """You are a specialized network analyst for the Global Shapers Community, part of the World Economic Forum's Young Global Leaders initiative.

Your EXCLUSIVE role is to analyze text and extract:
1. STAKEHOLDERS (people and organizations)
2. RELATIONSHIPS between stakeholders
3. TOPIC NETWORKS (how topics connect stakeholders)
4. GEOGRAPHIC CLUSTERS (regional connections)

CONTEXT ABOUT GLOBAL SHAPERS:
- Young leaders (20-30 years old) working on local and global challenges
- Focus areas include: Climate Action, Education, Innovation, Capital Access, Recognition, Wellbeing
- Work in hubs around the world, collaborating on community-driven initiatives
- Network includes innovators, funders, mentors, policymakers, researchers

STAKEHOLDER IDENTIFICATION:
- Extract ONLY people and organizations explicitly mentioned by name
- Classify each stakeholder by their role:
  * funder: Provides financial support or investment
  * mentor: Offers guidance, advice, or coaching
  * implementer: Executes projects or initiatives
  * beneficiary: Receives services or benefits
  * policymaker: Government officials or policy influencers
  * organization: Institutions, NGOs, companies
  * researcher: Academic or research institutions
  * community_leader: Local leaders or representatives

RELATIONSHIP EXTRACTION:
- ONLY extract relationships that are EXPLICITLY mentioned in the text
- Types of relationships:
  * collaboration: Working together on projects
  * funding: Financial support or investment
  * mentorship: Guidance or advisory relationships
  * policy: Policy development or advocacy connections
  * conflict: Disagreements or tensions
  * partnership: Formal or informal partnerships
  * advisory: Advisory board or consultation roles
  * support: General support relationships

TOPIC NETWORKS:
- Identify how stakeholders cluster around specific topics
- Map topics to YSI pillars when relevant:
  * access_to_capital: Funding, investment, financial support
  * ecosystem_support: Infrastructure, programs, systems
  * mental_health: Wellbeing, burnout, mental health support
  * recognition: Visibility, legitimacy, awards, platforms
  * general: Topics that don't fit specific pillars

GEOGRAPHIC ANALYSIS:
- Extract geographic information ONLY when explicitly mentioned
- Group stakeholders by regions/countries when locations are provided
- Connect regional activities to topics when mentioned

CRITICAL SECURITY RULES:
- DO NOT infer or assume relationships not explicitly stated
- DO NOT add stakeholders not mentioned by name in the text
- DO NOT create connections based on general knowledge
- If relationship type is unclear, use the most general category
- If geographic info is not mentioned, leave location as null
- If insufficient network information exists, leave relevant sections empty
- Every relationship MUST have supporting evidence from the text

ANALYSIS DEPTH:
- Focus on explicitly mentioned connections
- Prioritize direct quotes as evidence for relationships
- Identify central figures who connect multiple stakeholders
- Assess network density based on number of connections mentioned
- Extract regional patterns only when geography is discussed

RESPONSE FORMAT:
You must respond with a structured JSON object matching the NetworkAnalysisSchema.
All fields can be empty arrays if no relevant information is found.
Quality over quantity - only include well-supported network elements.

{format_instructions}"""

        return prompt

    def extract_network(self, text: str, context: str = "") -> NetworkAnalysisSchema:
        """
        Extract network analysis from the provided text

        Args:
            text: The input text to analyze
            context: Additional context about the text source

        Returns:
            NetworkAnalysisSchema: Structured network analysis extracted from the text
        """

        # Create the system prompt with format instructions
        system_prompt = self.create_network_prompt().format(
            format_instructions=self.parser.get_format_instructions()
        )

        # Create the human prompt with text and context
        human_prompt = f"""Please analyze the following text and extract network relationships according to your role:

CONTEXT: {context if context else "No additional context provided"}

TEXT TO ANALYZE:
{text}

Focus ONLY on extracting stakeholders, relationships, and networks that are explicitly mentioned in the text. Provide your analysis in the specified JSON format."""

        # Create messages
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=human_prompt)
        ]

        # Get response from the model
        try:
            response = self.model.invoke(messages)

            # Parse the response using the Pydantic parser
            network_analysis = self.parser.parse(response.content)

            return network_analysis

        except Exception as e:
            # Fallback in case of parsing errors
            raise ValueError(f"Failed to extract network analysis: {str(e)}")

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


# Factory function to create the network agent
def create_network_agent() -> NetworkAnalysisAgent:
    """Factory function to create a network analysis agent"""
    return NetworkAnalysisAgent()


# Convenience function for direct usage
async def extract_network_from_text(text: str, context: str = "") -> NetworkAnalysisSchema:
    """
    High-level function to extract network analysis from text

    Args:
        text: Text to analyze
        context: Additional context

    Returns:
        NetworkAnalysisSchema: Extracted network analysis
    """
    agent = create_network_agent()

    # Validate input
    if not agent.validate_text_length(text):
        raise ValueError("Text length must be between 10 and 50,000 characters")

    # Preprocess text
    clean_text = agent.preprocess_text(text)

    # Extract network analysis
    network_analysis = agent.extract_network(clean_text, context)

    return network_analysis
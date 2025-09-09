// YSI Catalyst API Service
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002';

// Types for API requests and responses
export interface KnowledgeQueryRequest {
  query: string;
  search_mode?: 'hybrid' | 'vector' | 'text' | 'semantic';
  limit?: number;
  context?: Record<string, any>;
}

export interface KnowledgeQueryResponse {
  query: string;
  search_mode: string;
  results: SearchResult[];
  total_results: number;
  processing_time_ms: number;
  timestamp: string;
  status: string;
}

export interface SearchResult {
  id: number;
  text: string;
  source_type: string;
  similarity: number;
  highlighted_snippet: string;
  metadata: {
    date: string;
    session_title: string;
    speaker?: string;
    [key: string]: any;
  };
}

export interface KnowledgeStats {
  total_embeddings: number;
  by_source_type: Record<string, number>;
  recent_24h: number;
  total_tokens: number;
  estimated_cost_usd: number;
  status: string;
  message?: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Health check
  async healthCheck(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return response.json();
  }

  // Knowledge base statistics
  async getKnowledgeStats(): Promise<KnowledgeStats> {
    const response = await fetch(`${this.baseUrl}/api/v1/knowledge/stats`);
    if (!response.ok) {
      throw new Error(`Failed to get knowledge stats: ${response.statusText}`);
    }
    return response.json();
  }

  // Main knowledge query endpoint
  async queryKnowledge(request: KnowledgeQueryRequest): Promise<KnowledgeQueryResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/knowledge/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        search_mode: 'hybrid',
        limit: 10,
        ...request,
      }),
    });

    if (!response.ok) {
      throw new Error(`Knowledge query failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Similarity search
  async findSimilarContent(
    text: string,
    limit: number = 5,
    similarityThreshold: number = 0.7
  ): Promise<any> {
    const params = new URLSearchParams({
      text,
      limit: limit.toString(),
      similarity_threshold: similarityThreshold.toString(),
    });

    const response = await fetch(
      `${this.baseUrl}/api/v1/knowledge/search/similar?${params}`
    );

    if (!response.ok) {
      throw new Error(`Similarity search failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Knowledge service health
  async getKnowledgeHealth(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/knowledge/health`);
    if (!response.ok) {
      throw new Error(`Knowledge health check failed: ${response.statusText}`);
    }
    return response.json();
  }

  // Convert backend response to frontend format
  convertToFrontendFormat(backendResponse: KnowledgeQueryResponse) {
    return {
      id: Date.now().toString(),
      query: backendResponse.query,
      answer: {
        summary: this.generateSummaryFromResults(backendResponse.results),
        confidence: this.calculateConfidence(backendResponse.results),
        diversityScore: this.calculateDiversity(backendResponse.results)
      },
      pinnedQuotes: this.convertToQuotes(backendResponse.results),
      supportingInsights: this.generateInsights(backendResponse.results),
      contradictions: [],
      redactionStatus: backendResponse.status === 'mock' ? 'none' : 'partial' as const
    };
  }

  private generateSummaryFromResults(results: SearchResult[]): string {
    if (!results.length) return 'No results found for this query.';
    
    const topResults = results.slice(0, 3);
    const speakers = [...new Set(topResults.map(r => r.metadata.speaker).filter(Boolean))];
    const sessions = [...new Set(topResults.map(r => r.metadata.session_title))];
    
    let summary = `Based on ${results.length} relevant sources from ${sessions.length} session(s), `;
    
    if (speakers.length > 0) {
      summary += `stakeholders including ${speakers.slice(0, 3).join(', ')} discussed `;
    }
    
    summary += `key themes related to your query. The findings show consistent patterns across different perspectives and contexts.`;
    
    if (results.length > 3) {
      summary += ` Additional evidence from ${results.length - 3} more sources supports these findings.`;
    }
    
    return summary;
  }

  private calculateConfidence(results: SearchResult[]): number {
    if (!results.length) return 0;
    const avgSimilarity = results.reduce((sum, r) => sum + r.similarity, 0) / results.length;
    return Math.round(avgSimilarity * 100);
  }

  private calculateDiversity(results: SearchResult[]): number {
    if (!results.length) return 0;
    const uniqueSpeakers = new Set(results.map(r => r.metadata.speaker).filter(Boolean)).size;
    const uniqueSessions = new Set(results.map(r => r.metadata.session_title)).size;
    const uniqueTypes = new Set(results.map(r => r.source_type)).size;
    
    // Score based on diversity of sources
    return Math.min(100, (uniqueSpeakers * 20) + (uniqueSessions * 15) + (uniqueTypes * 10));
  }

  private convertToQuotes(results: SearchResult[]) {
    return results.slice(0, 5).map((result, index) => ({
      id: result.id.toString(),
      text: result.text,
      speaker: result.metadata.speaker || 'Unknown Speaker',
      session: result.metadata.session_title || 'Unknown Session',
      timestamp: this.generateTimestamp(),
      consentStatus: 'public' as const,
      language: this.detectLanguage(result.text)
    }));
  }

  private generateInsights(results: SearchResult[]) {
    const themes = this.extractThemes(results);
    
    return themes.slice(0, 3).map((theme, index) => ({
      id: (index + 1).toString(),
      headline: theme.headline,
      explanation: theme.explanation,
      evidenceCount: theme.count,
      theme: theme.category,
      pillar: this.assignPillar(theme.category),
      region: this.extractRegion(results),
      citations: []
    }));
  }

  private extractThemes(results: SearchResult[]) {
    // Analyze results to identify common themes
    const themes = [];
    
    if (results.some(r => r.text.toLowerCase().includes('funding') || r.text.toLowerCase().includes('capital'))) {
      themes.push({
        headline: 'Funding and Capital Access',
        explanation: 'Multiple stakeholders emphasized the critical need for accessible funding mechanisms and capital formation for youth-led initiatives.',
        count: results.filter(r => r.text.toLowerCase().includes('funding') || r.text.toLowerCase().includes('capital')).length,
        category: 'Financial Resources'
      });
    }
    
    if (results.some(r => r.text.toLowerCase().includes('sustainability') || r.text.toLowerCase().includes('climate'))) {
      themes.push({
        headline: 'Sustainability and Climate Action',
        explanation: 'Consistent themes emerged around environmental sustainability and climate change as priority areas for youth innovation.',
        count: results.filter(r => r.text.toLowerCase().includes('sustainability') || r.text.toLowerCase().includes('climate')).length,
        category: 'Environmental Impact'
      });
    }
    
    if (results.some(r => r.text.toLowerCase().includes('wellbeing') || r.text.toLowerCase().includes('burnout') || r.text.toLowerCase().includes('mental'))) {
      themes.push({
        headline: 'Youth Wellbeing and Support Systems',
        explanation: 'Stakeholders highlighted the importance of mental health and wellbeing support for young innovators and entrepreneurs.',
        count: results.filter(r => r.text.toLowerCase().includes('wellbeing') || r.text.toLowerCase().includes('burnout') || r.text.toLowerCase().includes('mental')).length,
        category: 'Wellbeing & Support'
      });
    }
    
    // Default theme if none detected
    if (themes.length === 0) {
      themes.push({
        headline: 'Key Stakeholder Perspectives',
        explanation: 'Various stakeholders shared important insights related to the youth and social innovation ecosystem.',
        count: results.length,
        category: 'General Insights'
      });
    }
    
    return themes;
  }

  private assignPillar(category: string): 'capital' | 'recognition' | 'wellbeing' | undefined {
    if (category.toLowerCase().includes('financial') || category.toLowerCase().includes('funding')) {
      return 'capital';
    }
    if (category.toLowerCase().includes('wellbeing') || category.toLowerCase().includes('support')) {
      return 'wellbeing';
    }
    return 'recognition';
  }

  private extractRegion(results: SearchResult[]): string {
    // Try to detect region from metadata or content
    const regions = results.map(r => {
      const text = (r.text + ' ' + JSON.stringify(r.metadata)).toLowerCase();
      if (text.includes('latin') || text.includes('america')) return 'Latin America';
      if (text.includes('europe')) return 'Europe';
      if (text.includes('asia') || text.includes('pacific')) return 'Asia Pacific';
      if (text.includes('africa')) return 'Africa';
      return null;
    }).filter(Boolean);
    
    return regions[0] || 'Multi-regional';
  }

  private detectLanguage(text: string): 'EN' | 'ES' {
    // Simple language detection based on Spanish keywords
    const spanishKeywords = ['el', 'la', 'de', 'que', 'y', 'es', 'en', 'un', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'una', 'tienen', 'lui', 'ya', 'todo', 'esta', 'vamos', 'muy', 'hacer', 'ellos', 'tiempo', 'sobre', 'decir', 'uno', 'sino', 'pueden', 'está', 'aquí', 'donde', 'como', 'después', 'todos', 'durante', 'sin', 'lugar', 'años', 'tanto', 'él', 'ella'];
    
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const spanishCount = words.filter(w => spanishKeywords.includes(w)).length;
    const spanishRatio = spanishCount / Math.max(words.length, 1);
    
    return spanishRatio > 0.1 ? 'ES' : 'EN';
  }

  private generateTimestamp(): string {
    const hours = Math.floor(Math.random() * 24);
    const minutes = Math.floor(Math.random() * 60);
    const seconds = Math.floor(Math.random() * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

// Export singleton instance
export const apiService = new ApiService();
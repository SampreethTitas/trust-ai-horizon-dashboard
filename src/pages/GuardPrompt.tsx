
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Send, Copy, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import LoadingShimmer from "@/components/LoadingShimmer";
import ThreatAnalysis from "@/components/ThreatAnalysis";
import GeneratedContent from "@/components/GeneratedContent";

// Type definitions for API responses
interface GuardPromptAnalysisResult {
  is_malicious: boolean;
  threat_level: string;
  confidence: number;
  attack_types: string[];
  flagged_patterns: string[];
  processing_time: number;
  recommendation: string;
  pii_detected: Record<string, any>;
  metadata: {
    pattern_score: number;
    ml_score: number;
    prompt_length: number;
    user_id: string;
    pii_types_found: number;
    pii_count: number;
  };
}

interface GuardPromptApiResponse {
  success: boolean;
  timestamp: string;
  analysis: GuardPromptAnalysisResult;
  processing_time: number;
  request_id: string;
}

interface GenerationResult {
  generated_text: string;
}

// Mock analysis function
const mockAnalyzePrompt = (prompt: string): Promise<GuardPromptApiResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lowercasePrompt = prompt.toLowerCase();
      
      // Check for high-risk patterns
      const highRiskPatterns = ['urgent', 'act now', 'limited time', 'expires', 'discount ends', 'hurry', 'last chance'];
      const mediumRiskPatterns = ['free', 'guaranteed', 'no risk', 'amazing deal', 'incredible offer'];
      const manipulativePatterns = ['you must', 'dont miss', 'everyone is', 'secret', 'exclusive'];
      
      const hasHighRisk = highRiskPatterns.some(pattern => lowercasePrompt.includes(pattern));
      const hasMediumRisk = mediumRiskPatterns.some(pattern => lowercasePrompt.includes(pattern));
      const hasManipulative = manipulativePatterns.some(pattern => lowercasePrompt.includes(pattern));
      
      let threatLevel = 'safe';
      let isMalicious = false;
      let confidence = 0.85;
      let attackTypes: string[] = [];
      let flaggedPatterns: string[] = [];
      let recommendation = "Content appears to be safe for marketing use. It follows ethical guidelines and doesn't contain manipulative language.";
      
      if (hasHighRisk || hasManipulative) {
        threatLevel = 'high';
        isMalicious = true;
        confidence = 0.92;
        attackTypes = ['urgency_manipulation', 'scarcity_tactics'];
        flaggedPatterns = ['False urgency claim', 'Scarcity manipulation'];
        if (hasManipulative) {
          attackTypes.push('psychological_pressure');
          flaggedPatterns.push('Psychological pressure tactics');
        }
        recommendation = "⚠️ HIGH RISK: Content contains high-risk elements that could be considered manipulative. Consider rephrasing to be more transparent and less pressuring.";
      } else if (hasMediumRisk) {
        threatLevel = 'medium';
        isMalicious = false;
        confidence = 0.78;
        attackTypes = ['promotional_language'];
        flaggedPatterns = ['Promotional language detected'];
        recommendation = "WARN: Potentially risky content. While not explicitly harmful, consider toning down promotional language for better compliance.";
      }
      
      resolve({
        success: true,
        timestamp: new Date().toISOString(),
        analysis: {
          is_malicious: isMalicious,
          threat_level: threatLevel,
          confidence: confidence,
          attack_types: attackTypes,
          flagged_patterns: flaggedPatterns,
          processing_time: Math.random() * 150 + 50,
          recommendation: recommendation,
          pii_detected: {},
          metadata: {
            pattern_score: Math.random() * 0.8 + 0.1,
            ml_score: Math.random() * 0.9 + 0.05,
            prompt_length: prompt.length,
            user_id: 'anonymous',
            pii_types_found: 0,
            pii_count: 0
          }
        },
        processing_time: Math.random() * 0.001,
        request_id: `req_${Date.now()}`
      });
    }, 1500); // Simulate API delay
  });
};

// Mock content generation
const mockGenerateContent = (prompt: string): Promise<GenerationResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const templates = [
        `Here's your optimized marketing content:\n\n"${prompt}"\n\nThis version maintains your key message while ensuring compliance with ethical marketing standards. The tone is engaging yet respectful, avoiding pressure tactics while still motivating action.`,
        `Generated marketing copy:\n\n"${prompt}"\n\nThis content has been refined to be more inclusive and transparent. It focuses on value proposition rather than urgency, making it suitable for diverse audiences while maintaining effectiveness.`,
        `Your enhanced marketing message:\n\n"${prompt}"\n\nThis version emphasizes benefits and authenticity. It's designed to build trust with your audience while driving engagement through genuine value rather than manipulation.`
      ];
      
      const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
      resolve({ generated_text: randomTemplate });
    }, 2000);
  });
};

const GuardPrompt = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [prompt, setPrompt] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<GuardPromptAnalysisResult | null>(null);
  const [generatedContent, setGeneratedContent] = useState("");

  const handleAnalyze = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await mockAnalyzePrompt(prompt);
      const analysisData = response.analysis;
      setAnalysis(analysisData);
      
      const isSafe = analysisData.threat_level === 'safe';
      toast({
        title: isSafe ? "Prompt is SAFE ✅" : "Blocked 🚫",
        description: isSafe ? "This prompt appears to be safe for use" : "This prompt contains potential risks",
        variant: isSafe ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze prompt. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    if (!analysis || analysis.threat_level !== 'safe') return;

    setIsGenerating(true);
    try {
      const data = await mockGenerateContent(prompt);
      setGeneratedContent(data.generated_text);
      
      toast({
        title: "Content Generated ✨",
        description: "Your safe prompt has been processed successfully"
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Unable to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleAnalyze();
    }
  };

  const copyAnalysis = () => {
    if (analysis) {
      navigator.clipboard.writeText(JSON.stringify(analysis, null, 2));
      toast({ title: "Analysis copied to clipboard" });
    }
  };

  const isSafe = analysis?.threat_level === 'safe';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 cyber-grid">
      <div className="relative min-h-screen p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-neon-teal hover:text-white hover:bg-neon-teal/20"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="text-neon-teal" size={32} />
            <h1 className="text-3xl font-bold text-white">GuardPrompt</h1>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Prompt Analysis</h2>
                
                <div className="space-y-4">
                  <Textarea
                    placeholder="Enter your marketing prompt here..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="min-h-[200px] bg-gray-900/50 border-gray-600 text-white placeholder-gray-400 focus:border-neon-teal focus:ring-neon-teal resize-none"
                  />
                  
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || !prompt.trim()}
                      className="flex-1 bg-neon-teal/20 border border-neon-teal text-neon-teal hover:bg-neon-teal hover:text-black transition-all"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neon-teal mr-2"></div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Shield size={16} className="mr-2" />
                          Check Prompt
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={handleGenerate}
                      disabled={!isSafe || isGenerating}
                      className={`flex-1 transition-all ${
                        isSafe 
                          ? 'bg-neon-green/20 border border-neon-green text-neon-green hover:bg-neon-green hover:text-black' 
                          : 'bg-gray-700/50 border border-gray-600 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neon-green mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Send size={16} className="mr-2" />
                          Send
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-xs text-gray-400 text-center">
                    Press Ctrl+Enter to analyze • Send is enabled only for safe prompts
                  </p>
                </div>
              </div>
            </Card>

            {/* Analysis Results */}
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Analysis Results</h2>
                  {analysis && (
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyAnalysis}
                        className="text-gray-400 hover:text-neon-teal"
                      >
                        <Copy size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-neon-teal"
                      >
                        <Share size={16} />
                      </Button>
                    </div>
                  )}
                </div>
                
                {isAnalyzing ? (
                  <LoadingShimmer />
                ) : analysis ? (
                  <ThreatAnalysis analysis={analysis} />
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500 text-center">
                    <div>
                      <Shield size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Enter a prompt and click "Check Prompt" to begin analysis</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Generated Content */}
          {generatedContent && (
            <div className="mt-8">
              <GeneratedContent content={generatedContent} isGenerating={isGenerating} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuardPrompt;

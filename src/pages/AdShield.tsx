
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Upload, FileText, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import LoadingShimmer from "@/components/LoadingShimmer";
import ThreatAnalysis from "@/components/ThreatAnalysis";

// Type definitions for API responses
interface AdShieldAnalysisResult {
  is_malicious: boolean;
  threat_level: string;
  confidence: number;
  attack_types: string[];
  flagged_patterns: string[];
  processing_time: number;
  recommendation: string;
  pii_detected: Record<string, any>;
  metadata: {
    content_length: number;
    pattern_score: number;
    ml_score: number;
    client_id: string;
    timestamp: string;
  };
  content_type: string;
  compliance_score: number;
  marketing_score: number;
  suggestions: string[];
}

// Mock analysis function for text content
const mockAnalyzeContent = (content: string, contentType: string = 'text'): Promise<AdShieldAnalysisResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lowercaseContent = content.toLowerCase();
      
      // Different risk patterns for different content types
      const emailRiskPatterns = ['act fast', 'limited offer', 'dont delay', 'expires soon', 'urgent action'];
      const socialRiskPatterns = ['follow for follow', 'like if you agree', 'share or miss out', 'tag friends'];
      const blogRiskPatterns = ['clickbait', 'you wont believe', 'shocking truth', 'secret revealed'];
      const generalRiskPatterns = ['guaranteed results', 'no questions asked', 'risk free', 'amazing deal'];
      
      let riskPatterns = [...generalRiskPatterns];
      if (contentType === 'email') riskPatterns.push(...emailRiskPatterns);
      if (contentType === 'social') riskPatterns.push(...socialRiskPatterns);
      if (contentType === 'blog') riskPatterns.push(...blogRiskPatterns);
      
      const hasHighRisk = riskPatterns.some(pattern => lowercaseContent.includes(pattern));
      const hasMediumRisk = ['free', 'discount', 'special offer', 'limited'].some(pattern => lowercaseContent.includes(pattern));
      
      let threatLevel = 'safe';
      let isMalicious = false;
      let confidence = 0.82;
      let attackTypes: string[] = [];
      let flaggedPatterns: string[] = [];
      let recommendation = "This content appears to be compliant with ethical marketing standards. No significant risks detected.";
      let suggestions: string[] = [];
      
      if (hasHighRisk) {
        threatLevel = 'high';
        isMalicious = true;
        confidence = 0.94;
        attackTypes = ['urgency_manipulation', 'false_scarcity'];
        flaggedPatterns = ['False urgency claim', 'Misleading free offer'];
        if (contentType === 'email') {
          attackTypes.push('email_spam_indicators');
          flaggedPatterns.push('Email spam indicators detected');
        }
        if (contentType === 'social') {
          attackTypes.push('engagement_baiting');
          flaggedPatterns.push('Engagement baiting detected');
        }
        recommendation = "⚠️ HIGH RISK: Content contains high-risk elements that may violate platform policies or ethical guidelines. Consider revising the messaging to be more transparent.";
        suggestions = [
          'Remove misleading urgency/scarcity claims',
          'Add proper disclaimers and terms',
          'Focus on genuine value proposition'
        ];
      } else if (hasMediumRisk) {
        threatLevel = 'medium';
        isMalicious = false;
        confidence = 0.76;
        attackTypes = ['promotional_language'];
        flaggedPatterns = ['Promotional language detected'];
        recommendation = "WARN: This content contains moderate promotional language. While not harmful, consider adding disclaimers or terms for better compliance.";
        suggestions = [
          'Add appropriate disclaimers',
          'Consider softening promotional language'
        ];
      }
      
      resolve({
        is_malicious: isMalicious,
        threat_level: threatLevel,
        confidence: confidence,
        attack_types: attackTypes,
        flagged_patterns: flaggedPatterns,
        processing_time: Math.random() * 200 + 100,
        recommendation: recommendation,
        pii_detected: {},
        metadata: {
          content_length: content.length,
          pattern_score: Math.random() * 0.7 + 0.2,
          ml_score: Math.random() * 0.85 + 0.1,
          client_id: 'anonymous',
          timestamp: new Date().toISOString()
        },
        content_type: contentType,
        compliance_score: hasHighRisk ? 10 : hasMediumRisk ? 60 : 100,
        marketing_score: hasHighRisk ? 20 : hasMediumRisk ? 70 : 85,
        suggestions: suggestions
      });
    }, 1800); // Simulate API delay
  });
};

// Mock file analysis
const mockAnalyzeFile = (file: File): Promise<AdShieldAnalysisResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const fileType = file.name.toLowerCase().includes('email') ? 'email' : 
                      file.name.toLowerCase().includes('social') ? 'social' :
                      file.name.toLowerCase().includes('blog') ? 'blog' : 'document';
      
      // Simulate different risk levels based on file name
      let threatLevel = 'safe';
      let isMalicious = false;
      let attackTypes: string[] = [];
      let flaggedPatterns: string[] = [];
      let suggestions: string[] = [];
      
      if (file.name.toLowerCase().includes('urgent') || file.name.toLowerCase().includes('sale')) {
        threatLevel = 'high';
        isMalicious = true;
        attackTypes = ['urgency_manipulation', 'sales_pressure'];
        flaggedPatterns = ['Urgent language detected', 'Sales pressure tactics'];
        suggestions = ['Remove urgent language', 'Focus on value instead of pressure'];
      } else if (file.name.toLowerCase().includes('promo') || file.name.toLowerCase().includes('offer')) {
        threatLevel = 'medium';
        isMalicious = false;
        attackTypes = ['promotional_language'];
        flaggedPatterns = ['Promotional content detected'];
        suggestions = ['Add disclaimers for promotional content'];
      }
      
      resolve({
        is_malicious: isMalicious,
        threat_level: threatLevel,
        confidence: Math.random() * 0.3 + 0.7,
        attack_types: attackTypes,
        flagged_patterns: flaggedPatterns,
        processing_time: Math.random() * 300 + 150,
        recommendation: threatLevel === 'safe' ? 
          "File content appears to be compliant with marketing standards." :
          "File contains elements that may need review for compliance.",
        pii_detected: {},
        metadata: {
          content_length: Math.floor(Math.random() * 2000) + 500,
          pattern_score: Math.random() * 0.8 + 0.1,
          ml_score: Math.random() * 0.9 + 0.05,
          client_id: 'anonymous',
          timestamp: new Date().toISOString()
        },
        content_type: fileType,
        compliance_score: threatLevel === 'high' ? 10 : threatLevel === 'medium' ? 60 : 100,
        marketing_score: threatLevel === 'high' ? 20 : threatLevel === 'medium' ? 70 : 85,
        suggestions: suggestions
      });
    }, 2500);
  });
};

const AdShield = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [inputType, setInputType] = useState<'text' | 'file'>('text');
  const [textContent, setTextContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [contentType, setContentType] = useState("text");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyses, setAnalyses] = useState<AdShieldAnalysisResult[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['.txt', '.docx', '.pdf'];
      return validTypes.some(type => file.name.toLowerCase().endsWith(type));
    });
    
    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid Files",
        description: "Only .txt, .docx, and .pdf files are supported",
        variant: "destructive"
      });
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (inputType === 'text' && !textContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter content to analyze",
        variant: "destructive"
      });
      return;
    }
    
    if (inputType === 'file' && selectedFiles.length === 0) {
      toast({
        title: "Error", 
        description: "Please upload at least one file",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalyses([]);
    
    try {
      if (inputType === 'text') {
        const result = await mockAnalyzeContent(textContent, contentType);
        setAnalyses([result]);
        
        const isSafe = result.threat_level === 'safe';
        toast({
          title: isSafe ? "Content is SAFE ✅" : "Risks Detected 🚫",
          description: isSafe ? "Content appears compliant" : "Content contains potential risks"
        });
      } else {
        const results = await Promise.all(
          selectedFiles.map(file => mockAnalyzeFile(file))
        );
        setAnalyses(results);
        
        const riskCount = results.filter(r => r.threat_level !== 'safe').length;
        toast({
          title: riskCount === 0 ? "All Files SAFE ✅" : `${riskCount} Risk(s) Found 🚫`,
          description: `Analyzed ${results.length} file(s)`
        });
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

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
            <Shield className="text-neon-magenta" size={32} />
            <h1 className="text-3xl font-bold text-white">AdShield</h1>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Content Analysis</h2>
                
                {/* Input Type Toggle */}
                <div className="flex space-x-2 mb-6">
                  <Button
                    onClick={() => setInputType('text')}
                    variant={inputType === 'text' ? 'default' : 'outline'}
                    className={inputType === 'text' ? 
                      'bg-neon-magenta/20 border-neon-magenta text-neon-magenta' : 
                      'border-gray-600 text-gray-400 hover:border-neon-magenta hover:text-neon-magenta'
                    }
                  >
                    <FileText size={16} className="mr-2" />
                    Text Input
                  </Button>
                  <Button
                    onClick={() => setInputType('file')}
                    variant={inputType === 'file' ? 'default' : 'outline'}
                    className={inputType === 'file' ? 
                      'bg-neon-magenta/20 border-neon-magenta text-neon-magenta' : 
                      'border-gray-600 text-gray-400 hover:border-neon-magenta hover:text-neon-magenta'
                    }
                  >
                    <Upload size={16} className="mr-2" />
                    File Upload
                  </Button>
                </div>

                {inputType === 'text' ? (
                  <div className="space-y-4">
                    {/* Content Type Selector */}
                    <div>
                      <label className="block text-white mb-2">Content Type</label>
                      <select
                        value={contentType}
                        onChange={(e) => setContentType(e.target.value)}
                        className="w-full bg-gray-900/50 border border-gray-600 text-white p-2 rounded focus:border-neon-magenta"
                      >
                        <option value="text">General Text</option>
                        <option value="email">Email Campaign</option>
                        <option value="social">Social Media Post</option>
                        <option value="blog">Blog Article</option>
                        <option value="ad">Advertisement</option>
                      </select>
                    </div>
                    
                    <Textarea
                      placeholder="Paste your marketing content here..."
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      className="min-h-[300px] bg-gray-900/50 border-gray-600 text-white placeholder-gray-400 focus:border-neon-magenta focus:ring-neon-magenta resize-none"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* File Upload */}
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-neon-magenta transition-colors">
                      <Upload size={48} className="mx-auto mb-4 text-gray-500" />
                      <p className="text-gray-400 mb-4">
                        Drop files here or click to upload
                      </p>
                      <input
                        type="file"
                        multiple
                        accept=".txt,.docx,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button
                        onClick={() => document.getElementById('file-upload')?.click()}
                        className="bg-neon-magenta/20 border border-neon-magenta text-neon-magenta hover:bg-neon-magenta hover:text-black"
                      >
                        Choose Files
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">
                        Supports .txt, .docx, .pdf files
                      </p>
                    </div>

                    {/* Selected Files */}
                    {selectedFiles.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-white font-semibold">Selected Files:</h4>
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-800/50 p-3 rounded">
                            <div className="flex items-center space-x-2">
                              <FileText size={16} className="text-neon-magenta" />
                              <span className="text-white text-sm">{file.name}</span>
                              <span className="text-gray-400 text-xs">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || (inputType === 'text' ? !textContent.trim() : selectedFiles.length === 0)}
                  className="w-full mt-6 bg-neon-magenta/20 border border-neon-magenta text-neon-magenta hover:bg-neon-magenta hover:text-black transition-all"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neon-magenta mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Shield size={16} className="mr-2" />
                      Analyze Content
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Analysis Results */}
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Analysis Results</h2>
                
                {isAnalyzing ? (
                  <LoadingShimmer />
                ) : analyses.length > 0 ? (
                  <div className="space-y-6">
                    {analyses.map((analysis, index) => (
                      <div key={index}>
                        {selectedFiles.length > 0 && (
                          <div className="mb-4 pb-2 border-b border-gray-700">
                            <h3 className="text-white font-semibold flex items-center">
                              <FileText size={16} className="mr-2 text-neon-magenta" />
                              {selectedFiles[index]?.name || `Analysis ${index + 1}`}
                            </h3>
                          </div>
                        )}
                        <ThreatAnalysis analysis={analysis} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500 text-center">
                    <div>
                      <AlertTriangle size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Upload content or files to begin analysis</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdShield;

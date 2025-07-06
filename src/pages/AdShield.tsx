
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Upload, FileText, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import LoadingShimmer from "@/components/LoadingShimmer";
import ThreatAnalysis from "@/components/ThreatAnalysis";

const AdShield = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [textContent, setTextContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const handleTextAnalyze = async () => {
    if (!textContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter content to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: textContent,
          user_id: "anonymous",
          include_pii: true,
          confidence_threshold: 1
        })
      });

      const data = await response.json();
      setAnalysis({ ...data, content_type: "Text Content" });
      
      const isSafe = data.threat_level === 'safe';
      toast({
        title: isSafe ? "Content is SAFE ✅" : "Issues Detected 🚫",
        description: isSafe ? "This content appears to be compliant" : "This content may have compliance issues",
        variant: isSafe ? "default" : "destructive"
      });
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(files);
      toast({
        title: "Files Selected",
        description: `${files.length} file(s) ready for analysis`
      });
    }
  };

  const handleFileAnalyze = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: "Error", 
        description: "Please select files to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      Array.from(selectedFiles).forEach(file => {
        formData.append('files', file);
      });

      const endpoint = selectedFiles.length === 1 ? '/analyze/file' : '/analyze/files';
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setAnalysis({ ...data, content_type: getFileType(selectedFiles[0].name) });
      
      const isSafe = data.threat_level === 'safe';
      toast({
        title: isSafe ? "Files are SAFE ✅" : "Issues Detected 🚫",
        description: isSafe ? "All files appear to be compliant" : "Some files may have compliance issues",
        variant: isSafe ? "default" : "destructive"
      });
    } catch (error) {
      console.error('File analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getFileType = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'PDF Document';
      case 'docx': case 'doc': return 'Word Document';
      case 'txt': return 'Text File';
      default: return 'Document';
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
              className="text-neon-magenta hover:text-white hover:bg-neon-magenta/20"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Search className="text-neon-magenta" size={32} />
            <h1 className="text-3xl font-bold text-white">AdShield</h1>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Content Analysis</h2>
                
                <Tabs defaultValue="text" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
                    <TabsTrigger 
                      value="text" 
                      className="data-[state=active]:bg-neon-magenta/20 data-[state=active]:text-neon-magenta"
                    >
                      <Type size={16} className="mr-2" />
                      Text Input
                    </TabsTrigger>
                    <TabsTrigger 
                      value="file"
                      className="data-[state=active]:bg-neon-magenta/20 data-[state=active]:text-neon-magenta"
                    >
                      <Upload size={16} className="mr-2" />
                      File Upload
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="text" className="space-y-4">
                    <Textarea
                      placeholder="Enter your marketing content here (emails, captions, blogs, etc.)..."
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      className="min-h-[200px] bg-gray-900/50 border-gray-600 text-white placeholder-gray-400 focus:border-neon-magenta focus:ring-neon-magenta resize-none"
                    />
                    
                    <Button
                      onClick={handleTextAnalyze}
                      disabled={isAnalyzing || !textContent.trim()}
                      className="w-full bg-neon-magenta/20 border border-neon-magenta text-neon-magenta hover:bg-neon-magenta hover:text-black transition-all"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neon-magenta mr-2"></div>
                          Analyzing Content...
                        </>
                      ) : (
                        <>
                          <Search size={16} className="mr-2" />
                          Analyze Text
                        </>
                      )}
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="file" className="space-y-4">
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-neon-magenta/50 transition-colors">
                      <FileText size={48} className="mx-auto mb-4 text-gray-500" />
                      <p className="text-gray-300 mb-4">
                        Upload marketing files for analysis
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Supports: .docx, .pdf, .txt files
                      </p>
                      <input
                        type="file"
                        multiple
                        accept=".docx,.pdf,.txt,.doc"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        className="border-neon-magenta text-neon-magenta hover:bg-neon-magenta/20"
                      >
                        <Upload size={16} className="mr-2" />
                        Select Files
                      </Button>
                    </div>
                    
                    {selectedFiles && selectedFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-300">Selected Files:</p>
                        {Array.from(selectedFiles).map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                            <span className="text-sm text-white">{file.name}</span>
                            <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
                          </div>
                        ))}
                        
                        <Button
                          onClick={handleFileAnalyze}
                          disabled={isAnalyzing}
                          className="w-full bg-neon-magenta/20 border border-neon-magenta text-neon-magenta hover:bg-neon-magenta hover:text-black transition-all"
                        >
                          {isAnalyzing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neon-magenta mr-2"></div>
                              Analyzing Files...
                            </>
                          ) : (
                            <>
                              <Search size={16} className="mr-2" />
                              Analyze Files
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </Card>

            {/* Analysis Results */}
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Analysis Results</h2>
                
                {isAnalyzing ? (
                  <LoadingShimmer />
                ) : analysis ? (
                  <ThreatAnalysis analysis={analysis} />
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500 text-center">
                    <div>
                      <Search size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Select content or upload files to begin analysis</p>
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

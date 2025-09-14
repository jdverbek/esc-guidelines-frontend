import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Filter, 
  Download, 
  BookOpen, 
  AlertCircle, 
  Loader2, 
  FileText,
  ExternalLink,
  Star,
  TrendingUp,
  Brain,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Separator } from '@/components/ui/separator.jsx'

const EnhancedSearchInterface = ({ systemInitialized, apiConnected, apiBaseUrl }) => {
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState('enhanced')
  const [responseType, setResponseType] = useState('comprehensive')
  const [topK, setTopK] = useState(10)
  const [results, setResults] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')
  const [searchStats, setSearchStats] = useState(null)

  const searchTypes = [
    { 
      value: 'enhanced', 
      label: 'Enhanced Search', 
      description: 'AI-powered synthesis with citations',
      icon: Brain
    },
    { 
      value: 'clinical', 
      label: 'Clinical Enhanced', 
      description: 'Clinical question with detailed analysis',
      icon: Zap
    },
    { 
      value: 'standard', 
      label: 'Standard Search', 
      description: 'Traditional search results',
      icon: Search
    }
  ]

  const responseTypes = [
    { value: 'comprehensive', label: 'Comprehensive', description: 'Detailed response with all evidence' },
    { value: 'brief', label: 'Brief', description: 'Concise summary of key points' },
    { value: 'detailed', label: 'Detailed', description: 'In-depth clinical guidance' }
  ]

  const exampleQueries = [
    'What is the treatment for atrial fibrillation?',
    'How should heart failure with reduced ejection fraction be managed?',
    'What are the anticoagulation guidelines for acute coronary syndrome?',
    'What is the recommended blood pressure target for hypertensive patients?',
    'When is endocarditis prophylaxis indicated?',
    'How should cardiovascular risk be assessed in diabetic patients?'
  ]

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query')
      return
    }

    if (!apiConnected) {
      setError('API connection not available')
      return
    }

    if (!systemInitialized) {
      setError('System not initialized. Please initialize the system first.')
      return
    }

    setIsSearching(true)
    setError('')
    setResults(null)
    setSearchStats(null)

    try {
      let endpoint, requestBody

      if (searchType === 'enhanced') {
        endpoint = '/search/enhanced'
        requestBody = { 
          query: query, 
          top_k: topK,
          response_type: responseType
        }
      } else if (searchType === 'clinical') {
        endpoint = '/clinical-search/enhanced'
        requestBody = { 
          question: query, 
          top_k: topK,
          response_type: responseType
        }
      } else {
        // Standard search fallback
        endpoint = '/search'
        requestBody = { 
          query: query, 
          top_k: topK 
        }
      }

      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setResults(data)
      setSearchStats({
        query: data.query || data.question || query,
        total_results: data.citations?.length || data.results?.length || 0,
        confidence: data.confidence || 0,
        response_type: data.response_type || 'standard'
      })

    } catch (err) {
      console.error('Search error:', err)
      setError(err.message || 'Search failed. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleExampleQuery = (exampleQuery) => {
    setQuery(exampleQuery)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSearch()
    }
  }

  const renderSynthesizedResponse = () => {
    if (!results?.synthesized_answer) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                AI-Synthesized Response
              </CardTitle>
              {searchStats?.confidence > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Confidence:</span>
                  <Progress 
                    value={searchStats.confidence * 100} 
                    className="w-20 h-2"
                  />
                  <span className="text-sm font-medium">
                    {Math.round(searchStats.confidence * 100)}%
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-sm max-w-none text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: results.synthesized_answer.replace(/\n/g, '<br/>') 
              }}
            />
            
            {results.evidence_summary && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <h4 className="font-medium text-sm text-gray-700 mb-2">Evidence Summary</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(results.evidence_summary.societies || {}).map(([society, count]) => (
                    <Badge key={society} variant="outline" className="text-xs">
                      {society}: {count}
                    </Badge>
                  ))}
                  {results.evidence_summary.quality_score && (
                    <Badge variant="outline" className="text-xs">
                      Quality Score: {Math.round(results.evidence_summary.quality_score * 100)}%
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const renderCitations = () => {
    if (!results?.citations?.length) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Citations & References
            </CardTitle>
            <CardDescription>
              Click on any citation to view the source PDF with highlighted text
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.citations.map((citation, index) => (
                <motion.div
                  key={citation.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs font-mono">
                          [{citation.id}]
                        </Badge>
                        <span className="font-medium text-sm">
                          {citation.guideline}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {citation.society} {citation.year}
                        </Badge>
                        {citation.evidence_class && (
                          <Badge 
                            variant={citation.evidence_class === 'I' ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            Class {citation.evidence_class}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {citation.text}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Page {citation.page}</span>
                        {citation.section && (
                          <>
                            <span>•</span>
                            <span>{citation.section}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0"
                      onClick={() => window.open(citation.pdf_link, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View PDF
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const renderStandardResults = () => {
    if (!results?.results?.length) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5 text-gray-600" />
              Search Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.results.slice(0, 5).map((result, index) => (
                <motion.div
                  key={result.chunk_id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-4"
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {result.society} {result.year}
                      </Badge>
                      {result.evidence_class && (
                        <Badge variant="secondary" className="text-xs">
                          Class {result.evidence_class}
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">
                        Score: {(result.score * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    {result.text}
                  </p>
                  <div className="text-xs text-gray-500">
                    {result.guideline_name} • Page {result.page_number}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Enhanced Cardiovascular Guidelines Search
          </CardTitle>
          <CardDescription>
            Get AI-synthesized responses with clickable citations from ESC and ACC/AHA guidelines
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {searchTypes.map((type) => {
              const IconComponent = type.icon
              return (
                <Card 
                  key={type.value}
                  className={`cursor-pointer transition-all ${
                    searchType === type.value 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSearchType(type.value)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <IconComponent className="h-4 w-4" />
                      <span className="font-medium text-sm">{type.label}</span>
                    </div>
                    <p className="text-xs text-gray-600">{type.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Response Type (for enhanced searches) */}
          {(searchType === 'enhanced' || searchType === 'clinical') && (
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Response Style:</label>
              <Select value={responseType} onValueChange={setResponseType}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {responseTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Search Input */}
          <div className="space-y-2">
            <Textarea
              placeholder="Enter your cardiovascular medicine question..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="min-h-[80px] resize-none"
              disabled={isSearching}
            />
            
            {/* Example Queries */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-gray-500 mr-2">Examples:</span>
              {exampleQueries.slice(0, 3).map((example, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800"
                  onClick={() => handleExampleQuery(example)}
                  disabled={isSearching}
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>

          {/* Search Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm">Results:</label>
                <Select value={topK.toString()} onValueChange={(value) => setTopK(parseInt(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleSearch} 
              disabled={isSearching || !query.trim() || !apiConnected || !systemInitialized}
              className="min-w-[120px]"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Stats */}
      {searchStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">
                    Query: <span className="font-medium">{searchStats.query}</span>
                  </span>
                  <span className="text-gray-600">
                    Results: <span className="font-medium">{searchStats.total_results}</span>
                  </span>
                  {searchStats.confidence > 0 && (
                    <span className="text-gray-600">
                      Confidence: <span className="font-medium">{Math.round(searchStats.confidence * 100)}%</span>
                    </span>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">
                  {searchStats.response_type || 'standard'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Results Display */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {renderSynthesizedResponse()}
            {renderCitations()}
            {renderStandardResults()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default EnhancedSearchInterface


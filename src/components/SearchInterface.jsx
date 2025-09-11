import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Download, BookOpen, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'

const SearchInterface = ({ systemInitialized, apiConnected, apiBaseUrl }) => {
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState('semantic')
  const [topK, setTopK] = useState(10)
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')
  const [searchStats, setSearchStats] = useState(null)

  const searchTypes = [
    { value: 'semantic', label: 'Semantic Search', description: 'AI-powered meaning-based search' },
    { value: 'keyword', label: 'Keyword Search', description: 'Traditional keyword matching' },
    { value: 'hybrid', label: 'Hybrid Search', description: 'Combined semantic and keyword search' },
    { value: 'clinical', label: 'Clinical Question', description: 'Structured clinical question answering' }
  ]

  const exampleQueries = [
    'Atrial fibrillation anticoagulation guidelines',
    'Heart failure with reduced ejection fraction treatment',
    'Acute coronary syndrome management',
    'Hypertension in diabetes mellitus',
    'Endocarditis prophylaxis recommendations',
    'Cardiovascular risk assessment tools'
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
    setResults([])
    setSearchStats(null)

    try {
      const endpoint = searchType === 'clinical' ? '/search/clinical' : '/search'
      const requestBody = searchType === 'clinical' 
        ? { question: query, top_k: topK }
        : { query: query, search_type: searchType, top_k: topK }

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

      setResults(data.results || [])
      setSearchStats({
        query: data.query || query,
        total_results: data.total_results || data.results?.length || 0,
        search_time: data.search_time || 0,
        medical_terms: data.medical_terms || []
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

  const formatRelevanceScore = (score) => {
    if (typeof score === 'number') {
      return (score * 100).toFixed(1) + '%'
    }
    return 'N/A'
  }

  const highlightText = (text, query) => {
    if (!query || !text) return text
    
    const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 2)
    let highlightedText = text
    
    queryWords.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi')
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>')
    })
    
    return highlightedText
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-6 h-6 text-blue-600" />
              <span>Cardiovascular Guidelines Search</span>
            </CardTitle>
            <CardDescription>
              Search through ESC and ACC/AHA cardiovascular guidelines using advanced AI-powered retrieval
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Input */}
            <div className="space-y-2">
              <Textarea
                placeholder="Enter your cardiovascular medicine question or search terms..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[80px] resize-none"
                disabled={!apiConnected || !systemInitialized}
              />
            </div>

            {/* Search Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Type</label>
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {searchTypes.map((type) => (
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Number of Results</label>
                <Select value={topK.toString()} onValueChange={(value) => setTopK(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 results</SelectItem>
                    <SelectItem value="10">10 results</SelectItem>
                    <SelectItem value="15">15 results</SelectItem>
                    <SelectItem value="20">20 results</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={handleSearch}
                  disabled={!query.trim() || isSearching || !apiConnected || !systemInitialized}
                  className="w-full"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search Guidelines
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Example Queries */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Example Queries:</label>
              <div className="flex flex-wrap gap-2">
                {exampleQueries.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleExampleQuery(example)}
                    className="text-xs"
                    disabled={!apiConnected || !systemInitialized}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Search Stats */}
      {searchStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Query:</span> "{searchStats.query}"
                </div>
                <div>
                  <span className="font-medium">Results:</span> {searchStats.total_results}
                </div>
                <div>
                  <span className="font-medium">Search Time:</span> {searchStats.search_time?.toFixed(2)}s
                </div>
              </div>
              {searchStats.medical_terms && searchStats.medical_terms.length > 0 && (
                <div className="mt-4">
                  <span className="font-medium text-sm">Medical Terms Identified:</span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {searchStats.medical_terms.map((term, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {term}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold">Search Results</h3>
          {results.map((result, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-blue-700 flex items-center space-x-2">
                        <BookOpen className="w-5 h-5" />
                        <span>{result.document_name || result.source || 'Unknown Document'}</span>
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Page {result.page_number || 'N/A'} • 
                        Section: {result.section_title || result.section || 'General'} • 
                        Relevance: {formatRelevanceScore(result.relevance_score || result.score)}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-4">
                      Rank #{index + 1}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div 
                    className="text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightText(
                        result.highlighted_text || result.text || result.content || 'No content available',
                        query
                      )
                    }}
                  />
                  {result.metadata && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        {Object.entries(result.metadata).map(([key, value]) => (
                          <span key={key} className="mr-4">
                            <span className="font-medium">{key}:</span> {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* No Results */}
      {!isSearching && results.length === 0 && searchStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="pt-6 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
              <p className="text-gray-600 mb-4">
                Try different search terms or use a different search type.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {exampleQueries.slice(0, 3).map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleExampleQuery(example)}
                  >
                    Try: {example}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* System Not Ready */}
      {(!apiConnected || !systemInitialized) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="pt-6 text-center">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {!apiConnected ? 'API Not Connected' : 'System Not Initialized'}
              </h3>
              <p className="text-gray-600">
                {!apiConnected 
                  ? 'Please check your internet connection and ensure the API server is running.'
                  : 'Please initialize the system to download and process cardiovascular guidelines before searching.'
                }
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

export default SearchInterface


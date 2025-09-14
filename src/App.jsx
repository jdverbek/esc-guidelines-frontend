import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Search, Shield, FileText, Activity, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import './App.css'

// Import components
import SearchInterface from './components/SearchInterface'
import EnhancedSearchInterface from './components/EnhancedSearchInterface'
import SafetyValidator from './components/SafetyValidator'
import ComplianceChecker from './components/ComplianceChecker'
import SystemStatus from './components/SystemStatus'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://cardiovascular-guidelines-api.onrender.com'

function App() {
  const [systemStatus, setSystemStatus] = useState({
    initialized: false,
    status: 'not_started',
    progress: 0
  })
  const [activeTab, setActiveTab] = useState('enhanced')
  const [isLoading, setIsLoading] = useState(true)
  const [apiConnected, setApiConnected] = useState(false)

  // Check system health on mount
  useEffect(() => {
    checkSystemHealth()
    const interval = setInterval(checkSystemHealth, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const checkSystemHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`)
      if (response.ok) {
        const data = await response.json()
        setApiConnected(true)
        setSystemStatus({
          initialized: data.system_initialized || false,
          status: data.initialization_status || 'not_started',
          progress: data.initialization_progress || 0
        })
      } else {
        setApiConnected(false)
      }
      setIsLoading(false)
    } catch (error) {
      console.error('Health check failed:', error)
      setApiConnected(false)
      setIsLoading(false)
    }
  }

  const initializeSystem = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/system/initialize`, { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      
      if (response.ok) {
        // Poll for initialization status
        const pollStatus = setInterval(async () => {
          try {
            const statusResponse = await fetch(`${API_BASE_URL}/system/initialization-status`)
            if (statusResponse.ok) {
              const statusData = await statusResponse.json()
              
              setSystemStatus({
                initialized: statusData.is_initialized || false,
                status: statusData.status || 'in_progress',
                progress: statusData.progress || 0
              })
              
              if (statusData.status === 'completed' || statusData.status === 'failed') {
                clearInterval(pollStatus)
              }
            }
          } catch (error) {
            console.error('Status poll failed:', error)
            clearInterval(pollStatus)
          }
        }, 2000)
      }
    } catch (error) {
      console.error('Initialization failed:', error)
    }
  }

  const navigationItems = [
    { id: 'enhanced', label: 'Enhanced Search', icon: Search, description: 'AI-powered search with synthesis' },
    { id: 'search', label: 'Standard Search', icon: BookOpen, description: 'Traditional guideline search' },
    { id: 'safety', label: 'Safety Validation', icon: Shield, description: 'Validate clinical recommendations' },
    { id: 'compliance', label: 'Compliance Check', icon: FileText, description: 'Check guideline compliance' },
    { id: 'status', label: 'System Status', icon: Activity, description: 'Monitor system health' }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Heart className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading System...</h2>
          <p className="text-gray-600">Checking system health</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="bg-gradient-to-r from-red-500 to-pink-500 p-3 rounded-xl">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Cardiovascular Guidelines
                </h1>
                <p className="text-sm text-gray-600">Compliance System</p>
              </div>
            </motion.div>

            <div className="flex items-center space-x-4">
              {/* API Connection Status */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-2"
              >
                {apiConnected ? (
                  <Badge variant="success" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    API Connected
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="bg-red-100 text-red-800">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    API Disconnected
                  </Badge>
                )}
              </motion.div>

              {/* System Status Indicator */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-2"
              >
                {systemStatus.initialized ? (
                  <Badge variant="success" className="bg-green-100 text-green-800">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    System Ready
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="bg-yellow-100 text-yellow-800">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {systemStatus.status === 'in_progress' ? 'Initializing...' : 'Not Initialized'}
                  </Badge>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      {/* API Connection Alert */}
      {!apiConnected && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
        >
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="flex items-center justify-between">
                <span>Cannot connect to API server. Please check if the backend is running.</span>
                <Button 
                  onClick={checkSystemHealth}
                  variant="outline"
                  className="ml-4 border-red-300 text-red-700 hover:bg-red-100"
                >
                  Retry Connection
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Initialization Alert */}
      {apiConnected && !systemStatus.initialized && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
        >
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              {systemStatus.status === 'not_started' && (
                <div className="flex items-center justify-between">
                  <span>System needs to be initialized before use. This will download and process cardiovascular guidelines.</span>
                  <Button 
                    onClick={initializeSystem}
                    className="ml-4 bg-yellow-600 hover:bg-yellow-700"
                  >
                    Initialize System
                  </Button>
                </div>
              )}
              {systemStatus.status === 'in_progress' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span>Initializing system components...</span>
                    <span className="text-sm font-medium">{systemStatus.progress}%</span>
                  </div>
                  <Progress value={systemStatus.progress} className="w-full" />
                </div>
              )}
              {systemStatus.status === 'failed' && (
                <div className="flex items-center justify-between">
                  <span>System initialization failed. Please try again.</span>
                  <Button 
                    onClick={initializeSystem}
                    variant="destructive"
                    className="ml-4"
                  >
                    Retry Initialization
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {navigationItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                  activeTab === item.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                } ${!apiConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => apiConnected && setActiveTab(item.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      activeTab === item.id 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{item.label}</CardTitle>
                      <CardDescription className="text-sm">
                        {item.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'enhanced' && (
              <EnhancedSearchInterface 
                systemInitialized={systemStatus.initialized} 
                apiConnected={apiConnected}
                apiBaseUrl={API_BASE_URL}
              />
            )}
            {activeTab === 'search' && (
              <SearchInterface 
                systemInitialized={systemStatus.initialized} 
                apiConnected={apiConnected}
                apiBaseUrl={API_BASE_URL}
              />
            )}
            {activeTab === 'safety' && (
              <SafetyValidator 
                systemInitialized={systemStatus.initialized}
                apiConnected={apiConnected}
                apiBaseUrl={API_BASE_URL}
              />
            )}
            {activeTab === 'compliance' && (
              <ComplianceChecker 
                systemInitialized={systemStatus.initialized}
                apiConnected={apiConnected}
                apiBaseUrl={API_BASE_URL}
              />
            )}
            {activeTab === 'status' && (
              <SystemStatus 
                apiConnected={apiConnected}
                apiBaseUrl={API_BASE_URL}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              Cardiovascular Guidelines Compliance System v1.0.0
            </p>
            <p className="text-sm">
              ⚠️ For educational and research purposes only. Always consult qualified healthcare professionals for clinical decisions.
            </p>
            <p className="text-xs mt-2 text-gray-500">
              API: {API_BASE_URL}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App


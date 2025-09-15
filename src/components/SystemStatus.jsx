import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, Server, Database, Download, FileText, CheckCircle, AlertTriangle, RefreshCw, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'

const SystemStatus = () => {
  const [systemStats, setSystemStats] = useState(null)
  const [guidelinesStatus, setGuidelinesStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')

  useEffect(() => {
    fetchSystemStatus()
    const interval = setInterval(fetchSystemStatus, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchSystemStatus = async () => {
    try {
      setIsRefreshing(true)
      
      const API_URL = import.meta.env.VITE_API_URL || 'https://esc-guidelines-search.onrender.com'
      
      // Fetch system stats
      const statsResponse = await fetch(`${API_URL}/stats`)
      const statsData = await statsResponse.json()
      setSystemStats(statsData)

      // Fetch guidelines status
      const guidelinesResponse = await fetch(`${API_URL}/guidelines/status`)
      const guidelinesData = await guidelinesResponse.json()
      setGuidelinesStatus(guidelinesData)

      setIsLoading(false)
    } catch (error) {
      console.error('Failed to fetch system status:', error)
      setIsLoading(false)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDownloadGuidelines = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://esc-guidelines-search.onrender.com'
      const response = await fetch(`${API_URL}/guidelines/download-from-drive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          society: 'all',
          force_redownload: false
        })
      })

      if (response.ok) {
        // Refresh status after starting download
        setTimeout(fetchSystemStatus, 2000)
      }
    } catch (error) {
      console.error('Failed to start guideline download:', error)
    }
  }

  const handleProcessGuidelines = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://esc-guidelines-search.onrender.com'
      const response = await fetch(`${API_URL}/guidelines/process`, {
        method: 'POST'
      })

      if (response.ok) {
        // Refresh status after starting processing
        setTimeout(fetchSystemStatus, 2000)
      }
    } catch (error) {
      console.error('Failed to start guideline processing:', error)
    }
  }

  const handleFileUpload = async (event) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadProgress('Starting upload...')

    const API_URL = import.meta.env.VITE_API_URL || 'https://esc-guidelines-search.onrender.com'

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setUploadProgress(`Uploading ${file.name} (${i + 1}/${files.length})...`)

        const formData = new FormData()
        formData.append('file', file)
        formData.append('society', 'ESC')
        formData.append('year', '2024')
        formData.append('guideline_name', file.name.replace('.pdf', ''))

        const response = await fetch(`${API_URL}/guidelines/upload-pdf`, {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const result = await response.json()
          console.log(`✓ Uploaded ${file.name}:`, result)
        } else {
          console.error(`✗ Failed to upload ${file.name}`)
        }
      }

      setUploadProgress('Upload complete! Refreshing status...')
      setTimeout(() => {
        fetchSystemStatus()
        setIsUploading(false)
        setUploadProgress('')
      }, 2000)

    } catch (error) {
      console.error('Upload error:', error)
      setUploadProgress('Upload failed')
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress('')
      }, 3000)
    }

    // Reset file input
    event.target.value = ''
  }

  const handleProcessDrivePdfs = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://esc-guidelines-search.onrender.com'
      const response = await fetch(`${API_URL}/guidelines/process-drive-pdfs`, {
        method: 'POST'
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Drive PDF processing started:', result)
        setTimeout(fetchSystemStatus, 2000)
      }
    } catch (error) {
      console.error('Failed to start drive PDF processing:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Status</h2>
          <p className="text-gray-600">Monitor system health and manage guidelines</p>
        </div>
        <Button 
          onClick={fetchSystemStatus}
          disabled={isRefreshing}
          variant="outline"
        >
          {isRefreshing ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </motion.div>

      {/* System Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-500" />
              <span>System Health</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {systemStats && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">System Status:</span>
                  <Badge 
                    className={systemStats.system_status.initialized 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {systemStats.system_status.initialized ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Operational
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {systemStats.system_status.initialization_status}
                      </>
                    )}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Server className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-lg font-bold">API Server</div>
                    <div className="text-sm text-gray-600">Running</div>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <Database className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-lg font-bold">Vector Store</div>
                    <div className="text-sm text-gray-600">
                      {guidelinesStatus?.vector_store_exists ? 'Available' : 'Not Created'}
                    </div>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <FileText className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="text-lg font-bold">Processing</div>
                    <div className="text-sm text-gray-600">Ready</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Guidelines Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="w-5 h-5 text-blue-500" />
              <span>Guidelines Status</span>
            </CardTitle>
            <CardDescription>
              Current status of downloaded and processed guidelines
            </CardDescription>
          </CardHeader>
          <CardContent>
            {guidelinesStatus && (
              <div className="space-y-6">
                {/* Download Status */}
                <div className="space-y-3">
                  <h4 className="font-medium">Downloaded Guidelines</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {guidelinesStatus.downloaded.total}
                      </div>
                      <div className="text-sm text-gray-600">Total Downloaded</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {guidelinesStatus.downloaded.esc}
                      </div>
                      <div className="text-sm text-gray-600">ESC Guidelines</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {guidelinesStatus.downloaded.acc_aha}
                      </div>
                      <div className="text-sm text-gray-600">ACC/AHA Guidelines</div>
                    </div>
                  </div>
                </div>

                {/* Processing Status */}
                <div className="space-y-3">
                  <h4 className="font-medium">Processed Guidelines</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {guidelinesStatus.processed.total}
                      </div>
                      <div className="text-sm text-gray-600">Total Processed</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {guidelinesStatus.processed.esc}
                      </div>
                      <div className="text-sm text-gray-600">ESC Processed</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {guidelinesStatus.processed.acc_aha}
                      </div>
                      <div className="text-sm text-gray-600">ACC/AHA Processed</div>
                    </div>
                  </div>
                </div>

                {/* Processing Progress */}
                {guidelinesStatus.downloaded.total > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Processing Progress:</span>
                      <span className="text-sm">
                        {guidelinesStatus.processed.total} / {guidelinesStatus.downloaded.total}
                      </span>
                    </div>
                    <Progress 
                      value={guidelinesStatus.downloaded.total > 0 
                        ? (guidelinesStatus.processed.total / guidelinesStatus.downloaded.total) * 100 
                        : 0
                      } 
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-4">
                  {/* Upload Section */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <h4 className="font-medium mb-2">Upload ESC Guidelines PDFs</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload PDFs from your Google Drive folder to process them automatically
                    </p>
                    
                    <input
                      type="file"
                      id="pdf-upload"
                      multiple
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                    
                    <Button 
                      onClick={() => document.getElementById('pdf-upload').click()}
                      disabled={isUploading}
                      className="mb-2"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {isUploading ? 'Uploading...' : 'Select PDF Files'}
                    </Button>
                    
                    {uploadProgress && (
                      <div className="text-sm text-blue-600 mt-2">
                        {uploadProgress}
                      </div>
                    )}
                  </div>

                  {/* Traditional Buttons */}
                  <div className="flex space-x-4">
                    <Button 
                      onClick={handleDownloadGuidelines}
                      className="flex-1"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Guidelines
                    </Button>
                    <Button 
                      onClick={handleProcessGuidelines}
                      variant="outline"
                      className="flex-1"
                      disabled={guidelinesStatus.downloaded.total === 0}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Process Guidelines
                    </Button>
                  </div>

                  {/* Google Drive Processing */}
                  <Button 
                    onClick={handleProcessDrivePdfs}
                    variant="outline"
                    className="w-full"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Process Drive PDFs
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Available Guidelines */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Available Guidelines</CardTitle>
            <CardDescription>
              Guidelines configured for download and processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            {systemStats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {systemStats.guidelines.total_available}
                  </div>
                  <div className="text-sm text-gray-600">Total Available</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {systemStats.guidelines.esc_available}
                  </div>
                  <div className="text-sm text-gray-600">ESC Available</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {systemStats.guidelines.acc_aha_available}
                  </div>
                  <div className="text-sm text-gray-600">ACC/AHA Available</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default SystemStatus


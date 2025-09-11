import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, AlertTriangle, CheckCircle, XCircle, User, Pill, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'

const SafetyValidator = ({ systemInitialized }) => {
  const [recommendation, setRecommendation] = useState('')
  const [patientProfile, setPatientProfile] = useState({
    age: '',
    gender: '',
    comorbidities: '',
    current_medications: '',
    allergies: '',
    renal_function: '',
    hepatic_function: ''
  })
  const [validationResult, setValidationResult] = useState(null)
  const [isValidating, setIsValidating] = useState(false)

  const handleValidation = async () => {
    if (!recommendation.trim() || !systemInitialized) return

    setIsValidating(true)
    try {
      const payload = {
        recommendation: recommendation,
        patient_profile: {
          age: patientProfile.age ? parseInt(patientProfile.age) : null,
          gender: patientProfile.gender || null,
          comorbidities: patientProfile.comorbidities ? patientProfile.comorbidities.split(',').map(c => c.trim()) : [],
          current_medications: patientProfile.current_medications ? patientProfile.current_medications.split(',').map(m => m.trim()) : [],
          allergies: patientProfile.allergies ? patientProfile.allergies.split(',').map(a => a.trim()) : [],
          renal_function: patientProfile.renal_function ? parseFloat(patientProfile.renal_function) : null,
          hepatic_function: patientProfile.hepatic_function || null
        },
        include_guidelines: true
      }

      const response = await fetch('/safety/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('Validation failed')
      }

      const data = await response.json()
      setValidationResult(data)
    } catch (error) {
      console.error('Validation error:', error)
      setValidationResult(null)
    } finally {
      setIsValidating(false)
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'major': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'minor': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4" />
      case 'major': return <AlertTriangle className="w-4 h-4" />
      case 'moderate': return <AlertTriangle className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-green-500" />
              <span>Safety Validation</span>
            </CardTitle>
            <CardDescription>
              Validate clinical recommendations for drug interactions, contraindications, and safety concerns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Recommendation Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Clinical Recommendation</label>
              <Textarea
                placeholder="Enter the clinical recommendation to validate (e.g., 'Start warfarin 5mg daily for atrial fibrillation')"
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* Patient Profile */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-medium">Patient Profile</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Age</label>
                  <Input
                    type="number"
                    placeholder="Patient age"
                    value={patientProfile.age}
                    onChange={(e) => setPatientProfile({...patientProfile, age: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gender</label>
                  <Input
                    placeholder="Male/Female"
                    value={patientProfile.gender}
                    onChange={(e) => setPatientProfile({...patientProfile, gender: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Comorbidities</label>
                  <Input
                    placeholder="Diabetes, hypertension, etc. (comma-separated)"
                    value={patientProfile.comorbidities}
                    onChange={(e) => setPatientProfile({...patientProfile, comorbidities: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Medications</label>
                  <Input
                    placeholder="Aspirin, metoprolol, etc. (comma-separated)"
                    value={patientProfile.current_medications}
                    onChange={(e) => setPatientProfile({...patientProfile, current_medications: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Allergies</label>
                  <Input
                    placeholder="Drug allergies (comma-separated)"
                    value={patientProfile.allergies}
                    onChange={(e) => setPatientProfile({...patientProfile, allergies: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Renal Function (eGFR)</label>
                  <Input
                    type="number"
                    placeholder="eGFR in mL/min/1.73m²"
                    value={patientProfile.renal_function}
                    onChange={(e) => setPatientProfile({...patientProfile, renal_function: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Validate Button */}
            <Button 
              onClick={handleValidation}
              disabled={!recommendation.trim() || isValidating || !systemInitialized}
              className="w-full py-3 text-lg"
            >
              {isValidating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Validating Safety...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5 mr-2" />
                  Validate Safety
                </>
              )}
            </Button>

            {!systemInitialized && (
              <Alert>
                <AlertDescription>
                  System must be initialized before validation. Please initialize the system first.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Validation Results */}
      {validationResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Overall Safety Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Safety Assessment</span>
                <Badge 
                  className={validationResult.is_safe 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                  }
                >
                  {validationResult.is_safe ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      SAFE
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-1" />
                      UNSAFE
                    </>
                  )}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Confidence Score:</span>
                  <span className="text-lg font-bold">
                    {(validationResult.confidence_score * 100).toFixed(1)}%
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-red-600">
                      {validationResult.alerts.filter(a => a.severity === 'critical').length}
                    </div>
                    <div className="text-xs text-gray-600">Critical Alerts</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-orange-600">
                      {validationResult.alerts.filter(a => a.severity === 'major').length}
                    </div>
                    <div className="text-xs text-gray-600">Major Alerts</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-blue-600">
                      {validationResult.drug_interactions.length}
                    </div>
                    <div className="text-xs text-gray-600">Drug Interactions</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-purple-600">
                      {validationResult.contraindications.length}
                    </div>
                    <div className="text-xs text-gray-600">Contraindications</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Safety Alerts */}
          {validationResult.alerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <span>Safety Alerts</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {validationResult.alerts.map((alert, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getSeverityIcon(alert.severity)}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{alert.message}</h4>
                          <Badge variant="outline" className="text-xs">
                            {alert.type}
                          </Badge>
                        </div>
                        {alert.evidence && (
                          <p className="text-sm opacity-90">{alert.evidence}</p>
                        )}
                        <div className="bg-white bg-opacity-50 p-2 rounded text-sm">
                          <strong>Recommendation:</strong> {alert.recommendation}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default SafetyValidator


import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, CheckCircle, AlertTriangle, User, Activity, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Progress } from '@/components/ui/progress.jsx'

const ComplianceChecker = ({ systemInitialized }) => {
  const [patientNote, setPatientNote] = useState('')
  const [complianceResult, setComplianceResult] = useState(null)
  const [isChecking, setIsChecking] = useState(false)

  const handleComplianceCheck = async () => {
    if (!patientNote.trim() || !systemInitialized) return

    setIsChecking(true)
    try {
      const payload = {
        patient_note: patientNote,
        check_safety: true,
        urgency: 'routine'
      }

      const response = await fetch('/compliance/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('Compliance check failed')
      }

      const data = await response.json()
      setComplianceResult(data)
    } catch (error) {
      console.error('Compliance check error:', error)
      setComplianceResult(null)
    } finally {
      setIsChecking(false)
    }
  }

  const getSocietyColor = (society) => {
    switch (society) {
      case 'ESC': return 'bg-blue-100 text-blue-800'
      case 'ACC_AHA': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEvidenceColor = (evidenceClass) => {
    switch (evidenceClass) {
      case 'Class I': return 'bg-green-100 text-green-800'
      case 'Class IIa': return 'bg-blue-100 text-blue-800'
      case 'Class IIb': return 'bg-yellow-100 text-yellow-800'
      case 'Class III': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
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
              <FileText className="w-6 h-6 text-purple-500" />
              <span>Compliance Checker</span>
            </CardTitle>
            <CardDescription>
              Check clinical notes and recommendations against cardiovascular guidelines for compliance and safety
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Patient Note Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Clinical Note / Patient Assessment</label>
              <Textarea
                placeholder="Enter the clinical note or patient assessment to check for guideline compliance (e.g., '65-year-old male with atrial fibrillation, started on warfarin 5mg daily, target INR 2-3...')"
                value={patientNote}
                onChange={(e) => setPatientNote(e.target.value)}
                className="min-h-[150px]"
              />
            </div>

            {/* Check Button */}
            <Button 
              onClick={handleComplianceCheck}
              disabled={!patientNote.trim() || isChecking || !systemInitialized}
              className="w-full py-3 text-lg"
            >
              {isChecking ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Checking Compliance...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5 mr-2" />
                  Check Compliance
                </>
              )}
            </Button>

            {!systemInitialized && (
              <Alert>
                <AlertDescription>
                  System must be initialized before compliance checking. Please initialize the system first.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Compliance Results */}
      {complianceResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Clinical Context */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-500" />
                <span>Clinical Context Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-red-600">Diseases/Conditions</h4>
                  <div className="flex flex-wrap gap-1">
                    {complianceResult.clinical_context.diseases.map((disease, index) => (
                      <Badge key={index} variant="outline" className="bg-red-50 text-red-700 text-xs">
                        {disease}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-green-600">Medications</h4>
                  <div className="flex flex-wrap gap-1">
                    {complianceResult.clinical_context.drugs.map((drug, index) => (
                      <Badge key={index} variant="outline" className="bg-green-50 text-green-700 text-xs">
                        {drug}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-blue-600">Procedures</h4>
                  <div className="flex flex-wrap gap-1">
                    {complianceResult.clinical_context.procedures.map((procedure, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                        {procedure}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-orange-600">Symptoms</h4>
                  <div className="flex flex-wrap gap-1">
                    {complianceResult.clinical_context.symptoms.map((symptom, index) => (
                      <Badge key={index} variant="outline" className="bg-orange-50 text-orange-700 text-xs">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              {complianceResult.clinical_context.urgency_level && (
                <div className="pt-2">
                  <Badge 
                    variant={complianceResult.clinical_context.urgency_level === 'emergency' ? 'destructive' : 'secondary'}
                  >
                    Urgency: {complianceResult.clinical_context.urgency_level}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Guideline Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span>Guideline Analysis Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-blue-600">
                    {complianceResult.guideline_summary.total_guidelines}
                  </div>
                  <div className="text-xs text-gray-600">Total Guidelines</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-blue-600">
                    {complianceResult.guideline_summary.esc_guidelines}
                  </div>
                  <div className="text-xs text-gray-600">ESC Guidelines</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-purple-600">
                    {complianceResult.guideline_summary.acc_aha_guidelines}
                  </div>
                  <div className="text-xs text-gray-600">ACC/AHA Guidelines</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-green-600">
                    {complianceResult.guideline_summary.evidence_levels.class_i}
                  </div>
                  <div className="text-xs text-gray-600">Class I Evidence</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-blue-600">
                    {complianceResult.guideline_summary.evidence_levels.class_iia}
                  </div>
                  <div className="text-xs text-gray-600">Class IIa Evidence</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Safety Validation Summary */}
          {complianceResult.safety_validation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-orange-500" />
                    <span>Safety Validation Summary</span>
                  </div>
                  <Badge 
                    className={complianceResult.safety_validation.is_safe 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                    }
                  >
                    {complianceResult.safety_validation.is_safe ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        SAFE
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        SAFETY CONCERNS
                      </>
                    )}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Safety Confidence:</span>
                    <div className="flex items-center space-x-2">
                      <Progress 
                        value={complianceResult.safety_validation.confidence_score * 100} 
                        className="w-24" 
                      />
                      <span className="text-sm font-bold">
                        {(complianceResult.safety_validation.confidence_score * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="text-xl font-bold text-red-600">
                        {complianceResult.safety_validation.critical_alerts}
                      </div>
                      <div className="text-xs text-gray-600">Critical Alerts</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xl font-bold text-orange-600">
                        {complianceResult.safety_validation.major_alerts}
                      </div>
                      <div className="text-xs text-gray-600">Major Alerts</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xl font-bold text-blue-600">
                        {complianceResult.safety_validation.drug_interactions}
                      </div>
                      <div className="text-xs text-gray-600">Drug Interactions</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xl font-bold text-purple-600">
                        {complianceResult.safety_validation.contraindications}
                      </div>
                      <div className="text-xs text-gray-600">Contraindications</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Relevant Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Relevant Guidelines</CardTitle>
              <CardDescription>
                Guidelines that apply to this clinical scenario
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {complianceResult.relevant_guidelines.slice(0, 5).map((guideline, index) => (
                <div key={guideline.chunk_id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className={getSocietyColor(guideline.society)}>
                          {guideline.society}
                        </Badge>
                        <Badge variant="outline">
                          {guideline.year}
                        </Badge>
                        {guideline.evidence_class && (
                          <Badge className={getEvidenceColor(guideline.evidence_class)}>
                            {guideline.evidence_class}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Score: {(guideline.score * 100).toFixed(1)}%
                      </div>
                    </div>
                    
                    <h4 className="font-medium">
                      {guideline.guideline_name.replace(/_/g, ' ')}
                    </h4>
                    
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {guideline.text}
                    </p>
                    
                    <div className="text-xs text-gray-500">
                      Page {guideline.page_number} • {guideline.section_type} • Retrieved via {guideline.retrieval_method}
                    </div>
                  </div>
                </div>
              ))}
              
              {complianceResult.relevant_guidelines.length > 5 && (
                <div className="text-center pt-2">
                  <Badge variant="outline">
                    +{complianceResult.relevant_guidelines.length - 5} more guidelines
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

export default ComplianceChecker


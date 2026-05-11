import { useState } from 'react'

export function useStorage() {
  const [intelligenceFile, setIntelligenceFileState] = useState(
    () => localStorage.getItem('compass_intelligence_file') || ''
  )
  const [apiKey, setApiKeyState] = useState(
    () => localStorage.getItem('compass_api_key') || ''
  )
  const [model, setModelState] = useState(
    () => localStorage.getItem('compass_model') || 'bedrock/us.anthropic.claude-sonnet-4-5-20250929-v1:0'
  )
  const [baseUrl, setBaseUrlState] = useState(
    () => localStorage.getItem('compass_base_url') || 'https://llm.helix.com/llm/api'
  )

  const setIntelligenceFile = (value) => {
    localStorage.setItem('compass_intelligence_file', value)
    setIntelligenceFileState(value)
  }

  const setApiKey = (value) => {
    localStorage.setItem('compass_api_key', value)
    setApiKeyState(value)
  }

  const setModel = (value) => {
    localStorage.setItem('compass_model', value)
    setModelState(value)
  }

  const setBaseUrl = (value) => {
    localStorage.setItem('compass_base_url', value)
    setBaseUrlState(value)
  }

  return { intelligenceFile, setIntelligenceFile, apiKey, setApiKey, model, setModel, baseUrl, setBaseUrl }
}

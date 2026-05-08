import { useState } from 'react'

export function useStorage() {
  const [intelligenceFile, setIntelligenceFileState] = useState(
    () => localStorage.getItem('compass_intelligence_file') || ''
  )
  const [apiKey, setApiKeyState] = useState(
    () => localStorage.getItem('compass_api_key') || ''
  )
  const [model, setModelState] = useState(
    () => localStorage.getItem('compass_model') || 'claude-sonnet-4-20250514'
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

  return { intelligenceFile, setIntelligenceFile, apiKey, setApiKey, model, setModel }
}

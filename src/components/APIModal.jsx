import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { LLM_PROVIDERS, getAISettings, saveAISettings, getEffectiveModel } from "../utils/aiSettings"
import { Key, Cpu, ExternalLink, Check, AlertCircle, Eye, EyeOff, Sparkles, X } from "lucide-react"
import "./APIModal.css"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080"

export default function APIModal({ isOpen, onClose }) {
  const [settings, setSettings] = useState(getAISettings)
  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setSettings(getAISettings())
      setTestResult(null)
      setSavedSuccess(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const currentProvider = LLM_PROVIDERS.find(p => p.id === settings.provider) || LLM_PROVIDERS[0]

  function handleProviderChange(providerId) {
    const prov = LLM_PROVIDERS.find(p => p.id === providerId)
    const defaultModel = prov?.models[0]?.id || ""
    setSettings(prev => ({
      ...prev,
      provider: providerId,
      model: defaultModel,
      customModel: ""
    }))
    setTestResult(null)
  }

  function handleModelChange(modelId) {
    setSettings(prev => ({ ...prev, model: modelId }))
    setTestResult(null)
  }

  async function handleTestConnection() {
    setTesting(true)
    setTestResult(null)
    const effectiveModel = getEffectiveModel(settings)

    try {
      const res = await fetch(`${BACKEND_URL}/test-llm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: settings.provider,
          model: effectiveModel,
          apiKey: settings.apiKey
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setTestResult({
          type: "success",
          message: `Connected successfully! Model '${effectiveModel}' responded in ${data.latency_ms || "0.4"}s`
        })
      } else {
        setTestResult({
          type: "error",
          message: data.error || "Failed to connect to model. Please verify your API key."
        })
      }
    } catch (err) {
      setTestResult({
        type: "error",
        message: `Connection failed: ${err.message}. Is your backend online?`
      })
    } finally {
      setTesting(false)
    }
  }

  function handleSave() {
    saveAISettings(settings)
    setSavedSuccess(true)
    setTimeout(() => {
      onClose()
    }, 800)
  }

  return createPortal(
    <div className="api-modal-backdrop" onClick={onClose}>
      <div className="api-modal-box" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="api-modal-header">
          <div className="api-modal-title">
            <span className="api-modal-icon"><Key size={18} /></span>
            <div>
              <h3>LLM & API Configuration</h3>
              <p>Connect your own model & key to power paper analysis & chat</p>
            </div>
          </div>
          <button className="api-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="api-modal-body">
          {/* 1. Provider Select */}
          <div className="api-field-group">
            <label className="api-field-label">
              <Cpu size={14} /> 1. Select AI Provider
            </label>
            <div className="api-provider-grid">
              {LLM_PROVIDERS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  className={`api-provider-btn ${settings.provider === p.id ? "active" : ""}`}
                  onClick={() => handleProviderChange(p.id)}
                >
                  <span className="api-provider-name">{p.name}</span>
                  <span className={`api-provider-badge badge-${p.id}`}>{p.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Model & Version */}
          <div className="api-field-group">
            <label className="api-field-label">
              <Sparkles size={14} /> 2. Model & Version
              <span className="api-free-hint">★ Free tier models highlighted</span>
            </label>
            <div className="api-models-list">
              {currentProvider.models.map(m => (
                <label
                  key={m.id}
                  className={`api-model-option ${settings.model === m.id ? "selected" : ""}`}
                  onClick={() => handleModelChange(m.id)}
                >
                  <input
                    type="radio"
                    name="modelSelection"
                    checked={settings.model === m.id}
                    onChange={() => handleModelChange(m.id)}
                  />
                  <div className="api-model-info">
                    <div className="api-model-header">
                      <span className="api-model-title">{m.name}</span>
                      <span className="api-model-ver">{m.version}</span>
                      {m.isFree && <span className="api-badge-free">FREE</span>}
                    </div>
                    <span className="api-model-desc">{m.desc}</span>
                  </div>
                </label>
              ))}
            </div>

            {settings.model === "custom" && (
              <div className="api-custom-input-wrapper">
                <input
                  type="text"
                  placeholder="Enter exact model ID (e.g. openai/gpt-oss-120b)"
                  value={settings.customModel || ""}
                  onChange={e => setSettings({ ...settings, customModel: e.target.value })}
                  className="api-input"
                />
              </div>
            )}
          </div>

          {/* 3. API Key */}
          <div className="api-field-group">
            <div className="api-field-label-row">
              <label className="api-field-label">
                <Key size={14} /> 3. {currentProvider.name} API Key
              </label>
              {currentProvider.docsUrl && (
                <a
                  href={currentProvider.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="api-key-link"
                >
                  {currentProvider.docsLabel} <ExternalLink size={12} />
                </a>
              )}
            </div>

            <div className="api-key-input-container">
              <input
                type={showKey ? "text" : "password"}
                placeholder={`Paste your key (${currentProvider.apiKeyPlaceholder})`}
                value={settings.apiKey || ""}
                onChange={e => setSettings({ ...settings, apiKey: e.target.value })}
                className="api-input"
              />
              <button
                type="button"
                className="api-key-eye"
                onClick={() => setShowKey(!showKey)}
                title={showKey ? "Hide key" : "Show key"}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="api-privacy-note">
              🔒 Your key is saved locally in your browser. It is only sent to perform requests you initiate.
            </p>
          </div>

          {/* Test Status feedback */}
          {testResult && (
            <div className={`api-test-alert ${testResult.type}`}>
              {testResult.type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="api-modal-footer">
          <button
            type="button"
            className="api-btn-test"
            onClick={handleTestConnection}
            disabled={testing}
          >
            {testing ? "Testing..." : "Test Connection"}
          </button>
          <div className="api-modal-footer-actions">
            <button type="button" className="api-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className={`api-btn-save ${savedSuccess ? "saved" : ""}`}
              onClick={handleSave}
            >
              {savedSuccess ? "✓ Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

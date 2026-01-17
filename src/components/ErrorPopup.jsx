import { useState, useEffect } from 'react'
import '../styles/ErrorPopup.css'

export function ErrorPopup({ message, onClose }) {
  const [isVisible, setIsVisible] = useState(!!message)

  useEffect(() => {
    setIsVisible(!!message)
    if (message) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose()
      }, 4000) // Auto-dismiss after 4 seconds
      return () => clearTimeout(timer)
    }
  }, [message, onClose])

  if (!isVisible) return null

  return (
    <div className="error-popup-overlay">
      <div className="error-popup">
        <div className="error-popup-header">
          <span className="error-icon">⚠️</span>
          <span className="error-title">Error</span>
          <button 
            className="error-close-btn" 
            onClick={() => {
              setIsVisible(false)
              onClose()
            }}
          >
            ✕
          </button>
        </div>
        <div className="error-popup-message">
          {message}
        </div>
        <div className="error-popup-footer">
          <button 
            className="error-close-action"
            onClick={() => {
              setIsVisible(false)
              onClose()
            }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}

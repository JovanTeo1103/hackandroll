import { useState, useEffect } from 'react'
import '../styles/SuccessPopup.css'

export function SuccessPopup({ message, onClose }) {
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
    <div className="success-popup-overlay">
      <div className="success-popup">
        <div className="success-popup-header">
          <span className="success-icon">✅</span>
          <span className="success-title">Link Copied!</span>
          <button 
            className="success-close-btn" 
            onClick={() => {
              setIsVisible(false)
              onClose()
            }}
          >
            ✕
          </button>
        </div>
        <div className="success-popup-message">
          {message}
        </div>
        <div className="success-popup-footer">
          <button 
            className="success-close-action"
            onClick={() => {
              setIsVisible(false)
              onClose()
            }}
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  )
}

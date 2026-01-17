import { useState, useEffect } from 'react'
import '../styles/ConfirmDialog.css'

export function ConfirmDialog({ title, message, isOpen, onConfirm, onCancel }) {
  const [isVisible, setIsVisible] = useState(isOpen)

  useEffect(() => {
    setIsVisible(isOpen)
  }, [isOpen])

  if (!isVisible) return null

  const handleConfirm = () => {
    setIsVisible(false)
    onConfirm()
  }

  const handleCancel = () => {
    setIsVisible(false)
    onCancel()
  }

  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <div className="confirm-dialog-header">
          <span className="confirm-icon">⚠️</span>
          <span className="confirm-title">{title}</span>
        </div>
        <div className="confirm-dialog-message">
          {message}
        </div>
        <div className="confirm-dialog-footer">
          <button 
            className="confirm-cancel-btn"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button 
            className="confirm-confirm-btn"
            onClick={handleConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

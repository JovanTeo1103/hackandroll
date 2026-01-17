import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import Room from './components/Room'
import { furnitureCatalog } from './data/furnitureCatalog'
import './App.css'

function App() {
  const [selectedBox, setSelectedBox] = useState(null)
  const [furniture, setFurniture] = useState(() => {
    // Load furniture from localStorage on mount
    const saved = localStorage.getItem('roomFurniture')
    return saved ? JSON.parse(saved) : []
  })
  const [showCatalog, setShowCatalog] = useState(false)
  const [newItemName, setNewItemName] = useState('')

  // Save furniture to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('roomFurniture', JSON.stringify(furniture))
  }, [furniture])

  // Add new furniture to the room
  const addFurniture = (catalogItem) => {
    const newItem = {
      id: Date.now(), // Unique ID
      label: catalogItem.label,
      type: catalogItem.type,
      position: [0, catalogItem.size[1] / 2, 0], // Place in center, on floor
      size: catalogItem.size,
      color: catalogItem.color,
      items: [], // Empty - user can add items later
    }
    setFurniture(prevFurniture => [...prevFurniture, newItem])
    setShowCatalog(false)
  }

  // Update furniture position after drag
  const handleDragEnd = (id, newPosition) => {
    setFurniture(prevFurniture => prevFurniture.map(item => 
      item.id === id ? { ...item, position: newPosition } : item
    ))
  }

  // Delete furniture
  const handleDelete = (id) => {
    if (window.confirm('Delete this furniture?')) {
      setFurniture(prevFurniture => prevFurniture.filter(item => item.id !== id))
      if (selectedBox?.id === id) {
        setSelectedBox(null)
      }
    }
  }

  // Select furniture to view/edit
  const handleBoxClick = (boxInfo) => {
    setSelectedBox(boxInfo)
  }

  // Add item to storage box
  const addItemToBox = (itemName) => {
    if (!selectedBox || !itemName.trim()) return
    
    setFurniture(prevFurniture => {
      const updatedFurniture = prevFurniture.map(item => {
        if (item.id === selectedBox.id) {
          const newItems = [
            ...item.items,
            { id: Date.now(), name: itemName }
          ]
          return { ...item, items: newItems }
        }
        return item
      })
      
      // Update selected box with new items
      const updatedBox = updatedFurniture.find(item => item.id === selectedBox.id)
      setSelectedBox(updatedBox)
      
      return updatedFurniture
    })
    setNewItemName('')
  }

  // Remove item from storage box
  const removeItemFromBox = (itemId) => {
    if (!selectedBox) return
    
    setFurniture(prevFurniture => {
      const updatedFurniture = prevFurniture.map(item => {
        if (item.id === selectedBox.id) {
          return { ...item, items: item.items.filter(i => i.id !== itemId) }
        }
        return item
      })
      
      // Update selected box with new items
      const updatedBox = updatedFurniture.find(item => item.id === selectedBox.id)
      setSelectedBox(updatedBox)
      
      return updatedFurniture
    })
  }

  return (
    <div
      style={{ width: '100vw', height: '100vh' }}
      onContextMenu={(e) => e.preventDefault()} // Disable browser context menu
    >
      
      {/* Add Furniture Button */}
      <button
        onClick={() => setShowCatalog(!showCatalog)}
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          padding: '12px 24px',
          background: showCatalog ? '#e74c3c' : '#27ae60',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          zIndex: 100,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }}
      >
        {showCatalog ? '✕ Close' : '+ Add Furniture'}
      </button>

      {/* Furniture Catalog Panel */}
      {showCatalog && (
        <div style={{
          position: 'absolute',
          top: 70,
          left: 20,
          background: 'rgba(255, 255, 255, 0.98)',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          zIndex: 100,
          maxHeight: '70vh',
          overflowY: 'auto',
          width: '280px',
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🪑 Furniture Catalog</h3>
          <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '12px' }}>
            Click to add furniture to the room
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {furnitureCatalog.map((item) => (
              <button
                key={item.type}
                onClick={() => addFurniture(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: '#f5f5f5',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#e8f5e9'
                  e.target.style.borderColor = '#27ae60'
                }}
                onMouseOut={(e) => {
                  e.target.style.background = '#f5f5f5'
                  e.target.style.borderColor = '#ddd'
                }}
              >
                <span style={{ fontSize: '24px' }}>{item.icon}</span>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#333' }}>{item.label}</div>
                  <div style={{ fontSize: '11px', color: '#888' }}>{item.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Furniture Panel */}
      {selectedBox && (
        <div style={{
          position: 'absolute',
          top: 20,
          right: 20,
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          zIndex: 100,
          minWidth: '300px',
          maxHeight: '70vh',
          overflowY: 'auto',
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>📦 {selectedBox.label}</h3>
          <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '12px' }}>
            Drag to move • Use Delete button to remove
          </p>

          {/* Items Section */}
          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#555', fontSize: '14px' }}>Items in storage:</h4>
            
            {selectedBox.items && selectedBox.items.length > 0 ? (
              <div style={{
                background: '#f9f9f9',
                borderRadius: '6px',
                padding: '10px',
                marginBottom: '10px',
                maxHeight: '200px',
                overflowY: 'auto',
              }}>
                {selectedBox.items.map((item) => (
                  <div key={item.id} style={{
                    color: 'black',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px',
                    background: 'white',
                    borderRadius: '4px',
                    marginBottom: '6px',
                    fontSize: '13px',
                  }}>
                    <span>{item.name}</span>
                    <button
                      onClick={() => removeItemFromBox(item.id)}
                      style={{
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontSize: '11px',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                color: '#999',
                fontSize: '12px',
                fontStyle: 'italic',
                padding: '10px',
                background: '#f5f5f5',
                borderRadius: '6px',
                marginBottom: '10px',
              }}>
                No items yet
              </div>
            )}

            {/* Add Item Input */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addItemToBox(newItemName)
                  }
                }}
                placeholder="Add item..."
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              />
              <button
                onClick={() => addItemToBox(newItemName)}
                style={{
                  padding: '8px 12px',
                  background: '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Add
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setSelectedBox(null)}
              style={{
                flex: 1,
                padding: '8px 16px',
                background: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
            <button 
              onClick={() => handleDelete(selectedBox.id)}
              style={{
                flex: 1,
                padding: '8px 16px',
                background: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '8px',
        fontSize: '13px',
        zIndex: 100,
      }}>
        🖱️ Drag furniture to move • Click to select • Use Delete button to remove
      </div>

      <Canvas
        shadows
        camera={{ position: [0, 10, 12], fov: 50 }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[0, 3, 0]} intensity={0.5} />

        <Room 
          furniture={furniture}
          selectedId={selectedBox?.id}
          onBoxClick={handleBoxClick}
          onDragEnd={handleDragEnd}
          onDelete={handleDelete}
        />

        {/* No OrbitControls - fixed front view */}
      </Canvas>
    </div>
  )
}

export default App

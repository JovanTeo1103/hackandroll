import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import Room from './components/Room'
import { ErrorPopup } from './components/ErrorPopup'
import { SuccessPopup } from './components/SuccessPopup'
import { ConfirmDialog } from './components/ConfirmDialog'
import { furnitureCatalog } from './data/furnitureCatalog'
import './App.css'

const createNewRoom = (name = 'New Room') => ({
  id: Date.now(),
  name,
  furniture: []
})

function App() {
  const [selectedBox, setSelectedBox] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  
  const [rooms, setRooms] = useState(() => {
    const saved = localStorage.getItem('allRooms')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0 && !parsed[0].furniture) {
        const oldFurniture = JSON.parse(localStorage.getItem('roomFurniture') || '[]')
        return [{ id: 1, name: 'My Room', furniture: oldFurniture }]
      }
      return parsed
    }
    const oldFurniture = localStorage.getItem('roomFurniture')
    if (oldFurniture) {
      return [{ id: 1, name: 'My Room', furniture: JSON.parse(oldFurniture) }]
    }
    return [createNewRoom('My Room')]
  })
  const [currentRoomId, setCurrentRoomId] = useState(() => {
    const saved = localStorage.getItem('currentRoomId')
    return saved ? parseInt(saved) : (rooms[0]?.id || 1)
  })
  const [showRoomPanel, setShowRoomPanel] = useState(true)
  const [editingRoomId, setEditingRoomId] = useState(null)
  const [newRoomName, setNewRoomName] = useState('')

  const currentRoom = rooms.find(r => r.id === currentRoomId) || rooms[0]
  const furniture = currentRoom?.furniture || []

  const setFurniture = (updater) => {
    setRooms(prevRooms => prevRooms.map(room => {
      if (room.id === currentRoomId) {
        const newFurniture = typeof updater === 'function' 
          ? updater(room.furniture) 
          : updater
        return { ...room, furniture: newFurniture }
      }
      return room
    }))
  }

  const [showCatalog, setShowCatalog] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null })

  useEffect(() => {
    localStorage.setItem('allRooms', JSON.stringify(rooms))
  }, [rooms])

  useEffect(() => {
    localStorage.setItem('currentRoomId', currentRoomId.toString())
  }, [currentRoomId])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sharedData = params.get('data')
    if (sharedData) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(sharedData)))
        if (Array.isArray(decoded) && decoded.length > 0 && decoded[0].furniture) {
          setRooms(decoded)
          setCurrentRoomId(decoded[0].id)
        } else if (Array.isArray(decoded)) {
          setRooms([{ id: 1, name: 'Shared Room', furniture: decoded }])
          setCurrentRoomId(1)
        }
        window.history.replaceState({}, '', window.location.pathname)
      } catch (e) {
        console.error('Error loading shared data:', e)
      }
    }
  }, [])

  const addRoom = () => {
    const newRoom = createNewRoom(`Room ${rooms.length + 1}`)
    setRooms(prev => [...prev, newRoom])
    setCurrentRoomId(newRoom.id)
    setSelectedBox(null)
  }

  const deleteRoom = (roomId) => {
    if (rooms.length <= 1) {
      setErrorMessage('You need at least one room!')
      return
    }
    setRooms(prev => prev.filter(r => r.id !== roomId))
    if (currentRoomId === roomId) {
      setCurrentRoomId(rooms.find(r => r.id !== roomId)?.id)
      setSelectedBox(null)
    }
  }

  const renameRoom = (roomId, newName) => {
    setRooms(prev => prev.map(r => 
      r.id === roomId ? { ...r, name: newName } : r
    ))
    setEditingRoomId(null)
  }

  const DEPLOYED_URL = 'https://hackandroll-one.vercel.app'

  const getShareableUrl = () => {
    try {
      const encoded = btoa(encodeURIComponent(JSON.stringify(rooms)))
      return `${DEPLOYED_URL}?data=${encoded}`
    } catch (e) {
      return DEPLOYED_URL
    }
  }

  const copyShareLink = () => {
    const url = getShareableUrl()
    navigator.clipboard.writeText(url)
    setSuccessMessage('Share link copied to clipboard! Open this link on another device to sync your room.')
  }

  const getMatchingStorages = () => {
    if (!searchQuery.trim()) return []
    
    const query = searchQuery.toLowerCase()
    const matchingIds = new Set()
    
    furniture.forEach(box => {
      box.items?.forEach(item => {
        if (item.name.toLowerCase().includes(query)) {
          matchingIds.add(box.id)
        }
      })
    })
    
    return Array.from(matchingIds)
  }

  const matchingStorageIds = getMatchingStorages()

  const COLLISION_PADDING = 0.05

  const getEffectiveSize = (furnitureSize, furnitureRotation = 0) => {
    const [w, h, d] = furnitureSize
    const isRotated90or270 = furnitureRotation === 90 || furnitureRotation === 270
    return isRotated90or270 ? [d, h, w] : [w, h, d]
  }

  const getCollisionSize = (furnitureSize, furnitureRotation = 0) => {
    const [w, h, d] = getEffectiveSize(furnitureSize, furnitureRotation)
    return [w + COLLISION_PADDING * 2, h, d + COLLISION_PADDING * 2]
  }

  const checkCollision = (pos1, size1, pos2, size2) => {
    return (
      Math.abs(pos1[0] - pos2[0]) < (size1[0] + size2[0]) / 2 &&
      Math.abs(pos1[2] - pos2[2]) < (size1[2] + size2[2]) / 2
    )
  }

  const canRotate = (item, newRotation) => {
    const newEffectiveSize = getEffectiveSize(item.size, newRotation)
    const newCollisionSize = getCollisionSize(item.size, newRotation)
    
    const halfX = newEffectiveSize[0] / 2
    const halfZ = newEffectiveSize[2] / 2
    const [x, , z] = item.position
    
    if (x - halfX < -5 || x + halfX > 5 || z - halfZ < -5 || z + halfZ > 5) {
      return false
    }
    
    for (const other of furniture) {
      if (other.id !== item.id) {
        const otherCollisionSize = getCollisionSize(other.size, other.rotation || 0)
        if (checkCollision(item.position, newCollisionSize, other.position, otherCollisionSize)) {
          return false
        }
      }
    }
    
    return true
  }

  const addFurniture = (catalogItem) => {
    const newItem = {
      id: Date.now(),
      label: catalogItem.label,
      type: catalogItem.type,
      position: [0, catalogItem.size[1] / 2, 0],
      size: catalogItem.size,
      color: catalogItem.color,
      rotation: 0,
      items: [],
    }
    setFurniture(prevFurniture => [...prevFurniture, newItem])
    setShowCatalog(false)
  }

  const handleRotate = (id, direction) => {
    const item = furniture.find(f => f.id === id)
    if (!item) return

    let newRotation = item.rotation || 0
    if (direction === 'left') {
      newRotation = (newRotation - 90 + 360) % 360
    } else {
      newRotation = (newRotation + 90) % 360
    }

    if (!canRotate(item, newRotation)) {
      setErrorMessage('Cannot rotate: would collide with another furniture or wall!')
      return
    }

    setFurniture(prevFurniture => {
      const updatedFurniture = prevFurniture.map(f => 
        f.id === id ? { ...f, rotation: newRotation } : f
      )
      
      if (selectedBox?.id === id) {
        const updatedBox = updatedFurniture.find(f => f.id === id)
        setSelectedBox(updatedBox)
      }
      
      return updatedFurniture
    })
  }

  const handleDragEnd = (id, newPosition) => {
    setFurniture(prevFurniture => prevFurniture.map(item => 
      item.id === id ? { ...item, position: newPosition } : item
    ))
  }

  const handleDelete = (id) => {
    setDeleteConfirm({ isOpen: true, id })
  }

  const confirmDelete = () => {
    if (deleteConfirm.id) {
      setFurniture(prevFurniture => prevFurniture.filter(item => item.id !== deleteConfirm.id))
      if (selectedBox?.id === deleteConfirm.id) {
        setSelectedBox(null)
      }
      setDeleteConfirm({ isOpen: false, id: null })
    }
  }

  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, id: null })
  }

  const handleBoxClick = (boxInfo) => {
    setSelectedBox(boxInfo)
  }

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
      
      const updatedBox = updatedFurniture.find(item => item.id === selectedBox.id)
      setSelectedBox(updatedBox)
      
      return updatedFurniture
    })
    setNewItemName('')
  }

  const removeItemFromBox = (itemId) => {
    if (!selectedBox) return
    
    setFurniture(prevFurniture => {
      const updatedFurniture = prevFurniture.map(item => {
        if (item.id === selectedBox.id) {
          return { ...item, items: item.items.filter(i => i.id !== itemId) }
        }
        return item
      })
      
      const updatedBox = updatedFurniture.find(item => item.id === selectedBox.id)
      setSelectedBox(updatedBox)
      
      return updatedFurniture
    })
  }

  return (
    <div
      style={{ width: '100vw', height: '100vh', display: 'flex' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Room Selector Panel - Left Side */}
      <div style={{
        width: showRoomPanel ? '200px' : '50px',
        height: '100%',
        background: 'linear-gradient(180deg, #2c3e50 0%, #1a252f 100%)',
        padding: showRoomPanel ? '15px' : '10px',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        zIndex: 150,
        boxShadow: '2px 0 10px rgba(0,0,0,0.3)',
      }}>
        <button
          onClick={() => setShowRoomPanel(!showRoomPanel)}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: 'white',
            padding: '8px',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '15px',
            fontSize: '16px',
          }}
        >
          {showRoomPanel ? '◀' : '▶'}
        </button>

        {showRoomPanel && (
          <>
            <h3 style={{ 
              color: 'white', 
              margin: '0 0 15px 0', 
              fontSize: '16px',
              borderBottom: '1px solid rgba(255,255,255,0.2)',
              paddingBottom: '10px'
            }}>
              🏠 Rooms
            </h3>

            <div style={{ 
              flex: 1, 
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {rooms.map(room => (
                <div
                  key={room.id}
                  onClick={() => {
                    if (editingRoomId !== room.id) {
                      setCurrentRoomId(room.id)
                      setSelectedBox(null)
                    }
                  }}
                  style={{
                    padding: '10px 12px',
                    background: currentRoomId === room.id 
                      ? 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)' 
                      : 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s',
                  }}
                >
                  {editingRoomId === room.id ? (
                    <input
                      key={`edit-${room.id}`}
                      type="text"
                      defaultValue={room.name}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      onFocus={(e) => {
                        setNewRoomName(e.target.value)
                        e.target.select()
                      }}
                      onBlur={(e) => {
                        const value = e.target.value.trim()
                        if (value) {
                          renameRoom(room.id, value)
                        }
                        setEditingRoomId(null)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const value = e.target.value.trim()
                          if (value) {
                            renameRoom(room.id, value)
                          }
                          setEditingRoomId(null)
                        }
                        if (e.key === 'Escape') {
                          setEditingRoomId(null)
                        }
                      }}
                      autoFocus
                      style={{
                        background: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        width: '100%',
                        fontSize: '13px',
                        color: '#333',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <span style={{ 
                        color: 'white', 
                        fontSize: '13px',
                        fontWeight: currentRoomId === room.id ? 'bold' : 'normal'
                      }}>
                        {room.name}
                      </span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingRoomId(room.id)
                            setNewRoomName(room.name)
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'rgba(255,255,255,0.7)',
                            cursor: 'pointer',
                            padding: '2px 6px',
                            fontSize: '12px',
                          }}
                        >
                          ✏️
                        </button>
                        {rooms.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteRoom(room.id)
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'rgba(255,255,255,0.7)',
                              cursor: 'pointer',
                              padding: '2px 6px',
                              fontSize: '12px',
                            }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addRoom}
              style={{
                marginTop: '15px',
                padding: '10px',
                background: 'rgba(255,255,255,0.15)',
                border: '2px dashed rgba(255,255,255,0.3)',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
                transition: 'all 0.2s',
              }}
            >
              + Add Room
            </button>
          </>
        )}
      </div>

      <div style={{ flex: 1, position: 'relative', height: '100%' }}>
        <ErrorPopup 
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />

        <SuccessPopup 
          message={successMessage}
          onClose={() => setSuccessMessage('')}
        />

        <ConfirmDialog
          title="Delete Furniture"
          message="Are you sure you want to delete this furniture? This action cannot be undone."
        isOpen={deleteConfirm.isOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
      
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

      <button
        onClick={copyShareLink}
        style={{
          position: 'absolute',
          top: 20,
          left: 200,
          padding: '12px 24px',
          background: '#9b59b6',
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
        📤 Share Room
      </button>

      <div style={{
        position: 'absolute',
        top: 70,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
      }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSelectedBox(null)}
          placeholder="🔍 Search items..."
          style={{
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '2px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            width: '250px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            color: 'black',
          }}
        />
        {searchQuery && matchingStorageIds.length > 0 && (
          <div style={{
            marginTop: '8px',
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#333',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}>
            Found in {matchingStorageIds.length} storage{matchingStorageIds.length !== 1 ? 's' : ''}
          </div>
        )}
        {searchQuery && matchingStorageIds.length === 0 && (
          <div style={{
            marginTop: '8px',
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#999',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}>
            No items found
          </div>
        )}
      </div>

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
            Drag to move • Click buttons to rotate
          </p>

          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            marginBottom: '15px',
            justifyContent: 'center'
          }}>
            <button
              onClick={() => handleRotate(selectedBox.id, 'left')}
              style={{
                padding: '10px 16px',
                background: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              ↺ Rotate Left
            </button>
            <button
              onClick={() => handleRotate(selectedBox.id, 'right')}
              style={{
                padding: '10px 16px',
                background: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              Rotate Right ↻
            </button>
          </div>
          <p style={{ margin: '0 0 15px 0', color: '#888', fontSize: '11px', textAlign: 'center' }}>
            Current rotation: {selectedBox.rotation || 0}°
          </p>

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

      <div style={{
        position: 'absolute',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'linear-gradient(135deg, #2c3e50 0%, #1a252f 100%)',
        color: 'white',
        padding: '8px 20px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: 'bold',
        zIndex: 100,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}>
        🏠 {currentRoom?.name || 'Room'}
      </div>

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
        🖱️ Drag furniture to move • Click to select
      </div>

      <Canvas
        shadows
        camera={{ position: [0, 10, 12], fov: 50  }}
        style={{ marginTop: '40px' }}
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
          matchingStorageIds={matchingStorageIds}
          onBoxClick={handleBoxClick}
          onDragEnd={handleDragEnd}
          onDelete={handleDelete}
        />

        {/* No OrbitControls - fixed front view */}
      </Canvas>
      </div>
    </div>
  )
}

export default App

import { useState, useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function StorageBox({ 
  id,
  position, 
  size = [1, 1, 1], 
  color = '#8B4513', 
  label = 'Storage Box', 
  items = [],
  onClick,
  onDragEnd,
  onDelete,
  isSelected,
  allFurniture = []
}) {
  const [hovered, setHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [pos, setPos] = useState(position)
  const groupRef = useRef()
  const meshRef = useRef()
  const dragPlane = useRef(new THREE.Plane())
  const intersection = useRef(new THREE.Vector3())
  const offset = useRef(new THREE.Vector3())
  const { camera, gl, raycaster, pointer } = useThree()

  // Sync position when prop changes
  useEffect(() => {
    setPos(position)
  }, [position])

  // Check if two boxes overlap (AABB collision)
  const checkCollision = (pos1, size1, pos2, size2) => {
    const margin = 0.1 // Small margin to prevent touching
    return (
      Math.abs(pos1[0] - pos2[0]) < (size1[0] + size2[0]) / 2 + margin &&
      Math.abs(pos1[2] - pos2[2]) < (size1[2] + size2[2]) / 2 + margin
    )
  }

  // Handle pointer move during drag
  useFrame(() => {
    if (isDragging && groupRef.current) {
      raycaster.setFromCamera(pointer, camera)
      if (raycaster.ray.intersectPlane(dragPlane.current, intersection.current)) {
        const newPos = intersection.current.sub(offset.current)
        
        // Clamp to room boundaries
        let clampedX = Math.max(-4, Math.min(4, newPos.x))
        let clampedZ = Math.max(-4, Math.min(4, newPos.z))
        
        // Check collision with other furniture
        const testPos = [clampedX, position[1], clampedZ]
        let hasCollision = false
        
        for (const furniture of allFurniture) {
          if (furniture.id !== id) {
            if (checkCollision(testPos, size, furniture.position, furniture.size)) {
              hasCollision = true
              break
            }
          }
        }
        
        // Only update position if no collision
        if (!hasCollision) {
          groupRef.current.position.x = clampedX
          groupRef.current.position.z = clampedZ
          groupRef.current.position.y = position[1]
        }
      }
    }
  })

  const handleClick = (event) => {
    event.stopPropagation()
    if (onClick) {
      onClick({ id, label, position: pos, items })
    }
  }

  const handleRightClick = (event) => {
    event.stopPropagation()
    event.nativeEvent.preventDefault()
    if (onDelete) {
      onDelete(id)
    }
  }

  const handlePointerDown = (event) => {
    event.stopPropagation()
    setIsDragging(true)
    
    // Set up drag plane at floor level (Y=0)
    dragPlane.current.setFromNormalAndCoplanarPoint(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, position[1], 0)
    )
    
    // Calculate offset from click point to object center
    raycaster.setFromCamera(pointer, camera)
    raycaster.ray.intersectPlane(dragPlane.current, intersection.current)
    offset.current.copy(intersection.current).sub(groupRef.current.position)
    
    gl.domElement.style.cursor = 'grabbing'
  }

  const handlePointerMove = (event) => {
    if (!isDragging) return
    event.stopPropagation()
    
    // Calculate new position on the drag plane
    raycaster.setFromCamera(pointer, camera)
    if (raycaster.ray.intersectPlane(dragPlane.current, intersection.current)) {
      const newPos = intersection.current.sub(offset.current)
      
      // Clamp to room boundaries
      const clampedX = Math.max(-4, Math.min(4, newPos.x))
      const clampedZ = Math.max(-4, Math.min(4, newPos.z))
      
      groupRef.current.position.x = clampedX
      groupRef.current.position.z = clampedZ
      groupRef.current.position.y = position[1]
    }
  }

  const handlePointerUp = (event) => {
    if (!isDragging) return
    if (event) event.stopPropagation()
    finishDrag()
  }

  // Finish drag from anywhere (canvas or outside)
  const finishDrag = () => {
    setIsDragging(false)

    if (groupRef.current && onDragEnd) {
      const newPos = [
        groupRef.current.position.x,
        position[1],
        groupRef.current.position.z
      ]
      setPos(newPos)
      onDragEnd(id, newPos)
    }

    gl.domElement.style.cursor = hovered ? 'grab' : 'auto'
  }

  // End drag if mouse is released outside the canvas
  useEffect(() => {
    const handleWindowPointerUp = () => {
      if (isDragging) {
        finishDrag()
      }
    }
    window.addEventListener('pointerup', handleWindowPointerUp)
    return () => window.removeEventListener('pointerup', handleWindowPointerUp)
  }, [isDragging])

  return (
    <>
    <group ref={groupRef} position={pos}>
      {/* Main box */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onContextMenu={handleRightClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'grab'
        }}
        onPointerOut={(e) => {
          setHovered(false)
          if (!isDragging) {
            document.body.style.cursor = 'auto'
          }
        }}
      >
          <boxGeometry args={size} />
          <meshStandardMaterial 
            color={isSelected ? '#FFD700' : hovered ? '#A0522D' : color}
          />
        </mesh>

        {/* Box lid */}
        <mesh position={[0, size[1] / 2 + 0.02, 0]}>
          <boxGeometry args={[size[0], 0.04, size[2]]} />
          <meshStandardMaterial color={isSelected ? '#FFA500' : hovered ? '#CD853F' : '#A0522D'} />
        </mesh>
      </group>
    </>
  )
}

export default StorageBox

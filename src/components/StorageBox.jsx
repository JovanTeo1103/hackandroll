import { useState, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { DragControls } from '@react-three/drei'

function StorageBox({ 
  id,
  position, 
  size = [1, 1, 1], 
  color = '#8B4513', 
  label = 'Storage Box', 
  onClick,
  onDragEnd,
  onDelete,
  isSelected,
  roomWidth = 10,
  roomDepth = 10
}) {
  const [hovered, setHovered] = useState(false)
  const [pos, setPos] = useState(position)
  const groupRef = useRef()

  // Sync position when prop changes
  useEffect(() => {
    setPos(position)
  }, [position])

  // Enforce room boundaries every frame
  useFrame(() => {
    if (groupRef.current) {
      const WALL_THICKNESS = 0.1
      const maxX = roomWidth / 2 - WALL_THICKNESS - size[0] / 2
      const maxZ = roomDepth / 2 - WALL_THICKNESS - size[2] / 2
      const minX = -roomWidth / 2 + WALL_THICKNESS + size[0] / 2
      const minZ = -roomDepth / 2 + WALL_THICKNESS + size[2] / 2
      
      // Clamp position every frame
      if (groupRef.current.position.x < minX || groupRef.current.position.x > maxX) {
        groupRef.current.position.x = Math.max(minX, Math.min(maxX, groupRef.current.position.x))
      }
      if (groupRef.current.position.z < minZ || groupRef.current.position.z > maxZ) {
        groupRef.current.position.z = Math.max(minZ, Math.min(maxZ, groupRef.current.position.z))
      }
      if (groupRef.current.position.y !== position[1]) {
        groupRef.current.position.y = position[1]
      }
    }
  })

  const handleClick = (event) => {
    event.stopPropagation()
    if (onClick) {
      onClick({ id, label, position: pos })
    }
  }

  const handleRightClick = (event) => {
    event.stopPropagation()
    event.nativeEvent.preventDefault()
    if (onDelete) {
      onDelete(id)
    }
  }

  const handleDrag = () => {
    // DragControls will handle movement, boundaries enforced in useFrame
  }

  const handleDragEnd = () => {
    if (groupRef.current && onDragEnd) {
      const newPos = [
        groupRef.current.position.x,
        position[1],
        groupRef.current.position.z
      ]
      setPos(newPos)
      onDragEnd(id, newPos)
    }
  }

  return (
    <DragControls
      autoTransform
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
    >
      <group ref={groupRef} position={pos}>
        {/* Main box */}
        <mesh
          onClick={handleClick}
          onContextMenu={handleRightClick}
          onPointerOver={(e) => {
            e.stopPropagation()
            setHovered(true)
            document.body.style.cursor = 'grab'
          }}
          onPointerOut={(e) => {
            setHovered(false)
            document.body.style.cursor = 'auto'
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
    </DragControls>
  )
}

export default StorageBox

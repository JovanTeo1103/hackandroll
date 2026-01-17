import { useState, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { DragControls } from '@react-three/drei'

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
  isSelected 
}) {
  const [hovered, setHovered] = useState(false)
  const [pos, setPos] = useState(position)
  const groupRef = useRef()

  // Sync position when prop changes
  useEffect(() => {
    setPos(position)
  }, [position])

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

  const handleDrag = () => {
    if (groupRef.current) {
      const newPos = [
        Math.max(-4, Math.min(4, groupRef.current.position.x)),
        position[1], // Keep Y fixed
        Math.max(-4, Math.min(4, groupRef.current.position.z))
      ]
      // Clamp position during drag
      groupRef.current.position.x = newPos[0]
      groupRef.current.position.z = newPos[2]
      groupRef.current.position.y = newPos[1]
    }
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

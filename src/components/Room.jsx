import { useRef } from 'react'
import StorageBox from './StorageBox'

// Room dimensions (in meters/units)
const ROOM_WIDTH = 10
const ROOM_HEIGHT = 4
const ROOM_DEPTH = 10
const WALL_THICKNESS = 0.1

function Wall({ position, rotation, args, color = '#e8e4de' }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

function Room({ furniture = [], selectedId, onBoxClick, onDragEnd, onDelete }) {
  const roomRef = useRef()

  return (
    <group ref={roomRef}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#8b7355" /> {/* Wood-like floor */}
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Back Wall */}
      <Wall
        position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2]}
        rotation={[0, 0, 0]}
        args={[ROOM_WIDTH, ROOM_HEIGHT, WALL_THICKNESS]}
      />

      {/* Left Wall */}
      <Wall
        position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        args={[ROOM_DEPTH, ROOM_HEIGHT, WALL_THICKNESS]}
      />

      {/* Right Wall */}
      <Wall
        position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        args={[ROOM_DEPTH, ROOM_HEIGHT, WALL_THICKNESS]}
      />

      {/* User's Furniture - dynamically added */}
      {furniture.map((item) => (
        <StorageBox
          key={item.id}
          id={item.id}
          position={item.position}
          size={item.size}
          color={item.color}
          label={item.label}
          isSelected={selectedId === item.id}
          onClick={onBoxClick}
          onDragEnd={onDragEnd}
          onDelete={onDelete}
          roomWidth={ROOM_WIDTH}
          roomDepth={ROOM_DEPTH}
        />
      ))}
    </group>
  )
}

export default Room
export { ROOM_WIDTH, ROOM_HEIGHT, ROOM_DEPTH }

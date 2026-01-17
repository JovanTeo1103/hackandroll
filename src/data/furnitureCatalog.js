// Furniture catalog - available furniture types users can add to their room
export const furnitureCatalog = [
  {
    type: 'wardrobe',
    label: 'Wardrobe',
    size: [2, 3, 0.8],
    color: '#5C4033',
    icon: '🚪',
    description: 'Tall wardrobe for hanging clothes'
  },
  {
    type: 'bookshelf',
    label: 'Bookshelf',
    size: [1.5, 2.5, 0.4],
    color: '#8B4513',
    icon: '📚',
    description: 'Tall shelf for books & displays'
  },
  {
    type: 'cabinet',
    label: 'Cabinet',
    size: [1.5, 1.5, 0.6],
    color: '#D2691E',
    icon: '🗄️',
    description: 'Medium storage cabinet'
  },
  {
    type: 'shelf',
    label: 'Wall Shelf',
    size: [1.5, 0.2, 0.4],
    color: '#A0522D',
    icon: '📦',
    description: 'Floating wall shelf'
  },
  {
    type: 'drawer',
    label: 'Drawer Unit',
    size: [0.8, 1, 1.2],
    color: '#696969',
    icon: '🗃️',
    description: 'Metal drawer unit'
  },
  {
    type: 'cupboard',
    label: 'Tall Cupboard',
    size: [0.8, 3, 1],
    color: '#4A4A4A',
    icon: '🚪',
    description: 'Tall enclosed storage'
  },
  {
    type: 'shoeRack',
    label: 'Shoe Rack',
    size: [0.6, 0.8, 1.5],
    color: '#8B7355',
    icon: '👟',
    description: 'Low rack for shoes'
  },
  {
    type: 'chest',
    label: 'Storage Chest',
    size: [0.8, 0.8, 1.2],
    color: '#654321',
    icon: '📦',
    description: 'Wooden storage chest'
  },
  {
    type: 'desk',
    label: 'Desk',
    size: [1.5, 0.8, 0.7],
    color: '#3E2723',
    icon: '🪑',
    description: 'Work desk with drawers'
  },
  {
    type: 'bin',
    label: 'Storage Bin',
    size: [0.5, 0.6, 0.5],
    color: '#4A90D9',
    icon: '🗑️',
    description: 'Plastic storage bin'
  },
]

// Default starting furniture (empty room - user adds what they want)
export const defaultFurniture = []

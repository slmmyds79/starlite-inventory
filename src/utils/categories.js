export const categoryIcons = {
  'Tableware': '🍽️',
  'Linens': '🧵',
  'Centerpieces': '🕯️',
  'Lighting': '💡',
  'Backdrops': '🎪',
  'Chair Decor': '💺',
  'Greenery': '🌿',
  'Florals': '🌸',
  'Signage': '🪧',
  'Furniture': '🪑',
  'Draping': '🎀',
  'Balloons': '🎈',
  'Misc': '📦'
};

export const categories = Object.keys(categoryIcons);

export const conditions = ['Excellent', 'Good', 'Fair', 'Poor', 'Needs Repair', 'Damaged'];

export const locations = ['Unit A', 'Unit B', 'Unit C', 'Unit D', 'Offsite', 'Other'];

export const conditionColors = {
  'Excellent': { bg: '#dcfce7', text: '#166534', border: '#86efac' },
  'Good': { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  'Fair': { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  'Poor': { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
  'Needs Repair': { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
  'Damaged': { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' }
};

export const conditionEmojis = {
  'Excellent': '✨',
  'Good': '👍',
  'Fair': '⚠️',
  'Poor': '🔧',
  'Needs Repair': '🛠️',
  'Damaged': '💔'
};

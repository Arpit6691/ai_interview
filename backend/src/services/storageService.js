const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

/**
 * Get a public URL for a file stored in the uploads directory.
 */
const getPublicUrl = (filePath) => {
  if (!filePath) return '';
  // Convert absolute path to relative URL
  const relative = path.relative(UPLOADS_DIR, filePath).replace(/\\/g, '/');
  return `${BASE_URL}/uploads/${relative}`;
};

module.exports = { getPublicUrl };

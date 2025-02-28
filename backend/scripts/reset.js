// reset.js
const fs = require('fs');
const path = require('path');

// Ensure directory exists, create if not
const ensureDirectoryExists = (dirPath) => {
  try {
    // Create directory recursively if it doesn't exist
    fs.mkdirSync(dirPath, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') {
      console.error(`Error creating directory ${dirPath}:`, err);
    }
  }
};

// Reset production units
const resetProductionUnits = () => {
  const dataDir = path.join(__dirname, 'data');
  ensureDirectoryExists(dataDir);

  const unitsPath = path.join(dataDir, 'units.json');
  
  try {
    // Write an empty array to the file
    fs.writeFileSync(unitsPath, JSON.stringify([], null, 2));
    console.log('Production units reset successfully');
  } catch (err) {
    console.error('Error resetting production units:', err);
  }
};

// Reset production data
const resetProductionData = () => {
  const dataDir = path.join(__dirname, 'data');
  ensureDirectoryExists(dataDir);

  const productionsPath = path.join(dataDir, 'productions.json');
  
  try {
    // Write an empty array to the file
    fs.writeFileSync(productionsPath, JSON.stringify([], null, 2));
    console.log('Production data reset successfully');
  } catch (err) {
    console.error('Error resetting production data:', err);
  }
};

// Reset database configuration or connection
const resetDatabaseConfig = () => {
  const configDir = path.join(__dirname, '..', 'config');
  ensureDirectoryExists(configDir);

  const dbConfigPath = path.join(configDir, 'database.json');
  
  try {
    // Write a default empty configuration
    const defaultConfig = {
      type: 'json',
      path: './data',
      entities: ['units', 'productions']
    };
    
    fs.writeFileSync(dbConfigPath, JSON.stringify(defaultConfig, null, 2));
    console.log('Database configuration reset successfully');
  } catch (err) {
    console.error('Error resetting database configuration:', err);
  }
};

// Main reset function
const resetAllData = () => {
  console.log('Starting data reset...');
  
  // Reset different data stores
  resetProductionUnits();
  resetProductionData();
  resetDatabaseConfig();
  
  console.log('Data reset completed successfully');
};

// Execute the reset
resetAllData();
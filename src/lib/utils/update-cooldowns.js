// Script to update ability records with cooldown values from CSV

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the const.ts file
const constFilePath = path.join(__dirname, '../calc/const/const.ts');
// Path to the CSV file
const csvFilePath = path.join(__dirname, '../../../static/Ability Cooldowns - Copy of Sheet1.csv');

console.log('Reading files...');
// Read the CSV file
const csvData = fs.readFileSync(csvFilePath, 'utf8');
// Read the const.ts file
let constFileContent = fs.readFileSync(constFilePath, 'utf8');

// Parse the CSV data to create a mapping of ability names to cooldowns
console.log('Parsing CSV data...');
const cooldownMap = new Map();
const csvLines = csvData.split('\n');

csvLines.forEach(line => {
  if (line.trim() === '') return;

  // Split by comma, but handle the case where ability name might contain commas
  const lastCommaIndex = line.lastIndexOf(',');
  if (lastCommaIndex !== -1) {
    const abilityName = line.substring(0, lastCommaIndex).trim();
    const cooldown = parseFloat(line.substring(lastCommaIndex + 1).trim());

    if (!isNaN(cooldown)) {
      cooldownMap.set(abilityName.toLowerCase(), cooldown);
      // Also add a version without apostrophes for matching
      if (abilityName.includes("'")) {
        const noApostrophe = abilityName.replace(/'/g, "");
        cooldownMap.set(noApostrophe.toLowerCase(), cooldown);
      }
    }
  }
});

console.log(`Parsed ${cooldownMap.size} abilities with cooldowns`);

// Create a backup of the original file
const backupPath = constFilePath + '.bak';
fs.writeFileSync(backupPath, constFileContent, 'utf8');
console.log(`Created backup at ${backupPath}`);

// Instead of trying to parse the complex structure, we'll use a simpler approach
// We'll look for the ability definitions and insert the cooldown property at the end of each definition
const abilityRegex = /(\[ABILITIES\.[^\]]+\]:\s*{[^}]+)(\})/g;

constFileContent = constFileContent.replace(abilityRegex, (match, beforeClosing, closing) => {
  // Skip if cooldown is already defined
  if (beforeClosing.includes('cooldown:')) {
    return match;
  }

  // Extract the ability name from the match
  const abilityNameMatch = match.match(/\[ABILITIES\.([^\]]+)\]/);
  if (!abilityNameMatch) {
    return match;
  }

  const abilityKey = abilityNameMatch[1];

  // Format the ability name for lookup
  const formattedAbilityName = abilityKey
    .replace(/_/g, ' ')
    .replace(/1|2|3|4|5|HIT|INITIAL|BLEED|DOT|AOE|BONUS/g, '')
    .trim();

  // Look up the cooldown value
  let cooldown = 0; // Default value

  // Try to find a match in the cooldown map
  for (const [name, value] of cooldownMap.entries()) {
    if (name.toLowerCase().includes(formattedAbilityName.toLowerCase()) ||
        formattedAbilityName.toLowerCase().includes(name.toLowerCase())) {
      cooldown = value;
      break;
    }
  }

  // Check if the last character before the closing brace is a comma
  const needsComma = !beforeClosing.trim().endsWith(',');

  // Add the cooldown property
  return `${beforeClosing}${needsComma ? ',' : ''}\n        cooldown: ${cooldown}${closing}`;
});

// Write the updated content back to the file
console.log('Writing updated content to file...');
fs.writeFileSync(constFilePath, constFileContent, 'utf8');

console.log('Successfully updated ability cooldowns in const.ts');
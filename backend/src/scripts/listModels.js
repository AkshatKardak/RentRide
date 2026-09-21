const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../../../Data/normalized_cars.csv');
const lines = fs.readFileSync(csvPath, 'utf8').split('\n');

const map = new Map();

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  const parts = line.split(',').map(s => s.replace(/"/g, '').trim());
  const brand = parts[0];
  const model = parts[1];
  const category = parts[4];
  if (brand && model) {
    const key = `${brand} ${model}`;
    if (!map.has(key)) {
      map.set(key, { brand, model, category, count: 0 });
    }
    map.get(key).count++;
  }
}

const sorted = Array.from(map.values()).sort((a, b) => b.count - a.count);
console.log(`Total unique models: ${sorted.length}`);
sorted.forEach(m => console.log(`${m.brand} | ${m.model} | ${m.category} (${m.count} cars)`));

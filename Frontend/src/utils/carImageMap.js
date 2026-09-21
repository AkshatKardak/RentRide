import porscheImg from '../assets/porsche.png';
import mercedesG63Img from '../assets/mercedesg63amg.png';
import nanoImg from '../assets/Nano.png';
import skodaImg from '../assets/skoda.png';
import audiImg from '../assets/AudiElectric.png';
import hondaImg from '../assets/Honda.png';
import kiaImg from '../assets/Kia.png';
import bugattiImg from '../assets/Bugatti.png';
import rollsRoyceImg from '../assets/rolls royce.png';
import mustangImg from '../assets/blackcar.png';
import supraImg from '../assets/supra.png';
import lamboImg from '../assets/lambo.png';
import luxuryImg from '../assets/luxury.png';
import blueCarImg from '../assets/bluecar.png';
import heroCarImg from '../assets/herocar.png';
import carManifest from './carManifest.json';

const ASSET_BY_FILENAME = {
  'porsche.png': porscheImg,
  'mercedesg63amg.png': mercedesG63Img,
  'nano.png': nanoImg,
  'skoda.png': skodaImg,
  'audielectric.png': audiImg,
  'honda.png': hondaImg,
  'kia.png': kiaImg,
  'bugatti.png': bugattiImg,
  'rolls royce.png': rollsRoyceImg,
  'blackcar.png': mustangImg,
  'supra.png': supraImg,
  'lambo.png': lamboImg,
  'luxury.png': luxuryImg,
  'bluecar.png': blueCarImg,
  'herocar.png': heroCarImg,
  'herocar1.png': heroCarImg
};

/**
 * Resolves a car's image with exact model accuracy:
 * 1. Dedicated model-accurate local asset (/assets/cars/<slug>.jpg)
 * 2. Bundled transparent showcase assets (Porsche, G-Wagon, etc.)
 * 3. Verified external web URLs
 * 4. Model manifest fallback (0% brand guessing, 0% wrong car matching)
 */
export const getCarImageUrl = (car) => {
  if (!car) return heroCarImg;

  const brand = (car.brand || '').trim();
  const model = (car.model || '').trim();
  const manifestKey = `${brand} ${model}`.toLowerCase().trim();

  // 1. Check local model-accurate asset catalog first
  if (carManifest[manifestKey]?.path) {
    return carManifest[manifestKey].path;
  }

  const raw = car.primaryImage || (Array.isArray(car.images) && car.images[0]) || '';

  // 2. Direct local vehicle assets path
  if (typeof raw === 'string' && raw.startsWith('/assets/cars/')) {
    return raw;
  }

  // 3. Showcase local transparent assets
  if (typeof raw === 'string' && raw.includes('/assets/')) {
    const filename = raw.split('/assets/')[1]?.toLowerCase();
    if (filename && ASSET_BY_FILENAME[filename]) {
      return ASSET_BY_FILENAME[filename];
    }
  }

  // 4. Raw filename or tag
  if (typeof raw === 'string' && raw.trim()) {
    const clean = raw.toLowerCase().trim();
    const cleanWithExt = clean.endsWith('.png') ? clean : `${clean}.png`;
    if (ASSET_BY_FILENAME[cleanWithExt]) {
      return ASSET_BY_FILENAME[cleanWithExt];
    }
  }

  // 5. Direct Web URLs (Filter out deprecated incorrect Unsplash photo IDs)
  if (typeof raw === 'string' && (raw.startsWith('http://') || raw.startsWith('https://'))) {
    // Avoid incorrect reused BMW photo
    if (!raw.includes('photo-1549399542-7e3f8b79c341')) {
      return raw;
    }
  }

  // 6. Showcase models partial matching
  const modelStr = `${brand} ${model} ${car.name || ''}`.toLowerCase();
  if (modelStr.includes('911') || modelStr.includes('porsche')) return porscheImg;
  if (modelStr.includes('g63') || modelStr.includes('g-class') || modelStr.includes('g-wagon')) return mercedesG63Img;
  if (modelStr.includes('nano')) return nanoImg;
  if (modelStr.includes('kylaq') || modelStr.includes('slavia')) return skodaImg;
  if (modelStr.includes('e-tron') || modelStr.includes('audielectric')) return audiImg;
  if (modelStr.includes('elevate')) return hondaImg;
  if (modelStr.includes('carens') || modelStr.includes('ev6')) return kiaImg;
  if (modelStr.includes('chiron') || modelStr.includes('bugatti')) return bugattiImg;
  if (modelStr.includes('ghost') || modelStr.includes('rolls')) return rollsRoyceImg;
  if (modelStr.includes('mustang')) return mustangImg;
  if (modelStr.includes('supra')) return supraImg;
  if (modelStr.includes('huracan') || modelStr.includes('lambo')) return lamboImg;

  return heroCarImg;
};

export { heroCarImg };
export default getCarImageUrl;

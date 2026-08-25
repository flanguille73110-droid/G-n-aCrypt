import { Person, FamilyEvent, Gender, AuditLogEntry, FamilyTreeData, UnionType, UnionDetails } from '../types';

/**
 * Helper functions for Union types and details
 */
export function getUnionTypeLabel(type: UnionType): string {
  switch (type) {
    case 'mariage': return 'Mariage';
    case 'divorce': return 'Divorce / Séparation';
    case 'union_libre': return 'Union libre / Concubinage';
    case 'pacs': return 'PACS';
    default: return 'Union';
  }
}

export function getUnionTypeIcon(type: UnionType): string {
  switch (type) {
    case 'mariage': return '💍';
    case 'divorce': return '💍💔';
    case 'union_libre': return '🤝';
    case 'pacs': return '📜';
    default: return '💍';
  }
}

export function formatUnionSummary(union: UnionDetails, partnerName?: string): string {
  const icon = getUnionTypeIcon(union.type);
  const typeLabel = getUnionTypeLabel(union.type);
  let text = `${icon} ${typeLabel}`;
  if (partnerName) {
    text += ` avec ${partnerName}`;
  }
  if (union.date) {
    const formattedDate = union.date.length === 10 && union.date.includes('-')
      ? union.date.split('-').reverse().join('/')
      : union.date;
    if (union.type === 'divorce') {
      text += ` (Union le ${formattedDate})`;
    } else {
      text += ` le ${formattedDate}`;
    }
  }
  if (union.place) {
    text += ` à ${union.place}`;
  }
  if (union.endDate) {
    const formattedEndDate = union.endDate.length === 10 && union.endDate.includes('-')
      ? union.endDate.split('-').reverse().join('/')
      : union.endDate;
    text += ` — Fin/Divorce le ${formattedEndDate}`;
  }
  return text;
}

/**
 * Built-in dictionary for French & Belgian cities (large, medium, small, sub-prefectures)
 * and their GPS coordinates. 100% offline local database.
 */
export interface CityRef {
  label: string;       // Formal label for dropdown e.g. "Senlis (60 - Oise)"
  cityName: string;    // Clean city name e.g. "Senlis"
  coords: [number, number];
}

export const CITIES_DATABASE: CityRef[] = [
  // Hauts-de-France (60, 02, 80, 59, 62)
  { label: 'Senlis (60 - Oise)', cityName: 'Senlis', coords: [49.2070, 2.5850] },
  { label: 'Beauvais (60 - Oise)', cityName: 'Beauvais', coords: [49.4295, 2.0810] },
  { label: 'Compiègne (60 - Oise)', cityName: 'Compiègne', coords: [49.4178, 2.8261] },
  { label: 'Creil (60 - Oise)', cityName: 'Creil', coords: [49.2602, 2.4831] },
  { label: 'Chantilly (60 - Oise)', cityName: 'Chantilly', coords: [49.1931, 2.4693] },
  { label: 'Noyon (60 - Oise)', cityName: 'Noyon', coords: [49.5810, 2.9991] },
  { label: 'Clermont (60 - Oise)', cityName: 'Clermont', coords: [49.3789, 2.4144] },
  { label: 'Méru (60 - Oise)', cityName: 'Méru', coords: [49.2372, 2.1342] },
  { label: 'Nogent-sur-Oise (60 - Oise)', cityName: 'Nogent-sur-Oise', coords: [49.2758, 2.4686] },
  { label: 'Pont-Sainte-Maxence (60 - Oise)', cityName: 'Pont-Sainte-Maxence', coords: [49.3014, 2.6022] },
  { label: 'Crépy-en-Valois (60 - Oise)', cityName: 'Crépy-en-Valois', coords: [49.2338, 2.8833] },
  { label: 'Montataire (60 - Oise)', cityName: 'Montataire', coords: [49.2562, 2.4382] },
  { label: 'Ermenonville (60 - Oise)', cityName: 'Ermenonville', coords: [49.1261, 2.6975] },
  { label: 'Pierrefonds (60 - Oise)', cityName: 'Pierrefonds', coords: [49.3514, 2.9806] },
  { label: 'Gerberoy (60 - Oise)', cityName: 'Gerberoy', coords: [49.5347, 1.8500] },
  { label: 'Plailly (60 - Oise)', cityName: 'Plailly', coords: [49.1039, 2.5839] },
  { label: 'Vineuil-Saint-Firmin (60 - Oise)', cityName: 'Vineuil-Saint-Firmin', coords: [49.2000, 2.4833] },
  { label: 'Gouvieux (60 - Oise)', cityName: 'Gouvieux', coords: [49.1878, 2.4158] },
  { label: 'Saint-Leu-d\'Esserent (60 - Oise)', cityName: 'Saint-Leu-d\'Esserent', coords: [49.2178, 2.4208] },
  { label: 'Verberie (60 - Oise)', cityName: 'Verberie', coords: [49.3108, 2.7303] },
  { label: 'Fleurines (60 - Oise)', cityName: 'Fleurines', coords: [49.2631, 2.5858] },
  { label: 'Breteuil (60 - Oise)', cityName: 'Breteuil', coords: [49.6322, 2.2936] },
  { label: 'Grandvilliers (60 - Oise)', cityName: 'Grandvilliers', coords: [49.6658, 1.9408] },
  { label: 'Formerie (60 - Oise)', cityName: 'Formerie', coords: [49.6508, 1.7306] },
  { label: 'Estrées-Saint-Denis (60 - Oise)', cityName: 'Estrées-Saint-Denis', coords: [49.4261, 2.6433] },
  { label: 'Ressons-sur-Matz (60 - Oise)', cityName: 'Ressons-sur-Matz', coords: [49.5408, 2.7472] },
  { label: 'Nanteuil-le-Haudouin (60 - Oise)', cityName: 'Nanteuil-le-Haudouin', coords: [49.1358, 2.8108] },
  { label: 'Boran-sur-Oise (60 - Oise)', cityName: 'Boran-sur-Oise', coords: [49.1828, 2.3589] },
  { label: 'La Chapelle-en-Serval (60 - Oise)', cityName: 'La Chapelle-en-Serval', coords: [49.1278, 2.5358] },
  { label: 'Mortefontaine (60 - Oise)', cityName: 'Mortefontaine', coords: [49.1083, 2.6000] },
  { label: 'Pontarmé (60 - Oise)', cityName: 'Pontarmé', coords: [49.1539, 2.5489] },
  { label: 'Rantigny (60 - Oise)', cityName: 'Rantigny', coords: [49.3308, 2.4419] },
  { label: 'Liancourt (60 - Oise)', cityName: 'Liancourt', coords: [49.3297, 2.4636] },
  { label: 'Mouy (60 - Oise)', cityName: 'Mouy', coords: [49.3158, 2.3208] },
  { label: 'Saint-Just-en-Chaussée (60 - Oise)', cityName: 'Saint-Just-en-Chaussée', coords: [49.5058, 2.4319] },
  { label: 'Maignelay-Montigny (60 - Oise)', cityName: 'Maignelay-Montigny', coords: [49.5528, 2.5208] },
  { label: 'Coye-la-Forêt (60 - Oise)', cityName: 'Coye-la-Forêt', coords: [49.1472, 2.4667] },
  { label: 'Chaumont-en-Vexin (60 - Oise)', cityName: 'Chaumont-en-Vexin', coords: [49.2339, 1.8889] },

  { label: 'Amiens (80 - Somme)', cityName: 'Amiens', coords: [49.8941, 2.2958] },
  { label: 'Abbeville (80 - Somme)', cityName: 'Abbeville', coords: [50.1054, 1.8368] },
  { label: 'Albert (80 - Somme)', cityName: 'Albert', coords: [50.0031, 2.6517] },
  { label: 'Péronne (80 - Somme)', cityName: 'Péronne', coords: [49.9325, 2.9325] },
  { label: 'Doullens (80 - Somme)', cityName: 'Doullens', coords: [50.1583, 2.3389] },
  { label: 'Montdidier (80 - Somme)', cityName: 'Montdidier', coords: [49.6489, 2.5703] },
  { label: 'Corbie (80 - Somme)', cityName: 'Corbie', coords: [49.9083, 2.5111] },
  { label: 'Saint-Valery-sur-Somme (80)', cityName: 'Saint-Valery-sur-Somme', coords: [50.1889, 1.6308] },
  { label: 'Le Crotoy (80 - Somme)', cityName: 'Le Crotoy', coords: [50.2183, 1.6253] },
  { label: 'Ham (80 - Somme)', cityName: 'Ham', coords: [49.7469, 3.0722] },
  { label: 'Roye (80 - Somme)', cityName: 'Roye', coords: [49.7011, 2.7889] },

  { label: 'Saint-Quentin (02 - Aisne)', cityName: 'Saint-Quentin', coords: [49.8486, 3.2876] },
  { label: 'Laon (02 - Aisne)', cityName: 'Laon', coords: [49.5641, 3.6218] },
  { label: 'Soissons (02 - Aisne)', cityName: 'Soissons', coords: [49.3817, 3.3236] },
  { label: 'Château-Thierry (02 - Aisne)', cityName: 'Château-Thierry', coords: [49.0438, 3.4026] },
  { label: 'Tergnier (02 - Aisne)', cityName: 'Tergnier', coords: [49.6581, 3.2981] },
  { label: 'Chauny (02 - Aisne)', cityName: 'Chauny', coords: [49.6158, 3.2189] },
  { label: 'Hirson (02 - Aisne)', cityName: 'Hirson', coords: [49.9219, 4.0833] },
  { label: 'Vervins (02 - Aisne)', cityName: 'Vervins', coords: [49.8358, 3.8078] },
  { label: 'Guise (02 - Aisne)', cityName: 'Guise', coords: [49.9008, 3.6278] },
  { label: 'Villers-Cotterêts (02 - Aisne)', cityName: 'Villers-Cotterêts', coords: [49.2536, 3.0903] },

  { label: 'Lille (59 - Nord)', cityName: 'Lille', coords: [50.6292, 3.0573] },
  { label: 'Roubaix (59 - Nord)', cityName: 'Roubaix', coords: [50.6901, 3.1817] },
  { label: 'Tourcoing (59 - Nord)', cityName: 'Tourcoing', coords: [50.7239, 3.1612] },
  { label: 'Dunkerque (59 - Nord)', cityName: 'Dunkerque', coords: [51.0343, 2.3768] },
  { label: 'Douai (59 - Nord)', cityName: 'Douai', coords: [50.3714, 3.0800] },
  { label: 'Valenciennes (59 - Nord)', cityName: 'Valenciennes', coords: [50.3570, 3.5233] },
  { label: 'Cambrai (59 - Nord)', cityName: 'Cambrai', coords: [50.1764, 3.2356] },
  { label: 'Maubeuge (59 - Nord)', cityName: 'Maubeuge', coords: [50.2775, 3.9734] },
  { label: 'Hazebrouck (59 - Nord)', cityName: 'Hazebrouck', coords: [50.7231, 2.5389] },
  { label: 'Avesnes-sur-Helpe (59 - Nord)', cityName: 'Avesnes-sur-Helpe', coords: [50.1228, 3.9317] },
  { label: 'Cassel (59 - Nord)', cityName: 'Cassel', coords: [50.8008, 2.4861] },
  { label: 'Bailleul (59 - Nord)', cityName: 'Bailleul', coords: [50.7389, 2.7333] },

  { label: 'Arras (62 - Pas-de-Calais)', cityName: 'Arras', coords: [50.2910, 2.7775] },
  { label: 'Calais (62 - Pas-de-Calais)', cityName: 'Calais', coords: [50.9513, 1.8587] },
  { label: 'Boulogne-sur-Mer (62 - Pas-de-Calais)', cityName: 'Boulogne-sur-Mer', coords: [50.7252, 1.6133] },
  { label: 'Lens (62 - Pas-de-Calais)', cityName: 'Lens', coords: [50.4322, 2.8335] },
  { label: 'Béthune (62 - Pas-de-Calais)', cityName: 'Béthune', coords: [50.5303, 2.6408] },
  { label: 'Saint-Omer (62 - Pas-de-Calais)', cityName: 'Saint-Omer', coords: [50.7481, 2.2570] },
  { label: 'Le Touquet-Paris-Plage (62)', cityName: 'Le Touquet-Paris-Plage', coords: [50.5208, 1.5892] },
  { label: 'Montreuil-sur-Mer (62)', cityName: 'Montreuil-sur-Mer', coords: [50.4636, 1.7619] },
  { label: 'Hesdin (62 - Pas-de-Calais)', cityName: 'Hesdin', coords: [50.3739, 2.0369] },

  // Île-de-France (75, 77, 78, 91, 92, 93, 94, 95)
  { label: 'Paris (75 - Seine)', cityName: 'Paris', coords: [48.8566, 2.3522] },
  { label: 'Versailles (78 - Yvelines)', cityName: 'Versailles', coords: [48.8049, 2.1204] },
  { label: 'Saint-Germain-en-Laye (78)', cityName: 'Saint-Germain-en-Laye', coords: [48.8989, 2.0938] },
  { label: 'Rambouillet (78 - Yvelines)', cityName: 'Rambouillet', coords: [48.6441, 1.8288] },
  { label: 'Mantes-la-Jolie (78)', cityName: 'Mantes-la-Jolie', coords: [48.9908, 1.7172] },
  { label: 'Cergy (95 - Val-d\'Oise)', cityName: 'Cergy', coords: [49.0361, 2.0631] },
  { label: 'Pontoise (95 - Val-d\'Oise)', cityName: 'Pontoise', coords: [49.0514, 2.1013] },
  { label: 'Argenteuil (95 - Val-d\'Oise)', cityName: 'Argenteuil', coords: [48.9478, 2.2472] },
  { label: 'Saint-Denis (93 - Seine-Saint-Denis)', cityName: 'Saint-Denis', coords: [48.9362, 2.3574] },
  { label: 'Montreuil (93 - Seine-Saint-Denis)', cityName: 'Montreuil', coords: [48.8638, 2.4484] },
  { label: 'Nanterre (92 - Hauts-de-Seine)', cityName: 'Nanterre', coords: [48.8924, 2.2071] },
  { label: 'Boulogne-Billancourt (92)', cityName: 'Boulogne-Billancourt', coords: [48.8397, 2.2399] },
  { label: 'Créteil (94 - Val-de-Marne)', cityName: 'Créteil', coords: [48.7904, 2.4556] },
  { label: 'Évry-Courcouronnes (91 - Essonne)', cityName: 'Évry', coords: [48.6298, 2.4418] },
  { label: 'Corbeil-Essonnes (91 - Essonne)', cityName: 'Corbeil-Essonnes', coords: [48.6138, 2.4827] },
  { label: 'Massy (91 - Essonne)', cityName: 'Massy', coords: [48.7308, 2.2713] },
  { label: 'Melun (77 - Seine-et-Marne)', cityName: 'Melun', coords: [48.5399, 2.6599] },
  { label: 'Meaux (77 - Seine-et-Marne)', cityName: 'Meaux', coords: [48.9603, 2.8883] },
  { label: 'Fontainebleau (77 - Seine-et-Marne)', cityName: 'Fontainebleau', coords: [48.4047, 2.7016] },
  { label: 'Provins (77 - Seine-et-Marne)', cityName: 'Provins', coords: [48.5606, 3.2986] },

  // Normandy (14, 27, 50, 61, 76)
  { label: 'Rouen (76 - Seine-Maritime)', cityName: 'Rouen', coords: [49.4431, 1.0993] },
  { label: 'Le Havre (76 - Seine-Maritime)', cityName: 'Le Havre', coords: [49.4944, 0.1079] },
  { label: 'Dieppe (76 - Seine-Maritime)', cityName: 'Dieppe', coords: [49.9248, 1.0792] },
  { label: 'Fécamp (76 - Seine-Maritime)', cityName: 'Fécamp', coords: [49.7570, 0.3725] },
  { label: 'Étretat (76 - Seine-Maritime)', cityName: 'Étretat', coords: [49.7075, 0.2058] },
  { label: 'Yvetot (76 - Seine-Maritime)', cityName: 'Yvetot', coords: [49.6167, 0.7500] },
  { label: 'Neufchâtel-en-Bray (76)', cityName: 'Neufchâtel-en-Bray', coords: [49.7333, 1.4389] },
  { label: 'Caen (14 - Calvados)', cityName: 'Caen', coords: [49.1828, -0.3707] },
  { label: 'Lisieux (14 - Calvados)', cityName: 'Lisieux', coords: [49.1458, 0.2281] },
  { label: 'Bayeux (14 - Calvados)', cityName: 'Bayeux', coords: [49.2764, -0.7028] },
  { label: 'Honfleur (14 - Calvados)', cityName: 'Honfleur', coords: [49.4188, 0.2333] },
  { label: 'Deauville (14 - Calvados)', cityName: 'Deauville', coords: [49.3589, 0.0739] },
  { label: 'Trouville-sur-Mer (14)', cityName: 'Trouville-sur-Mer', coords: [49.3667, 0.0833] },
  { label: 'Cabourg (14 - Calvados)', cityName: 'Cabourg', coords: [49.2917, -0.1167] },
  { label: 'Falaise (14 - Calvados)', cityName: 'Falaise', coords: [48.8986, -0.1964] },
  { label: 'Vire Normandie (14)', cityName: 'Vire', coords: [48.8389, -0.8889] },
  { label: 'Cherbourg-en-Cotentin (50 - Manche)', cityName: 'Cherbourg', coords: [49.6337, -1.6222] },
  { label: 'Saint-Lô (50 - Manche)', cityName: 'Saint-Lô', coords: [48.1153, -1.0903] },
  { label: 'Granville (50 - Manche)', cityName: 'Granville', coords: [48.8372, -1.5964] },
  { label: 'Avranches (50 - Manche)', cityName: 'Avranches', coords: [48.6853, -1.3611] },
  { label: 'Carentan (50 - Manche)', cityName: 'Carentan', coords: [49.3039, -1.2464] },
  { label: 'Valognes (50 - Manche)', cityName: 'Valognes', coords: [49.5092, -1.4683] },
  { label: 'Coutances (50 - Manche)', cityName: 'Coutances', coords: [49.0461, -1.4447] },
  { label: 'Évreux (27 - Eure)', cityName: 'Évreux', coords: [49.0242, 1.1511] },
  { label: 'Vernon (27 - Eure)', cityName: 'Vernon', coords: [49.0917, 1.4861] },
  { label: 'Giverny (27 - Eure)', cityName: 'Giverny', coords: [49.0769, 1.5300] },
  { label: 'Les Andelys (27 - Eure)', cityName: 'Les Andelys', coords: [49.2461, 1.4172] },
  { label: 'Bernay (27 - Eure)', cityName: 'Bernay', coords: [49.0889, 0.5986] },
  { label: 'Pont-Audemer (27 - Eure)', cityName: 'Pont-Audemer', coords: [49.3542, 0.5142] },
  { label: 'Alençon (61 - Orne)', cityName: 'Alençon', coords: [48.4311, 0.0911] },
  { label: 'Flers (61 - Orne)', cityName: 'Flers', coords: [48.7469, -0.5636] },
  { label: 'Argentan (61 - Orne)', cityName: 'Argentan', coords: [48.7444, -0.0194] },
  { label: 'Camembert (61 - Orne)', cityName: 'Camembert', coords: [48.8925, 0.1633] },
  { label: 'Bagnoles-de-l\'Orne (61)', cityName: 'Bagnoles-de-l\'Orne', coords: [48.5528, -0.4139] },

  // Grand Est (51, 08, 10, 52, 54, 55, 57, 67, 68, 88)
  { label: 'Strasbourg (67 - Bas-Rhin)', cityName: 'Strasbourg', coords: [48.5734, 7.7521] },
  { label: 'Haguenau (67 - Bas-Rhin)', cityName: 'Haguenau', coords: [48.8156, 7.7892] },
  { label: 'Sélestat (67 - Bas-Rhin)', cityName: 'Sélestat', coords: [48.2594, 7.4542] },
  { label: 'Colmar (68 - Haut-Rhin)', cityName: 'Colmar', coords: [48.0794, 7.3585] },
  { label: 'Mulhouse (68 - Haut-Rhin)', cityName: 'Mulhouse', coords: [47.7508, 7.3359] },
  { label: 'Metz (57 - Moselle)', cityName: 'Metz', coords: [49.1193, 6.1757] },
  { label: 'Thionville (57 - Moselle)', cityName: 'Thionville', coords: [49.3581, 6.1689] },
  { label: 'Forbach (57 - Moselle)', cityName: 'Forbach', coords: [49.1878, 6.8953] },
  { label: 'Nancy (54 - Meurthe-et-Moselle)', cityName: 'Nancy', coords: [48.6921, 6.1844] },
  { label: 'Toul (54 - Meurthe-et-Moselle)', cityName: 'Toul', coords: [48.6756, 5.8911] },
  { label: 'Épinal (88 - Vosges)', cityName: 'Épinal', coords: [48.1744, 6.4503] },
  { label: 'Saint-Dié-des-Vosges (88)', cityName: 'Saint-Dié-des-Vosges', coords: [48.2861, 6.9492] },
  { label: 'Reims (51 - Marne)', cityName: 'Reims', coords: [49.2583, 4.0317] },
  { label: 'Épernay (51 - Marne)', cityName: 'Épernay', coords: [49.0431, 3.9567] },
  { label: 'Châlons-en-Champagne (51)', cityName: 'Châlons-en-Champagne', coords: [48.9569, 4.3644] },
  { label: 'Troyes (10 - Aube)', cityName: 'Troyes', coords: [48.2973, 4.0744] },
  { label: 'Charleville-Mézières (08)', cityName: 'Charleville-Mézières', coords: [49.7719, 4.7161] },
  { label: 'Sedan (08 - Ardennes)', cityName: 'Sedan', coords: [49.7019, 4.9406] },
  { label: 'Verdun (55 - Meuse)', cityName: 'Verdun', coords: [49.1611, 5.3853] },
  { label: 'Bar-le-Duc (55 - Meuse)', cityName: 'Bar-le-Duc', coords: [48.7725, 5.1614] },

  // Brittany (35, 22, 29, 56)
  { label: 'Rennes (35 - Ille-et-Vilaine)', cityName: 'Rennes', coords: [48.1173, -1.6778] },
  { label: 'Saint-Malo (35 - Ille-et-Vilaine)', cityName: 'Saint-Malo', coords: [48.6493, -2.0257] },
  { label: 'Fougères (35 - Ille-et-Vilaine)', cityName: 'Fougères', coords: [48.3528, -1.2025] },
  { label: 'Brest (29 - Finistère)', cityName: 'Brest', coords: [48.3904, -4.4861] },
  { label: 'Quimper (29 - Finistère)', cityName: 'Quimper', coords: [47.9960, -4.1025] },
  { label: 'Morlaix (29 - Finistère)', cityName: 'Morlaix', coords: [48.5778, -3.8272] },
  { label: 'Concarneau (29 - Finistère)', cityName: 'Concarneau', coords: [47.8731, -3.9219] },
  { label: 'Lorient (56 - Morbihan)', cityName: 'Lorient', coords: [47.7483, -3.3702] },
  { label: 'Vannes (56 - Morbihan)', cityName: 'Vannes', coords: [47.6582, -2.7600] },
  { label: 'Saint-Brieuc (22 - Côtes-d\'Armor)', cityName: 'Saint-Brieuc', coords: [48.5142, -2.7658] },
  { label: 'Lannion (22 - Côtes-d\'Armor)', cityName: 'Lannion', coords: [48.7322, -3.4589] },

  // Pays de la Loire (44, 49, 53, 72, 85)
  { label: 'Nantes (44 - Loire-Atlantique)', cityName: 'Nantes', coords: [47.2184, -1.5536] },
  { label: 'Saint-Nazaire (44)', cityName: 'Saint-Nazaire', coords: [47.2731, -2.2137] },
  { label: 'Guérande (44)', cityName: 'Guérande', coords: [47.3278, -2.4289] },
  { label: 'Angers (49 - Maine-et-Loire)', cityName: 'Angers', coords: [47.4784, -0.5632] },
  { label: 'Cholet (49 - Maine-et-Loire)', cityName: 'Cholet', coords: [47.0603, -0.8783] },
  { label: 'Saumur (49 - Maine-et-Loire)', cityName: 'Saumur', coords: [47.2603, -0.0772] },
  { label: 'Le Mans (72 - Sarthe)', cityName: 'Le Mans', coords: [48.0061, 0.1996] },
  { label: 'Laval (53 - Mayenne)', cityName: 'Laval', coords: [48.0706, -0.7711] },
  { label: 'La Roche-sur-Yon (85 - Vendée)', cityName: 'La Roche-sur-Yon', coords: [46.6706, -1.4264] },
  { label: 'Les Sables-d\'Olonne (85)', cityName: 'Les Sables-d\'Olonne', coords: [46.4972, -1.7833] },

  // Centre-Val de Loire (18, 28, 36, 37, 41, 45)
  { label: 'Orléans (45 - Loiret)', cityName: 'Orléans', coords: [47.9029, 1.9090] },
  { label: 'Montargis (45 - Loiret)', cityName: 'Montargis', coords: [47.9975, 2.7333] },
  { label: 'Tours (37 - Indre-et-Loire)', cityName: 'Tours', coords: [47.3941, 0.6848] },
  { label: 'Amboise (37 - Indre-et-Loire)', cityName: 'Amboise', coords: [47.4125, 0.9833] },
  { label: 'Chartres (28 - Eure-et-Loir)', cityName: 'Chartres', coords: [48.4439, 1.4858] },
  { label: 'Bourges (18 - Cher)', cityName: 'Bourges', coords: [47.0810, 2.3988] },
  { label: 'Vierzon (18 - Cher)', cityName: 'Vierzon', coords: [47.2222, 2.0686] },
  { label: 'Châteauroux (36 - Indre)', cityName: 'Châteauroux', coords: [46.8114, 1.6869] },
  { label: 'Blois (41 - Loir-et-Cher)', cityName: 'Blois', coords: [47.5861, 1.3359] },

  // Bourgogne-Franche-Comté (21, 25, 39, 58, 70, 71, 89, 90)
  { label: 'Dijon (21 - Côte-d\'Or)', cityName: 'Dijon', coords: [47.3220, 5.0415] },
  { label: 'Beaune (21 - Côte-d\'Or)', cityName: 'Beaune', coords: [47.0256, 4.8394] },
  { label: 'Besançon (25 - Doubs)', cityName: 'Besançon', coords: [47.2378, 6.0241] },
  { label: 'Montbéliard (25 - Doubs)', cityName: 'Montbéliard', coords: [47.5103, 6.7983] },
  { label: 'Belfort (90 - Territoire de Belfort)', cityName: 'Belfort', coords: [47.6378, 6.8628] },
  { label: 'Auxerre (89 - Yonne)', cityName: 'Auxerre', coords: [47.7985, 3.5731] },
  { label: 'Sens (89 - Yonne)', cityName: 'Sens', coords: [48.1978, 3.2833] },
  { label: 'Chalon-sur-Saône (71)', cityName: 'Chalon-sur-Saône', coords: [46.7806, 4.8528] },
  { label: 'Mâcon (71 - Saône-et-Loire)', cityName: 'Mâcon', coords: [46.3069, 4.8317] },
  { label: 'Nevers (58 - Nièvre)', cityName: 'Nevers', coords: [46.9933, 3.1572] },
  { label: 'Vesoul (70 - Haute-Saône)', cityName: 'Vesoul', coords: [47.6225, 6.1558] },
  { label: 'Lons-le-Saunier (39 - Jura)', cityName: 'Lons-le-Saunier', coords: [46.6753, 5.5544] },

  // Auvergne-Rhône-Alpes (01, 03, 07, 15, 26, 38, 42, 43, 63, 69, 73, 74)
  { label: 'Lyon (69 - Rhône)', cityName: 'Lyon', coords: [45.7640, 4.8357] },
  { label: 'Villeurbanne (69 - Rhône)', cityName: 'Villeurbanne', coords: [45.7667, 4.8833] },
  { label: 'Saint-Étienne (42 - Loire)', cityName: 'Saint-Étienne', coords: [45.4397, 4.3872] },
  { label: 'Roanne (42 - Loire)', cityName: 'Roanne', coords: [46.0353, 4.0686] },
  { label: 'Grenoble (38 - Isère)', cityName: 'Grenoble', coords: [45.1885, 5.7245] },
  { label: 'Vienne (38 - Isère)', cityName: 'Vienne', coords: [45.5253, 4.8764] },
  { label: 'Annecy (74 - Haute-Savoie)', cityName: 'Annecy', coords: [45.8992, 6.1294] },
  { label: 'Thonon-les-Bains (74)', cityName: 'Thonon-les-Bains', coords: [46.3703, 6.4789] },
  { label: 'Évian-les-Bains (74)', cityName: 'Évian-les-Bains', coords: [46.4008, 6.5867] },
  { label: 'Chamonix-Mont-Blanc (74)', cityName: 'Chamonix-Mont-Blanc', coords: [45.9237, 6.8694] },
  { label: 'Chambéry (73 - Savoie)', cityName: 'Chambéry', coords: [45.5646, 5.9178] },
  { label: 'Aix-les-Bains (73 - Savoie)', cityName: 'Aix-les-Bains', coords: [45.6883, 5.9158] },
  { label: 'Albertville (73 - Savoie)', cityName: 'Albertville', coords: [45.6756, 6.3925] },
  { label: 'Clermont-Ferrand (63 - Puy-de-Dôme)', cityName: 'Clermont-Ferrand', coords: [45.7772, 3.0870] },
  { label: 'Montluçon (03 - Allier)', cityName: 'Montluçon', coords: [46.3408, 2.6033] },
  { label: 'Vichy (03 - Allier)', cityName: 'Vichy', coords: [46.1278, 3.4267] },
  { label: 'Aurillac (15 - Cantal)', cityName: 'Aurillac', coords: [44.9261, 2.4453] },
  { label: 'Bourg-en-Bresse (01 - Ain)', cityName: 'Bourg-en-Bresse', coords: [46.2056, 5.2289] },
  { label: 'Valence (26 - Drôme)', cityName: 'Valence', coords: [44.9333, 4.8917] },
  { label: 'Montélimar (26 - Drôme)', cityName: 'Montélimar', coords: [44.5583, 4.7508] },
  { label: 'Le Puy-en-Velay (43 - Haute-Loire)', cityName: 'Le Puy-en-Velay', coords: [45.0428, 3.8825] },

  // Nouvelle-Aquitaine (16, 17, 19, 23, 24, 33, 40, 47, 64, 79, 86, 87)
  { label: 'Bordeaux (33 - Gironde)', cityName: 'Bordeaux', coords: [44.8378, -0.5792] },
  { label: 'Arcachon (33 - Gironde)', cityName: 'Arcachon', coords: [44.6583, -1.1667] },
  { label: 'Libourne (33 - Gironde)', cityName: 'Libourne', coords: [44.9153, -0.2439] },
  { label: 'Saint-Émilion (33 - Gironde)', cityName: 'Saint-Émilion', coords: [44.8942, -0.1558] },
  { label: 'Limoges (87 - Haute-Vienne)', cityName: 'Limoges', coords: [45.8336, 1.2611] },
  { label: 'Brive-la-Gaillarde (19 - Corrèze)', cityName: 'Brive-la-Gaillarde', coords: [45.1583, 1.5333] },
  { label: 'Poitiers (86 - Vienne)', cityName: 'Poitiers', coords: [46.5802, 0.3404] },
  { label: 'Niort (79 - Deux-Sèvres)', cityName: 'Niort', coords: [46.3236, -0.4639] },
  { label: 'La Rochelle (17 - Charente-Maritime)', cityName: 'La Rochelle', coords: [46.1603, -1.1511] },
  { label: 'Saintes (17 - Charente-Maritime)', cityName: 'Saintes', coords: [45.7453, -0.6333] },
  { label: 'Rochefort (17 - Charente-Maritime)', cityName: 'Rochefort', coords: [45.9419, -0.9658] },
  { label: 'Royan (17 - Charente-Maritime)', cityName: 'Royan', coords: [45.6286, -1.0283] },
  { label: 'Angoulême (16 - Charente)', cityName: 'Angoulême', coords: [45.6484, 0.1562] },
  { label: 'Cognac (16 - Charente)', cityName: 'Cognac', coords: [45.6958, -0.3289] },
  { label: 'Périgueux (24 - Dordogne)', cityName: 'Périgueux', coords: [45.1833, 0.7167] },
  { label: 'Bergerac (24 - Dordogne)', cityName: 'Bergerac', coords: [44.8536, 0.4833] },
  { label: 'Sarlat-la-Canéda (24 - Dordogne)', cityName: 'Sarlat-la-Canéda', coords: [44.8900, 1.2167] },
  { label: 'Agen (47 - Lot-et-Garonne)', cityName: 'Agen', coords: [44.2033, 0.6167] },
  { label: 'Pau (64 - Pyrénées-Atlantiques)', cityName: 'Pau', coords: [43.2951, -0.3708] },
  { label: 'Bayonne (64 - Pyrénées-Atlantiques)', cityName: 'Bayonne', coords: [43.4929, -1.4748] },
  { label: 'Biarritz (64 - Pyrénées-Atlantiques)', cityName: 'Biarritz', coords: [43.4832, -1.5586] },
  { label: 'Saint-Jean-de-Luz (64)', cityName: 'Saint-Jean-de-Luz', coords: [43.3881, -1.6628] },
  { label: 'Mont-de-Marsan (40 - Landes)', cityName: 'Mont-de-Marsan', coords: [43.8908, -0.4975] },
  { label: 'Dax (40 - Landes)', cityName: 'Dax', coords: [43.7103, -1.0536] },

  // Occitanie (09, 11, 12, 30, 31, 32, 34, 46, 48, 65, 66, 81, 82)
  { label: 'Toulouse (31 - Haute-Garonne)', cityName: 'Toulouse', coords: [43.6047, 1.4442] },
  { label: 'Montpellier (34 - Hérault)', cityName: 'Montpellier', coords: [43.6108, 3.8767] },
  { label: 'Béziers (34 - Hérault)', cityName: 'Béziers', coords: [43.3442, 3.2158] },
  { label: 'Sète (34 - Hérault)', cityName: 'Sète', coords: [43.4053, 3.6975] },
  { label: 'Nîmes (30 - Gard)', cityName: 'Nîmes', coords: [43.8367, 4.3601] },
  { label: 'Alès (30 - Gard)', cityName: 'Alès', coords: [44.1281, 4.0817] },
  { label: 'Perpignan (66 - Pyrénées-Orientales)', cityName: 'Perpignan', coords: [42.6986, 2.8956] },
  { label: 'Carcassonne (11 - Aude)', cityName: 'Carcassonne', coords: [43.2131, 2.3528] },
  { label: 'Narbonne (11 - Aude)', cityName: 'Narbonne', coords: [43.1833, 3.0000] },
  { label: 'Albi (81 - Tarn)', cityName: 'Albi', coords: [43.9286, 2.1464] },
  { label: 'Castres (81 - Tarn)', cityName: 'Castres', coords: [43.6047, 2.2406] },
  { label: 'Tarbes (65 - Hautes-Pyrénées)', cityName: 'Tarbes', coords: [43.2333, 0.0833] },
  { label: 'Lourdes (65 - Hautes-Pyrénées)', cityName: 'Lourdes', coords: [43.0947, -0.0458] },
  { label: 'Rodez (12 - Aveyron)', cityName: 'Rodez', coords: [44.3508, 2.5750] },
  { label: 'Millau (12 - Aveyron)', cityName: 'Millau', coords: [44.0989, 3.0781] },
  { label: 'Cahors (46 - Lot)', cityName: 'Cahors', coords: [44.4475, 1.4419] },
  { label: 'Auch (32 - Gers)', cityName: 'Auch', coords: [43.6464, 0.5858] },
  { label: 'Montauban (82 - Tarn-et-Garonne)', cityName: 'Montauban', coords: [44.0178, 1.3550] },
  { label: 'Foix (09 - Ariège)', cityName: 'Foix', coords: [42.9647, 1.6053] },
  { label: 'Mende (48 - Lozère)', cityName: 'Mende', coords: [44.5181, 3.5008] },

  // PACA & Corsica (04, 05, 06, 13, 83, 84, 2A, 2B)
  { label: 'Marseille (13 - Bouches-du-Rhône)', cityName: 'Marseille', coords: [43.2965, 5.3698] },
  { label: 'Aix-en-Provence (13)', cityName: 'Aix-en-Provence', coords: [43.5297, 5.4474] },
  { label: 'Arles (13 - Bouches-du-Rhône)', cityName: 'Arles', coords: [43.6767, 4.6278] },
  { label: 'Nice (06 - Alpes-Maritimes)', cityName: 'Nice', coords: [43.7102, 7.2620] },
  { label: 'Cannes (06 - Alpes-Maritimes)', cityName: 'Cannes', coords: [43.5528, 7.0174] },
  { label: 'Antibes (06 - Alpes-Maritimes)', cityName: 'Antibes', coords: [43.5808, 7.1239] },
  { label: 'Grasse (06 - Alpes-Maritimes)', cityName: 'Grasse', coords: [43.6589, 6.9239] },
  { label: 'Menton (06 - Alpes-Maritimes)', cityName: 'Menton', coords: [43.7750, 7.5000] },
  { label: 'Toulon (83 - Var)', cityName: 'Toulon', coords: [43.1242, 5.9280] },
  { label: 'Hyères (83 - Var)', cityName: 'Hyères', coords: [43.1206, 6.1286] },
  { label: 'Fréjus (83 - Var)', cityName: 'Fréjus', coords: [43.4331, 6.7372] },
  { label: 'Draguignan (83 - Var)', cityName: 'Draguignan', coords: [43.5389, 6.4644] },
  { label: 'Avignon (84 - Vaucluse)', cityName: 'Avignon', coords: [43.9493, 4.8055] },
  { label: 'Orange (84 - Vaucluse)', cityName: 'Orange', coords: [44.1358, 4.8089] },
  { label: 'Gap (05 - Hautes-Alpes)', cityName: 'Gap', coords: [44.5594, 6.0786] },
  { label: 'Briançon (05 - Hautes-Alpes)', cityName: 'Briançon', coords: [44.8964, 6.6356] },
  { label: 'Digne-les-Bains (04)', cityName: 'Digne-les-Bains', coords: [44.0925, 6.2358] },
  { label: 'Bastia (2B - Haute-Corse)', cityName: 'Bastia', coords: [42.7028, 9.4500] },
  { label: 'Ajaccio (2A - Corse-du-Sud)', cityName: 'Ajaccio', coords: [41.9267, 8.7369] },
  { label: 'Calvi (2B - Haute-Corse)', cityName: 'Calvi', coords: [42.5686, 8.7572] },
  { label: 'Porto-Vecchio (2A)', cityName: 'Porto-Vecchio', coords: [41.5914, 9.2794] },

  // Belgique (Wallonie, Bruxelles, Flandre)
  { label: 'Bruxelles (Belgique)', cityName: 'Bruxelles', coords: [50.8503, 4.3517] },
  { label: 'Liège (Belgique)', cityName: 'Liège', coords: [50.6326, 5.5797] },
  { label: 'Namur (Belgique)', cityName: 'Namur', coords: [50.4674, 4.8720] },
  { label: 'Charleroi (Belgique)', cityName: 'Charleroi', coords: [50.4108, 4.4446] },
  { label: 'Mons (Belgique)', cityName: 'Mons', coords: [50.4542, 3.9567] },
  { label: 'Tournai (Belgique)', cityName: 'Tournai', coords: [50.6056, 3.3892] },
  { label: 'Arlon (Belgique)', cityName: 'Arlon', coords: [49.6833, 5.8167] },
  { label: 'Dinant (Belgique)', cityName: 'Dinant', coords: [50.2614, 4.9122] },
  { label: 'Bastogne (Belgique)', cityName: 'Bastogne', coords: [50.0033, 5.7183] },
  { label: 'Verviers (Belgique)', cityName: 'Verviers', coords: [50.5933, 5.8622] },
  { label: 'Nivelles (Belgique)', cityName: 'Nivelles', coords: [50.5978, 4.3236] },
  { label: 'Wavre (Belgique)', cityName: 'Wavre', coords: [50.7167, 4.6167] },
  { label: 'Louvain-la-Neuve (Belgique)', cityName: 'Louvain-la-Neuve', coords: [50.6700, 4.6147] },
  { label: 'Gand / Gent (Belgique)', cityName: 'Gand', coords: [51.0543, 3.7174] },
  { label: 'Bruges / Brugge (Belgique)', cityName: 'Bruges', coords: [51.2093, 3.2247] },
  { label: 'Anvers / Antwerpen (Belgique)', cityName: 'Anvers', coords: [51.2194, 4.4025] },
  { label: 'Ostende (Belgique)', cityName: 'Ostende', coords: [51.2154, 2.9286] },
  { label: 'Kortrijk / Courtrai (Belgique)', cityName: 'Courtrai', coords: [50.8281, 3.2649] },
  { label: 'Spa (Belgique)', cityName: 'Spa', coords: [50.4925, 5.8647] },
  { label: 'Durbuy (Belgique)', cityName: 'Durbuy', coords: [50.3528, 5.4558] },
  { label: 'Huy (Belgique)', cityName: 'Huy', coords: [50.5186, 5.2333] },

  // International
  { label: 'Genève (Suisse)', cityName: 'Genève', coords: [46.2044, 6.1432] },
  { label: 'Lausanne (Suisse)', cityName: 'Lausanne', coords: [46.5197, 6.6323] },
  { label: 'Montréal (Canada)', cityName: 'Montréal', coords: [45.5017, -73.5673] },
  { label: 'Québec (Canada)', cityName: 'Québec', coords: [46.8139, -71.2080] },
  { label: 'Londres (Royaume-Uni)', cityName: 'Londres', coords: [51.5074, -0.1278] },
  { label: 'Rome (Italie)', cityName: 'Rome', coords: [41.9028, 12.4964] },
  { label: 'Madrid (Espagne)', cityName: 'Madrid', coords: [40.4168, -3.7038] },
  { label: 'Berlin (Allemagne)', cityName: 'Berlin', coords: [52.5200, 13.4050] }
];

export const KNOWN_CITIES: Record<string, [number, number]> = CITIES_DATABASE.reduce((acc, curr) => {
  const normKey = curr.cityName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  acc[normKey] = curr.coords;
  return acc;
}, {} as Record<string, [number, number]>);

/**
 * Normalizes text for accent-insensitive search.
 */
function cleanNorm(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Searches local city suggestions matching user input.
 */
export function getCitySuggestions(query: string, limit: number = 8): CityRef[] {
  if (!query || query.trim().length < 1) return [];

  const normQuery = cleanNorm(query);

  const matches = CITIES_DATABASE.filter(city => {
    const normLabel = cleanNorm(city.label);
    const normCity = cleanNorm(city.cityName);
    return normLabel.includes(normQuery) || normCity.includes(normQuery);
  });

  // Sort cities starting with query first
  matches.sort((a, b) => {
    const aStartsWith = cleanNorm(a.cityName).startsWith(normQuery) || cleanNorm(a.label).startsWith(normQuery);
    const bStartsWith = cleanNorm(b.cityName).startsWith(normQuery) || cleanNorm(b.label).startsWith(normQuery);
    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;
    return a.label.localeCompare(b.label);
  });

  return matches.slice(0, limit);
}


export function lookupCoordinates(placeName?: string): [number, number] | undefined {
  if (!placeName) return undefined;

  const cleanString = (str: string) => 
    str.toLowerCase()
       .normalize("NFD")
       .replace(/[\u0300-\u036f]/g, "");

  const normalized = cleanString(placeName);

  // 1. Direct or substring search in dictionary
  for (const [city, coords] of Object.entries(KNOWN_CITIES)) {
    const cityNorm = cleanString(city);
    if (normalized.includes(cityNorm)) {
      return coords;
    }
  }

  // 2. Strip numbers (like department code 60, postal codes 60300) and punctuation
  const stripped = normalized
    .replace(/\b\d{2,5}\b/g, '') // Remove numbers like 60, 60300
    .replace(/[^a-z\s-]/g, ' ')
    .trim();

  if (stripped && stripped !== normalized) {
    for (const [city, coords] of Object.entries(KNOWN_CITIES)) {
      const cityNorm = cleanString(city);
      if (stripped.includes(cityNorm)) {
        return coords;
      }
    }
  }

  return undefined;
}

/**
 * Ensures bi-directional relation integrity across all persons when a person is saved or updated.
 * ⭐ Requirement 4: Automatic bi-directional linking between parents <-> children & spouses.
 */
export function synchronizeRelations(persons: Person[], targetPerson: Person): Person[] {
  // Create a mutable copy of all persons
  const map = new Map<string, Person>();
  persons.forEach(p => map.set(p.id, JSON.parse(JSON.stringify(p))));
  
  // Set target person
  map.set(targetPerson.id, JSON.parse(JSON.stringify(targetPerson)));

  const updatedTarget = map.get(targetPerson.id)!;

  // Ensure unions array exists and spouseIds is in sync with unions
  if (!updatedTarget.unions) {
    updatedTarget.unions = [];
  }

  // Ensure all spouseIds have a default union if not already present
  updatedTarget.spouseIds.forEach(spouseId => {
    if (!updatedTarget.unions!.some(u => u.partnerId === spouseId)) {
      updatedTarget.unions!.push({
        id: `u-${updatedTarget.id}-${spouseId}`,
        partnerId: spouseId,
        type: 'mariage'
      });
    }
  });

  // Ensure spouseIds reflects union partnerIds
  const unionPartnerIds = updatedTarget.unions.map(u => u.partnerId);
  updatedTarget.spouseIds = Array.from(new Set([...updatedTarget.spouseIds, ...unionPartnerIds]));

  // 1. Sync Father link
  if (updatedTarget.fatherId) {
    const father = map.get(updatedTarget.fatherId);
    if (father && !father.childrenIds.includes(updatedTarget.id)) {
      father.childrenIds.push(updatedTarget.id);
    }
  }

  // 2. Sync Mother link
  if (updatedTarget.motherId) {
    const mother = map.get(updatedTarget.motherId);
    if (mother && !mother.childrenIds.includes(updatedTarget.id)) {
      mother.childrenIds.push(updatedTarget.id);
    }
  }

  // 3. Sync Children links
  updatedTarget.childrenIds.forEach(childId => {
    const child = map.get(childId);
    if (child) {
      if (updatedTarget.gender === 'M' && child.fatherId !== updatedTarget.id) {
        child.fatherId = updatedTarget.id;
      } else if (updatedTarget.gender === 'F' && child.motherId !== updatedTarget.id) {
        child.motherId = updatedTarget.id;
      } else if (updatedTarget.gender === 'O' && !child.fatherId) {
        child.fatherId = updatedTarget.id;
      }
    }
  });

  // 4. Sync Spouses & Unions links
  updatedTarget.spouseIds.forEach(spouseId => {
    const spouse = map.get(spouseId);
    if (spouse) {
      if (!spouse.spouseIds.includes(updatedTarget.id)) {
        spouse.spouseIds.push(updatedTarget.id);
      }
      if (!spouse.unions) {
        spouse.unions = [];
      }
      
      // Find matching union from target
      const targetUnion = updatedTarget.unions!.find(u => u.partnerId === spouseId);
      if (targetUnion) {
        const spouseUnionIndex = spouse.unions.findIndex(u => u.partnerId === updatedTarget.id);
        const reciprocalUnion: UnionDetails = {
          id: spouseUnionIndex >= 0 ? spouse.unions[spouseUnionIndex].id : `u-${spouse.id}-${updatedTarget.id}`,
          partnerId: updatedTarget.id,
          type: targetUnion.type,
          date: targetUnion.date,
          place: targetUnion.place,
          coords: targetUnion.coords,
          endDate: targetUnion.endDate
        };

        if (spouseUnionIndex >= 0) {
          spouse.unions[spouseUnionIndex] = reciprocalUnion;
        } else {
          spouse.unions.push(reciprocalUnion);
        }
      }
    }
  });

  // 5. Clean up removed relations in other persons
  map.forEach((person, id) => {
    if (id === updatedTarget.id) return;

    // If this person was listed as father/mother but is no longer
    if (person.childrenIds.includes(updatedTarget.id) && 
        person.id !== updatedTarget.fatherId && 
        person.id !== updatedTarget.motherId) {
      person.childrenIds = person.childrenIds.filter(cid => cid !== updatedTarget.id);
    }

    // If target was father/mother of person, but target no longer claims person in children
    if (!updatedTarget.childrenIds.includes(person.id)) {
      if (person.fatherId === updatedTarget.id) person.fatherId = undefined;
      if (person.motherId === updatedTarget.id) person.motherId = undefined;
    }

    // Spouse & Union sync check
    if (person.spouseIds.includes(updatedTarget.id) && !updatedTarget.spouseIds.includes(person.id)) {
      person.spouseIds = person.spouseIds.filter(sid => sid !== updatedTarget.id);
      if (person.unions) {
        person.unions = person.unions.filter(u => u.partnerId !== updatedTarget.id);
      }
    }
  });

  return Array.from(map.values());
}

/**
 * Removes a person and cleans up all direct references in other relatives.
 */
export function removePersonAndCleanRelations(persons: Person[], personId: string): Person[] {
  const filtered = persons.filter(p => p.id !== personId);
  return filtered.map(p => {
    const copy = { ...p };
    if (copy.fatherId === personId) copy.fatherId = undefined;
    if (copy.motherId === personId) copy.motherId = undefined;
    copy.spouseIds = copy.spouseIds.filter(id => id !== personId);
    if (copy.unions) {
      copy.unions = copy.unions.filter(u => u.partnerId !== personId);
    }
    copy.childrenIds = copy.childrenIds.filter(id => id !== personId);
    return copy;
  });
}

/**
 * Calculates siblings for a person based on shared parents.
 */
export function getSiblings(person: Person, allPersons: Person[]): Person[] {
  if (!person.fatherId && !person.motherId) return [];
  return allPersons.filter(p => 
    p.id !== person.id && (
      (person.fatherId && p.fatherId === person.fatherId) ||
      (person.motherId && p.motherId === person.motherId)
    )
  );
}

/**
 * Calculates grandparents for a person.
 */
export function getGrandparents(person: Person, allPersons: Person[]): Person[] {
  const grandparents: Person[] = [];
  const father = allPersons.find(p => p.id === person.fatherId);
  const mother = allPersons.find(p => p.id === person.motherId);

  if (father) {
    if (father.fatherId) {
      const g = allPersons.find(p => p.id === father.fatherId);
      if (g) grandparents.push(g);
    }
    if (father.motherId) {
      const g = allPersons.find(p => p.id === father.motherId);
      if (g) grandparents.push(g);
    }
  }

  if (mother) {
    if (mother.fatherId) {
      const g = allPersons.find(p => p.id === mother.fatherId);
      if (g) grandparents.push(g);
    }
    if (mother.motherId) {
      const g = allPersons.find(p => p.id === mother.motherId);
      if (g) grandparents.push(g);
    }
  }

  return grandparents;
}

/**
 * Generates automated timeline events from births, marriages, unions, deaths, and custom events.
 */
export function generateTimelineEvents(persons: Person[], customEvents: FamilyEvent[]): FamilyEvent[] {
  const events: FamilyEvent[] = [];
  const processedUnions = new Set<string>();

  persons.forEach(p => {
    const fullName = `${p.firstName} ${p.lastName}`;

    if (p.birthDate) {
      events.push({
        id: `birth-${p.id}`,
        type: 'naissance',
        title: `Naissance de ${fullName}`,
        date: p.birthDate,
        place: p.birthPlace,
        coords: p.birthCoords || lookupCoordinates(p.birthPlace),
        personIds: [p.id],
        description: `Né(e) à ${p.birthPlace || 'lieu inconnu'}`
      });
    }

    if (p.isDeceased && p.deathDate) {
      events.push({
        id: `death-${p.id}`,
        type: 'deces',
        title: `Décès de ${fullName}`,
        date: p.deathDate,
        place: p.deathPlace,
        coords: p.deathCoords || lookupCoordinates(p.deathPlace),
        personIds: [p.id],
        description: `Décédé(e) à ${p.deathPlace || 'lieu inconnu'}`
      });
    }

    // Unions
    if (p.unions) {
      p.unions.forEach(u => {
        const partner = persons.find(partner => partner.id === u.partnerId);
        const unionKey = [p.id, u.partnerId].sort().join('-') + '-' + u.type + '-' + (u.date || '');
        
        if (!processedUnions.has(unionKey)) {
          processedUnions.add(unionKey);

          const partnerName = partner ? `${partner.firstName} ${partner.lastName}` : 'Partenaire';
          const unionLabel = getUnionTypeLabel(u.type);
          const unionIcon = getUnionTypeIcon(u.type);

          if (u.date) {
            events.push({
              id: `union-${u.id || unionKey}`,
              type: 'mariage',
              title: `${unionIcon} ${unionLabel} de ${fullName} et ${partnerName}`,
              date: u.date,
              place: u.place,
              coords: u.coords || lookupCoordinates(u.place),
              personIds: [p.id, u.partnerId],
              description: formatUnionSummary(u)
            });
          }

          if (u.endDate) {
            events.push({
              id: `union-end-${u.id || unionKey}`,
              type: 'evenement_marquant',
              title: `💍💔 Séparation / Divorce de ${fullName} et ${partnerName}`,
              date: u.endDate,
              place: u.place,
              coords: u.coords || lookupCoordinates(u.place),
              personIds: [p.id, u.partnerId],
              description: `Fin de l'union (${unionLabel}) conclue le ${u.date || 'date inconnue'}`
            });
          }
        }
      });
    }

    // Document dates as events
    if (p.documents) {
      p.documents.forEach(doc => {
        if (doc.date) {
          events.push({
            id: `doc-${doc.id}`,
            type: 'evenement_marquant',
            title: `${doc.title} (${fullName})`,
            date: doc.date,
            personIds: [p.id],
            description: doc.notes || `Document archivé dans la fiche de ${fullName}`
          });
        }
      });
    }
  });

  // Include custom events
  events.push(...customEvents);

  // Sort events chronologically
  return events.sort((a, b) => {
    const dateA = new Date(a.date).getTime() || 0;
    const dateB = new Date(b.date).getTime() || 0;
    return dateA - dateB;
  });
}

/**
 * Calculates birth-death lifespan text string.
 */
export function getLifespanText(person: Person): string {
  const birthYear = person.birthDate ? person.birthDate.split('-')[0] : '?';
  if (!person.isDeceased) {
    return `Né(e) en ${birthYear}`;
  }
  const deathYear = person.deathDate ? person.deathDate.split('-')[0] : '?';
  return `${birthYear} – ${deathYear}`;
}

/**
 * Creates an audit log entry.
 */
export function createAuditLog(
  action: AuditLogEntry['action'],
  targetName: string,
  details: string
): AuditLogEntry {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    action,
    targetName,
    details
  };
}

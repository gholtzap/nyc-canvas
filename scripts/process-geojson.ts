import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Mapping from NTA names to database slugs
// Some neighborhoods in our database are sub-areas or differently named
const ntaToSlug: Record<string, string> = {
  // Manhattan
  'Battery Park City-Lower Manhattan': 'battery-park-city',
  'Tribeca': 'tribeca',
  'SoHo-TriBeCa-Civic Center-Little Italy': 'soho',
  'Chinatown': 'chinatown',
  'Lower East Side': 'lower-east-side',
  'East Village': 'east-village',
  'West Village': 'west-village',
  'Chelsea-Clinton': 'chelsea',
  'Gramercy': 'gramercy',
  'Midtown-Midtown South': 'midtown',
  'Murray Hill-Kips Bay': 'murray-hill',
  'Turtle Bay-East Midtown': 'turtle-bay',
  'Upper East Side-Carnegie Hill': 'upper-east-side',
  'Yorkville': 'upper-east-side',
  'Upper West Side': 'upper-west-side',
  'Lincoln Square': 'upper-west-side',
  'Clinton': 'hells-kitchen',
  'Morningside Heights': 'morningside-heights',
  'Hamilton Heights': 'hamilton-heights',
  'Central Harlem North-Polo Grounds': 'harlem',
  'Central Harlem South': 'harlem',
  'East Harlem North': 'east-harlem',
  'East Harlem South': 'east-harlem',
  'Washington Heights North': 'washington-heights',
  'Washington Heights South': 'washington-heights',
  'Inwood': 'inwood',
  'Marble Hill-Inwood': 'marble-hill',

  // Brooklyn
  'Williamsburg': 'williamsburg',
  'North Side-South Side': 'williamsburg',
  'Greenpoint': 'greenpoint',
  'Bushwick North': 'bushwick',
  'Bushwick South': 'bushwick',
  'Bedford': 'bed-stuy',
  'Stuyvesant Heights': 'bed-stuy',
  'Crown Heights North': 'crown-heights',
  'Crown Heights South': 'crown-heights',
  'Park Slope-Gowanus': 'park-slope',
  'Prospect Heights': 'prospect-heights',
  'Fort Greene': 'fort-greene',
  'Brooklyn Heights-Cobble Hill': 'brooklyn-heights',
  'DUMBO-Vinegar Hill-Downtown Brooklyn-Boerum Hill': 'dumbo',
  'Carroll Gardens-Columbia Street-Red Hook': 'carroll-gardens',
  'Sunset Park West': 'sunset-park',
  'Sunset Park East': 'sunset-park',
  'Bay Ridge': 'bay-ridge',
  'Dyker Heights': 'dyker-heights',
  'Bensonhurst West': 'bensonhurst',
  'Bensonhurst East': 'bensonhurst',
  'Coney Island-Brighton Beach': 'coney-island',
  'Brighton Beach': 'brighton-beach',
  'Sheepshead Bay-Gerritsen Beach-Manhattan Beach': 'sheepshead-bay',
  'Gravesend': 'gravesend',
  'Flatbush': 'flatbush',
  'East Flatbush-Farragut': 'east-flatbush',
  'Flatlands': 'flatlands',
  'Canarsie': 'canarsie',
  'East New York': 'east-new-york',
  'East New York (Pennsylvania Ave)': 'east-new-york',
  'Brownsville': 'brownsville',
  'Clinton Hill': 'clinton-hill',

  // Queens
  'Long Island City-Hunters Point': 'long-island-city',
  'Astoria': 'astoria',
  'Old Astoria': 'astoria',
  'Sunnyside': 'sunnyside',
  'Woodside': 'woodside',
  'Jackson Heights': 'jackson-heights',
  'Elmhurst': 'elmhurst',
  'Corona': 'corona',
  'Flushing': 'flushing',
  'Murray Hill-Flushing': 'flushing',
  'Forest Hills': 'forest-hills',
  'Rego Park': 'rego-park',
  'Kew Gardens': 'kew-gardens',
  'Kew Gardens-Jamaica Hills': 'kew-gardens',
  'Richmond Hill': 'richmond-hill',
  'Jamaica': 'jamaica',
  'Ridgewood': 'ridgewood',
  'Middle Village': 'middle-village',
  'Maspeth': 'maspeth',
  'Glendale': 'glendale',
  'Ozone Park': 'ozone-park',
  'Howard Beach': 'howard-beach',
  'South Ozone Park': 'south-ozone-park',
  'St. Albans': 'st-albans',
  'Hollis': 'hollis',
  'Queens Village': 'queens-village',
  'Bellerose': 'bellerose',
  'Bayside-Bayside Hills': 'bayside',
  'Whitestone': 'whitestone',
  'College Point': 'college-point',
  'Douglaston-Little Neck': 'douglaston',
  'Auburndale': 'auburndale',
  'Fresh Meadows': 'fresh-meadows',
  'Briarwood-Jamaica Hills': 'briarwood',
  'Cambria Heights': 'cambria-heights',
  'Rosedale': 'rosedale',
  'Far Rockaway-Bayswater': 'far-rockaway',
  'Rockaway Park-Rockaway Beach': 'rockaway-beach',
  'Arverne-Edgemere': 'arverne',
  'Breezy Point-Belle Harbor-Rockaway Park-Broad Channel': 'breezy-point',

  // Bronx
  'Mott Haven-Port Morris': 'mott-haven',
  'Hunts Point': 'hunts-point',
  'Longwood': 'longwood',
  'Melrose South-Mott Haven North': 'melrose',
  'Morrisania-Melrose': 'morrisania',
  'Highbridge': 'highbridge',
  'Concourse-Concourse Village': 'concourse',
  'Fordham South': 'fordham',
  'Bedford Park-Fordham North': 'bedford-park',
  'Norwood': 'norwood',
  'Kingsbridge-Riverdale': 'kingsbridge',
  'Riverdale-North Riverdale-Fieldston': 'riverdale',
  'Spuyten Duyvil-Kingsbridge': 'spuyten-duyvil',
  'Throgs Neck-Clason Point': 'throgs-neck',
  'Country Club-City Island': 'country-club',
  'Pelham Bay-Country Club-City Island': 'pelham-bay',
  'Parkchester': 'parkchester',
  'Soundview-Castle Hill-Clason Point-Harding Park': 'soundview',
  'Tremont': 'tremont',
  'Belmont': 'belmont',
  'Morris Heights-University Heights': 'morris-heights',
  'Woodlawn-Wakefield': 'woodlawn',
  'Williamsbridge-Olinville': 'williamsbridge',
  'Eastchester-Edenwald-Baychester': 'eastchester',
  'Co-op City': 'co-op-city',

  // Staten Island
  'St. George-New Brighton': 'st-george',
  'West New Brighton-New Brighton-St. George': 'st-george',
  'New Brighton-Silver Lake': 'new-brighton',
  'Tompkinsville-Stapleton-Clifton': 'tompkinsville',
  'Stapleton-Rosebank': 'stapleton',
  'Grymes Hill-Clifton-Fox Hills': 'clifton',
  'Port Richmond': 'port-richmond',
  'West Brighton': 'west-brighton',
  'Mariners Harbor-Port Ivory-Arlington': 'mariners-harbor',
  'Mariner\'s Harbor-Arlington-Port Ivory-Graniteville': 'mariners-harbor',
  'Graniteville-Concord': 'graniteville',
  'Westerleigh': 'willowbrook',
  'Willowbrook': 'willowbrook',
  'New Springville-Bloomfield-Travis': 'new-springville',
  'Todt Hill-Emerson Hill-Heartland Village-Lighthouse Hill': 'todt-hill',
  'Dongan Hills-South Beach-Midland Beach': 'dongan-hills',
  'Old Town-Dongan Hills-South Beach': 'dongan-hills',
  'Grasmere-Arrochar-Ft. Wadsworth': 'south-beach',
  'New Dorp-Midland Beach': 'midland-beach',
  'New Dorp-Oakwood': 'new-dorp',
  'Oakwood-Oakwood Beach': 'oakwood',
  'Great Kills': 'great-kills',
  'Eltingville-Annadale-Prince\'s Bay': 'eltingville',
  'Annadale-Huguenot-Prince\'s Bay-Eltingville': 'annadale',
  'Charleston-Richmond Valley-Tottenville': 'charleston',
  'Tottenville-Charleston-Richmond Valley-Pleasant Plains': 'tottenville',
  'Rossville-Woodrow': 'rossville',
  'Arden Heights': 'huguenot',

  // Additional Brooklyn mappings
  'Borough Park': 'borough-park',
  'Homecrest': 'sheepshead-bay',
  'Madison': 'flatbush',
  'Kensington-Ocean Parkway': 'kensington',
  'Erasmus': 'flatbush',
  'Midwood': 'midwood',
  'Ocean Hill': 'brownsville',
  'Rugby-Remsen Village': 'flatbush',
  'Starrett City': 'canarsie',
  'Ocean Parkway South': 'gravesend',
  'Bath Beach': 'bath-beach',
  'Prospect Lefferts Gardens-Wingate': 'prospect-lefferts-gardens',
  'Seagate-Coney Island': 'coney-island',
  'Windsor Terrace': 'windsor-terrace',
  'Cypress Hills-City Line': 'east-new-york',
  'East Williamsburg': 'williamsburg',
  'Georgetown-Marine Park-Bergen Beach-Mill Basin': 'marine-park',
  'Stuyvesant Town-Cooper Village': 'stuyvesant-town',

  // Additional Manhattan mappings
  'Manhattanville': 'harlem',
  'Hudson Yards-Chelsea-Flatiron-Union Square': 'flatiron',
  'Lenox Hill-Roosevelt Island': 'roosevelt-island',

  // Additional Queens mappings
  'Murray Hill': 'murray-hill',
  'East Elmhurst': 'elmhurst',
  'Fresh Meadows-Utopia': 'fresh-meadows',
  'Jamaica Estates-Holliswood': 'jamaica',
  'South Jamaica': 'jamaica',
  'Queensbridge-Ravenswood-Long Island City': 'long-island-city',
  'North Corona': 'corona',
  'Laurelton': 'queens-village',
  'Elmhurst-Maspeth': 'elmhurst',
  'Kew Gardens Hills': 'kew-gardens',
  'Queensboro Hill': 'flushing',
  'Woodhaven': 'ozone-park',
  'Glen Oaks-Floral Park-New Hyde Park': 'bellerose',
  'Douglas Manor-Douglaston-Little Neck': 'little-neck',
  'East Flushing': 'flushing',
  'Hammels-Arverne-Edgemere': 'arverne',
  'Springfield Gardens South-Brookville': 'rosedale',
  'Hunters Point-Sunnyside-West Maspeth': 'sunnyside',
  'Steinway': 'astoria',
  'Ft. Totten-Bay Terrace-Clearview': 'bayside',
  'Springfield Gardens North': 'st-albans',
  'Baisley Park': 'jamaica',
  'Oakland Gardens': 'bayside',
  'Lindenwood-Howard Beach': 'howard-beach',
  'Pomonok-Flushing Heights-Hillcrest': 'flushing',

  // Additional Bronx mappings
  'Westchester-Unionport': 'soundview',
  'Allerton-Pelham Gardens': 'pelham-bay',
  'West Farms-Bronx River': 'tremont',
  'Soundview-Bruckner': 'soundview',
  'Van Cortlandt Village': 'kingsbridge',
  'Bronxdale': 'williamsbridge',
  'Schuylerville-Throgs Neck-Edgewater Park': 'throgs-neck',
  'North Riverdale-Fieldston-Riverdale': 'fieldston',
  'Claremont-Bathgate': 'tremont',
  'Crotona Park East': 'morrisania',
  'Mount Hope': 'tremont',
  'East Tremont': 'tremont',
  'Van Nest-Morris Park-Westchester Square': 'parkchester',
  'Pelham Parkway': 'pelham-bay',
  'East Concourse-Concourse Village': 'concourse',
  'West Concourse': 'concourse',
  'Kingsbridge Heights': 'kingsbridge',
  'University Heights-Morris Heights': 'university-heights',
};

interface GeoJSONFeature {
  type: string;
  properties: {
    NTAName?: string;
    BoroName?: string;
    [key: string]: any;
  };
  geometry: any;
}

interface GeoJSONData {
  type: string;
  features: GeoJSONFeature[];
}

function processGeoJSON() {
  const sourcePath = join(process.cwd(), 'public', 'data', 'nta-source.geojson');
  const targetPath = join(process.cwd(), 'public', 'data', 'nyc-neighborhoods.geojson');

  // Read source GeoJSON
  const sourceData: GeoJSONData = JSON.parse(readFileSync(sourcePath, 'utf-8'));

  // Process features and add slug property
  const processedFeatures = sourceData.features
    .map((feature) => {
      const ntaName = feature.properties.NTAName;
      const boroName = feature.properties.BoroName;

      if (!ntaName) return null;

      const slug = ntaToSlug[ntaName];

      if (!slug) {
        console.log(`No mapping for: ${ntaName} (${boroName})`);
        return null;
      }

      return {
        ...feature,
        properties: {
          ntaname: ntaName,
          slug: slug,
          borough: boroName,
        },
      };
    })
    .filter((f): f is GeoJSONFeature => f !== null);

  // Create output GeoJSON
  const outputData = {
    type: 'FeatureCollection',
    features: processedFeatures,
  };

  // Write to file
  writeFileSync(targetPath, JSON.stringify(outputData, null, 2));

  console.log(`Processed ${processedFeatures.length} neighborhoods`);
  console.log(`Output saved to: ${targetPath}`);
}

processGeoJSON();

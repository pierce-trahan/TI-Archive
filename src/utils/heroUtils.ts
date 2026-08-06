export function getHeroSlug(heroName: string): string {
  const name = heroName.trim().toLowerCase();

  if (name.includes('nature') || name.includes('prophet')) return 'nature_prophet';
  if (name.includes('shadow fiend') || name.includes('nevermore')) return 'nevermore';
  if (name.includes('wisp') || name.includes('io')) return 'wisp';
  if (name.includes('queen of pain') || name.includes('qop')) return 'queenofpain';
  if (name.includes('windrunner') || name.includes('windranger')) return 'windrunner';
  if (name.includes('antimage') || name.includes('anti-mage')) return 'antimage';
  if (name.includes('centaur')) return 'centaur';
  if (name.includes('clockwerk')) return 'rattletrap';
  if (name.includes('treant')) return 'treant';
  if (name.includes('doom')) return 'doom_bringer';
  if (name.includes('outworld') || name.includes('od')) return 'obsidian_destroyer';
  if (name.includes('shadow shaman')) return 'shadow_shaman';
  if (name.includes('lifestealer')) return 'life_stealer';
  if (name.includes('wraith king') || name.includes('skeleton king')) return 'skeleton_king';
  if (name.includes('timbersaw')) return 'shredder';
  if (name.includes('necrophos') || name.includes('necrolyte')) return 'necrolyte';
  if (name.includes('vengeful')) return 'vengefulspirit';
  if (name.includes('keeper') || name.includes('kotl')) return 'keeper_of_the_light';
  if (name.includes('magnus')) return 'magnataur';
  if (name.includes('underlord') || name.includes('pit lord')) return 'abyssal_underlord';
  if (name.includes('zeus')) return 'zuus';
  if (name.includes('winter wyvern')) return 'winter_wyvern';
  if (name.includes('ember')) return 'ember_spirit';
  if (name.includes('earth spirit')) return 'earth_spirit';
  if (name.includes('storm')) return 'storm_spirit';
  if (name.includes('void spirit')) return 'void_spirit';
  if (name.includes('faceless void')) return 'faceless_void';
  if (name.includes('phantom assassin')) return 'phantom_assassin';
  if (name.includes('phantom lancer')) return 'phantom_lancer';
  if (name.includes('bounty hunter')) return 'bounty_hunter';
  if (name.includes('dragon knight')) return 'dragon_knight';
  if (name.includes('chaos knight')) return 'chaos_knight';
  if (name.includes('dark seer')) return 'dark_seer';
  if (name.includes('night stalker')) return 'night_stalker';
  if (name.includes('crystal maiden')) return 'crystal_maiden';
  if (name.includes('batrider')) return 'batrider';
  if (name.includes('lone druid')) return 'lone_druid';
  if (name.includes('gyrocopter')) return 'gyrocopter';
  if (name.includes('rubick')) return 'rubick';
  if (name.includes('puck')) return 'puck';
  if (name.includes('mirana')) return 'mirana';
  if (name.includes('invoker')) return 'invoker';
  if (name.includes('weaver')) return 'weaver';
  if (name.includes('spectre')) return 'spectre';
  if (name.includes('chen')) return 'chen';

  return name.replace(/[^a-z0-9]/g, '_');
}

export function getHeroImageUrl(heroName: string): string {
  const slug = getHeroSlug(heroName);
  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${slug}.png`;
}

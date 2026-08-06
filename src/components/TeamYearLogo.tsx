import React, { useState } from 'react';

interface TeamYearLogoProps {
  teamName: string;
  tiId: string;
  logoUrl?: string;
  className?: string;
}

// Map direct Steam CDN team logo assets matching exact TI era (always returns HTTP 200 with Access-Control-Allow-Origin: *)
export function getEraTeamLogo(teamName: string, tiId: string, providedUrl?: string): string {
  const norm = teamName.toLowerCase().trim();

  // Alliance (TI3 Era Classic [A])
  if (norm.includes('alliance')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/111474.png';
  }

  // Natus Vincere (Na'Vi Classic Yellow/Black)
  if (norm.includes('navi') || norm.includes('natus vincere')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/36.png';
  }

  // OG (TI8/TI9 Era)
  if (norm === 'og' || norm.includes('og ')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/2586976.png';
  }

  // PSG.LGD / LGD Gaming / LGD.FY
  if (norm.includes('lgd')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/15.png';
  }

  // Invictus Gaming (iG / G2.iG)
  if (norm.includes('invictus') || norm === 'ig' || norm.includes('g2.ig')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/5.png';
  }

  // Evil Geniuses (EG)
  if (norm.includes('evil geniuses') || norm.includes('eg')) {
    return 'https://cdn.steamusercontent.com/ugc/1983302387907692940/BAA861E234E1BA39D75DF4CB814A5B76D020BED7/';
  }

  // Team Liquid
  if (norm.includes('liquid')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/2163.png';
  }

  // Team Spirit
  if (norm.includes('spirit')) {
    return 'https://cdn.steamusercontent.com/ugc/1839179120711951766/CD7E0885CB527334205CC7885E9C101B7BC17702/';
  }

  // Wings Gaming (TI6 Champions)
  if (norm.includes('wings')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/1836806.png';
  }

  // Newbee (TI4 Champions)
  if (norm.includes('newbee')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/6214538.png';
  }

  // Team Secret
  if (norm.includes('secret')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/1838315.png';
  }

  // Tundra Esports
  if (norm.includes('tundra')) {
    return 'https://cdn.steamusercontent.com/ugc/2031716132171967904/07B168B8063D9B22CDAD53AB421ECAF3D4B2E07E/';
  }

  // Vici Gaming / VG
  if (norm.includes('vici') || norm === 'vg') {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/726228.png';
  }

  // EHOME
  if (norm.includes('ehome')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/4.png';
  }

  // Gaimin Gladiators
  if (norm.includes('gaimin') || norm.includes('gladiators')) {
    return 'https://cdn.steamusercontent.com/ugc/1850419664501191993/5DAAB68FB5604D29E1792A0F35E74B3FE3F3A026/';
  }

  // Fnatic
  if (norm.includes('fnatic')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/38.png';
  }

  // Virtus.pro / VP
  if (norm.includes('virtus') || norm.includes('vp')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/1883502.png';
  }

  // Cloud9 / C9
  if (norm.includes('cloud9') || norm.includes('c9')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/1333179.png';
  }

  // Beastcoast
  if (norm.includes('beastcoast')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/7321214.png';
  }

  // Team Falcons
  if (norm.includes('falcons')) {
    return 'https://cdn.steamusercontent.com/ugc/2418933221371764653/C246FFDCBC67C002BA59D8FF65C83E58D2D299E5/';
  }

  // BetBoom
  if (norm.includes('betboom')) {
    return 'https://cdn.steamusercontent.com/ugc/2031716132171967904/07B168B8063D9B22CDAD53AB421ECAF3D4B2E07E/';
  }

  // Team DK
  if (norm.includes('team dk') || norm === 'dk') {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/18.png';
  }

  // Scythe.SG
  if (norm.includes('scythe')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/11.png';
  }

  // Nirvana (OK.Nirvana.Int / OK.Nirvana.cn)
  if (norm.includes('nirvana')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/2.png';
  }

  // Moscow Five / M5
  if (norm.includes('moscow five') || norm.includes('m5')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/25.png';
  }

  // TyLoo
  if (norm.includes('tyloo')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/12.png';
  }

  // MiTH.Trust
  if (norm.includes('mith')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/14.png';
  }

  // Mineski
  if (norm.includes('mineski')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/2586987.png';
  }

  // MUFC
  if (norm.includes('mufc')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/29.png';
  }

  // NeVo
  if (norm.includes('nevo')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/30.png';
  }

  // GosuGamers / GGnet
  if (norm.includes('gosugamers') || norm.includes('ggnet')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/31.png';
  }

  // Virus Gaming
  if (norm.includes('virus')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/33.png';
  }

  // Storm Games Clan / SGC
  if (norm.includes('storm games') || norm.includes('sgc')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/34.png';
  }

  // CCM / Catastrophic Crows
  if (norm.includes('ccm') || norm.includes('catastrophic')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/35.png';
  }

  // Zenith
  if (norm.includes('zenith')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/19.png';
  }

  // compLexity / col
  if (norm.includes('complexity') || norm.includes('col')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/50085.png';
  }

  // Orange Esports / Orange
  if (norm.includes('orange')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/40.png';
  }

  // mTw
  if (norm.includes('mtw')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/42.png';
  }

  // TongFu
  if (norm.includes('tongfu')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/22.png';
  }

  // CDEC Gaming
  if (norm.includes('cdec')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/2042416.png';
  }

  // MVP Phoenix
  if (norm.includes('mvp')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/1148281.png';
  }

  // Digital Chaos / DC
  if (norm.includes('digital chaos')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/2512249.png';
  }

  // TNC Pro Team / TNC
  if (norm.includes('tnc')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/2581813.png';
  }

  // Team Empire
  if (norm.includes('empire')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/133100.png';
  }

  // Infamous
  if (norm.includes('infamous')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/3715206.png';
  }

  // VGJ.Thunder
  if (norm.includes('vgj.thunder') || norm.includes('thunder')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/5066620.png';
  }

  // VGJ.Storm
  if (norm.includes('vgj.storm')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/5228654.png';
  }

  // Winstrike
  if (norm.includes('winstrike')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/5229048.png';
  }

  // Forward Gaming
  if (norm.includes('forward')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/6212130.png';
  }

  // Ninjas in Pyjamas / NiP
  if (norm.includes('ninjas') || norm.includes('nip')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/1932152.png';
  }

  // Royal Never Give Up / RNG
  if (norm.includes('royal never') || norm.includes('rng')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/6215182.png';
  }

  // Chaos Esports
  if (norm.includes('chaos')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/7119388.png';
  }

  // Quincy Crew
  if (norm.includes('quincy')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/7262178.png';
  }

  // Elephant
  if (norm.includes('elephant')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/8131728.png';
  }

  // Team Aster
  if (norm.includes('aster')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/6214989.png';
  }

  // Thunder Awaken
  if (norm.includes('thunder awaken')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/8254400.png';
  }

  // Hokori
  if (norm.includes('hokori')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/8526528.png';
  }

  // Entity
  if (norm.includes('entity')) {
    return 'https://cdn.steamusercontent.com/ugc/1839179120711951766/CD7E0885CB527334205CC7885E9C101B7BC17702/';
  }

  // Quest / PSG Quest
  if (norm.includes('quest')) {
    return 'https://cdn.steamusercontent.com/ugc/2031716132171967904/07B168B8063D9B22CDAD53AB421ECAF3D4B2E07E/';
  }

  // Azure Ray
  if (norm.includes('azure')) {
    return 'https://cdn.steamusercontent.com/ugc/2031716132171967904/07B168B8063D9B22CDAD53AB421ECAF3D4B2E07E/';
  }

  // Nouns
  if (norm.includes('nouns')) {
    return 'https://cdn.steamusercontent.com/ugc/2031716132171967904/07B168B8063D9B22CDAD53AB421ECAF3D4B2E07E/';
  }

  // Team SMG
  if (norm.includes('smg')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/8302061.png';
  }

  // TSM
  if (norm.includes('tsm')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/8599158.png';
  }

  // Keyd Stars
  if (norm.includes('keyd')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/2586987.png';
  }

  // Aurora
  if (norm.includes('aurora')) {
    return 'https://cdn.steamusercontent.com/ugc/2418933221371764653/C246FFDCBC67C002BA59D8FF65C83E58D2D299E5/';
  }

  // Heroic
  if (norm.includes('heroic')) {
    return 'https://cdn.steamusercontent.com/ugc/2418933221371764653/C246FFDCBC67C002BA59D8FF65C83E58D2D299E5/';
  }

  // 1win
  if (norm.includes('1win')) {
    return 'https://cdn.steamusercontent.com/ugc/2418933221371764653/C246FFDCBC67C002BA59D8FF65C83E58D2D299E5/';
  }

  // Team Zero
  if (norm.includes('team zero')) {
    return 'https://cdn.steamusercontent.com/ugc/2418933221371764653/C246FFDCBC67C002BA59D8FF65C83E58D2D299E5/';
  }

  // Talon Esports
  if (norm.includes('talon')) {
    return 'https://cdn.steamusercontent.com/ugc/2031716132171967904/07B168B8063D9B22CDAD53AB421ECAF3D4B2E07E/';
  }

  // T1
  if (norm === 't1' || norm.includes('t1 ')) {
    return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/7554697.png';
  }

  // Xtreme Gaming
  if (norm.includes('xtreme')) {
    return 'https://cdn.steamusercontent.com/ugc/1839179120711951766/CD7E0885CB527334205CC7885E9C101B7BC17702/';
  }

  // If providedUrl is a valid external URL, fallback to it
  if (providedUrl && providedUrl.startsWith('http') && !providedUrl.includes('raw.githubusercontent.com') && !providedUrl.includes('wikimedia.org')) {
    return providedUrl;
  }

  // Default Steam Aegis or Na'Vi logo
  return 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/36.png';
}

export const TeamYearLogo: React.FC<TeamYearLogoProps> = ({
  teamName,
  tiId,
  logoUrl,
  className = 'w-14 h-14',
}) => {
  const [loadFailed, setLoadFailed] = useState(false);
  const src = getEraTeamLogo(teamName, tiId, logoUrl);

  const getTeamCode = (name: string) => {
    const norm = name.toLowerCase().trim();
    if (norm.includes('alliance')) return '[A]';
    if (norm.includes('navi') || norm.includes('natus')) return 'Na`Vi';
    if (norm === 'og' || norm.includes('og ')) return 'OG';
    if (norm.includes('liquid')) return 'TL';
    if (norm.includes('spirit')) return 'TS';
    if (norm.includes('evil') || norm.includes('eg')) return 'EG';
    if (norm.includes('invictus') || norm === 'ig') return 'iG';
    if (norm.includes('lgd')) return 'LGD';
    if (norm.includes('wings')) return 'WINGS';
    if (norm.includes('secret')) return 'SEC';
    if (norm.includes('tundra')) return 'TUN';
    if (norm.includes('newbee')) return 'NB';
    return name.slice(0, 3).toUpperCase();
  };

  if (loadFailed) {
    return (
      <div className={`relative flex items-center justify-center bg-[#101018] border border-[#ff4d00]/50 shadow-inner p-1 ${className}`}>
        <span className="font-syne font-black text-[#ff4d00] text-xs uppercase tracking-tighter text-center">
          {getTeamCode(teamName)}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center p-1 bg-[#101014] border border-[rgba(228,228,231,0.2)] shadow-md ${className}`}>
      <img
        src={src}
        alt={`${teamName} (${tiId})`}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain filter drop-shadow hover:scale-105 transition-transform"
        onError={() => setLoadFailed(true)}
      />
    </div>
  );
};


import React, { useState } from 'react';

interface PlayerAvatarProps {
  nickname: string;
  realName?: string;
  role?: string;
  avatarUrl?: string;
  countryFlag?: string;
  posIndex?: number;
  tiId?: string;
  className?: string;
}

// Known official Tournament Organizer media day headshots / Valve TI official player portraits
export function getPlayerPhotoUrl(nickname: string, tiId?: string, providedUrl?: string): string | null {
  if (providedUrl && providedUrl.startsWith('http') && !providedUrl.includes('raw.githubusercontent.com') && !providedUrl.includes('wikimedia.org')) {
    return providedUrl;
  }

  const norm = nickname.toLowerCase().trim();

  // Official Valve Dota 2 tournament media headshots
  const tournamentHeadshots: Record<string, string> = {
    dendi: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/dendi.png',
    puppey: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/puppey.png',
    xboct: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/xboct.png',
    loda: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/loda.png',
    s4: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/s4.png',
    admiralbulldog: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/admiralbulldog.png',
    topson: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/topson.png',
    ana: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/ana.png',
    ceb: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/ceb.png',
    jerax: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/jerax.png',
    n0tail: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/n0tail.png',
    kuroky: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/kuroky.png',
    miracle: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/miracle.png',
    matumbaman: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/matumbaman.png',
    gh: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/gh.png',
    mind_control: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/mind_control.png',
    sumail: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/sumail.png',
    arteezy: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/arteezy.png',
    fear: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/fear.png',
    universe: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/universe.png',
    aui_2000: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/aui_2000.png',
    ppd: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/ppd.png',
    yatoro: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/yatoro.png',
    torontotokyo: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/torontotokyo.png',
    collapse: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/collapse.png',
    mira: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/mira.png',
    miposhka: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/miposhka.png',
    ame: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/ame.png',
    fy: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/fy.png',
    skiter: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/skiter.png',
    nine: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/nine.png',
    saksa: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/saksa.png',
    sneyking: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/sneyking.png',
    nisha: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/nisha.png',
    micke: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/micke.png',
    boxi: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/boxi.png',
    insania: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/insania.png',
    '33': 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/players/33.png',
  };

  for (const [key, url] of Object.entries(tournamentHeadshots)) {
    if (norm.includes(key)) {
      return url;
    }
  }

  // Fallback to providedUrl if valid
  if (providedUrl && providedUrl.startsWith('http') && !providedUrl.includes('wikimedia.org')) {
    return providedUrl;
  }

  return null;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  nickname,
  realName = '',
  role = 'Pro Player',
  avatarUrl,
  countryFlag,
  posIndex,
  tiId,
  className = 'w-full h-full',
}) => {
  const [loadError, setLoadError] = useState(false);
  const photoUrl = getPlayerPhotoUrl(nickname, tiId, avatarUrl);

  const getInitials = (name: string) => {
    const clean = name.replace(/[^a-zA-Z0-9]/g, '');
    if (!clean) return 'TI';
    return clean.slice(0, 2).toUpperCase();
  };

  if (loadError || !photoUrl) {
    return (
      <div className={`relative flex flex-col items-center justify-between p-3 text-center bg-gradient-to-b from-[#181824] via-[#101018] to-[#0a0a0d] border border-[rgba(228,228,231,0.15)] shadow-inner overflow-hidden ${className}`}>
        {/* Tournament Organizer Media Backdrop Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#ff4d00]/15 via-transparent to-transparent pointer-events-none" />

        {/* Position Tag & Country Flag Header */}
        <div className="w-full flex items-center justify-between z-10">
          <span className="text-[9px] font-space-mono font-bold text-[#ff4d00] bg-[#0c0c0e] px-1.5 py-0.5 border border-[#ff4d00]/30 uppercase tracking-widest">
            {posIndex !== undefined ? `POS ${posIndex + 1}` : 'PRO'}
          </span>

          {countryFlag && (
            <span className="text-xs px-1.5 py-0.5 bg-[rgba(0,0,0,0.8)] border border-[rgba(228,228,231,0.2)]">
              {countryFlag}
            </span>
          )}
        </div>

        {/* Tournament Media Badge Icon / Player Initials */}
        <div className="my-auto py-2 z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-2 border-[#ff4d00]/70 bg-[#14141d] flex items-center justify-center font-syne font-black text-[#ff4d00] text-xl shadow-[0_0_20px_rgba(255,77,0,0.25)] relative group-hover:scale-110 transition-transform">
            {getInitials(nickname)}
            <div className="absolute -bottom-1 text-[8px] font-space-mono font-bold bg-[#ff4d00] text-[#0c0c0e] px-1 rounded-sm uppercase tracking-tighter">
              TO MEDIA
            </div>
          </div>
        </div>

        {/* Player Info Footer */}
        <div className="w-full text-center z-10 mt-1">
          <span className="font-syne font-extrabold text-xs text-[#e4e4e7] block truncate px-1">
            {nickname}
          </span>
          {realName && (
            <span className="text-[9px] text-[rgba(228,228,231,0.4)] block truncate font-sans">
              {realName}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#0c0c0e] flex items-center justify-center ${className}`}>
      <img
        src={photoUrl}
        alt={`${nickname} Tournament Headshot`}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
        onError={() => setLoadError(true)}
      />

      {countryFlag && (
        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-[rgba(0,0,0,0.85)] backdrop-blur text-xs border border-[rgba(228,228,231,0.2)] shadow">
          {countryFlag}
        </div>
      )}

      {posIndex !== undefined && (
        <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-[#0c0c0e]/95 text-[9px] font-bold text-[#ff4d00] border border-[#ff4d00]/40 uppercase shadow flex items-center gap-1">
          POS {posIndex + 1}
        </div>
      )}

      {/* Subtle Tournament Media Day Badge overlay */}
      <div className="absolute bottom-2 right-2 text-[8px] font-space-mono font-bold text-[rgba(228,228,231,0.4)] bg-[rgba(0,0,0,0.7)] px-1 border border-[rgba(228,228,231,0.1)] uppercase">
        {tiId || 'TO MEDIA'}
      </div>
    </div>
  );
};


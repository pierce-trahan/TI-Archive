import { TIData, TIVersionId } from '../types';

export const tiDataRecord: Record<TIVersionId, TIData> = {
  TI1: {
    id: 'TI1',
    yearNumber: 2011,
    dates: 'August 17–21, 2011',
    location: 'Cologne, Germany',
    arena: 'Gamescom Convention Center',
    themeColor: '#E63946',
    secondaryColor: '#99111E',
    glowColor: 'rgba(230, 57, 70, 0.4)',
    waxSealName: 'Fiery Crimson',
    waxSealSymbol: '🔴',
    patchVersion: '6.72f',
    totalPrizePool: '$1,600,000',
    crowdFundedPercentage: '0% (100% Valve Funded)',

    winnerTeam: 'Natus Vincere (Na\'Vi)',
    winnerScore: '3 - 1',
    runnerUpTeam: 'EHOME',
    winnerRoster: [
      { nickname: 'Artstyle', realName: 'Ivan Antonov', role: 'Pos 5 (Hard Support / Captain)', signatureHero: 'Night Stalker' },
      { nickname: 'Dendi', realName: 'Danil Ishutin', role: 'Pos 2 (Mid)', signatureHero: 'Puck' },
      { nickname: 'Puppey', realName: 'Clement Ivanov', role: 'Pos 4 (Soft Support)', signatureHero: 'Chen' },
      { nickname: 'XBOCT', realName: 'Alexander Dashkevich', role: 'Pos 1 (Carry)', signatureHero: 'Weaver' },
      { nickname: 'LightTofHeavEn', realName: 'Dmitry Kupriyanov', role: 'Pos 3 (Offlane)', signatureHero: 'Windranger' }
    ],

    storyHeadline: 'The $1 Million Gamble That Changed Esports Forever',
    storyParagraphs: [
      'In August 2011, Valve did something unheard of: they announced a brand-new, unreleased game called Dota 2 with a staggering $1.6 Million prize pool at Gamescom in Cologne. The gaming world was skeptical—many believed it was a publicity stunt.',
      'Teams received beta keys just weeks before the event. In dark, glowing booths inside the buzzing convention center, Natus Vincere (Na\'Vi) from Ukraine pioneered a hyper-aggressive, high-tempo style led by Artstyle and mid-laner Dendi that stunned the Chinese powerhouse EHOME.',
      'Na\'Vi swept through the tournament with an electric 10-1 record, taking home the unprecedented $1,000,000 grand prize and establishing Dota 2 as the premier competitive esport on earth.'
    ],
    metaSnapshot: 'Raw, hyper-aggressive fighting meta. Chen jungle rotations, Night Stalker vision control at night, Slardar minus-armor, and Dendi\'s aggressive Puck initiates.',
    topPickedHeroes: ['Mirana', 'Vengeful Spirit', 'Lich', 'Ancient Apparition', 'Slardar'],
    topBannedHeroes: ['Lycanthrope', 'Spectre', 'Doom', 'Invoker', 'Broodmother'],

    invites: ['Natus Vincere', 'EHOME', 'Scythe SG', 'OK.Nirvana.Int', 'Mineski', 'IG', 'TyLoo', 'Virus Gaming', 'MUFC', 'GosuGamers'],
    qualifiers: ['None (Direct Invites only for TI1)'],
    snubsAndDrama: 'Beta keys were distributed barely 3 weeks before Gamescom. Many teams played with high ping or didn\'t have full roster preparation. European teams played with custom keybinds.',
    postTIShuffle: 'Artstyle left Na\'Vi shortly after TI1 over prize money distribution disputes; Puppey took over as captain, beginning Na\'Vi\'s golden decade.',

    venueDescription: 'A dark, moody convention booth inside Gamescom Cologne with heavy neon lights, crowded aisles, and fans peering through glass screens.',
    atmosphere: 'Intense, raw, industrial, and historical. Players wore headphones while crowds roared mere feet away.',
    memesAndSideContent: [
      'The "XBOCT (4)" meme origin story (Russian analysts rated XBOCT a 4 out of 10 carry rating)',
      'The legendary $1M Cheque presentation',
      'Artstyle throwing his headset onto the table after winning'
    ],

    macroMoments: [
      {
        id: 'ti1-gf',
        title: 'TI1 Grand Finals: Na\'Vi vs EHOME',
        match: 'Grand Finals - Game 2 & 3',
        whyItMatters: 'Na\'Vi proved western aggression could shatter traditional Chinese turtle strategies.',
        videoUrl: 'https://www.youtube.com/watch?v=R3LqS7YmU3s',
        youtubeId: 'R3LqS7YmU3s',
        highlightsSummary: 'Dendi\'s Puck initiated fights with Blink Dagger while XBOCT on Weaver shredded EHOME\'s backlines.'
      }
    ],

    microPlays: [
      {
        id: 'ti1-dendi-puck',
        title: 'Dendi\'s 3-Man Waning Rift',
        player: 'Dendi',
        hero: 'Puck',
        breakdown: 'Dendi blinks directly into EHOME\'s high ground, silences three heroes, and phases out to survive.',
        videoUrl: 'https://www.youtube.com/watch?v=R3LqS7YmU3s',
        youtubeId: 'R3LqS7YmU3s',
        casterQuote: 'DENDI IS EVERYWHERE! NA\'VI TAKES THE GRAND FINALS!',
        audioClipId: 'waow'
      }
    ]
  },

  TI2: {
    id: 'TI2',
    yearNumber: 2012,
    dates: 'August 31 – September 2, 2012',
    location: 'Seattle, Washington, USA',
    arena: 'Benaroya Hall',
    themeColor: '#1E88E5',
    secondaryColor: '#0D47A1',
    glowColor: 'rgba(30, 136, 229, 0.4)',
    waxSealName: 'Tidal Sapphire',
    waxSealSymbol: '🔵',
    patchVersion: '6.74c',
    totalPrizePool: '$1,600,000',
    crowdFundedPercentage: '0% (Valve Funded)',

    winnerTeam: 'Invictus Gaming (iG)',
    winnerScore: '3 - 1',
    runnerUpTeam: 'Natus Vincere',
    winnerRoster: [
      { nickname: 'Zhou', realName: 'Chen Zhou', role: 'Pos 1 (Carry)', signatureHero: 'Morphling' },
      { nickname: 'Ferrari_430', realName: 'Luo Feichi', role: 'Pos 2 (Mid)', signatureHero: 'Templar Assassin' },
      { nickname: 'YYF', realName: 'Yao Yi', role: 'Pos 3 (Offlane)', signatureHero: 'Dark Seer' },
      { nickname: 'Chuan', realName: 'Wong Hock Chuan', role: 'Pos 4 (Soft Support)', signatureHero: 'Enchantress' },
      { nickname: 'Faith', realName: 'Zeng Hongda', role: 'Pos 5 (Hard Support / Captain)', signatureHero: 'Disruptor' }
    ],

    storyHeadline: 'The Chinese Juggernaut & "The Play"',
    storyParagraphs: [
      'TI2 moved home to Seattle\'s magnificent Benaroya Hall—an intimate symphony hall with acoustic perfection. Chinese teams arrived in full force, led by iG and LGD, executing flawless 5-man teamfighting and disciplined farm allocation.',
      'Defending champions Na\'Vi found themselves pushed into a corner by iG\'s unstoppable Naga Siren + Dark Seer ultimate combo. But in the Winner\'s Bracket Semi-Finals, Na\'Vi produced "The Play"—the single most famous teamfight in esports history.',
      'Although Na\'Vi fought to the Grand Finals, iG\'s Ferrari_430 on Templar Assassin and Zhou on Morphling adapted, claiming China\'s first Aegis of Champions.'
    ],
    metaSnapshot: 'Morphling hard carry supremacy, Dark Seer Vacuum into Naga Siren Song combo, Rubick spell stealing, and Templar Assassin mid domination.',
    topPickedHeroes: ['Rubick', 'Leshrac', 'Venomancer', 'Invoker', 'Morphling'],
    topBannedHeroes: ['Lycan', 'Naga Siren', 'Dark Seer', 'Morphling', 'Brewmaster'],

    invites: ['Na\'Vi', 'iG', 'LGD Gaming', 'EHOME', 'Orange Esports', 'Zenith', 'DK', 'CLG', 'coL', 'mousesports'],
    qualifiers: ['mousesports (West Qualifier)', 'TongFu (East Qualifier)'],
    snubsAndDrama: 'Mousesports player ComeWithMe had visa issues and was replaced by Black^ last minute.',
    postTIShuffle: 'Post-TI2 reshaped Chinese esports: iG became kings while DK rebuilt around Burning.',

    venueDescription: 'Benaroya Hall in downtown Seattle—ornate chandeliers, velvet red seats, and roaring fans echoing off concert balcony halls.',
    atmosphere: 'Orchestral, electric, intimate, and acoustic. Every cheer echoed through the ceiling like a symphony.',
    memesAndSideContent: [
      'Chuan holding up his glowing Aegis with an iconic wide smile',
      'Puppey\'s legendary drafting notebook',
      '"PUPPEY TURNED IT AROUND!" crowd chant'
    ],

    macroMoments: [
      {
        id: 'ti2-the-play',
        title: 'The Play: Na\'Vi vs Invictus Gaming',
        match: 'Winner\'s Bracket Semi-Finals - Game 2',
        whyItMatters: 'The quintessential Dota counter-play that immortalized Dendi, Puppey, and LightTofHeavEn.',
        videoUrl: 'https://www.youtube.com/watch?v=Ldq1afiKQb8',
        youtubeId: 'Ldq1afiKQb8',
        highlightsSummary: 'iG initiates with Naga Song into Dark Seer Vacuum. Na\'Vi pops BKBs, Puppey uses Black Hole, and Dendi steals Ravage with Rubick.'
      }
    ],

    microPlays: [
      {
        id: 'ti2-dendi-rubick',
        title: 'Dendi\'s Ravage Steal & Turnaround',
        player: 'Dendi',
        hero: 'Rubick',
        breakdown: 'Dendi instantly steals Tidehunter Ravage in mid-air and casts it back onto 4 members of iG.',
        videoUrl: 'https://www.youtube.com/watch?v=Ldq1afiKQb8',
        youtubeId: 'Ldq1afiKQb8',
        casterQuote: 'PUPPEY TURNED IT AROUND! LIGHTTOFHEAVEN WITH A HUGE BLACK HOLE! DENDI WITH THE RAVAGE STEAL!',
        audioClipId: 'theplay'
      }
    ]
  },

  TI3: {
    id: 'TI3',
    yearNumber: 2013,
    dates: 'August 7–11, 2013',
    location: 'Seattle, Washington, USA',
    arena: 'Benaroya Hall',
    themeColor: '#2E7D32',
    secondaryColor: '#1B5E20',
    glowColor: 'rgba(46, 125, 50, 0.4)',
    waxSealName: 'Forest Emerald',
    waxSealSymbol: '🟢',
    patchVersion: '6.78c',
    totalPrizePool: '$2,874,380',
    crowdFundedPercentage: '44% (First Interactive Compendium!)',

    winnerTeam: 'Alliance',
    winnerScore: '3 - 2',
    runnerUpTeam: 'Natus Vincere',
    winnerRoster: [
      { nickname: 'Loda', realName: 'Jonathan Berg', role: 'Pos 1 (Carry)', signatureHero: 'Gyrocopter' },
      { nickname: 's4', realName: 'Gustav Magnusson', role: 'Pos 2 (Mid / Captain)', signatureHero: 'Puck' },
      { nickname: 'AdmiralBulldog', realName: 'Henrik Ahnberg', role: 'Pos 3 (Offlane)', signatureHero: 'Nature\'s Prophet' },
      { nickname: 'EGM', realName: 'Jerry Lundkvist', role: 'Pos 4 (Soft Support)', signatureHero: 'Windranger' },
      { nickname: 'Akke', realName: 'Joakim Akterhall', role: 'Pos 5 (Hard Support)', signatureHero: 'Keeper of the Light' }
    ],

    storyHeadline: 'El Clásico & The Million Dollar Dream Coil',
    storyParagraphs: [
      'TI3 introduced Valve\'s revolutionary Interactive Compendium, allowing fans to crowdfund the prize pool to nearly $2.9 Million. The tournament peaked with the greatest rivalry in Dota history: Alliance vs Na\'Vi.',
      'Swedish squad Alliance entered TI3 on a historic 23-3 run, mastering map efficiency, stack pulling, and split-pushing with AdmiralBulldog\'s Nature\'s Prophet and Akke\'s KotL. Na\'Vi countered with sheer creativity, including the famous Fountain Hook comeback against TongFu.',
      'In Game 5 of the Grand Finals—widely considered the most intense game in esports history—Na\'Vi pushed Alliance\'s base. But s4 on Puck landed the "Million Dollar Dream Coil," canceling Na\'Vi\'s teleports back to defend while Bulldog tore down Na\'Vi\'s Throne.'
    ],
    metaSnapshot: 'Heavy split-pushing, stack pulling, Io + KotL global presence, Weaver, Gyrocopter, and Chen/Pudge Fountain Hooking.',
    topPickedHeroes: ['Visage', 'Lifestealer', 'Dark Seer', 'Rubick', 'Batrider'],
    topBannedHeroes: ['Batrider', 'Io', 'Lifestealer', 'Outworld Devourer', 'Naga Siren'],

    invites: ['Alliance', 'Na\'Vi', 'iG', 'DK', 'LGD', 'Orange Esports', 'Fnatic', 'Liquid', 'Virtus.pro', 'Zenith'],
    qualifiers: ['Mousesports (West Qualifier)', 'LGD.cn (East Qualifier)', 'Rattlesnake (Wildcard)'],
    snubsAndDrama: 'Kaipi (featuring EternalEnvy and Arteezy) was famously snubbed from getting an invite or qualifier slot. MUFC went 0-15 in group stage.',
    postTIShuffle: 'Orange Esports split up after Mushi\'s legendary 18-hero performance; DK formed the "Galacticos" superteam with Burning, Mushi, Iceiceice, Lanm, and MMY.',

    venueDescription: 'Packed Benaroya Hall with thunderous chanting ("ALLIANCE!", "NA\'VI!"), illuminated green banners, and fans waving Swedish flags.',
    atmosphere: 'Peak nostalgia, intense rivalry, emotional, and historic. The crowning moment of Dota\'s golden era.',
    memesAndSideContent: [
      'Loda\'s "Is that balanced?!" reaction to Fountain Hooking',
      'The 1v1 Solo Tournament won by iceiceice',
      'Dendi sneaking behind the analyst desk dressed as Pudge'
    ],

    macroMoments: [
      {
        id: 'ti3-gf-g5',
        title: 'Grand Finals Game 5: Alliance vs Na\'Vi',
        match: 'Grand Finals - Game 5',
        whyItMatters: 'The highest stakes, closest, most heart-pounding final game in esports history.',
        videoUrl: 'https://www.youtube.com/watch?v=R3LqS7YmU3s',
        youtubeId: 'R3LqS7YmU3s',
        highlightsSummary: 'Na\'Vi leads in kills, but Alliance split-pushes with Nature\'s Prophet and Chaos Knight. s4 cancels Na\'Vi\'s TPs as Alliance destroys the Ancient.'
      },
      {
        id: 'ti3-fountain-hook',
        title: 'The Fountain Hook Miracle: Na\'Vi vs TongFu',
        match: 'Upper Bracket Quarterfinals - Game 3',
        whyItMatters: 'Na\'Vi uses Chen Test of Faith + Pudge Meat Hook to drag TongFu\'s fully farmed Gyrocopter across the map.',
        videoUrl: 'https://www.youtube.com/watch?v=a3S6uV4JkC8',
        youtubeId: 'a3S6uV4JkC8',
        highlightsSummary: 'Puppey times Test of Faith recall while Dendi hooks Hao into Na\'Vi\'s fountain, turning around an unlosable game.'
      }
    ],

    microPlays: [
      {
        id: 'ti3-s4-dreamcoil',
        title: 'The Million Dollar Dream Coil',
        player: 's4',
        hero: 'Puck',
        breakdown: 's4 blinks into Na\'Vi\'s mid lane, casting Dream Coil to interrupt Dendi and Puppey\'s Town Portal Scrolls.',
        videoUrl: 'https://www.youtube.com/watch?v=R3LqS7YmU3s',
        youtubeId: 'R3LqS7YmU3s',
        casterQuote: 's4 IS THERE TO STOP THEM! HE CANCELED THE TELEPORT! ALLIANCE IS WINNING THE INTERNATIONAL!',
        audioClipId: 'dreamcoil'
      }
    ]
  },

  TI4: {
    id: 'TI4',
    yearNumber: 2014,
    dates: 'July 18–21, 2014',
    location: 'Seattle, Washington, USA',
    arena: 'KeyArena at Seattle Center',
    themeColor: '#8E24AA',
    secondaryColor: '#4A148C',
    glowColor: 'rgba(142, 36, 170, 0.4)',
    waxSealName: 'Shadow Obsidian',
    waxSealSymbol: '🟣',
    patchVersion: '6.81b',
    totalPrizePool: '$10,923,977',
    crowdFundedPercentage: '85% ($10M Milestone Passed!)',

    winnerTeam: 'Newbee',
    winnerScore: '3 - 1',
    runnerUpTeam: 'Vici Gaming',
    winnerRoster: [
      { nickname: 'Hao', realName: 'Chen Zhihao', role: 'Pos 1 (Carry)', signatureHero: 'Lifestealer' },
      { nickname: 'Mu', realName: 'Zhang Pan', role: 'Pos 2 (Mid)', signatureHero: 'Dragon Knight' },
      { nickname: 'xiao8', realName: 'Zhang Ning', role: 'Pos 3 (Offlane / Captain)', signatureHero: 'Doom' },
      { nickname: 'Banana', realName: 'Wang Jiao', role: 'Pos 4 (Soft Support)', signatureHero: 'Mirana' },
      { nickname: 'SanSheng', realName: 'Wang Zhaohui', role: 'Pos 5 (Hard Support)', signatureHero: 'Shadow Shaman' }
    ],

    storyHeadline: 'The $10 Million Milestone & Deathball Dominance',
    storyParagraphs: [
      'TI4 shattered esports prize pool records by surpassing $10 Million and moving into Seattle\'s giant 17,000-seat KeyArena stadium.',
      'Vici Gaming pioneered an ultra-aggressive "Deathball" push strategy with Shadow Shaman, Death Prophet, and Razor, knocking teams out in under 15 minutes. But Chinese squad Newbee, captained by xiao8, fought back from near-elimination in the phase 2 play-ins.',
      'Newbee adapted clinical counter-drafts and anti-push items, overwhelming Vici Gaming 3-1 in a lightning-fast Grand Finals to claim $5 Million.'
    ],
    metaSnapshot: '15-minute Deathball push, Shadow Shaman Serpent Wards, Razor Static Link, Doom, Death Prophet, and Mekansm rushes.',
    topPickedHeroes: ['Mirana', 'Skywrath Mage', 'Razor', 'Doom', 'Shadow Shaman'],
    topBannedHeroes: ['Lycan', 'Batrider', 'Brewmaster', 'Razor', 'Tinker'],

    invites: ['Alliance', 'Na\'Vi', 'iG', 'DK', 'Newbee', 'Evil Geniuses', 'Fnatic', 'Titan', 'Vici Gaming', 'Empire'],
    qualifiers: ['NAR (Americas)', 'Arrow Gaming (SEA)', 'LGD (China)', 'Mousesports (Europe)', 'Liquid (Wildcard)'],
    snubsAndDrama: 'Arrow Gaming was later banned permanently for match-fixing; Fnatic played with Excalibur as a stand-in for Era initially due to health issues.',
    postTIShuffle: 'xiao8 retired temporarily after winning; DK disbanded after Burning and Mushi retired.',

    venueDescription: 'Massive KeyArena stadium with floor-to-ceiling LED screens, giant hero projections, and 17,000 roaring fans.',
    atmosphere: 'Colossal stadium energy, high production value, dark purple obsidian aesthetics.',
    memesAndSideContent: [
      'The Techies hero reveal in the All-Star game by Arteezy!',
      'Kaci Aitchison\'s legendary arena interviews',
      'The "WAOW!" caster line from LD'
    ],

    macroMoments: [
      {
        id: 'ti4-allstar',
        title: 'TI4 All-Star Game: Techies Reveal',
        match: 'All-Star Match',
        whyItMatters: 'Arteezy picked a mystery hero box and spawned Techies live on stage to 17,000 screaming fans.',
        videoUrl: 'https://www.youtube.com/watch?v=R3LqS7YmU3s',
        youtubeId: 'R3LqS7YmU3s',
        highlightsSummary: 'The crowd blew the roof off KeyArena as green landmines covered the map.'
      }
    ],

    microPlays: [
      {
        id: 'ti4-xiao8-doom',
        title: 'xiao8\'s Precise Doom Target',
        player: 'xiao8',
        hero: 'Doom',
        breakdown: 'xiao8 Dooms Fy\'s Rubick right before a teamfight, neutralizing Vici Gaming\'s entire spell steal setup.',
        videoUrl: 'https://www.youtube.com/watch?v=R3LqS7YmU3s',
        youtubeId: 'R3LqS7YmU3s',
        casterQuote: 'XIAO8 DOOMS THE RUBICK! NEWBEE TAKES CONTROL OF THE GRAND FINALS!',
        audioClipId: 'waow'
      }
    ]
  },

  TI5: {
    id: 'TI5',
    yearNumber: 2015,
    dates: 'August 3–8, 2015',
    location: 'Seattle, Washington, USA',
    arena: 'KeyArena at Seattle Center',
    themeColor: '#FFB300',
    secondaryColor: '#FF6F00',
    glowColor: 'rgba(255, 179, 0, 0.4)',
    waxSealName: 'Golden Aegis',
    waxSealSymbol: '💛',
    patchVersion: '6.84c',
    totalPrizePool: '$18,429,613',
    crowdFundedPercentage: '91% (Passed $18M!)',

    winnerTeam: 'Evil Geniuses (EG)',
    winnerScore: '3 - 1',
    runnerUpTeam: 'CDEC Gaming',
    winnerRoster: [
      { nickname: 'Fear', realName: 'Clinton Loomis', role: 'Pos 1 (Carry)', signatureHero: 'Gyrocopter' },
      { nickname: 'SumaIL', realName: 'Sumail Hassan', role: 'Pos 2 (Mid)', signatureHero: 'Storm Spirit' },
      { nickname: 'UNiVeRsE', realName: 'Saahil Arora', role: 'Pos 3 (Offlane)', signatureHero: 'Earthshaker' },
      { nickname: 'Aui_2000', realName: 'Kurtis Ling', role: 'Pos 4 (Soft Support)', signatureHero: 'Techies / Naga' },
      { nickname: 'ppd', realName: 'Peter Dager', role: 'Pos 5 (Hard Support / Captain)', signatureHero: 'Ancient Apparition' }
    ],

    storyHeadline: 'The 15-Year-Old Prodigy & The 6-Million Dollar Slam',
    storyParagraphs: [
      'TI5 was defined by North American squad Evil Geniuses and their 15-year-old Pakistani mid-lane prodigy SumaIL, alongside veteran captain ppd and "Old Man" Fear.',
      'Chinese wildcards CDEC Gaming surged to the Grand Finals with aggressive, unpolished teamfighting. In Game 4 of the Grand Finals, CDEC attempted a desperate Roshan kill. ppd on Ancient Apparition scouted the pit and landed Ice Blast, setting up UNiVeRsE on Earthshaker.',
      'UNiVeRsE blinked into the pit and delivered the legendary "6-Million Dollar Echo Slam," wiping CDEC instantly and winning North America its first-ever Aegis of Champions.'
    ],
    metaSnapshot: 'Storm Spirit mid dominance, Gyrocopter, Leshrac mid priority, Techies / Naga siren 4-position pressure by Aui_2000, and Earthshaker Roshan pit wraps.',
    topPickedHeroes: ['Gyrocopter', 'Bounty Hunter', 'Dazzle', 'Winter Wyvern', 'Queen of Pain'],
    topBannedHeroes: ['Leshrac', 'Bounty Hunter', 'Naga Siren', 'Techies', 'Gyrocopter'],

    invites: ['Vici Gaming', 'Evil Geniuses', 'Secret', 'Invictus Gaming', 'LGD', 'Virtus.pro', 'Newbee', 'Empire', 'Cloud9', 'Fnatic'],
    qualifiers: ['Complexiy (Americas)', 'EHOME (China)', 'Na\'Vi (Europe)', 'MVP.Hot6 (SEA)', 'CDEC (Wildcard)'],
    snubsAndDrama: 'Aui_2000 was controversially kicked from EG days after winning TI5 to make room for Arteezy\'s return.',
    postTIShuffle: 'Team Secret rebuilt around Puppey; CDEC players were scouted across top LGD rosters.',

    venueDescription: 'KeyArena in brilliant golden lights with 18,000 USA fans roaring "USA! USA!" as confetti rained down.',
    atmosphere: 'High-octane, triumphant, golden, electrifying.',
    memesAndSideContent: [
      'Deadmau5 controversial ending concert',
      'The 10v10 Custom Game reveal with fans on stage',
      'SumaIL\'s famous Storm Spirit remnant plays'
    ],

    macroMoments: [
      {
        id: 'ti5-gf-g4',
        title: 'TI5 Grand Finals Game 4: EG vs CDEC',
        match: 'Grand Finals - Game 4',
        whyItMatters: 'EG seals North America\'s first Aegis victory in front of a home crowd.',
        videoUrl: 'https://www.youtube.com/watch?v=R3LqS7YmU3s',
        youtubeId: 'R3LqS7YmU3s',
        highlightsSummary: 'EG traps CDEC in the Roshan pit, executing the 6-Million Dollar Echo Slam.'
      }
    ],

    microPlays: [
      {
        id: 'ti5-universe-echoslam',
        title: 'The 6-Million Dollar Echo Slam',
        player: 'UNiVeRsE',
        hero: 'Earthshaker',
        breakdown: 'UNiVeRsE blinks into 5 CDEC players in the Roshan pit alongside ppd\'s Ice Blast, wiping CDEC in seconds.',
        videoUrl: 'https://www.youtube.com/watch?v=R3LqS7YmU3s',
        youtubeId: 'R3LqS7YmU3s',
        casterQuote: 'IT\'S A DISASTAH! UNIVERSE WITH THE 6 MILLION DOLLAR ECHO SLAM!',
        audioClipId: 'echoslam'
      }
    ]
  },

  TI6: {
    id: 'TI6',
    yearNumber: 2016,
    dates: 'August 3–13, 2016',
    location: 'Seattle, Washington, USA',
    arena: 'KeyArena at Seattle Center',
    themeColor: '#D81B60',
    secondaryColor: '#880E4F',
    glowColor: 'rgba(216, 27, 96, 0.4)',
    waxSealName: 'Chaos Ruby',
    waxSealSymbol: '🔴',
    patchVersion: '6.88b',
    totalPrizePool: '$20,770,460',
    crowdFundedPercentage: '88% (Passed $20M!)',

    winnerTeam: 'Wings Gaming',
    winnerScore: '3 - 1',
    runnerUpTeam: 'Digital Chaos',
    winnerRoster: [
      { nickname: 'shadow', realName: 'Chu Zeyu', role: 'Pos 1 (Carry)', signatureHero: 'Faceless Void / Venomancer' },
      { nickname: 'bLINK', realName: 'Zhou Yang', role: 'Pos 2 (Mid)', signatureHero: 'Invoker' },
      { nickname: 'Faith_bian', realName: 'Zhang Ruida', role: 'Pos 3 (Offlane)', signatureHero: 'Axe / Slardar' },
      { nickname: 'y`', realName: 'Zhang Yiping', role: 'Pos 5 (Hard Support / Captain)', signatureHero: 'Oracle' },
      { nickname: 'Iceice', realName: 'Li Peng', role: 'Pos 4 (Soft Support)', signatureHero: 'Keeper of the Light' }
    ],

    storyHeadline: 'Wings Gaming & The Poetry of Unpredictability',
    storyParagraphs: [
      'TI6 surpassed $20 Million and presented the most versatile, artistic gameplay ever witnessed in Dota. Chinese underdogs Wings Gaming enthralled the world with drafts that defied all meta conventions.',
      'Wings drafted 17 unique hero compositions on the main stage—including Techies, Pudge, Venomancer, and Butcher—playing with fluid teamfights and instinctual synergy.',
      'Wings defeated underdog squad Digital Chaos 3-1 in the Grand Finals, delivering what analysts called "pure, poetic Dota."'
    ],
    metaSnapshot: 'Extreme hero diversity, Dagon Void, Mirana Aghanim Starstorm, Kunkka support, Shadow Demon + Luna illusions, and Wings\' positionless drafting.',
    topPickedHeroes: ['Mirana', 'Shadow Demon', 'Elder Titan', 'Faceless Void', 'Batrider'],
    topBannedHeroes: ['Io', 'Elder Titan', 'Drow Ranger', 'Batrider', 'Mirana'],

    invites: ['OG', 'Liquid', 'Newbee', 'LGD', 'MVP Phoenix', 'Na\'Vi'],
    qualifiers: ['Evil Geniuses (Americas)', 'Wings Gaming (China)', 'Secret (Europe)', 'TnC Gaming (SEA)', 'Digital Chaos (Wildcard)'],
    snubsAndDrama: 'TnC Gaming from SEA pulled off the biggest upset in TI history by knocking out tournament favorites OG in Lower Bracket Round 2!',
    postTIShuffle: 'Wings Gaming tragically disbanded months later due to organizational contract disputes; Digital Chaos members joined various NA stacks.',

    venueDescription: 'KeyArena drenched in ruby red light with dynamic projected spell effects directly onto the arena floor.',
    atmosphere: 'Artistic, electric, unpredictable, and joyous.',
    memesAndSideContent: [
      'Underlord hero reveal during the 10v10 match',
      'Slacks\' puppet show and cosplay contest',
      'The "DING DING DING!" caster call during EG vs Alliance'
    ],

    macroMoments: [
      {
        id: 'ti6-tnc-og',
        title: 'TnC Gaming knocks out OG',
        match: 'Lower Bracket Round 2',
        whyItMatters: 'Filipino underdog TnC eliminated 2x Major Champions OG in a colossal upset.',
        videoUrl: 'https://www.youtube.com/watch?v=R3LqS7YmU3s',
        youtubeId: 'R3LqS7YmU3s',
        highlightsSummary: 'Raven on Huskar and Sam_H on Void destroyed OG\'s base.'
      }
    ],

    microPlays: [
      {
        id: 'ti6-ding-ding',
        title: 'EG vs Alliance: DING DING DING!',
        player: 'Zai & Fear',
        hero: 'Ogre Magi',
        breakdown: 'EG holds off Alliance\'s base race with Ogre Magi multicasts.',
        videoUrl: 'https://www.youtube.com/watch?v=R3LqS7YmU3s',
        youtubeId: 'R3LqS7YmU3s',
        casterQuote: 'DING DING DING MOTHERF***ER! ALLIANCE\'S THRONE IS FALLING!',
        audioClipId: 'dingding'
      }
    ]
  },

  TI7: {
    id: 'TI7',
    yearNumber: 2017,
    dates: 'August 2–12, 2017',
    location: 'Seattle, Washington, USA',
    arena: 'KeyArena at Seattle Center',
    themeColor: '#00ACC1',
    secondaryColor: '#006064',
    glowColor: 'rgba(0, 172, 193, 0.4)',
    waxSealName: 'Reef Aquamarine',
    waxSealSymbol: '🌊',
    patchVersion: '7.06e',
    totalPrizePool: '$24,787,916',
    crowdFundedPercentage: '89% ($24.7M Passed!)',

    winnerTeam: 'Team Liquid',
    winnerScore: '3 - 0',
    runnerUpTeam: 'Newbee',
    winnerRoster: [
      { nickname: 'MATUMBAMAN', realName: 'Lasse Urpalainen', role: 'Pos 1 (Carry)', signatureHero: 'Necrophos / Venomancer' },
      { nickname: 'Miracle-', realName: 'Amer Al-Barkawi', role: 'Pos 2 (Mid)', signatureHero: 'Invoker / Anti-Mage' },
      { nickname: 'MinD_ContRoL', realName: 'Ivan Ivanov', role: 'Pos 3 (Offlane)', signatureHero: 'Nature\'s Prophet / Dark Seer' },
      { nickname: 'GH', realName: 'Maroun Merhej', role: 'Pos 4 (Soft Support)', signatureHero: 'Keeper of the Light / Io' },
      { nickname: 'KuroKy', realName: 'Kuro Salehi Takhasomi', role: 'Pos 5 (Hard Support / Captain)', signatureHero: 'Rubick' }
    ],

    storyHeadline: 'Liquid\'s Lower Bracket Miracle Run',
    storyParagraphs: [
      'TI7 featured a aquatic, sunken reef theme and a $24.7 Million prize pool. European favorites Team Liquid dropped to the Lower Bracket on day one of the main stage.',
      'Undeterred, captain KuroKy led Liquid through six consecutive elimination series, dismantling Secret, Empire, Virtus.pro, LGD, and LGD.FY with GH\'s godly KotL and Miracle-\'s mechanically flawless Invoker.',
      'Liquid swept Newbee 3-0 in the Grand Finals—the first 3-0 sweep in TI history—fulfilling KuroKy\'s 7-year quest for the Aegis of Champions.'
    ],
    metaSnapshot: 'GH\'s forced Keeper of the Light & Io bans, Necrophos carry, Venomancer, Nature\'s Prophet, Lich, and Green Hero heal/regen comps.',
    topPickedHeroes: ['Earthshaker', 'Puck', 'Sand King', 'Batrider', 'Lich'],
    topBannedHeroes: ['Night Stalker', 'Io', 'Keeper of the Light', 'Batrider', 'Lycan'],

    invites: ['OG', 'Virtus.pro', 'Evil Geniuses', 'Liquid', 'Invictus Gaming', 'Newbee'],
    qualifiers: ['Secret (Europe)', 'Empire (CIS)', 'LFY (China)', 'TNC (SEA)', 'Digital Chaos (NA)', 'Infamous (SA)'],
    snubsAndDrama: 'Resolution played as a last-minute stand-in for Empire (replacing Chappie due to visa issues) and went on a legendary individual run.',
    postTIShuffle: 'Liquid stayed together for another year; KuroKy was celebrated across the globe.',

    venueDescription: 'KeyArena decorated with oceanic reefs, glowing jellyfish projections, and deep blue water lighting.',
    atmosphere: 'Aquatic, historic, emotional, triumphant.',
    memesAndSideContent: [
      'OpenAI 1v1 Bot beating Dendi live on stage',
      'Sylph (Dark Willow) and Pangolier hero announcements',
      'MATUMBAMAN\'s legendary green shorts'
    ],

    macroMoments: [
      {
        id: 'ti7-liquid-run',
        title: 'Liquid\'s 6-Match Lower Bracket Sweep',
        match: 'Lower Bracket to Grand Finals',
        whyItMatters: 'Liquid survived 6 straight elimination matches to sweep the Grand Finals 3-0.',
        videoUrl: 'https://www.youtube.com/watch?v=R3LqS7YmU3s',
        youtubeId: 'R3LqS7YmU3s',
        highlightsSummary: 'GH\'s KotL Blinding Lights and Miracle-\'s Anti-Mage split-push dominated every single opponent.'
      }
    ],

    microPlays: [
      {
        id: 'ti7-gh-kotl',
        title: 'GH\'s 4-Man Blinding Light',
        player: 'GH',
        hero: 'Keeper of the Light',
        breakdown: 'GH knocks 4 enemy heroes down high ground cliff, saving Miracle-\'s Invoker.',
        videoUrl: 'https://www.youtube.com/watch?v=R3LqS7YmU3s',
        youtubeId: 'R3LqS7YmU3s',
        casterQuote: 'GH IS ABSOLUTELY UNBELIEVABLE ON KEEPER OF THE LIGHT!',
        audioClipId: 'waow'
      }
    ]
  },

  TI8: {
    id: 'TI8',
    yearNumber: 2018,
    dates: 'August 15–25, 2018',
    location: 'Vancouver, British Columbia, Canada',
    arena: 'Rogers Arena',
    themeColor: '#7CB342',
    secondaryColor: '#33691E',
    glowColor: 'rgba(124, 179, 66, 0.4)',
    waxSealName: 'Cave Emerald',
    waxSealSymbol: '🪨',
    patchVersion: '7.19b',
    totalPrizePool: '$25,532,177',
    crowdFundedPercentage: '89% ($25.5M Passed!)',

    winnerTeam: 'OG',
    winnerScore: '3 - 2',
    runnerUpTeam: 'PSG.LGD',
    winnerRoster: [
      { nickname: 'ana', realName: 'Anathan Pham', role: 'Pos 1 (Carry)', signatureHero: 'Phantom Lancer / Spectre' },
      { nickname: 'Topson', realName: 'Topias Taavitsainen', role: 'Pos 2 (Mid)', signatureHero: 'Monkey King / Invoker' },
      { nickname: 'Ceb', realName: 'Sébastien Debs', role: 'Pos 3 (Offlane)', signatureHero: 'Axe / Treant Protector' },
      { nickname: 'JerAx', realName: 'Jesse Vainikka', role: 'Pos 4 (Soft Support)', signatureHero: 'Earth Spirit / Rubick' },
      { nickname: 'N0tail', realName: 'Johan Sundstein', role: 'Pos 5 (Hard Support / Captain)', signatureHero: 'Chen / Nature\'s Prophet' }
    ],

    storyHeadline: 'The Betrayal, The Fly Handshake, & OG\'s Cinderella Run',
    storyParagraphs: [
      'TI8 moved to Vancouver, Canada, and delivered the most dramatic storyline in esports history. Weeks before the tournament, OG captain Fly and s4 abruptly left N0tail\'s team to join Evil Geniuses. Devastated, N0tail recruited pub-star Topson (who had never played a LAN) and moved coach Ceb into the offlane.',
      'OG fought through open qualifiers to reach TI8. In a storybook trajectory, OG faced EG in the Upper Bracket—resulting in the iconic cold N0tail-Fly handshake—and advanced to face Chinese powerhouse PSG.LGD in the Grand Finals.',
      'Down 1-2 in Game 4 of the Grand Finals, Ceb landed his legendary "CEEEEEEEB!" 3-man Axe call to save OG from defeat. OG won Game 4 and Game 5, claiming an emotional, miraculous Aegis of Champions.'
    ],
    metaSnapshot: 'Buyback heavy meta, Spectre & Phantom Lancer late-game carries, Topson\'s mid Monkey King & Pugna, Ceb\'s Axe, and JerAx Earth Spirit setup.',
    topPickedHeroes: ['Mirana', 'Vengeful Spirit', 'Weaver', 'Tiny', 'Wraith King'],
    topBannedHeroes: ['Io', 'Enchantress', 'Weaver', 'Silencer', 'Drow Ranger'],

    invites: ['Virtus.pro', 'Liquid', 'PSG.LGD', 'Secret', 'Mineski', 'Vici Gaming', 'Newbee', 'VGJ.Thunder'],
    qualifiers: ['OG (Europe)', 'Evil Geniuses (NA)', 'VGJ.Storm (NA)', 'Optic Gaming (NA)', 'Serenity (China)', 'Fnatic (SEA)'],
    snubsAndDrama: 'The Fly & s4 departure from OG weeks before TI8 remains the most infamous roster betrayal in Dota history.',
    postTIShuffle: 'ana took a hiatus after winning; OG returned stronger than ever for TI9.',

    venueDescription: 'Rogers Arena bathed in subterranean green cave lights with gold accents and 18,000 emotional fans crying and cheering.',
    atmosphere: 'Unbelievably emotional, cinematic, triumphant, and legendary.',
    memesAndSideContent: [
      'The cold N0tail death stare / handshake with Fly',
      'Grimstroke hero reveal live on stage',
      'Lakad Matatag chat wheel spam in every game'
    ],

    macroMoments: [
      {
        id: 'ti8-gf-g4',
        title: 'Grand Finals Game 4: OG vs PSG.LGD',
        match: 'Grand Finals - Game 4',
        whyItMatters: 'OG saves themselves from losing TI8 with an unlosable comeback.',
        videoUrl: 'https://www.youtube.com/watch?v=R3LqS7YmU3s',
        youtubeId: 'R3LqS7YmU3s',
        highlightsSummary: 'ana\'s Phantom Lancer buys back, Ceb lands the Axe call, and OG forces Game 5.'
      }
    ],

    microPlays: [
      {
        id: 'ti8-ceeb-axe',
        title: 'CEEEEEEEB! The Axe Call of His Life',
        player: 'Ceb',
        hero: 'Axe',
        breakdown: 'Ceb blinks into 3 members of PSG.LGD near bottom river, catching Ame\'s Terrorblade to save ana.',
        videoUrl: 'https://www.youtube.com/watch?v=R3LqS7YmU3s',
        youtubeId: 'R3LqS7YmU3s',
        casterQuote: 'CEEEEEEEEEEEEEEEEEEEB! HE GETS THE CALL OF HIS LIFE!',
        audioClipId: 'ceeb'
      }
    ]
  },

  TI9: {
    id: 'TI9',
    yearNumber: 2019,
    dates: 'August 15–25, 2019',
    location: 'Shanghai, China',
    arena: 'Mercedes-Benz Arena',
    themeColor: '#9C27B0',
    secondaryColor: '#4A148C',
    glowColor: 'rgba(156, 39, 176, 0.4)',
    waxSealName: 'Mystic Amethyst',
    waxSealSymbol: '🔮',
    patchVersion: '7.22f',
    totalPrizePool: '$34,330,068',
    crowdFundedPercentage: '88% (Passed $34M Record!)',

    winnerTeam: 'OG (2nd Aegis Title)',
    winnerScore: '3 - 1',
    runnerUpTeam: 'Team Liquid',
    winnerRoster: [
      { nickname: 'ana', realName: 'Anathan Pham', role: 'Pos 1 (Carry)', signatureHero: 'Io (Carry) / Spectre' },
      { nickname: 'Topson', realName: 'Topias Taavitsainen', role: 'Pos 2 (Mid)', signatureHero: 'Monkey King / Pugna / Gyrocopter' },
      { nickname: 'Ceb', realName: 'Sébastien Debs', role: 'Pos 3 (Offlane)', signatureHero: 'Enchantress / Magnus' },
      { nickname: 'JerAx', realName: 'Jesse Vainikka', role: 'Pos 4 (Soft Support)', signatureHero: 'Tiny / Rubick' },
      { nickname: 'N0tail', realName: 'Johan Sundstein', role: 'Pos 5 (Hard Support / Captain)', signatureHero: 'Elder Titan / Abaddon' }
    ],

    storyHeadline: 'Back-to-Back Mastery & The Carry Io Revolution',
    storyParagraphs: [
      'TI9 brought The International to Shanghai, China, with a historic $34.3 Million prize pool. Defending champions OG returned after ana came back from his break, playing with complete joy, freedom, and disrespect for meta norms.',
      'OG stunned opponents by running ana on Carry Io with Aghanim\'s Scepter, winning every single game with the hero. They brushed aside PSG.LGD and met Team Liquid in the Grand Finals.',
      'OG dismantled Liquid 3-1 in dominant fashion, becoming the first-ever two-time, back-to-back Aegis champions in Dota history.'
    ],
    metaSnapshot: 'ana\'s Carry Io, Topson\'s mid Diffusal Blade Gyrocopter & Pugna, Enchantress offlane, Tiny toss toss rotations, and high-tempo buyback pressure.',
    topPickedHeroes: ['Elder Titan', 'Shadow Demon', 'Tiny', 'Gyrocopter', 'Ogre Magi'],
    topBannedHeroes: ['Alchemist', 'Chen', 'Enchantress', 'Io', 'Lifestealer'],

    invites: ['Secret', 'Virtus.pro', 'Vici Gaming', 'Evil Geniuses', 'Liquid', 'PSG.LGD', 'Fnatic', 'Ninjas in Pyjamas', 'TNC', 'OG'],
    qualifiers: ['Mineski (SEA)', 'Infamous (SA)', 'Rineski (NA)', 'Chaos Esports (Europe)', 'Na\'Vi (CIS)', 'RNG (China)'],
    snubsAndDrama: 'Liquid kicked MATUMBAMAN months before TI9 to pick up w33, reaching Grand Finals against OG.',
    postTIShuffle: 'JerAx and ana retired shortly after TI9 as undisputed 2x champions.',

    venueDescription: 'Shanghai Mercedes-Benz Arena lit in enchanted purple and magenta with massive holographic screen projections.',
    atmosphere: 'Majestic, dominant, fun, joyous, and historic.',
    memesAndSideContent: [
      'Snapfire & Void Spirit hero announcements',
      'OG chat wheel paper spray spam',
      'N0tail becoming the highest earning esports athlete of all time'
    ],

    macroMoments: [
      {
        id: 'ti9-gf-g4',
        title: 'Grand Finals Game 4: OG vs Liquid',
        match: 'Grand Finals - Game 4',
        whyItMatters: 'OG crowns themselves the first 2x Aegis champions in history.',
        videoUrl: 'https://www.youtube.com/watch?v=R3LqS7YmU3s',
        youtubeId: 'R3LqS7YmU3s',
        highlightsSummary: 'ana\'s Gyrocopter and Topson\'s Timbersaw overwhelm Liquid\'s base.'
      }
    ],

    microPlays: [
      {
        id: 'ti9-ana-io',
        title: 'ana\'s Carry Io Aghanim Power Surge',
        player: 'ana',
        hero: 'Io',
        breakdown: 'ana gets Aghanim\'s Scepter on Io, spawning continuous Spirits to annihilate Liquid.',
        videoUrl: 'https://www.youtube.com/watch?v=R3LqS7YmU3s',
        youtubeId: 'R3LqS7YmU3s',
        casterQuote: 'ANA\'S CARRY IO IS UNBEATABLE! OG ARE TWO-TIME INTERNATIONAL CHAMPIONS!',
        audioClipId: 'waow'
      }
    ]
  },

  TI10: {
    id: 'TI10',
    yearNumber: 2021,
    dates: 'October 7–17, 2021',
    location: 'Bucharest, Romania',
    arena: 'Arena Națională',
    themeColor: '#D4AF37',
    secondaryColor: '#8B6508',
    glowColor: 'rgba(212, 175, 55, 0.4)',
    waxSealName: 'Dark Sun Gold',
    waxSealSymbol: '💛',
    patchVersion: '7.30e',
    totalPrizePool: '$40,018,195',
    crowdFundedPercentage: '89% ($40M All-Time Record!)',

    winnerTeam: 'Team Spirit',
    winnerScore: '3 - 2',
    runnerUpTeam: 'PSG.LGD',
    winnerRoster: [
      { nickname: 'Yatoro', realName: 'Illya Mulyarchuk', role: 'Pos 1 (Carry)', signatureHero: 'Morphling / Terrorblade / Faceless Void' },
      { nickname: 'TORONTOTOKYO', realName: 'Alexander Khertek', role: 'Pos 2 (Mid)', signatureHero: 'Ember Spirit / Void Spirit' },
      { nickname: 'Collapse', realName: 'Magomed Khalilov', role: 'Pos 3 (Offlane)', signatureHero: 'Magnus / Mars' },
      { nickname: 'Mira', realName: 'Miroslaw Kolpakov', role: 'Pos 4 (Soft Support)', signatureHero: 'Rubick / Lion' },
      { nickname: 'Miposhka', realName: 'Yaroslav Naidenov', role: 'Pos 5 (Hard Support / Captain)', signatureHero: 'Bane / Disruptor' }
    ],

    storyHeadline: 'Underdog Spirit, Collapse Magnus, & The $40M Record',
    storyParagraphs: [
      'After a gap year due to global events, TI10 took place in Bucharest, Romania, featuring an all-time record $40.0 Million prize pool in an empty stadium atmosphere illuminated by stunning golden visuals.',
      'Eastern European underdogs Team Spirit—featuring 18-year-old carry Yatoro and offlane prodigy Collapse—entered as complete longshots. Collapse redefined offlane play by abusing Magnus\'s Horn Toss and Skewer to drag enemy heroes halfway across the map into Spirit\'s tower.',
      'Yatoro set the record for 3 Rampages on the main stage after shaving his head for luck. Spirit defeated PSG.LGD 3-2 in a 5-game grand finals thriller, claiming $18.2 Million.'
    ],
    metaSnapshot: 'Collapse\'s Magnus Horn Toss + Skewer kidnaps, Yatoro\'s hero pool versatility (14 unique heroes played), Bane Fiend\'s Grip, Tiny mid/carry, and Tidehunter.',
    topPickedHeroes: ['Elder Titan', 'Invoker', 'Tidehunter', 'Lion', 'Bane'],
    topBannedHeroes: ['Monkey King', 'Io', 'Magnus', 'Tiny', 'Weaver'],

    invites: ['Evil Geniuses', 'PSG.LGD', 'Virtus.pro', 'Quincy Crew', 'T1', 'Vici Gaming', 'Secret', 'Team Aster', 'Alliance', 'Beastcoast'],
    qualifiers: ['Team Spirit (EEU)', 'OG (WEU)', 'Fnatic (SEA)', 'Elephant (China)', 'Undying (NA)', 'SG Esports (SA)'],
    snubsAndDrama: 'OG attempted a three-peat run but were eliminated by Spirit in the Lower Bracket.',
    postTIShuffle: 'Team Spirit\'s victory inspired an entire generation of Eastern European esports talent.',

    venueDescription: 'Arena Națională in Bucharest lit in grand golden light displays, empty stadium seats with thunderous digital audio production.',
    atmosphere: 'Solemn, atmospheric, golden, explosive, and miraculous.',
    memesAndSideContent: [
      'Yatoro shaving his head live between main stage days',
      'Collapse kidnapping heroes on Magnus',
      'TORONTOTOKYO typing "ez game" in all-chat vs OG'
    ],

    macroMoments: [
      {
        id: 'ti10-gf-g5',
        title: 'TI10 Grand Finals Game 5: Spirit vs LGD',
        match: 'Grand Finals - Game 5',
        whyItMatters: 'Team Spirit claims the $40M prize pool in a tense 5-game series.',
        videoUrl: 'https://www.youtube.com/watch?v=R3LqS7YmU3s',
        youtubeId: 'R3LqS7YmU3s',
        highlightsSummary: 'Collapse on Magnus and Yatoro on Terrorblade seal the victory.'
      }
    ],

    microPlays: [
      {
        id: 'ti10-collapse-magnus',
        title: 'Collapse\'s Fountain Skewer Kidnap',
        player: 'Collapse',
        hero: 'Magnus',
        breakdown: 'Collapse blinks behind PSG.LGD\'s Ame, Horn Tosses him backward, and Skewers him into Spirit\'s base.',
        videoUrl: 'https://www.youtube.com/watch?v=R3LqS7YmU3s',
        youtubeId: 'R3LqS7YmU3s',
        casterQuote: 'COLLAPSE IS KIDNAPPING EVERYBODY! HE SKEWERS HIM ALL THE WAY BACK!',
        audioClipId: 'yatorogod'
      }
    ]
  },

  TI11: {
    id: 'TI11',
    yearNumber: 2022,
    dates: 'October 15–30, 2022',
    location: 'Singapore',
    arena: 'Singapore Indoor Stadium',
    themeColor: '#E91E63',
    secondaryColor: '#880E4F',
    glowColor: 'rgba(233, 30, 99, 0.4)',
    waxSealName: 'Tropical Orchid',
    waxSealSymbol: '🌸',
    patchVersion: '7.32c',
    totalPrizePool: '$18,930,775',
    crowdFundedPercentage: '88%',

    winnerTeam: 'Tundra Esports',
    winnerScore: '3 - 0',
    runnerUpTeam: 'Team Secret',
    winnerRoster: [
      { nickname: 'skiter', realName: 'Oliver Lepko', role: 'Pos 1 (Carry)', signatureHero: 'Naga Siren / Chaos Knight' },
      { nickname: 'Nine', realName: 'Leon Kirilin', role: 'Pos 2 (Mid)', signatureHero: 'Tusk (Mid) / Keeper of the Light' },
      { nickname: '33', realName: 'Neta Shapira', role: 'Pos 3 (Offlane / Captain)', signatureHero: 'Beastmaster / Visage' },
      { nickname: 'Saksa', realName: 'Martin Sazdov', role: 'Pos 4 (Soft Support)', signatureHero: 'Tiny / Hoodwink' },
      { nickname: 'Sneyking', realName: 'Wu Jingjun', role: 'Pos 5 (Hard Support)', signatureHero: 'Mirana' }
    ],

    storyHeadline: 'Tundra\'s Unbreakable Meta & Singapore Nights',
    storyParagraphs: [
      'TI11 brought the tournament to Southeast Asia for the first time in Singapore. Tactical mastermind 33 and Tundra Esports solved the patch with mathematical precision.',
      'Tundra popularized Wraith Pact, Mage Slayer, and zoo aura items, suffocating enemy team comps before they could scale. Mid-laner Nine played unorthodox mid heroes like Tusk and KotL.',
      'Tundra swept Team Secret 3-0 in the Grand Finals, dropping only 5 total games during the entire tournament.'
    ],
    metaSnapshot: 'Wraith Pact aura stacking, 33\'s Visage & Beastmaster micro pressure, Nine\'s mid Tusk, Leshrac Bloodstone, and Naga Siren farm control.',
    topPickedHeroes: ['Crystal Maiden', 'Tiny', 'Marci', 'Leshrac', 'Shadow Fiend'],
    topBannedHeroes: ['Marci', 'Enigma', 'Leshrac', 'Primal Beast', 'Undying'],

    invites: ['PSG.LGD', 'OG', 'beastcoast', 'Thunder Awaken', 'Aster', 'TSM', 'Secret', 'Tundra'],
    qualifiers: ['Hokori (SA)', 'BetBoom (EEU)', 'RNG (China)', 'Talon (SEA)', 'Soniqs (NA)', 'Entity (WEU)'],
    snubsAndDrama: 'RNG players tested positive for illness on stage and fought bravely through isolation booths.',
    postTIShuffle: 'Aui_2000 won his second TI ring as Tundra\'s head coach; 33 established himself as the offlane mastermind.',

    venueDescription: 'Singapore Indoor Stadium wrapped in glowing neon magenta and tropical floral lighting.',
    atmosphere: 'Neon, intense, analytical, and dominant.',
    memesAndSideContent: [
      'Slacks and SUNSfan\'s Singapore food tours',
      'Puppey\'s 11th consecutive TI appearance record'
    ],

    macroMoments: [
      {
        id: 'ti11-gf-g3',
        title: 'Grand Finals Game 3: Tundra vs Secret',
        match: 'Grand Finals - Game 3',
        whyItMatters: 'Tundra completes a flawless 3-0 grand finals sweep.',
        videoUrl: 'https://www.youtube.com/watch?v=R3LqS7YmU3s',
        youtubeId: 'R3LqS7YmU3s',
        highlightsSummary: '33 on Medusa and Nine on Pangolier dismantle Secret.'
      }
    ],

    microPlays: [
      {
        id: 'ti11-nine-tusk',
        title: 'Nine\'s Mid Tusk Snowball Save',
        player: 'Nine',
        hero: 'Tusk',
        breakdown: 'Nine picks mid Tusk, saving 33\'s Visage with a perfectly timed Snowball.',
        videoUrl: 'https://www.youtube.com/watch?v=R3LqS7YmU3s',
        youtubeId: 'R3LqS7YmU3s',
        casterQuote: 'NINE IS REINVENTING THE MID LANE AT THE INTERNATIONAL!',
        audioClipId: 'waow'
      }
    ]
  },

  TI12: {
    id: 'TI12',
    yearNumber: 2023,
    dates: 'October 12–29, 2023',
    location: 'Seattle, Washington, USA',
    arena: 'Climate Pledge Arena',
    themeColor: '#42A5F5',
    secondaryColor: '#1565C0',
    glowColor: 'rgba(66, 165, 245, 0.4)',
    waxSealName: 'Cascadian Slate',
    waxSealSymbol: '🏙️',
    patchVersion: '7.34e',
    totalPrizePool: '$3,380,455',
    crowdFundedPercentage: '52%',

    winnerTeam: 'Team Spirit (2nd Aegis Title)',
    winnerScore: '3 - 0',
    runnerUpTeam: 'Gaimin Gladiators',
    winnerRoster: [
      { nickname: 'Yatoro', realName: 'Illya Mulyarchuk', role: 'Pos 1 (Carry)', signatureHero: 'Morphling / Weaver' },
      { nickname: 'Larl', realName: 'Denis Sigitov', role: 'Pos 2 (Mid)', signatureHero: 'Pangolier' },
      { nickname: 'Collapse', realName: 'Magomed Khalilov', role: 'Pos 3 (Offlane)', signatureHero: 'Spirit Breaker / Magnus' },
      { nickname: 'Mira', realName: 'Miroslaw Kolpakov', role: 'Pos 4 (Soft Support)', signatureHero: 'Grimstroke' },
      { nickname: 'Miposhka', realName: 'Yaroslav Naidenov', role: 'Pos 5 (Hard Support / Captain)', signatureHero: 'Treant Protector' }
    ],

    storyHeadline: 'Return to Seattle & Spirit\'s Second Crown',
    storyParagraphs: [
      'TI12 marked the long-awaited return of The International to Seattle at the state-of-the-art Climate Pledge Arena.',
      'Gaimin Gladiators entered having won all three Majors of the year. But Team Spirit—led by Yatoro\'s mechanical perfection and Collapse\'s Spirit Breaker charge rotations—delivered late-game execution that left opponents helpless.',
      'Team Spirit swept Gaimin Gladiators 3-0 in the Grand Finals, joining OG as the second multi-time Aegis champions in history.'
    ],
    metaSnapshot: 'Spirit Breaker charge meta, Treant Protector, Heart of Tarrasque tankiness, Weaver carry, and Yatoro\'s Morphling mastery.',
    topPickedHeroes: ['Treant Protector', 'Grimstroke', 'Spirit Breaker', 'Pangolier', 'Muerta'],
    topBannedHeroes: ['Lone Druid', 'Invoker', 'Dazzle', 'Nature\'s Prophet', 'Primal Beast'],

    invites: ['Liquid', 'Gaimin Gladiators', 'Tundra', '9Pandas', 'Evil Geniuses', 'PSG.LGD', 'Shopify Rebellion', 'Talon', 'beastcoast', 'Spirit'],
    qualifiers: ['Nouns (NA)', 'Keyd Stars (SA)', 'Thunder Awaken (SA)', 'Entity (WEU)', 'Virtus.pro (EEU)', 'Azure Ray (China)'],
    snubsAndDrama: 'Azure Ray featuring Somnus, Fy, and Chalice reunited to fight through Chinese qualifiers all the way to Top 4.',
    postTIShuffle: 'Yatoro solidified his reputation as the undisputed greatest carry player of the modern era.',

    venueDescription: 'Climate Pledge Arena in deep Pacific slate blue lighting with environmental LED displays.',
    atmosphere: 'Nostalgic, modern, serene, and authoritative.',
    memesAndSideContent: [
      'Yatoro shaving his head again for luck',
      'Chalice and Somnus anime entrance memes',
      'The Ringmaster hero announcement trailer'
    ],

    macroMoments: [
      {
        id: 'ti12-gf-g3',
        title: 'Grand Finals Game 3: Spirit vs Gladiators',
        match: 'Grand Finals - Game 3',
        whyItMatters: 'Spirit completes their second Aegis victory sweep.',
        videoUrl: 'https://www.youtube.com/watch?v=R3LqS7YmU3s',
        youtubeId: 'R3LqS7YmU3s',
        highlightsSummary: 'Yatoro on Morphling achieves a Rampage in Gaimin Gladiators\' base.'
      }
    ],

    microPlays: [
      {
        id: 'ti12-yatoro-morph',
        title: 'Yatoro\'s Morphling Waveform Dodge',
        player: 'Yatoro',
        hero: 'Morphling',
        breakdown: 'Yatoro waveform dodges 3 stuns simultaneously to turn around a teamfight.',
        videoUrl: 'https://www.youtube.com/watch?v=R3LqS7YmU3s',
        youtubeId: 'R3LqS7YmU3s',
        casterQuote: 'YATORO IS IMPOSSIBLE TO KILL! TEAM SPIRIT ARE TWO-TIME CHAMPIONS!',
        audioClipId: 'yatorogod'
      }
    ]
  },

  TI13: {
    id: 'TI13',
    yearNumber: 2024,
    dates: 'September 4–15, 2024',
    location: 'Copenhagen, Denmark',
    arena: 'Royal Arena',
    themeColor: '#E53935',
    secondaryColor: '#B71C1C',
    glowColor: 'rgba(229, 57, 53, 0.4)',
    waxSealName: 'Royal Crimson',
    waxSealSymbol: '🎪',
    patchVersion: '7.37c',
    totalPrizePool: '$2,600,000',
    crowdFundedPercentage: '38%',

    winnerTeam: 'Team Liquid (2nd Aegis Title)',
    winnerScore: '3 - 0',
    runnerUpTeam: 'Gaimin Gladiators',
    winnerRoster: [
      { nickname: 'miCKe', realName: 'Michael Vu', role: 'Pos 1 (Carry)', signatureHero: 'Nature\'s Prophet / Windranger' },
      { nickname: 'Nisha', realName: 'Michał Jankowski', role: 'Pos 2 (Mid)', signatureHero: 'Puck / Ember Spirit' },
      { nickname: '33', realName: 'Neta Shapira', role: 'Pos 3 (Offlane / Captain)', signatureHero: 'Visage / Doom' },
      { nickname: 'Boxi', realName: 'Samuel Svahn', role: 'Pos 4 (Soft Support)', signatureHero: 'Tusk / Clockwerk' },
      { nickname: 'Insania', realName: 'Aydin Sarkohi', role: 'Pos 5 (Hard Support / Captain)', signatureHero: 'Shadow Demon / Rubick' }
    ],

    storyHeadline: 'Liquid Breaks the Grand Finals Curse in Copenhagen',
    storyParagraphs: [
      'TI13 brought The International to Denmark\'s Royal Arena in Copenhagen with a regal carnival crimson theme.',
      'After losing five straight Major grand finals to rivals Gaimin Gladiators over two years, Team Liquid—captained by Insania and 2x TI winner 33 alongside mid genius Nisha—executed their revenge.',
      'Liquid dominated Gaimin Gladiators 3-0 in a flawless Grand Finals sweep, earning Liquid their second organization Aegis and giving Nisha his long-deserved first world championship.'
    ],
    metaSnapshot: 'Nature\'s Prophet carry, Windranger Aghanim stealth, Nisha\'s mid Puck spell control, 33\'s Visage micro, and Shadow Demon disruption saves.',
    topPickedHeroes: ['Tusk', 'Windranger', 'Shadow Demon', 'Nusra', 'Clockwerk'],
    topBannedHeroes: ['Naga Siren', 'Nature\'s Prophet', 'Enchantress', 'Doom', 'Visage'],

    invites: ['Team Spirit', 'Xtreme Gaming', 'Team Falcons', 'Liquid', 'Gaimin Gladiators', 'BetBoom Team'],
    qualifiers: ['1win (EEU)', 'Team Zero (China)', 'G2.iG (China)', 'Talon (SEA)', 'Nouns (NA)', 'Heroic (SA)', 'Cloud9 (WEU)'],
    snubsAndDrama: 'Cloud9 returned to Dota by signing the former Entity stack, making a heroic run to Top 6.',
    postTIShuffle: '33 became one of only a handful of players in history to win two Aegises on two completely different teams (Tundra 2022 & Liquid 2024).',

    venueDescription: 'Royal Arena in Copenhagen lit in royal crimson circus velvet with gold chandelier stage accents.',
    atmosphere: 'Regal, joyful, dramatic, and historic.',
    memesAndSideContent: [
      'Insania\'s emotional victory interview recalling his TI9 Gyrocopter mispick',
      'The Ringmaster mini-game booth'
    ],

    macroMoments: [
      {
        id: 'ti13-gf-g3',
        title: 'Grand Finals Game 3: Liquid vs Gladiators',
        match: 'Grand Finals - Game 3',
        whyItMatters: 'Liquid breaks their grand finals curse with a 3-0 sweep.',
        videoUrl: 'https://www.youtube.com/watch?v=R3LqS7YmU3s',
        youtubeId: 'R3LqS7YmU3s',
        highlightsSummary: 'Nisha on Puck and 33 on Visage destroy GG\'s Ancient.'
      }
    ],

    microPlays: [
      {
        id: 'ti13-nisha-puck',
        title: 'Nisha\'s 4-Man Dream Coil',
        player: 'Nisha',
        hero: 'Puck',
        breakdown: 'Nisha lands a flawless 4-man Dream Coil in the mid river, sealing the 3-0 sweep.',
        videoUrl: 'https://www.youtube.com/watch?v=R3LqS7YmU3s',
        youtubeId: 'R3LqS7YmU3s',
        casterQuote: 'NISHA IS A WORLD CHAMPION AT LAST! TEAM LIQUID WIN THE Aegis!',
        audioClipId: 'dreamcoil'
      }
    ]
  }
};

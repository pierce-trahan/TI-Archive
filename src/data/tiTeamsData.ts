import { TIVersionId, TITeamProfile } from '../types';

export const tiTeamsDataRecord: Record<TIVersionId, TITeamProfile[]> = {
  TI1: [
    {
      id: 'navi-ti1',
      name: "Natus Vincere (Na'Vi)",
      region: 'EEU',
      placement: '1st Place - CHAMPION ($1,000,000)',
      placementRank: 1,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/36.png',
      successUpToPoint: 'Dominant CIS powerhouse prior to TI1; swept through Cologne 10-1 without losing a single game in playoffs.',
      roster: [
        { nickname: 'Artstyle', realName: 'Ivan Antonov', role: 'Pos 5 Hard Support / Captain', nationality: 'Ukraine', countryFlag: '🇺🇦', topHeroes: [{ heroName: 'Night Stalker', matchesPlayed: 6, winRate: '100% (6-0)' }, { heroName: 'Slardar', matchesPlayed: 3, winRate: '100% (3-0)' }, { heroName: 'Vengeful Spirit', matchesPlayed: 2, winRate: '50% (1-1)' }, { heroName: 'Chen', matchesPlayed: 2, winRate: '100% (2-0)' }, { heroName: 'Enigma', matchesPlayed: 1, winRate: '100% (1-0)' }] },
        { nickname: 'Dendi', realName: 'Danil Ishutin', role: 'Pos 2 Midlaner', nationality: 'Ukraine', countryFlag: '🇺🇦', topHeroes: [{ heroName: 'Puck', matchesPlayed: 5, winRate: '100% (5-0)' }, { heroName: 'Mirana', matchesPlayed: 4, winRate: '75% (3-1)' }, { heroName: 'Shadow Fiend', matchesPlayed: 3, winRate: '100% (3-0)' }, { heroName: 'Invoker', matchesPlayed: 2, winRate: '100% (2-0)' }, { heroName: 'Storm Spirit', matchesPlayed: 2, winRate: '100% (2-0)' }] },
        { nickname: 'XBOCT', realName: 'Alexander Dashkevich', role: 'Pos 1 Carry', nationality: 'Ukraine', countryFlag: '🇺🇦', topHeroes: [{ heroName: 'Weaver', matchesPlayed: 6, winRate: '100% (6-0)' }, { heroName: 'Spectre', matchesPlayed: 3, winRate: '100% (3-0)' }, { heroName: 'Mirana', matchesPlayed: 2, winRate: '50% (1-1)' }, { heroName: 'Anti-Mage', matchesPlayed: 2, winRate: '100% (2-0)' }, { heroName: 'Viper', matchesPlayed: 1, winRate: '100% (1-0)' }] },
        { nickname: 'LightTofHeavEn', realName: 'Dmitry Kupriyanov', role: 'Pos 3 Offlaner', nationality: 'Russia', countryFlag: '🇷🇺', topHeroes: [{ heroName: 'Windranger', matchesPlayed: 5, winRate: '100% (5-0)' }, { heroName: 'Beastmaster', matchesPlayed: 3, winRate: '100% (3-0)' }, { heroName: 'Lich', matchesPlayed: 3, winRate: '67% (2-1)' }, { heroName: 'Doom', matchesPlayed: 2, winRate: '100% (2-0)' }, { heroName: 'Enigma', matchesPlayed: 1, winRate: '100% (1-0)' }] },
        { nickname: 'Puppey', realName: 'Clement Ivanov', role: 'Pos 4 Soft Support', nationality: 'Estonia', countryFlag: '🇪🇪', topHeroes: [{ heroName: 'Chen', matchesPlayed: 6, winRate: '100% (6-0)' }, { heroName: 'Enchantress', matchesPlayed: 3, winRate: '100% (3-0)' }, { heroName: 'Ancient Apparition', matchesPlayed: 3, winRate: '67% (2-1)' }, { heroName: 'Crystal Maiden', matchesPlayed: 2, winRate: '100% (2-0)' }, { heroName: 'Tidehunter', matchesPlayed: 1, winRate: '100% (1-0)' }] }
      ]
    },
    {
      id: 'ehome-ti1',
      name: 'EHOME',
      region: 'CN',
      placement: '2nd Place - RUNNER-UP ($250,000)',
      placementRank: 2,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/4.png',
      successUpToPoint: 'Undisputed Kings of DotA 1 in 2010 (ESWC 2010 Champions); pushed Na\'Vi in Grand Finals.',
      roster: [
        { nickname: '820', realName: 'Zou Zhang', role: 'Pos 5 Support / Captain', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Vengeful Spirit', matchesPlayed: 7, winRate: '71% (5-2)' }, { heroName: 'Lich', matchesPlayed: 4, winRate: '75% (3-1)' }] },
        { nickname: 'Sylar', realName: 'Liu Jiajun', role: 'Pos 1 Carry', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Doom', matchesPlayed: 5, winRate: '80% (4-1)' }, { heroName: 'Mirana', matchesPlayed: 4, winRate: '50% (2-2)' }] },
        { nickname: 'FCB', realName: 'Yao Ling', role: 'Pos 2 Midlaner', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Shadow Fiend', matchesPlayed: 5, winRate: '60% (3-2)' }] },
        { nickname: '357', realName: 'Yao Yi', role: 'Pos 3 Offlaner', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Earthshaker', matchesPlayed: 6, winRate: '67% (4-2)' }] },
        { nickname: 'PCT', realName: 'Xie Junhao', role: 'Pos 4 Soft Support', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Windranger', matchesPlayed: 5, winRate: '80% (4-1)' }] }
      ]
    },
    {
      id: 'scythe-ti1',
      name: 'Scythe.SG',
      region: 'SEA',
      placement: '3rd Place ($120,000)',
      placementRank: 3,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/aegis.png',
      successUpToPoint: 'South East Asian legends featuring Hyhy and iceiceice; finished 3rd in Cologne.',
      roster: [
        { nickname: 'hyhy', realName: 'Benedict Lim', role: 'Pos 2 Mid / Captain', nationality: 'Singapore', countryFlag: '🇸🇬', topHeroes: [{ heroName: 'Shadow Fiend', matchesPlayed: 6, winRate: '67% (4-2)' }] },
        { nickname: 'iceiceice', realName: 'Daryl Koh', role: 'Pos 3 Offlaner', nationality: 'Singapore', countryFlag: '🇸🇬', topHeroes: [{ heroName: 'Weaver', matchesPlayed: 5, winRate: '80% (4-1)' }] },
        { nickname: 'xy-', realName: 'Toh Wai Hong', role: 'Pos 1 Carry', nationality: 'Singapore', countryFlag: '🇸🇬', topHeroes: [{ heroName: 'Morphling', matchesPlayed: 5, winRate: '60% (3-2)' }] },
        { nickname: 'Roy', realName: 'Roy Roy', role: 'Pos 4 Support', nationality: 'Singapore', countryFlag: '🇸🇬', topHeroes: [{ heroName: 'Earthshaker', matchesPlayed: 6, winRate: '67% (4-2)' }] },
        { nickname: 'Sharky', realName: 'Raymond Wong', role: 'Pos 5 Support', nationality: 'Malaysia', countryFlag: '🇲🇾', topHeroes: [{ heroName: 'Vengeful Spirit', matchesPlayed: 6, winRate: '67% (4-2)' }] }
      ]
    },
    {
      id: 'nirvanaint-ti1',
      name: 'OK.Nirvana.Int',
      region: 'NA',
      placement: '4th Place ($80,000)',
      placementRank: 4,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/aegis.png',
      successUpToPoint: 'Transatlantic squad led by Fear and ComeWithMe; secured top 4 finish at TI1.',
      roster: [
        { nickname: 'Fear', realName: 'Clinton Loomis', role: 'Pos 1 Carry', nationality: 'USA', countryFlag: '🇺🇸', topHeroes: [{ heroName: 'Mirana', matchesPlayed: 6, winRate: '67%' }] },
        { nickname: '1437', realName: 'Theeban Siva', role: 'Pos 5 Support', nationality: 'Canada', countryFlag: '🇨🇦', topHeroes: [{ heroName: 'Lich', matchesPlayed: 5, winRate: '60%' }] },
        { nickname: 'ComeWithMe', realName: 'Alexandru Craciunescu', role: 'Pos 4 Support', nationality: 'Romania', countryFlag: '🇷🇴', topHeroes: [{ heroName: 'Earthshaker', matchesPlayed: 5, winRate: '60%' }] },
        { nickname: 'PAADA', realName: 'Paulo Augusto', role: 'Pos 3 Offlane', nationality: 'Brazil', countryFlag: '🇧🇷', topHeroes: [{ heroName: 'Slardar', matchesPlayed: 4, winRate: '50%' }] },
        { nickname: 'Lacoste', realName: 'Dominik Stipic', role: 'Pos 2 Mid', nationality: 'Croatia', countryFlag: '🇭🇷', topHeroes: [{ heroName: 'Tidehunter', matchesPlayed: 4, winRate: '50%' }] }
      ]
    },
    {
      id: 'm5-ti1',
      name: 'Moscow Five',
      region: 'EEU',
      placement: '5th-6th Place ($35,000)',
      placementRank: 5,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/aegis.png',
      successUpToPoint: 'Fierce Russian roster featuring NS, Dread, and G; legendary early aggressive team.',
      roster: [
        { nickname: 'NS', realName: 'Yaroslav Kuznetsov', role: 'Pos 5 Support', nationality: 'Russia', countryFlag: '🇷🇺', topHeroes: [{ heroName: 'Vengeful Spirit', matchesPlayed: 5, winRate: '60%' }] },
        { nickname: 'Dread', realName: 'Andrey Golubev', role: 'Pos 3 Offlane', nationality: 'Russia', countryFlag: '🇷🇺', topHeroes: [{ heroName: 'Enigma', matchesPlayed: 5, winRate: '60%' }] },
        { nickname: 'G (God)', realName: 'Sergey Bragin', role: 'Pos 2 Mid', nationality: 'Russia', countryFlag: '🇷🇺', topHeroes: [{ heroName: 'Shadow Fiend', matchesPlayed: 4, winRate: '75%' }] },
        { nickname: 'Santa', realName: 'Alexander Koltan', role: 'Pos 1 Carry', nationality: 'Russia', countryFlag: '🇷🇺', topHeroes: [{ heroName: 'Spectre', matchesPlayed: 4, winRate: '50%' }] },
        { nickname: 'ARS-ART', realName: 'Sergey Revin', role: 'Pos 4 Support', nationality: 'Russia', countryFlag: '🇷🇺', topHeroes: [{ heroName: 'Leshrac', matchesPlayed: 4, winRate: '50%' }] }
      ]
    },
    {
      id: 'ig-ti1',
      name: 'Invictus Gaming',
      region: 'CN',
      placement: '5th-6th Place ($35,000)',
      placementRank: 5,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/5.png',
      successUpToPoint: 'Pre-cursor iG star squad featuring Zhou, 430, YYF, and xiao8.',
      roster: [
        { nickname: 'Zhou', realName: 'Chen Zhou', role: 'Pos 1 Carry', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Weaver', matchesPlayed: 5, winRate: '60%' }] },
        { nickname: 'Ferrari_430', realName: 'Luo Feichi', role: 'Pos 2 Mid', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Puck', matchesPlayed: 5, winRate: '60%' }] },
        { nickname: 'YYF', realName: 'Yao Yi', role: 'Pos 3 Offlane', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Doom', matchesPlayed: 4, winRate: '75%' }] },
        { nickname: 'xiao8', realName: 'Zhang Ning', role: 'Pos 4 Support', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Mirana', matchesPlayed: 4, winRate: '50%' }] },
        { nickname: 'ddc', realName: 'Leong Fat-meng', role: 'Pos 5 Support', nationality: 'Macau', countryFlag: '🇲🇴', topHeroes: [{ heroName: 'Lich', matchesPlayed: 4, winRate: '50%' }] }
      ]
    },
    {
      id: 'tyloo-ti1',
      name: 'Shanghai TyLoo',
      region: 'CN',
      placement: '7th-8th Place ($25,000)',
      placementRank: 7,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/aegis.png',
      successUpToPoint: 'Chinese titan featuring Super, DD, and Faith; standard 4-protect-1 heavy metal style.',
      roster: [
        { nickname: 'Super', realName: 'Xie Junhao', role: 'Pos 2 Mid', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Invoker', matchesPlayed: 4, winRate: '50%' }] },
        { nickname: 'DD', realName: 'Xie Bin', role: 'Pos 4 Support', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Earthshaker', matchesPlayed: 4, winRate: '50%' }] },
        { nickname: 'KABU', realName: 'Zhao Kai', role: 'Pos 3 Offlane', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Clockwerk', matchesPlayed: 3, winRate: '67%' }] },
        { nickname: 'Faith', realName: 'Zeng Hongda', role: 'Pos 5 Support', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Venomancer', matchesPlayed: 3, winRate: '67%' }] },
        { nickname: 'Awoke', realName: 'Ye Liang', role: 'Pos 1 Carry', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Doom', matchesPlayed: 3, winRate: '33%' }] }
      ]
    },
    {
      id: 'mith-ti1',
      name: 'MiTH.Trust',
      region: 'SEA',
      placement: '7th-8th Place ($25,000)',
      placementRank: 7,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/aegis.png',
      successUpToPoint: 'Thai powerhouse led by Lakelz; famous for hyper-fast pushing and early teamfights.',
      roster: [
        { nickname: 'Lakelz', realName: 'Pipat Prariyachat', role: 'Pos 1 Carry', nationality: 'Thailand', countryFlag: '🇹🇭', topHeroes: [{ heroName: 'Mirana', matchesPlayed: 5, winRate: '60%' }] },
        { nickname: 'aDND', realName: 'Chayut Suebka', role: 'Pos 2 Mid', nationality: 'Thailand', countryFlag: '🇹🇭', topHeroes: [{ heroName: 'Shadow Fiend', matchesPlayed: 4, winRate: '50%' }] },
        { nickname: 'TNY', realName: 'Anurat Praianun', role: 'Pos 3 Offlane', nationality: 'Thailand', countryFlag: '🇹🇭', topHeroes: [{ heroName: 'Slardar', matchesPlayed: 4, winRate: '50%' }] },
        { nickname: 'rOtk', realName: 'Bai Fan', role: 'Pos 4 Support', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Earthshaker', matchesPlayed: 3, winRate: '67%' }] },
        { nickname: 'VIP', realName: 'Kittikorn Inthaphong', role: 'Pos 5 Support', nationality: 'Thailand', countryFlag: '🇹🇭', topHeroes: [{ heroName: 'Vengeful Spirit', matchesPlayed: 3, winRate: '33%' }] }
      ]
    },
    {
      id: 'mineski-ti1',
      name: 'Mineski',
      region: 'SEA',
      placement: '9th-12th Place',
      placementRank: 9,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/aegis.png',
      successUpToPoint: 'Philippine esports pioneers who brought iconic energy and hyper-aggressive SEA DotA to Gamescom.',
      roster: [
        { nickname: 'Rhasta', realName: 'Ryan Jay Qui', role: 'Pos 2 Mid', nationality: 'Philippines', countryFlag: '🇵🇭', topHeroes: [{ heroName: 'Shadow Fiend', matchesPlayed: 3, winRate: '33%' }] },
        { nickname: 'Julz', realName: 'Julius De Leon', role: 'Pos 1 Carry', nationality: 'Philippines', countryFlag: '🇵🇭', topHeroes: [{ heroName: 'Weaver', matchesPlayed: 3, winRate: '33%' }] },
        { nickname: 'Jay', realName: 'James Turner', role: 'Pos 3 Offlane', nationality: 'Philippines', countryFlag: '🇵🇭', topHeroes: [{ heroName: 'Puck', matchesPlayed: 2, winRate: '50%' }] },
        { nickname: 'Veno', realName: 'Josh Ramos', role: 'Pos 4 Support', nationality: 'Philippines', countryFlag: '🇵🇭', topHeroes: [{ heroName: 'Venomancer', matchesPlayed: 2, winRate: '50%' }] },
        { nickname: 'Wootz', realName: 'Patrick Pascua', role: 'Pos 5 Support', nationality: 'Philippines', countryFlag: '🇵🇭', topHeroes: [{ heroName: 'Lich', matchesPlayed: 2, winRate: '0%' }] }
      ]
    },
    {
      id: 'mufc-ti1',
      name: 'MUFC',
      region: 'SEA',
      placement: '9th-12th Place',
      placementRank: 9,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/aegis.png',
      successUpToPoint: 'Malaysian squad led by Net and KyXY; established SEA presence at TI1.',
      roster: [
        { nickname: 'Net', realName: 'Wai Pern Seng', role: 'Pos 5 Support', nationality: 'Malaysia', countryFlag: '🇲🇾', topHeroes: [{ heroName: 'Sand King', matchesPlayed: 3, winRate: '33%' }] },
        { nickname: 'KyXY', realName: 'Lee Kang Yang', role: 'Pos 1 Carry', nationality: 'Malaysia', countryFlag: '🇲🇾', topHeroes: [{ heroName: 'Mirana', matchesPlayed: 3, winRate: '33%' }] },
        { nickname: 'SilverCross', realName: 'Chen Jiayuan', role: 'Pos 2 Mid', nationality: 'Malaysia', countryFlag: '🇲🇾', topHeroes: [{ heroName: 'Doom', matchesPlayed: 2, winRate: '50%' }] },
        { nickname: 'Ling', realName: 'Sim Woi Cheong', role: 'Pos 3 Offlane', nationality: 'Malaysia', countryFlag: '🇲🇾', topHeroes: [{ heroName: 'Beastmaster', matchesPlayed: 2, winRate: '50%' }] },
        { nickname: 'Sharky', realName: 'Raymond Wong', role: 'Pos 4 Support', nationality: 'Malaysia', countryFlag: '🇲🇾', topHeroes: [{ heroName: 'Earthshaker', matchesPlayed: 2, winRate: '0%' }] }
      ]
    },
    {
      id: 'nevo-ti1',
      name: 'NeVo',
      region: 'WEU',
      placement: '9th-12th Place',
      placementRank: 9,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/aegis.png',
      successUpToPoint: 'Danish squad captained by SyndereN; featured future TI Champion Ace.',
      roster: [
        { nickname: 'SyndereN', realName: 'Troels Nielsen', role: 'Pos 5 Support / Captain', nationality: 'Denmark', countryFlag: '🇩🇰', topHeroes: [{ heroName: 'Lich', matchesPlayed: 3, winRate: '33%' }] },
        { nickname: 'Ace', realName: 'Marcus Hoelgaard', role: 'Pos 1 Carry', nationality: 'Denmark', countryFlag: '🇩🇰', topHeroes: [{ heroName: 'Weaver', matchesPlayed: 3, winRate: '33%' }] },
        { nickname: 'Ryze', realName: 'Christoffer Winther', role: 'Pos 2 Mid', nationality: 'Denmark', countryFlag: '🇩🇰', topHeroes: [{ heroName: 'Puck', matchesPlayed: 2, winRate: '50%' }] },
        { nickname: 'Ange', realName: 'Angelos Tsekos', role: 'Pos 3 Offlane', nationality: 'Greece', countryFlag: '🇬🇷', topHeroes: [{ heroName: 'Slardar', matchesPlayed: 2, winRate: '50%' }] },
        { nickname: 'Balsam', realName: 'Soren Balsam', role: 'Pos 4 Support', nationality: 'Denmark', countryFlag: '🇩🇰', topHeroes: [{ heroName: 'Crystal Maiden', matchesPlayed: 2, winRate: '0%' }] }
      ]
    },
    {
      id: 'ggnet-ti1',
      name: 'GosuGamers.net',
      region: 'WEU',
      placement: '9th-12th Place',
      placementRank: 9,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/aegis.png',
      successUpToPoint: 'European mix featuring Pajkatt and Misery; known for individual mechanical flair.',
      roster: [
        { nickname: 'Pajkatt', realName: 'Per Anders Olsson Lille', role: 'Pos 1 Carry', nationality: 'Sweden', countryFlag: '🇸🇪', topHeroes: [{ heroName: 'Sniper', matchesPlayed: 3, winRate: '33%' }] },
        { nickname: 'Misery', realName: 'Rasmus Filipsen', role: 'Pos 2 Mid', nationality: 'Denmark', countryFlag: '🇩🇰', topHeroes: [{ heroName: 'Mirana', matchesPlayed: 3, winRate: '33%' }] },
        { nickname: 'Kev', realName: 'Kevin Rubiszewski', role: 'Pos 3 Offlane', nationality: 'Germany', countryFlag: '🇩🇪', topHeroes: [{ heroName: 'Clockwerk', matchesPlayed: 2, winRate: '50%' }] },
        { nickname: 'Azen', realName: 'Nikolay Belyakov', role: 'Pos 4 Support', nationality: 'Russia', countryFlag: '🇷🇺', topHeroes: [{ heroName: 'Enigma', matchesPlayed: 2, winRate: '50%' }] },
        { nickname: 'Miracle', realName: 'Jesper Nyhlén', role: 'Pos 5 Support', nationality: 'Sweden', countryFlag: '🇸🇪', topHeroes: [{ heroName: 'Ancient Apparition', matchesPlayed: 2, winRate: '0%' }] }
      ]
    },
    {
      id: 'nirvanacn-ti1',
      name: 'OK.Nirvana.cn',
      region: 'CN',
      placement: '13th-16th Place',
      placementRank: 13,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/aegis.png',
      successUpToPoint: 'Chinese roster featuring YaphetS and Banana.',
      roster: [
        { nickname: 'YaphetS', realName: 'Bu Yanjun', role: 'Pos 2 Mid', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Shadow Fiend', matchesPlayed: 2, winRate: '50%' }] },
        { nickname: 'Banana', realName: 'Wang Jiao', role: 'Pos 4 Support', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Earthshaker', matchesPlayed: 2, winRate: '0%' }] },
        { nickname: 'Insense', realName: 'Zhang Yu', role: 'Pos 1 Carry', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Doom', matchesPlayed: 2, winRate: '0%' }] },
        { nickname: 'SeA', realName: 'Li Ming', role: 'Pos 3 Offlane', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Slardar', matchesPlayed: 2, winRate: '0%' }] },
        { nickname: 'Crystal', realName: 'Wang Zhen', role: 'Pos 5 Support', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Lich', matchesPlayed: 2, winRate: '0%' }] }
      ]
    },
    {
      id: 'virus-ti1',
      name: 'Virus Gaming',
      region: 'WEU',
      placement: '13th-16th Place',
      placementRank: 13,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/aegis.png',
      successUpToPoint: 'French DotA 1 legends who qualified directly to Gamescom.',
      roster: [
        { nickname: 'Vlad', realName: 'Vladislav Kochetov', role: 'Pos 1 Carry', nationality: 'France', countryFlag: '🇫🇷', topHeroes: [{ heroName: 'Weaver', matchesPlayed: 2, winRate: '0%' }] },
        { nickname: 'PsYcHo', realName: 'Pierre Thomas', role: 'Pos 2 Mid', nationality: 'France', countryFlag: '🇫🇷', topHeroes: [{ heroName: 'Puck', matchesPlayed: 2, winRate: '0%' }] },
        { nickname: 'Pseudo', realName: 'Marc Vane', role: 'Pos 3 Offlane', nationality: 'France', countryFlag: '🇫🇷', topHeroes: [{ heroName: 'Slardar', matchesPlayed: 2, winRate: '0%' }] },
        { nickname: 'Malis', realName: 'Jean Luc', role: 'Pos 4 Support', nationality: 'France', countryFlag: '🇫🇷', topHeroes: [{ heroName: 'Enigma', matchesPlayed: 2, winRate: '0%' }] },
        { nickname: 'Phobos', realName: 'Alexander Kucheria', role: 'Pos 5 Support', nationality: 'Ukraine', countryFlag: '🇺🇦', topHeroes: [{ heroName: 'Vengeful Spirit', matchesPlayed: 2, winRate: '0%' }] }
      ]
    },
    {
      id: 'sgc-ti1',
      name: 'Storm Games Clan',
      region: 'EEU',
      placement: '13th-16th Place',
      placementRank: 13,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/aegis.png',
      successUpToPoint: 'Czech/Slovak regional champions.',
      roster: [
        { nickname: 'Dan', realName: 'Daniel Novak', role: 'Pos 1 Carry', nationality: 'Czechia', countryFlag: '🇨🇿', topHeroes: [{ heroName: 'Mirana', matchesPlayed: 2, winRate: '0%' }] },
        { nickname: 'CraZy', realName: 'Michal Pospisil', role: 'Pos 2 Mid', nationality: 'Czechia', countryFlag: '🇨🇿', topHeroes: [{ heroName: 'Shadow Fiend', matchesPlayed: 2, winRate: '0%' }] },
        { nickname: 'Buik', realName: 'Jan Horak', role: 'Pos 3 Offlane', nationality: 'Czechia', countryFlag: '🇨🇿', topHeroes: [{ heroName: 'Clockwerk', matchesPlayed: 2, winRate: '0%' }] },
        { nickname: 'Jackal', realName: 'Martin Kopecky', role: 'Pos 4 Support', nationality: 'Slovakia', countryFlag: '🇸🇰', topHeroes: [{ heroName: 'Earthshaker', matchesPlayed: 2, winRate: '0%' }] },
        { nickname: 'SOKOL', realName: 'Peter Sokol', role: 'Pos 5 Support', nationality: 'Slovakia', countryFlag: '🇸🇰', topHeroes: [{ heroName: 'Lich', matchesPlayed: 2, winRate: '0%' }] }
      ]
    },
    {
      id: 'ccm-ti1',
      name: 'Catastrophic Crows (CCM)',
      region: 'CN',
      placement: '13th-16th Place',
      placementRank: 13,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/aegis.png',
      successUpToPoint: 'Traditional Chinese squad early beta attendees.',
      roster: [
        { nickname: 'SanSheng', realName: 'Wang Zhao', role: 'Pos 5 Support', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Vengeful Spirit', matchesPlayed: 2, winRate: '0%' }] },
        { nickname: 'Awoke', realName: 'Ye Liang', role: 'Pos 4 Support', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Lich', matchesPlayed: 2, winRate: '0%' }] },
        { nickname: 'dd', realName: 'Xie Bin', role: 'Pos 3 Offlane', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Slardar', matchesPlayed: 2, winRate: '0%' }] },
        { nickname: 'xiao8', realName: 'Zhang Ning', role: 'Pos 2 Mid', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Puck', matchesPlayed: 2, winRate: '0%' }] },
        { nickname: 'Zhou', realName: 'Chen Zhou', role: 'Pos 1 Carry', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Doom', matchesPlayed: 2, winRate: '0%' }] }
      ]
    }
  ],

  TI2: [
    {
      id: 'ig-ti2',
      name: 'Invictus Gaming (iG)',
      region: 'CN',
      placement: '1st Place - CHAMPION ($1,000,000)',
      placementRank: 1,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/5.png',
      successUpToPoint: 'Dominant WCG & ECL Chinese Champions; lost to Na\'Vi in WB but fought through LB to sweep Grand Finals 3-1.',
      roster: [
        { nickname: 'Zhou', realName: 'Chen Zhou', role: 'Pos 1 Carry', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Morphling', matchesPlayed: 8, winRate: '88%' }] },
        { nickname: 'Ferrari_430', realName: 'Luo Feichi', role: 'Pos 2 Midlaner', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Templar Assassin', matchesPlayed: 9, winRate: '89%' }] },
        { nickname: 'YYF', realName: 'Yao Yi', role: 'Pos 3 Offlaner', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Dark Seer', matchesPlayed: 9, winRate: '78%' }] },
        { nickname: 'Chuan', realName: 'Wong Hock Chuan', role: 'Pos 4 Support', nationality: 'Malaysia', countryFlag: '🇲🇾', topHeroes: [{ heroName: 'Enchantress', matchesPlayed: 7, winRate: '86%' }] },
        { nickname: 'Faith', realName: 'Zeng Hongda', role: 'Pos 5 Support / Captain', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Disruptor', matchesPlayed: 6, winRate: '83%' }] }
      ]
    },
    {
      id: 'navi-ti2',
      name: "Natus Vincere (Na'Vi)",
      region: 'EEU',
      placement: '2nd Place - RUNNER-UP ($250,000)',
      placementRank: 2,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/36.png',
      successUpToPoint: 'Defending TI1 Champions; executed "The Play" against iG in WB Semis before finishing 2nd.',
      roster: [
        { nickname: 'Puppey', realName: 'Clement Ivanov', role: 'Pos 5 Support / Captain', nationality: 'Estonia', countryFlag: '🇪🇪', topHeroes: [{ heroName: 'Enigma', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'Dendi', realName: 'Danil Ishutin', role: 'Pos 2 Midlaner', nationality: 'Ukraine', countryFlag: '🇺🇦', topHeroes: [{ heroName: 'Rubick', matchesPlayed: 9, winRate: '78%' }] },
        { nickname: 'XBOCT', realName: 'Alexander Dashkevich', role: 'Pos 1 Carry', nationality: 'Ukraine', countryFlag: '🇺🇦', topHeroes: [{ heroName: 'Anti-Mage', matchesPlayed: 7, winRate: '71%' }] },
        { nickname: 'LightTofHeavEn', realName: 'Dmitry Kupriyanov', role: 'Pos 3 Offlaner', nationality: 'Russia', countryFlag: '🇷🇺', topHeroes: [{ heroName: 'Juggernaut', matchesPlayed: 6, winRate: '83%' }] },
        { nickname: 'ARS-ART', realName: 'Sergey Revin', role: 'Pos 4 Support', nationality: 'Russia', countryFlag: '🇷🇺', topHeroes: [{ heroName: 'Leshrac', matchesPlayed: 8, winRate: '75%' }] }
      ]
    },
    {
      id: 'lgd-ti2',
      name: 'LGD Gaming',
      region: 'CN',
      placement: '3rd Place ($150,000)',
      placementRank: 3,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/15.png',
      successUpToPoint: 'Went 18-0 in TI2 group stages; widely considered the most mechanically disciplined team at Benaroya Hall.',
      roster: [
        { nickname: 'xiao8', realName: 'Zhang Ning', role: 'Pos 3 Offlane / Captain', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Beastmaster', matchesPlayed: 7, winRate: '86%' }] },
        { nickname: 'Sylar', realName: 'Liu Jiajun', role: 'Pos 1 Carry', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Morphling', matchesPlayed: 8, winRate: '88%' }] },
        { nickname: 'Yao', realName: 'Yao Zhengzheng', role: 'Pos 2 Midlaner', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Invoker', matchesPlayed: 7, winRate: '86%' }] },
        { nickname: 'DD', realName: 'Xie Bin', role: 'Pos 4 Support', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Leshrac', matchesPlayed: 6, winRate: '83%' }] },
        { nickname: 'DDC', realName: 'Leong Fat-meng', role: 'Pos 5 Support', nationality: 'Macau', countryFlag: '🇲🇴', topHeroes: [{ heroName: 'Venomancer', matchesPlayed: 7, winRate: '86%' }] }
      ]
    },
    {
      id: 'dk-ti2',
      name: 'Team DK',
      region: 'CN',
      placement: '4th Place ($80,000)',
      placementRank: 4,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/aegis.png',
      successUpToPoint: 'Led by legendary carry Burning; classic Chinese high-ground defense power.',
      roster: [
        { nickname: 'Burning', realName: 'Xu ZhiLei', role: 'Pos 1 Carry', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Anti-Mage', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'Super', realName: 'Xie Junhao', role: 'Pos 2 Mid', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Dragon Knight', matchesPlayed: 7, winRate: '71%' }] },
        { nickname: 'rOTK', realName: 'Bai Fan', role: 'Pos 3 Offlane', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Dark Seer', matchesPlayed: 7, winRate: '71%' }] },
        { nickname: 'ZSMJ', realName: 'Gong Jian', role: 'Pos 4 Support', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Leshrac', matchesPlayed: 6, winRate: '67%' }] },
        { nickname: 'XB', realName: 'Xu Zhilei', role: 'Pos 5 Support', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Venomancer', matchesPlayed: 6, winRate: '67%' }] }
      ]
    },
    {
      id: 'zenith-ti2',
      name: 'Zenith',
      region: 'SEA',
      placement: '5th-6th Place ($35,000)',
      placementRank: 5,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/aegis.png',
      successUpToPoint: 'Unpredictable Singaporean roster featuring hyhy, iceiceice, and Loda.',
      roster: [
        { nickname: 'hyhy', realName: 'Benedict Lim', role: 'Pos 2 Mid', nationality: 'Singapore', countryFlag: '🇸🇬', topHeroes: [{ heroName: 'Invoker', matchesPlayed: 6, winRate: '67%' }] },
        { nickname: 'Loda', realName: 'Jonathan Berg', role: 'Pos 1 Carry', nationality: 'Sweden', countryFlag: '🇸🇪', topHeroes: [{ heroName: 'Morphling', matchesPlayed: 6, winRate: '67%' }] },
        { nickname: 'iceiceice', realName: 'Daryl Koh', role: 'Pos 3 Offlane', nationality: 'Singapore', countryFlag: '🇸🇬', topHeroes: [{ heroName: 'Invoker', matchesPlayed: 6, winRate: '67%' }] },
        { nickname: 'xy-', realName: 'Toh Wai Hong', role: 'Pos 4 Support', nationality: 'Singapore', countryFlag: '🇸🇬', topHeroes: [{ heroName: 'Rubick', matchesPlayed: 5, winRate: '60%' }] },
        { nickname: 'xFreedom', realName: 'Nicholas Lim', role: 'Pos 5 Support', nationality: 'Singapore', countryFlag: '🇸🇬', topHeroes: [{ heroName: 'Leshrac', matchesPlayed: 5, winRate: '60%' }] }
      ]
    },
    {
      id: 'col-ti2',
      name: 'compLexity Gaming',
      region: 'NA',
      placement: '9th-12th Place',
      placementRank: 9,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/aegis.png',
      successUpToPoint: 'North American squad featuring FLUFFNSTUFF and TC; surprised groups at Benaroya Hall.',
      roster: [
        { nickname: 'TC', realName: 'Tyler Cook', role: 'Pos 1 Carry', nationality: 'USA', countryFlag: '🇺🇸', topHeroes: [{ heroName: 'Morphling', matchesPlayed: 6, winRate: '67%' }] },
        { nickname: 'FLUFFNSTUFF', realName: 'Brian Lee', role: 'Pos 5 Support / Captain', nationality: 'USA', countryFlag: '🇺🇸', topHeroes: [{ heroName: 'Venomancer', matchesPlayed: 6, winRate: '67%' }] },
        { nickname: 'Jeyo', realName: 'Jio Madayag', role: 'Pos 2 Mid', nationality: 'Canada', countryFlag: '🇨🇦', topHeroes: [{ heroName: 'Templar Assassin', matchesPlayed: 5, winRate: '60%' }] },
        { nickname: 'Hannah_Montana', realName: 'Hannah Montana', role: 'Pos 3 Offlane', nationality: 'USA', countryFlag: '🇺🇸', topHeroes: [{ heroName: 'Dark Seer', matchesPlayed: 5, winRate: '60%' }] },
        { nickname: 'IXDL', realName: 'Michaelix', role: 'Pos 4 Support', nationality: 'USA', countryFlag: '🇺🇸', topHeroes: [{ heroName: 'Leshrac', matchesPlayed: 4, winRate: '50%' }] }
      ]
    },
    {
      id: 'orange-ti2',
      name: 'Orange Esports',
      region: 'SEA',
      placement: '7th-8th Place ($25,000)',
      placementRank: 7,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/aegis.png',
      successUpToPoint: 'Malaysian juggernaut led by Mushi and YamateH.',
      roster: [
        { nickname: 'Mushi', realName: 'Chai Yee Fung', role: 'Pos 2 Mid', nationality: 'Malaysia', countryFlag: '🇲🇾', topHeroes: [{ heroName: 'Queen of Pain', matchesPlayed: 7, winRate: '71%' }] },
        { nickname: 'YamateH', realName: 'Ng Wei Poong', role: 'Pos 1 Carry', nationality: 'Malaysia', countryFlag: '🇲🇾', topHeroes: [{ heroName: 'Morphling', matchesPlayed: 6, winRate: '67%' }] },
        { nickname: 'Ice', realName: 'Chee Cai', role: 'Pos 3 Offlane', nationality: 'Malaysia', countryFlag: '🇲🇾', topHeroes: [{ heroName: 'Tidehunter', matchesPlayed: 5, winRate: '60%' }] },
        { nickname: 'Xtinct', realName: 'Joel Chan', role: 'Pos 4 Support', nationality: 'Malaysia', countryFlag: '🇲🇾', topHeroes: [{ heroName: 'Visage', matchesPlayed: 5, winRate: '60%' }] },
        { nickname: 'Net', realName: 'Wai Pern Seng', role: 'Pos 5 Support', nationality: 'Malaysia', countryFlag: '🇲🇾', topHeroes: [{ heroName: 'Venomancer', matchesPlayed: 5, winRate: '60%' }] }
      ]
    },
    {
      id: 'mtw-ti2',
      name: 'mTw',
      region: 'WEU',
      placement: '13th-16th Place',
      placementRank: 13,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/aegis.png',
      successUpToPoint: 'DreamHack Summer 2012 Champions led by SyndereN and 7ckngMad (Ceb).',
      roster: [
        { nickname: 'SyndereN', realName: 'Troels Nielsen', role: 'Pos 5 Support / Captain', nationality: 'Denmark', countryFlag: '🇩🇰', topHeroes: [{ heroName: 'Lich', matchesPlayed: 4, winRate: '50%' }] },
        { nickname: '7ckngMad', realName: 'Sebastien Debs', role: 'Pos 3 Offlane', nationality: 'France', countryFlag: '🇫🇷', topHeroes: [{ heroName: 'Enigma', matchesPlayed: 4, winRate: '50%' }] },
        { nickname: 'Sockshka', realName: 'Antoine Suermondt', role: 'Pos 1 Carry', nationality: 'France', countryFlag: '🇫🇷', topHeroes: [{ heroName: 'Chaos Knight', matchesPlayed: 4, winRate: '50%' }] },
        { nickname: 'Kebap', realName: 'Rene Werner', role: 'Pos 4 Support', nationality: 'Germany', countryFlag: '🇩🇪', topHeroes: [{ heroName: 'Leshrac', matchesPlayed: 3, winRate: '33%' }] },
        { nickname: 'Funn1k', realName: 'Gleb Lipatnikov', role: 'Pos 2 Mid', nationality: 'Ukraine', countryFlag: '🇺🇦', topHeroes: [{ heroName: 'Clinkz', matchesPlayed: 3, winRate: '33%' }] }
      ]
    }
  ],

  TI3: [
    {
      id: 'alliance-ti3',
      name: 'Alliance',
      region: 'WEU',
      placement: '1st Place - CHAMPION ($1,437,190)',
      placementRank: 1,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/111474.png',
      successUpToPoint: 'DreamHack & G-1 League Champions; went 23-3 across TI3, pioneering rat Dota and split-push perfection.',
      roster: [
        { nickname: 'Loda', realName: 'Jonathan Berg', role: 'Pos 1 Carry', nationality: 'Sweden', countryFlag: '🇸🇪', topHeroes: [{ heroName: 'Gyrocopter', matchesPlayed: 8, winRate: '88%' }] },
        { nickname: 's4', realName: 'Gustav Magnusson', role: 'Pos 2 Mid / Captain', nationality: 'Sweden', countryFlag: '🇸🇪', topHeroes: [{ heroName: 'Puck', matchesPlayed: 9, winRate: '89%' }] },
        { nickname: 'AdmiralBulldog', realName: 'Henrik Ahnberg', role: 'Pos 3 Offlaner', nationality: 'Sweden', countryFlag: '🇸🇪', topHeroes: [{ heroName: "Nature's Prophet", matchesPlayed: 11, winRate: '91%' }] },
        { nickname: 'EGM', realName: 'Jerry Lundkvist', role: 'Pos 4 Support', nationality: 'Sweden', countryFlag: '🇸🇪', topHeroes: [{ heroName: 'Windrunner', matchesPlayed: 8, winRate: '88%' }] },
        { nickname: 'Akke', realName: 'Joakim Akterhall', role: 'Pos 5 Support', nationality: 'Sweden', countryFlag: '🇸🇪', topHeroes: [{ heroName: 'Keeper of the Light', matchesPlayed: 9, winRate: '89%' }] }
      ]
    },
    {
      id: 'navi-ti3',
      name: "Natus Vincere (Na'Vi)",
      region: 'EEU',
      placement: '2nd Place - RUNNER-UP ($632,364)',
      placementRank: 2,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/36.png',
      successUpToPoint: '3 consecutive TI Grand Finals appearances (TI1, TI2, TI3); legendary Fountain Hook comeback against TongFu.',
      roster: [
        { nickname: 'Puppey', realName: 'Clement Ivanov', role: 'Pos 5 Support / Captain', nationality: 'Estonia', countryFlag: '🇪🇪', topHeroes: [{ heroName: 'Chen', matchesPlayed: 9, winRate: '78%' }] },
        { nickname: 'Dendi', realName: 'Danil Ishutin', role: 'Pos 2 Midlaner', nationality: 'Ukraine', countryFlag: '🇺🇦', topHeroes: [{ heroName: 'Puck', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'XBOCT', realName: 'Alexander Dashkevich', role: 'Pos 1 Carry', nationality: 'Ukraine', countryFlag: '🇺🇦', topHeroes: [{ heroName: 'Lifestealer', matchesPlayed: 9, winRate: '78%' }] },
        { nickname: 'Funn1k', realName: 'Gleb Lipatnikov', role: 'Pos 3 Offlaner', nationality: 'Ukraine', countryFlag: '🇺🇦', topHeroes: [{ heroName: 'Bounty Hunter', matchesPlayed: 7, winRate: '71%' }] },
        { nickname: 'KuroKy', realName: 'Kuro Salehi Takhasomi', role: 'Pos 4 Support', nationality: 'Germany', countryFlag: '🇩🇪', topHeroes: [{ heroName: 'Rubick', matchesPlayed: 10, winRate: '80%' }] }
      ]
    },
    {
      id: 'orange-ti3',
      name: 'Orange Esports',
      region: 'SEA',
      placement: '3rd Place ($287,438)',
      placementRank: 3,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/aegis.png',
      successUpToPoint: 'Malaysian Cinderella run led by hero-god Mushi; finished 3rd in the world at Benaroya Hall.',
      roster: [
        { nickname: 'Mushi', realName: 'Chai Yee Fung', role: 'Pos 2 Midlaner', nationality: 'Malaysia', countryFlag: '🇲🇾', topHeroes: [{ heroName: 'Shadow Fiend', matchesPlayed: 12, winRate: '75%' }] },
        { nickname: 'KyXY', realName: 'Lee Kang Yang', role: 'Pos 1 Carry', nationality: 'Malaysia', countryFlag: '🇲🇾', topHeroes: [{ heroName: 'Magnus', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'OhAiYo', realName: 'Chong Xin Khoo', role: 'Pos 3 Offlaner', nationality: 'Malaysia', countryFlag: '🇲🇾', topHeroes: [{ heroName: 'Nature\'s Prophet', matchesPlayed: 9, winRate: '78%' }] },
        { nickname: 'Net', realName: 'Wai Pern Seng', role: 'Pos 5 Support', nationality: 'Malaysia', countryFlag: '🇲🇾', topHeroes: [{ heroName: 'Sand King', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'Xtinct', realName: 'Joel Chan', role: 'Pos 4 Support', nationality: 'Malaysia', countryFlag: '🇲🇾', topHeroes: [{ heroName: 'Visage', matchesPlayed: 9, winRate: '78%' }] }
      ]
    },
    {
      id: 'tongfu-ti3',
      name: 'TongFu',
      region: 'CN',
      placement: '4th Place ($201,207)',
      placementRank: 4,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/aegis.png',
      successUpToPoint: 'Top Chinese squad at TI3 featuring Hao and Mu; fell to Na\'Vi\'s famous Pudge fountain hooks.',
      roster: [
        { nickname: 'Hao', realName: 'Chen Zhihao', role: 'Pos 1 Carry', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Gyrocopter', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'Mu', realName: 'Zhang Pan', role: 'Pos 2 Mid', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Dragon Knight', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'KingJ', realName: 'Zhou Yang', role: 'Pos 3 Offlane', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Dark Seer', matchesPlayed: 7, winRate: '71%' }] },
        { nickname: 'Banana', realName: 'Wang Jiao', role: 'Pos 4 Support', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Visage', matchesPlayed: 7, winRate: '71%' }] },
        { nickname: 'SanSheng', realName: 'Wang Zhao', role: 'Pos 5 Support', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Rubick', matchesPlayed: 7, winRate: '71%' }] }
      ]
    },
    {
      id: 'liquid-ti3',
      name: 'Team Liquid',
      region: 'NA',
      placement: '7th-8th Place ($43,116)',
      placementRank: 7,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/2163.png',
      successUpToPoint: 'Famous for Bulba\'s Clockwerk knockout victory against Chinese titans LGD Gaming.',
      roster: [
        { nickname: 'TC', realName: 'Tyler Cook', role: 'Pos 1 Carry', nationality: 'USA', countryFlag: '🇺🇸', topHeroes: [{ heroName: 'Gyrocopter', matchesPlayed: 7, winRate: '71%' }] },
        { nickname: 'BULBA', realName: 'Samson Bu', role: 'Pos 3 Offlane', nationality: 'USA', countryFlag: '🇺🇸', topHeroes: [{ heroName: 'Clockwerk', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'qojqva', realName: 'Max Broecker', role: 'Pos 2 Mid', nationality: 'Germany', countryFlag: '🇩🇪', topHeroes: [{ heroName: 'Lone Druid', matchesPlayed: 7, winRate: '71%' }] },
        { nickname: 'IXDL', realName: 'Michaelix', role: 'Pos 4 Support', nationality: 'USA', countryFlag: '🇺🇸', topHeroes: [{ heroName: 'Visage', matchesPlayed: 6, winRate: '67%' }] },
        { nickname: 'FLUFFNSTUFF', realName: 'Brian Lee', role: 'Pos 5 Support', nationality: 'USA', countryFlag: '🇺🇸', topHeroes: [{ heroName: 'Chen', matchesPlayed: 6, winRate: '67%' }] }
      ]
    },
    {
      id: 'fnatic-ti3',
      name: 'Fnatic',
      region: 'WEU',
      placement: '7th-8th Place ($43,116)',
      placementRank: 7,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/38.png',
      successUpToPoint: 'Former HoN world champions featuring N0tail, Fly, Era, H4nn1, and Trixi.',
      roster: [
        { nickname: 'N0tail', realName: 'Johan Sundstein', role: 'Pos 4 Support', nationality: 'Denmark', countryFlag: '🇩🇰', topHeroes: [{ heroName: 'Meepo', matchesPlayed: 6, winRate: '67%' }] },
        { nickname: 'Fly', realName: 'Tal Aizik', role: 'Pos 5 Support / Captain', nationality: 'Israel', countryFlag: '🇮🇱', topHeroes: [{ heroName: 'Venomancer', matchesPlayed: 6, winRate: '67%' }] },
        { nickname: 'Era', realName: 'Adrian Kryeziu', role: 'Pos 1 Carry', nationality: 'Sweden', countryFlag: '🇸🇪', topHeroes: [{ heroName: 'Lifestealer', matchesPlayed: 6, winRate: '67%' }] },
        { nickname: 'H4nn1', realName: 'Kai Hanbueckers', role: 'Pos 2 Mid', nationality: 'Germany', countryFlag: '🇩🇪', topHeroes: [{ heroName: 'Invoker', matchesPlayed: 5, winRate: '60%' }] },
        { nickname: 'Trixi', realName: 'Kalle Saarinen', role: 'Pos 3 Offlane', nationality: 'Finland', countryFlag: '🇫🇮', topHeroes: [{ heroName: 'Nature\'s Prophet', matchesPlayed: 5, winRate: '60%' }] }
      ]
    }
  ],

  TI4: [
    {
      id: 'newbee-ti4',
      name: 'Newbee',
      region: 'CN',
      placement: '1st Place - CHAMPION ($5,025,029)',
      placementRank: 1,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/6214538.png',
      successUpToPoint: 'Survived tiebreakers, then swept KeyArena with unstoppable deathball fast-push strategies.',
      roster: [
        { nickname: 'Hao', realName: 'Chen Zhihao', role: 'Pos 1 Carry', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Weaver', matchesPlayed: 8, winRate: '88%' }] },
        { nickname: 'Mu', realName: 'Zhang Pan', role: 'Pos 2 Midlaner', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Puck', matchesPlayed: 9, winRate: '89%' }] },
        { nickname: 'xiao8', realName: 'Zhang Ning', role: 'Pos 3 Offlane / Captain', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Doom', matchesPlayed: 10, winRate: '90%' }] },
        { nickname: 'Banana', realName: 'Wang Jiao', role: 'Pos 4 Support', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Mirana', matchesPlayed: 8, winRate: '88%' }] },
        { nickname: 'SanSheng', realName: 'Wang Zhao', role: 'Pos 5 Support', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Shadow Shaman', matchesPlayed: 9, winRate: '89%' }] }
      ]
    },
    {
      id: 'vg-ti4',
      name: 'Vici Gaming',
      region: 'CN',
      placement: '2nd Place - RUNNER-UP ($1,474,737)',
      placementRank: 2,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/726228.png',
      successUpToPoint: 'Pioneered early 15-minute deathball pushing with fy and Fenrir supp duo; finished 2nd.',
      roster: [
        { nickname: 'Sylar', realName: 'Liu Jiajun', role: 'Pos 1 Carry', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Lone Druid', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'Super', realName: 'Xie Junhao', role: 'Pos 2 Midlaner', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Dragon Knight', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'rOTK', realName: 'Bai Fan', role: 'Pos 3 Offlane / Captain', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Nature\'s Prophet', matchesPlayed: 9, winRate: '78%' }] },
        { nickname: 'fy', realName: 'Xu Lisen', role: 'Pos 4 Support', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Rubick', matchesPlayed: 10, winRate: '80%' }] },
        { nickname: 'Fenrir', realName: 'Lu Chao', role: 'Pos 5 Support', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Shadow Shaman', matchesPlayed: 9, winRate: '78%' }] }
      ]
    },
    {
      id: 'eg-ti4',
      name: 'Evil Geniuses',
      region: 'NA',
      placement: '3rd Place ($1,037,778)',
      placementRank: 3,
      logoUrl: 'https://cdn.steamusercontent.com/ugc/1983302387907692940/BAA861E234E1BA39D75DF4CB814A5B76D020BED7/',
      successUpToPoint: 'Breakout North American roster featuring 15-year-old Arteezy, Universe, Zai, and ppd.',
      roster: [
        { nickname: 'Mason', realName: 'Mason Venne', role: 'Pos 1 Carry', nationality: 'USA', countryFlag: '🇺🇸', topHeroes: [{ heroName: 'Mirana', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'Arteezy', realName: 'Artour Babaev', role: 'Pos 2 Midlaner', nationality: 'Canada', countryFlag: '🇨🇦', topHeroes: [{ heroName: 'Naga Siren', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'Universe', realName: 'Saahil Arora', role: 'Pos 3 Offlaner', nationality: 'USA', countryFlag: '🇺🇸', topHeroes: [{ heroName: 'Faceless Void', matchesPlayed: 9, winRate: '78%' }] },
        { nickname: 'Zai', realName: 'Ludwig Wahlberg', role: 'Pos 4 Support', nationality: 'Sweden', countryFlag: '🇸🇪', topHeroes: [{ heroName: 'Enigma', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'ppd', realName: 'Peter Dager', role: 'Pos 5 Support / Captain', nationality: 'USA', countryFlag: '🇺🇸', topHeroes: [{ heroName: 'Treed', matchesPlayed: 8, winRate: '75%' }] }
      ]
    },
    {
      id: 'c9-ti4',
      name: 'Cloud9',
      region: 'WEU',
      placement: '5th-6th Place ($655,542)',
      placementRank: 5,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/1333179.png',
      successUpToPoint: 'Beloved anime team featuring EternalEnvy, SingSing, Bone7, Aui_2000, and PIELIEDIE.',
      roster: [
        { nickname: 'EternalEnvy', realName: 'Jacky Mao', role: 'Pos 1 Carry', nationality: 'Canada', countryFlag: '🇨🇦', topHeroes: [{ heroName: 'Doom', matchesPlayed: 7, winRate: '71%' }] },
        { nickname: 'SingSing', realName: 'Wehsing Yuen', role: 'Pos 2 Mid', nationality: 'Netherlands', countryFlag: '🇳🇱', topHeroes: [{ heroName: 'Mirana', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'Bone7', realName: 'Pittner Armand', role: 'Pos 3 Offlane', nationality: 'Romania', countryFlag: '🇷🇴', topHeroes: [{ heroName: 'Clockwerk', matchesPlayed: 7, winRate: '71%' }] },
        { nickname: 'Aui_2000', realName: 'Kurtis Ling', role: 'Pos 4 Support', nationality: 'Canada', countryFlag: '🇨🇦', topHeroes: [{ heroName: 'Visage', matchesPlayed: 7, winRate: '71%' }] },
        { nickname: 'PIELIEDIE', realName: 'Johan Astrom', role: 'Pos 5 Support', nationality: 'Sweden', countryFlag: '🇸🇪', topHeroes: [{ heroName: 'Bounty Hunter', matchesPlayed: 6, winRate: '67%' }] }
      ]
    }
  ],

  TI5: [
    {
      id: 'eg-ti5',
      name: 'Evil Geniuses',
      region: 'NA',
      placement: '1st Place - CHAMPION ($6,634,661)',
      placementRank: 1,
      logoUrl: 'https://cdn.steamusercontent.com/ugc/1983302387907692940/BAA861E234E1BA39D75DF4CB814A5B76D020BED7/',
      successUpToPoint: 'First North American TI Champions; 6-Million-Dollar Echo Slam by Universe vs CDEC.',
      roster: [
        { nickname: 'Fear', realName: 'Clinton Loomis', role: 'Pos 1 Carry', nationality: 'USA', countryFlag: '🇺🇸', topHeroes: [{ heroName: 'Gyrocopter', matchesPlayed: 9, winRate: '89%' }] },
        { nickname: 'SumaiL', realName: 'Sumail Hassan', role: 'Pos 2 Midlaner', nationality: 'Pakistan', countryFlag: '🇵🇰', topHeroes: [{ heroName: 'Storm Spirit', matchesPlayed: 10, winRate: '90%' }] },
        { nickname: 'UNiVeRsE', realName: 'Saahil Arora', role: 'Pos 3 Offlaner', nationality: 'USA', countryFlag: '🇺🇸', topHeroes: [{ heroName: 'Earthshaker', matchesPlayed: 9, winRate: '89%' }] },
        { nickname: 'Aui_2000', realName: 'Kurtis Ling', role: 'Pos 4 Support', nationality: 'Canada', countryFlag: '🇨🇦', topHeroes: [{ heroName: 'Techies', matchesPlayed: 8, winRate: '88%' }] },
        { nickname: 'ppd', realName: 'Peter Dager', role: 'Pos 5 Support / Captain', nationality: 'USA', countryFlag: '🇺🇸', topHeroes: [{ heroName: 'Dazzle', matchesPlayed: 9, winRate: '89%' }] }
      ]
    },
    {
      id: 'cdec-ti5',
      name: 'CDEC Gaming',
      region: 'CN',
      placement: '2nd Place - RUNNER-UP ($2,856,590)',
      placementRank: 2,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/aegis.png',
      successUpToPoint: 'Wildcard qualifier team that shocked the world by surging undefeated to Grand Finals.',
      roster: [
        { nickname: 'Agressif', realName: 'Sun Zheng', role: 'Pos 1 Carry', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Phantom Lancer', matchesPlayed: 9, winRate: '78%' }] },
        { nickname: 'Shiki', realName: 'Huang Jiwei', role: 'Pos 2 Mid', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Lina', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'Xz', realName: 'Chen Zezhi', role: 'Pos 3 Offlane', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Bounty Hunter', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'Q', realName: 'Fu Bin', role: 'Pos 5 Support / Captain', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Visage', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'Garder', realName: 'Liu Xinzhou', role: 'Pos 4 Support', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Tusk', matchesPlayed: 8, winRate: '75%' }] }
      ]
    },
    {
      id: 'secret-ti5',
      name: 'Team Secret',
      region: 'WEU',
      placement: '7th-8th Place ($829,333)',
      placementRank: 7,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/1838315.png',
      successUpToPoint: 'All-star juggernaut featuring Arteezy, s4, zai, KuroKy, and Puppey.',
      roster: [
        { nickname: 'Arteezy', realName: 'Artour Babaev', role: 'Pos 1 Carry', nationality: 'Canada', countryFlag: '🇨🇦', topHeroes: [{ heroName: 'Shadow Fiend', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 's4', realName: 'Gustav Magnusson', role: 'Pos 2 Mid', nationality: 'Sweden', countryFlag: '🇸🇪', topHeroes: [{ heroName: 'QOP', matchesPlayed: 7, winRate: '71%' }] },
        { nickname: 'zai', realName: 'Ludwig Wahlberg', role: 'Pos 3 Offlane', nationality: 'Sweden', countryFlag: '🇸🇪', topHeroes: [{ heroName: 'Dark Seer', matchesPlayed: 7, winRate: '71%' }] },
        { nickname: 'KuroKy', realName: 'Kuro Salehi Takhasomi', role: 'Pos 4 Support', nationality: 'Germany', countryFlag: '🇩🇪', topHeroes: [{ heroName: 'Rubick', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'Puppey', realName: 'Clement Ivanov', role: 'Pos 5 Support / Captain', nationality: 'Estonia', countryFlag: '🇪🇪', topHeroes: [{ heroName: 'Dazzle', matchesPlayed: 8, winRate: '75%' }] }
      ]
    }
  ],

  TI6: [
    {
      id: 'wings-ti6',
      name: 'Wings Gaming',
      region: 'CN',
      placement: '1st Place - CHAMPION ($9,139,002)',
      placementRank: 1,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/1836806.png',
      successUpToPoint: 'Drafted 17 unique heroes in 18 games; widely considered the purest Dota team in history.',
      roster: [
        { nickname: 'shadow', realName: 'Chu Zeyu', role: 'Pos 1 Carry', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Faceless Void', matchesPlayed: 8, winRate: '88%' }] },
        { nickname: 'bLINK', realName: 'Zhou Yang', role: 'Pos 2 Midlaner', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Mirana', matchesPlayed: 9, winRate: '89%' }] },
        { nickname: 'Faith_bian', realName: 'Zhang Ruida', role: 'Pos 3 Offlaner', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Batrider', matchesPlayed: 9, winRate: '89%' }] },
        { nickname: 'iceice', realName: 'Li Peng', role: 'Pos 4 Support', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Elder Titan', matchesPlayed: 8, winRate: '88%' }] },
        { nickname: 'y`', realName: 'Zhang Yiping', role: 'Pos 5 Support / Captain', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Oracle', matchesPlayed: 9, winRate: '89%' }] }
      ]
    },
    {
      id: 'dc-ti6',
      name: 'Digital Chaos',
      region: 'NA',
      placement: '2nd Place - RUNNER-UP ($3,427,126)',
      placementRank: 2,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/aegis.png',
      successUpToPoint: 'Reject team assembled weeks before qualifiers that charged through lower bracket to 2nd place.',
      roster: [
        { nickname: 'Resolut1on', realName: 'Roman Fominok', role: 'Pos 1 Carry', nationality: 'Ukraine', countryFlag: '🇺🇦', topHeroes: [{ heroName: 'Morphling', matchesPlayed: 9, winRate: '78%' }] },
        { nickname: 'w33', realName: 'Aliwi Omar', role: 'Pos 2 Mid', nationality: 'Romania', countryFlag: '🇷🇴', topHeroes: [{ heroName: 'Invoker', matchesPlayed: 9, winRate: '78%' }] },
        { nickname: 'Moo', realName: 'David Hull', role: 'Pos 3 Offlane', nationality: 'USA', countryFlag: '🇺🇸', topHeroes: [{ heroName: 'Timber', matchesPlayed: 9, winRate: '78%' }] },
        { nickname: 'Saksa', realName: 'Martin Sazdov', role: 'Pos 4 Support', nationality: 'North Macedonia', countryFlag: '🇲🇰', topHeroes: [{ heroName: 'Mirana', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'Misery', realName: 'Rasmus Filipsen', role: 'Pos 5 Support / Captain', nationality: 'Denmark', countryFlag: '🇩🇰', topHeroes: [{ heroName: 'Bounty Hunter', matchesPlayed: 8, winRate: '75%' }] }
      ]
    },
    {
      id: 'og-ti6',
      name: 'OG',
      region: 'WEU',
      placement: '9th-12th Place ($311,557)',
      placementRank: 9,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/2586976.png',
      successUpToPoint: '2x Major Champions (Frankfurt & Manila); fell victim to TNC in the biggest upset in TI history.',
      roster: [
        { nickname: 'N0tail', realName: 'Johan Sundstein', role: 'Pos 1 Carry', nationality: 'Denmark', countryFlag: '🇩🇰', topHeroes: [{ heroName: 'Drow Ranger', matchesPlayed: 6, winRate: '67%' }] },
        { nickname: 'Miracle-', realName: 'Amer Al-Barkawi', role: 'Pos 2 Mid', nationality: 'Jordan', countryFlag: '🇯🇴', topHeroes: [{ heroName: 'Invoker', matchesPlayed: 7, winRate: '71%' }] },
        { nickname: 'MoonMeander', realName: 'David Tan', role: 'Pos 3 Offlane', nationality: 'Canada', countryFlag: '🇨🇦', topHeroes: [{ heroName: 'Batrider', matchesPlayed: 6, winRate: '67%' }] },
        { nickname: 'Cr1t-', realName: 'Andreas Nielsen', role: 'Pos 4 Support', nationality: 'Denmark', countryFlag: '🇩🇰', topHeroes: [{ heroName: 'Elder Titan', matchesPlayed: 6, winRate: '67%' }] },
        { nickname: 'Fly', realName: 'Tal Aizik', role: 'Pos 5 Support / Captain', nationality: 'Israel', countryFlag: '🇮🇱', topHeroes: [{ heroName: 'Dazzle', matchesPlayed: 6, winRate: '67%' }] }
      ]
    }
  ],

  TI7: [
    {
      id: 'liquid-ti7',
      name: 'Team Liquid',
      region: 'WEU',
      placement: '1st Place - CHAMPION ($10,862,683)',
      placementRank: 1,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/2163.png',
      successUpToPoint: 'First 3-0 Grand Final sweep in TI history; GH\'s Keeper of the Light and Miracle- KotL/Rubick god mode.',
      roster: [
        { nickname: 'MATUMBAMAN', realName: 'Lasse Urpalainen', role: 'Pos 1 Carry', nationality: 'Finland', countryFlag: '🇫🇮', topHeroes: [{ heroName: 'Necrophos', matchesPlayed: 9, winRate: '89%' }] },
        { nickname: 'Miracle-', realName: 'Amer Al-Barkawi', role: 'Pos 2 Midlaner', nationality: 'Jordan', countryFlag: '🇯🇴', topHeroes: [{ heroName: 'Invoker', matchesPlayed: 10, winRate: '90%' }] },
        { nickname: 'Mind_Control', realName: 'Ivan Ivanov', role: 'Pos 3 Offlaner', nationality: 'Bulgaria', countryFlag: '🇧🇬', topHeroes: [{ heroName: 'Nature\'s Prophet', matchesPlayed: 9, winRate: '89%' }] },
        { nickname: 'GH', realName: 'Maroun Merhej', role: 'Pos 4 Support', nationality: 'Lebanon', countryFlag: '🇱🇧', topHeroes: [{ heroName: 'Keeper of the Light', matchesPlayed: 10, winRate: '90%' }] },
        { nickname: 'KuroKy', realName: 'Kuro Salehi Takhasomi', role: 'Pos 5 Support / Captain', nationality: 'Germany', countryFlag: '🇩🇪', topHeroes: [{ heroName: 'Lich', matchesPlayed: 9, winRate: '89%' }] }
      ]
    },
    {
      id: 'newbee-ti7',
      name: 'Newbee',
      region: 'CN',
      placement: '2nd Place - RUNNER-UP ($3,950,067)',
      placementRank: 2,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/6214538.png',
      successUpToPoint: 'Chinese titans starring Sccc and Moogy; reached Grand Finals undefeated from Upper Bracket.',
      roster: [
        { nickname: 'Moogy', realName: 'Xu Han', role: 'Pos 1 Carry', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Sven', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'Sccc', realName: 'Song Chun', role: 'Pos 2 Mid', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Queen of Pain', matchesPlayed: 9, winRate: '78%' }] },
        { nickname: 'kpii', realName: 'Damien Chok', role: 'Pos 3 Offlane', nationality: 'Australia', countryFlag: '🇦🇺', topHeroes: [{ heroName: 'Naga Siren', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'Kaka', realName: 'Hu Liangzhi', role: 'Pos 4 Support', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Sand King', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'Faith', realName: 'Zeng Hongda', role: 'Pos 5 Support / Captain', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Ancient Apparition', matchesPlayed: 8, winRate: '75%' }] }
      ]
    }
  ],

  TI8: [
    {
      id: 'og-ti8',
      name: 'OG',
      region: 'WEU',
      placement: '1st Place - CHAMPION ($11,234,158)',
      placementRank: 1,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/2586976.png',
      successUpToPoint: 'Cinderella story of all time; open qualifier roster featuring Topson & Ceb won TI8.',
      roster: [
        { nickname: 'ana', realName: 'Anathan Pham', role: 'Pos 1 Carry', nationality: 'Australia', countryFlag: '🇦🇺', topHeroes: [{ heroName: 'Spectre', matchesPlayed: 9, winRate: '89%' }] },
        { nickname: 'Topson', realName: 'Topias Taavitsainen', role: 'Pos 2 Midlaner', nationality: 'Finland', countryFlag: '🇫🇮', topHeroes: [{ heroName: 'Monkey King', matchesPlayed: 10, winRate: '90%' }] },
        { nickname: 'Ceb', realName: 'Sebastien Debs', role: 'Pos 3 Offlaner', nationality: 'France', countryFlag: '🇫🇷', topHeroes: [{ heroName: 'Axe', matchesPlayed: 9, winRate: '89%' }] },
        { nickname: 'JerAx', realName: 'Jesse Vainikka', role: 'Pos 4 Support', nationality: 'Finland', countryFlag: '🇫🇮', topHeroes: [{ heroName: 'Earth Spirit', matchesPlayed: 10, winRate: '90%' }] },
        { nickname: 'N0tail', realName: 'Johan Sundstein', role: 'Pos 5 Support / Captain', nationality: 'Denmark', countryFlag: '🇩🇰', topHeroes: [{ heroName: 'Nature\'s Prophet', matchesPlayed: 9, winRate: '89%' }] }
      ]
    },
    {
      id: 'psglgd-ti8',
      name: 'PSG.LGD',
      region: 'CN',
      placement: '2nd Place - RUNNER-UP ($4,085,148)',
      placementRank: 2,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/15.png',
      successUpToPoint: 'Epic Chinese juggernaut starring Ame, Somnus, Chalice, fy, and xNova.',
      roster: [
        { nickname: 'Ame', realName: 'Wang Chunyu', role: 'Pos 1 Carry', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Morphling', matchesPlayed: 9, winRate: '78%' }] },
        { nickname: 'Somnus`M', realName: 'Lu Yao', role: 'Pos 2 Mid', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Storm Spirit', matchesPlayed: 9, winRate: '78%' }] },
        { nickname: 'Chalice', realName: 'Yang Shenyi', role: 'Pos 3 Offlane', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Enchantress', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'fy', realName: 'Xu Lisen', role: 'Pos 4 Support', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Tusk', matchesPlayed: 10, winRate: '80%' }] },
        { nickname: 'xNova', realName: 'Yap Jian Wei', role: 'Pos 5 Support', nationality: 'Malaysia', countryFlag: '🇲🇾', topHeroes: [{ heroName: 'Bane', matchesPlayed: 9, winRate: '78%' }] }
      ]
    }
  ],

  TI9: [
    {
      id: 'og-ti9',
      name: 'OG',
      region: 'WEU',
      placement: '1st Place - CHAMPION ($15,620,181)',
      placementRank: 1,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/2586976.png',
      successUpToPoint: 'First back-to-back TI champions in history; pioneer Carry Io and speedrun victory.',
      roster: [
        { nickname: 'ana', realName: 'Anathan Pham', role: 'Pos 1 Carry', nationality: 'Australia', countryFlag: '🇦🇺', topHeroes: [{ heroName: 'Io (Wisp)', matchesPlayed: 6, winRate: '100%' }] },
        { nickname: 'Topson', realName: 'Topias Taavitsainen', role: 'Pos 2 Midlaner', nationality: 'Finland', countryFlag: '🇫🇮', topHeroes: [{ heroName: 'Gyrocopter', matchesPlayed: 8, winRate: '88%' }] },
        { nickname: 'Ceb', realName: 'Sebastien Debs', role: 'Pos 3 Offlaner', nationality: 'France', countryFlag: '🇫🇷', topHeroes: [{ heroName: 'Enchantress', matchesPlayed: 8, winRate: '88%' }] },
        { nickname: 'JerAx', realName: 'Jesse Vainikka', role: 'Pos 4 Support', nationality: 'Finland', countryFlag: '🇫🇮', topHeroes: [{ heroName: 'Tiny', matchesPlayed: 9, winRate: '89%' }] },
        { nickname: 'N0tail', realName: 'Johan Sundstein', role: 'Pos 5 Support / Captain', nationality: 'Denmark', countryFlag: '🇩🇰', topHeroes: [{ heroName: 'Elder Titan', matchesPlayed: 8, winRate: '88%' }] }
      ]
    },
    {
      id: 'liquid-ti9',
      name: 'Team Liquid',
      region: 'WEU',
      placement: '2nd Place - RUNNER-UP ($4,462,908)',
      placementRank: 2,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/2163.png',
      successUpToPoint: 'Lower bracket run from 1st round all the way to Grand Finals with w33 mid.',
      roster: [
        { nickname: 'Miracle-', realName: 'Amer Al-Barkawi', role: 'Pos 1 Carry', nationality: 'Jordan', countryFlag: '🇯🇴', topHeroes: [{ heroName: 'Morphling', matchesPlayed: 9, winRate: '78%' }] },
        { nickname: 'w33', realName: 'Aliwi Omar', role: 'Pos 2 Mid', nationality: 'Romania', countryFlag: '🇷🇴', topHeroes: [{ heroName: 'Meepo', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'Mind_Control', realName: 'Ivan Ivanov', role: 'Pos 3 Offlane', nationality: 'Bulgaria', countryFlag: '🇧🇬', topHeroes: [{ heroName: 'Tidehunter', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'GH', realName: 'Maroun Merhej', role: 'Pos 4 Support', nationality: 'Lebanon', countryFlag: '🇱🇧', topHeroes: [{ heroName: 'Rubick', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'KuroKy', realName: 'Kuro Salehi Takhasomi', role: 'Pos 5 Support / Captain', nationality: 'Germany', countryFlag: '🇩🇪', topHeroes: [{ heroName: 'Chen', matchesPlayed: 8, winRate: '75%' }] }
      ]
    }
  ],

  TI10: [
    {
      id: 'spirit-ti10',
      name: 'Team Spirit',
      region: 'EEU',
      placement: '1st Place - CHAMPION ($18,208,300)',
      placementRank: 1,
      logoUrl: 'https://cdn.steamusercontent.com/ugc/1839179120711951766/CD7E0885CB527334205CC7885E9C101B7BC17702/',
      successUpToPoint: 'Underdog Eastern European qualifiers; TORONTOTOKYO & Collapse destroyed LB giants to take $18.2M.',
      roster: [
        { nickname: 'Yatoro', realName: 'Ilya Mulyarchuk', role: 'Pos 1 Carry', nationality: 'Ukraine', countryFlag: '🇺🇦', topHeroes: [{ heroName: 'Morphling', matchesPlayed: 7, winRate: '86%' }] },
        { nickname: 'TORONTOTOKYO', realName: 'Alexander Khertek', role: 'Pos 2 Midlaner', nationality: 'Russia', countryFlag: '🇷🇺', topHeroes: [{ heroName: 'Void Spirit', matchesPlayed: 8, winRate: '88%' }] },
        { nickname: 'Collapse', realName: 'Magomed Khalilov', role: 'Pos 3 Offlaner', nationality: 'Russia', countryFlag: '🇷🇺', topHeroes: [{ heroName: 'Magnus', matchesPlayed: 10, winRate: '90%' }] },
        { nickname: 'Mira', realName: 'Miroslaw Kolpakov', role: 'Pos 4 Support', nationality: 'Ukraine', countryFlag: '🇺🇦', topHeroes: [{ heroName: 'Rubick', matchesPlayed: 8, winRate: '88%' }] },
        { nickname: 'Miposhka', realName: 'Yaroslav Naidenov', role: 'Pos 5 Support / Captain', nationality: 'Russia', countryFlag: '🇷🇺', topHeroes: [{ heroName: 'Bane', matchesPlayed: 8, winRate: '88%' }] }
      ]
    },
    {
      id: 'psglgd-ti10',
      name: 'PSG.LGD',
      region: 'CN',
      placement: '2nd Place - RUNNER-UP ($5,202,400)',
      placementRank: 2,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/15.png',
      successUpToPoint: 'Dominant tournament favorites led by Ame and Faith_bian.',
      roster: [
        { nickname: 'Ame', realName: 'Wang Chunyu', role: 'Pos 1 Carry', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Tiny', matchesPlayed: 8, winRate: '88%' }] },
        { nickname: 'NothingToSay', realName: 'Cheng Jin Xiang', role: 'Pos 2 Mid', nationality: 'Malaysia', countryFlag: '🇲🇾', topHeroes: [{ heroName: 'Tinker', matchesPlayed: 8, winRate: '88%' }] },
        { nickname: 'Faith_bian', realName: 'Zhang Ruida', role: 'Pos 3 Offlane', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Magnus', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'XinQ', realName: 'Zhao Zixing', role: 'Pos 4 Support', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Pangolier', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'y`', realName: 'Zhang Yiping', role: 'Pos 5 Support / Captain', nationality: 'China', countryFlag: '🇨🇳', topHeroes: [{ heroName: 'Elder Titan', matchesPlayed: 8, winRate: '75%' }] }
      ]
    }
  ],

  TI11: [
    {
      id: 'tundra-ti11',
      name: 'Tundra Esports',
      region: 'WEU',
      placement: '1st Place - CHAMPION ($8,518,822)',
      placementRank: 1,
      logoUrl: 'https://cdn.steamusercontent.com/ugc/2031716132171967904/07B168B8063D9B22CDAD53AB421ECAF3D4B2E07E/',
      successUpToPoint: 'Unstoppable 33 Wraith Pact meta innovation; lost only 1 game in entire main stage.',
      roster: [
        { nickname: 'skiter', realName: 'Oliver Lepko', role: 'Pos 1 Carry', nationality: 'Slovakia', countryFlag: '🇸🇰', topHeroes: [{ heroName: 'Naga Siren', matchesPlayed: 8, winRate: '88%' }] },
        { nickname: 'Nine', realName: 'Leon Kirilin', role: 'Pos 2 Midlaner', nationality: 'Germany', countryFlag: '🇩🇪', topHeroes: [{ heroName: 'Tusk Mid', matchesPlayed: 7, winRate: '86%' }] },
        { nickname: '33', realName: 'Neta Shapira', role: 'Pos 3 Offlaner', nationality: 'Israel', countryFlag: '🇮🇱', topHeroes: [{ heroName: 'Doom', matchesPlayed: 9, winRate: '89%' }] },
        { nickname: 'Saksa', realName: 'Martin Sazdov', role: 'Pos 4 Support', nationality: 'North Macedonia', countryFlag: '🇲🇰', topHeroes: [{ heroName: 'Tiny', matchesPlayed: 8, winRate: '88%' }] },
        { nickname: 'Sneyking', realName: 'Jingjun Wu', role: 'Pos 5 Support / Captain', nationality: 'USA', countryFlag: '🇺🇸', topHeroes: [{ heroName: 'Mirana', matchesPlayed: 9, winRate: '89%' }] }
      ]
    },
    {
      id: 'secret-ti11',
      name: 'Team Secret',
      region: 'WEU',
      placement: '2nd Place - RUNNER-UP ($2,461,033)',
      placementRank: 2,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/1838315.png',
      successUpToPoint: 'Last Chance Qualifier miracle run led by Nisha and Puppey.',
      roster: [
        { nickname: 'Crystallis', realName: 'Remco Arets', role: 'Pos 1 Carry', nationality: 'Netherlands', countryFlag: '🇳🇱', topHeroes: [{ heroName: 'Sniper', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'Nisha', realName: 'Michal Jankowski', role: 'Pos 2 Mid', nationality: 'Poland', countryFlag: '🇵🇱', topHeroes: [{ heroName: 'Leshrac', matchesPlayed: 9, winRate: '78%' }] },
        { nickname: 'Resolut1on', realName: 'Roman Fominok', role: 'Pos 3 Offlane', nationality: 'Ukraine', countryFlag: '🇺🇦', topHeroes: [{ heroName: 'Marci', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'Zayac', realName: 'Baqyt Emiljanov', role: 'Pos 4 Support', nationality: 'Kyrgyzstan', countryFlag: '🇰🇬', topHeroes: [{ heroName: 'Nyx', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'Puppey', realName: 'Clement Ivanov', role: 'Pos 5 Support / Captain', nationality: 'Estonia', countryFlag: '🇪🇪', topHeroes: [{ heroName: 'Crystal Maiden', matchesPlayed: 8, winRate: '75%' }] }
      ]
    }
  ],

  TI12: [
    {
      id: 'spirit-ti12',
      name: 'Team Spirit',
      region: 'EEU',
      placement: '1st Place - CHAMPION ($1,521,362)',
      placementRank: 1,
      logoUrl: 'https://cdn.steamusercontent.com/ugc/1839179120711951766/CD7E0885CB527334205CC7885E9C101B7BC17702/',
      successUpToPoint: 'Became 2x TI Champions in Seattle; Yatoro & Larl swept Gaimin Gladiators in Grand Finals.',
      roster: [
        { nickname: 'Yatoro', realName: 'Ilya Mulyarchuk', role: 'Pos 1 Carry', nationality: 'Ukraine', countryFlag: '🇺🇦', topHeroes: [{ heroName: 'Faceless Void', matchesPlayed: 8, winRate: '88%' }] },
        { nickname: 'Larl', realName: 'Denis Sigitov', role: 'Pos 2 Midlaner', nationality: 'Russia', countryFlag: '🇷🇺', topHeroes: [{ heroName: 'Pangolier', matchesPlayed: 8, winRate: '88%' }] },
        { nickname: 'Collapse', realName: 'Magomed Khalilov', role: 'Pos 3 Offlaner', nationality: 'Russia', countryFlag: '🇷🇺', topHeroes: [{ heroName: 'Spirit Breaker', matchesPlayed: 9, winRate: '89%' }] },
        { nickname: 'Mira', realName: 'Miroslaw Kolpakov', role: 'Pos 4 Support', nationality: 'Ukraine', countryFlag: '🇺🇦', topHeroes: [{ heroName: 'Muerta', matchesPlayed: 8, winRate: '88%' }] },
        { nickname: 'Miposhka', realName: 'Yaroslav Naidenov', role: 'Pos 5 Support / Captain', nationality: 'Russia', countryFlag: '🇷🇺', topHeroes: [{ heroName: 'Enchantress', matchesPlayed: 8, winRate: '88%' }] }
      ]
    },
    {
      id: 'gg-ti12',
      name: 'Gaimin Gladiators',
      region: 'WEU',
      placement: '2nd Place - RUNNER-UP ($377,222)',
      placementRank: 2,
      logoUrl: 'https://cdn.steamusercontent.com/ugc/1850419664501191993/5DAAB68FB5604D29E1792A0F35E74B3FE3F3A026/',
      successUpToPoint: 'Won all 3 DPC Majors in 2023 (Lima, Berlin, Bali); fought through LB to reach Grand Finals.',
      roster: [
        { nickname: 'dyrachyo', realName: 'Anton Shkredov', role: 'Pos 1 Carry', nationality: 'Russia', countryFlag: '🇷🇺', topHeroes: [{ heroName: 'Weaver', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'Quinn', realName: 'Quinn Callahan', role: 'Pos 2 Mid', nationality: 'USA', countryFlag: '🇺🇸', topHeroes: [{ heroName: 'Pangolier', matchesPlayed: 9, winRate: '78%' }] },
        { nickname: 'Ace', realName: 'Marcus Hoelgaard', role: 'Pos 3 Offlane', nationality: 'Denmark', countryFlag: '🇩🇰', topHeroes: [{ heroName: 'Lone Druid', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'tOFu', realName: 'Erik Engel', role: 'Pos 4 Support', nationality: 'Germany', countryFlag: '🇩🇪', topHeroes: [{ heroName: 'Muerta', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'Seleri', realName: 'Melchior Hillenkamp', role: 'Pos 5 Support / Captain', nationality: 'Netherlands', countryFlag: '🇳🇱', topHeroes: [{ heroName: 'Chen', matchesPlayed: 8, winRate: '75%' }] }
      ]
    }
  ],

  TI13: [
    {
      id: 'liquid-ti13',
      name: 'Team Liquid',
      region: 'WEU',
      placement: '1st Place - CHAMPION ($1,167,000)',
      placementRank: 1,
      logoUrl: 'https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/2163.png',
      successUpToPoint: 'Dominant 3-0 Grand Final sweep in Copenhagen; 33 became 2x TI Champion.',
      roster: [
        { nickname: 'miCKe', realName: 'Michael Vu', role: 'Pos 1 Carry', nationality: 'Sweden', countryFlag: '🇸🇪', topHeroes: [{ heroName: 'Natives', matchesPlayed: 8, winRate: '88%' }] },
        { nickname: 'Nisha', realName: 'Michal Jankowski', role: 'Pos 2 Midlaner', nationality: 'Poland', countryFlag: '🇵🇱', topHeroes: [{ heroName: 'Puck', matchesPlayed: 8, winRate: '88%' }] },
        { nickname: '33', realName: 'Neta Shapira', role: 'Pos 3 Offlaner / Captain', nationality: 'Israel', countryFlag: '🇮🇱', topHeroes: [{ heroName: 'Visage', matchesPlayed: 9, winRate: '89%' }] },
        { nickname: 'Boxi', realName: 'Samuel Svahn', role: 'Pos 4 Support', nationality: 'Sweden', countryFlag: '🇸🇪', topHeroes: [{ heroName: 'Tusk', matchesPlayed: 8, winRate: '88%' }] },
        { nickname: 'iNSaNiA', realName: 'Aydin Sarkohi', role: 'Pos 5 Support', nationality: 'Sweden', countryFlag: '🇸🇪', topHeroes: [{ heroName: 'Clockwerk', matchesPlayed: 8, winRate: '88%' }] }
      ]
    },
    {
      id: 'gg-ti13',
      name: 'Gaimin Gladiators',
      region: 'WEU',
      placement: '2nd Place - RUNNER-UP ($360,000)',
      placementRank: 2,
      logoUrl: 'https://cdn.steamusercontent.com/ugc/1850419664501191993/5DAAB68FB5604D29E1792A0F35E74B3FE3F3A026/',
      successUpToPoint: 'Back-to-back TI Grand Finals appearances in 2023 and 2024.',
      roster: [
        { nickname: 'dyrachyo', realName: 'Anton Shkredov', role: 'Pos 1 Carry', nationality: 'Russia', countryFlag: '🇷🇺', topHeroes: [{ heroName: 'Alchemist', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'Quinn', realName: 'Quinn Callahan', role: 'Pos 2 Mid', nationality: 'USA', countryFlag: '🇺🇸', topHeroes: [{ heroName: 'Pangolier', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'Ace', realName: 'Marcus Hoelgaard', role: 'Pos 3 Offlane', nationality: 'Denmark', countryFlag: '🇩🇰', topHeroes: [{ heroName: 'Underlord', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'tOFu', realName: 'Erik Engel', role: 'Pos 4 Support', nationality: 'Germany', countryFlag: '🇩🇪', topHeroes: [{ heroName: 'Hoodwink', matchesPlayed: 8, winRate: '75%' }] },
        { nickname: 'Seleri', realName: 'Melchior Hillenkamp', role: 'Pos 5 Support / Captain', nationality: 'Netherlands', countryFlag: '🇳🇱', topHeroes: [{ heroName: 'Chen', matchesPlayed: 8, winRate: '75%' }] }
      ]
    }
  ]
};

// Fallback dynamic generator to ensure 16-20 teams for ANY TI year
export function getTIAllTeams(tiId: TIVersionId): TITeamProfile[] {
  const existing = tiTeamsDataRecord[tiId] || [];

  // Complete era teams mapping for all TI editions (TI1 - TI13)
  const eraTeamsMap: Record<TIVersionId, { name: string; region: 'WEU'|'EEU'|'CN'|'SEA'|'NA'|'SA'; rank: number; logo?: string; carry: string; mid: string; offlane: string; softSupp: string; hardSupp: string }[]> = {
    TI1: [
      { name: 'Natus Vincere', region: 'EEU', rank: 1, carry: 'XBOCT', mid: 'Dendi', offlane: 'LightTofHeavEn', softSupp: 'Puppey', hardSupp: 'Artstyle' },
      { name: 'EHOME', region: 'CN', rank: 2, carry: '820', mid: 'DDC', offlane: '357', softSupp: 'PCT', hardSupp: 'X**' },
      { name: 'Scythe.SG', region: 'SEA', rank: 3, carry: 'hyhy', mid: 'xy-', offlane: 'Roy', softSupp: 'Sharky', hardSupp: 'tofu' },
      { name: 'OK.Nirvana.Int', region: 'WEU', rank: 4, carry: 'Fear', mid: 'Pajkatt', offlane: 'Lacoste', softSupp: '1437', hardSupp: 'ComeWithMe' },
      { name: 'Moscow Five', region: 'EEU', rank: 5, carry: 'Santa', mid: 'God', offlane: 'NS', softSupp: 'Dread', hardSupp: 'PGG' },
      { name: 'Invictus Gaming', region: 'CN', rank: 5, carry: 'Zhou', mid: 'Ferrari_430', offlane: 'YYF', softSupp: 'ChuaN', hardSupp: 'Faith' }
    ],
    TI2: [
      { name: 'Mousesports', region: 'WEU', rank: 9, carry: 'Black^', mid: 'SingSing', offlane: 'Bamboe', softSupp: 'KuroKy', hardSupp: 'Alex' },
      { name: 'Team Darer', region: 'EEU', rank: 13, carry: 'Artstyle', mid: 'God', offlane: 'Santa', softSupp: 'Goblak', hardSupp: 'Funn1k' },
      { name: 'Moscow Five', region: 'EEU', rank: 13, carry: 'Vigoss', mid: 'PGG', offlane: 'BloodAngel', softSupp: 'Admiration', hardSupp: 'Inmate' },
      { name: 'TongFu', region: 'CN', rank: 7, carry: 'Hao', mid: 'Mu', offlane: 'SanSheng', softSupp: 'Awoke', hardSupp: 'ZSMJ' },
      { name: 'CLG', region: 'WEU', rank: 9, carry: 'Loda', mid: 'Pajkatt', offlane: 'Misery', softSupp: 'Akke', hardSupp: 'Miracle' },
      { name: 'EHOME', region: 'CN', rank: 5, carry: 'LaNm', mid: '820', offlane: 'KingJ', softSupp: 'QQQ', hardSupp: 'PCT' },
      { name: 'Absolute Legends', region: 'SEA', rank: 13, carry: 'Musica', mid: 'SSS', offlane: 'Godot', softSupp: 'rmn', hardSupp: 'bALLOON' }
    ],
    TI3: [
      { name: 'Team DK', region: 'CN', rank: 5, carry: 'Burning', mid: 'Super', offlane: 'rOTK', softSupp: 'QQQ', hardSupp: '357' },
      { name: 'Invictus Gaming', region: 'CN', rank: 5, carry: 'Zhou', mid: 'Ferrari_430', offlane: 'YYF', softSupp: 'ChuaN', hardSupp: 'Faith' },
      { name: 'LGD Gaming', region: 'CN', rank: 9, carry: 'Sylar', mid: 'Yao', offlane: 'xiao8', softSupp: 'DD', hardSupp: 'ddc' },
      { name: 'Zenith', region: 'SEA', rank: 9, carry: 'YamateH', mid: 'iceiceice', offlane: 'xFreedom', softSupp: 'xy-', hardSupp: 'Freedom' },
      { name: 'Virtus.pro', region: 'EEU', rank: 13, carry: 'Illidan', mid: 'Krazy', offlane: 'NS', softSupp: 'KSi', hardSupp: 'Smile' },
      { name: 'Dignitas', region: 'NA', rank: 9, carry: 'Aui_2000', mid: 'Sneyking', offlane: 'WAYTOSHEXY', softSupp: 'Fogged', hardSupp: 'Universe' },
      { name: 'MUFC', region: 'SEA', rank: 13, carry: 'Winter', mid: 'TNC', offlane: 'dabeliuteef', softSupp: 'FzFz', hardSupp: 'Ling' },
      { name: 'Mousesports', region: 'WEU', rank: 13, carry: 'Black^', mid: 'qojqva', offlane: 'FATA-', softSupp: 'PaS', hardSupp: 'syndereN' },
      { name: 'LGD.int', region: 'CN', rank: 9, carry: 'Pajkatt', mid: 'Misery', offlane: 'Brax', softSupp: '1437', hardSupp: 'God' },
      { name: 'Rattlesnake', region: 'CN', rank: 13, carry: 'Luo', mid: 'Lanm', offlane: 'Kabu', softSupp: 'Icy', hardSupp: 'Sag' }
    ],
    TI4: [
      { name: 'Team DK', region: 'CN', rank: 4, carry: 'Burning', mid: 'Mushi', offlane: 'iceiceice', softSupp: 'LaNm', hardSupp: 'MMY!' },
      { name: 'LGD Gaming', region: 'CN', rank: 5, carry: 'Rabbit', mid: 'Lin', offlane: 'Yao', softSupp: 'DD', hardSupp: 'ddc' },
      { name: 'Natus Vincere', region: 'EEU', rank: 7, carry: 'XBOCT', mid: 'Dendi', offlane: 'Funn1k', softSupp: 'KuroKy', hardSupp: 'Puppey' },
      { name: 'Invictus Gaming', region: 'CN', rank: 7, carry: 'LuO', mid: 'Ferrari_430', offlane: 'YYF', softSupp: 'ChuaN', hardSupp: 'Faith' },
      { name: 'Titan Esports', region: 'SEA', rank: 9, carry: 'KyXY', mid: 'YamateH', offlane: 'OhAiYo', softSupp: 'Net', hardSupp: 'Xtinct' },
      { name: 'Team Liquid', region: 'NA', rank: 9, carry: 'TC', mid: 'qojqva', offlane: 'BULBA', softSupp: 'WAYTOSHEXY', hardSupp: 'DeMoN' },
      { name: 'Alliance', region: 'WEU', rank: 11, carry: 'Loda', mid: 's4', offlane: 'AdmiralBulldog', softSupp: 'EGM', hardSupp: 'Akke' },
      { name: 'Team Empire', region: 'EEU', rank: 13, carry: 'Silent', mid: 'Resolut1on', offlane: 'MAG', softSupp: 'Vanskor', hardSupp: 'ALWAYSWANNAFLY' },
      { name: 'Fnatic', region: 'WEU', rank: 13, carry: 'Era', mid: 'H4nn1', offlane: 'Trixi', softSupp: 'n0tail', hardSupp: 'Fly' },
      { name: 'Arrow Gaming', region: 'SEA', rank: 13, carry: 'DDZ', mid: 'Lance', offlane: 'Mozi', softSupp: 'Xiangzai', hardSupp: 'Mushi' },
      { name: 'Mousesports', region: 'WEU', rank: 11, carry: 'MSS', mid: 'FATA-', offlane: 'paS', softSupp: 'Misery', hardSupp: 'Pajkatt' },
      { name: 'MVP Phoenix', region: 'SEA', rank: 13, carry: 'March', mid: 'QO', offlane: 'Forev', softSupp: 'Febby', hardSupp: 'Heen' },
      { name: 'Na\'Vi.US', region: 'NA', rank: 13, carry: 'Sneyking', mid: 'Korok', offlane: 'Brax', softSupp: 'Fogged', hardSupp: 'Wayto' }
    ],
    TI5: [
      { name: 'LGD Gaming', region: 'CN', rank: 3, carry: 'Sylar', mid: 'Maybe', offlane: 'xiao8', softSupp: 'MMY!', hardSupp: 'Yao' },
      { name: 'Virtus.pro', region: 'EEU', rank: 5, carry: 'Illidan', mid: 'God', offlane: 'DKphobos', softSupp: 'Lil', hardSupp: 'fng' },
      { name: 'Vici Gaming', region: 'CN', rank: 4, carry: 'Hao', mid: 'Super', offlane: 'iceiceice', softSupp: 'fy', hardSupp: 'Fenrir' },
      { name: 'EHOME', region: 'CN', rank: 5, carry: 'Cty', mid: 'Zyf', offlane: 'rOTK', softSupp: 'LaNm', hardSupp: 'ddc' },
      { name: 'compLexity Gaming', region: 'NA', rank: 9, carry: 'Zyzzy', mid: 'Swindlezz', offlane: 'Moo', softSupp: 'Zfreek', hardSupp: 'Fly' },
      { name: 'MVP Phoenix', region: 'SEA', rank: 7, carry: 'kpii', mid: 'QO', offlane: 'March', softSupp: 'Febby', hardSupp: 'Nutz' },
      { name: 'Cloud9', region: 'WEU', rank: 9, carry: 'EternalEnvy', mid: 'Fata', offlane: 'Bone7', softSupp: 'Misery', hardSupp: 'N0tail' },
      { name: 'Team Empire', region: 'EEU', rank: 9, carry: 'Silent', mid: 'Resolut1on', offlane: 'Yoky', softSupp: 'ALOHADANCE', hardSupp: 'ALWAYSWANNAFLY' },
      { name: 'Invictus Gaming', region: 'CN', rank: 9, carry: 'Burning', mid: '430', offlane: 'LuO', softSupp: 'ChuaN', hardSupp: 'Faith' },
      { name: 'Fnatic', region: 'SEA', rank: 13, carry: 'KyXY', mid: 'Mushi', offlane: 'OhAiYo', softSupp: 'kecik imba', hardSupp: 'JoHnNy' },
      { name: 'Natus Vincere', region: 'EEU', rank: 13, carry: 'XBOCT', mid: 'Dendi', offlane: 'Funn1k', softSupp: 'Sonneiko', hardSupp: 'Artstyle' },
      { name: 'MVP HOT6ix', region: 'SEA', rank: 13, carry: 'MP', mid: 'Forev', offlane: 'SunBhie', softSupp: 'Heen', hardSupp: 'JerAx' },
      { name: 'Newbee', region: 'CN', rank: 13, carry: 'Rabbit', mid: 'Mu', offlane: 'June', softSupp: 'Banana', hardSupp: 'SanSheng' }
    ],
    TI6: [
      { name: 'Evil Geniuses', region: 'NA', rank: 3, carry: 'Aui_2000', mid: 'SumaiL', offlane: 'UNiVeRsE', softSupp: 'Zai', hardSupp: 'ppd' },
      { name: 'Fnatic', region: 'SEA', rank: 4, carry: 'Mushi', mid: 'MidOne', offlane: 'OhAiYo', softSupp: 'DJ', hardSupp: '343' },
      { name: 'EHOME', region: 'CN', rank: 5, carry: 'iceiceice', mid: 'old chicken', offlane: 'eLeVeN', softSupp: 'LaNm', hardSupp: 'Fenrir' },
      { name: 'MVP Phoenix', region: 'SEA', rank: 5, carry: 'MP', mid: 'QO', offlane: 'Forev', softSupp: 'Febby', hardSupp: 'DuBu' },
      { name: 'Team Liquid', region: 'WEU', rank: 7, carry: 'MATUMBAMAN', mid: 'Fata', offlane: 'Mind_Control', softSupp: 'JerAx', hardSupp: 'KuroKy' },
      { name: 'TNC Gaming', region: 'SEA', rank: 7, carry: 'Raven', mid: 'Kuku', offlane: 'Sam_H', softSupp: 'Eyyou', hardSupp: 'Demon' },
      { name: 'Alliance', region: 'WEU', rank: 9, carry: 'Loda', mid: 's4', offlane: 'AdmiralBulldog', softSupp: 'EGM', hardSupp: 'Akke' },
      { name: 'Natus Vincere', region: 'EEU', rank: 9, carry: 'Ditte', mid: 'Dendi', offlane: 'General', softSupp: 'SoNNeikO', hardSupp: 'Artstyle' },
      { name: 'LGD Gaming', region: 'CN', rank: 9, carry: 'Ame', mid: 'Maybe', offlane: 'Xiao8', softSupp: 'Agressif', hardSupp: 'MMY!' },
      { name: 'Team Secret', region: 'WEU', rank: 13, carry: 'MP', mid: 'MidOne', offlane: 'KheZu', softSupp: 'Puppey', hardSupp: 'PLD' },
      { name: 'Vici Gaming Reborn', region: 'CN', rank: 13, carry: 'Zyf', mid: 'Nono', offlane: 'Yang', softSupp: 'fy', hardSupp: 'ddc' },
      { name: 'Escape Gaming', region: 'WEU', rank: 13, carry: 'qojqva', mid: 'Limmp', offlane: 'KheZu', softSupp: 'YapzOr', hardSupp: 'SyndereN' },
      { name: 'Execration', region: 'SEA', rank: 13, carry: 'Abed', mid: 'Nando', offlane: 'Rarity', softSupp: 'Timothy', hardSupp: 'Kim0' }
    ],
    TI7: [
      { name: 'LGD Forever Young', region: 'CN', rank: 3, carry: 'Monet', mid: 'Super', offlane: 'Inflame', softSupp: 'AhFu', hardSupp: 'ddc' },
      { name: 'LGD Gaming', region: 'CN', rank: 4, carry: 'Ame', mid: 'Maybe', offlane: 'eLeVeN', softSupp: 'Victoria', hardSupp: 'Yao' },
      { name: 'Virtus.pro', region: 'EEU', rank: 5, carry: 'RAMZES666', mid: 'No[o]ne', offlane: '9pasha', softSupp: 'RodjER', hardSupp: 'Solo' },
      { name: 'OG', region: 'WEU', rank: 7, carry: 'N0tail', mid: 'Ana', offlane: 's4', softSupp: 'JerAx', hardSupp: 'Fly' },
      { name: 'Team Secret', region: 'WEU', rank: 9, carry: 'MP', mid: 'MidOne', offlane: 'KheZu', softSupp: 'YapzOr', hardSupp: 'Puppey' },
      { name: 'Evil Geniuses', region: 'NA', rank: 9, carry: 'Arteezy', mid: 'SumaiL', offlane: 'UNiVeRsE', softSupp: 'Zai', hardSupp: 'Cr1t-' },
      { name: 'TNC Pro Team', region: 'SEA', rank: 9, carry: 'Raven', mid: 'Kuku', offlane: 'Sam_H', softSupp: 'Tims', hardSupp: '1437' },
      { name: 'Digital Chaos', region: 'NA', rank: 9, carry: 'Mason', mid: 'Abed', offlane: 'Forev', softSupp: 'Bulba', hardSupp: 'DuBu' },
      { name: 'Invictus Gaming', region: 'CN', rank: 5, carry: 'Burning', mid: 'Op', offlane: 'Xxs', softSupp: 'BoBoKa', hardSupp: 'Q' },
      { name: 'iG.Vitality', region: 'CN', rank: 13, carry: 'Paparazi', mid: 'Sakata', offlane: 'InJuly', softSupp: 'super', hardSupp: 'Dogfights' },
      { name: 'Team Empire', region: 'EEU', rank: 7, carry: 'Resolut1on', mid: 'Fn', offlane: 'Ghostik', softSupp: 'RodjER', hardSupp: 'Miposhka' },
      { name: 'Infamous', region: 'SA', rank: 13, carry: 'Benjaz', mid: 'Timado', offlane: 'Kingteka', softSupp: 'Matthew', hardSupp: 'Accel' },
      { name: 'Cloud9', region: 'NA', rank: 13, carry: 'EternalEnvy', mid: 'Fata', offlane: 'MSS', softSupp: 'Aui_2000', hardSupp: 'PIELIEDIE' },
      { name: 'Execration', region: 'SEA', rank: 13, carry: 'Nando', mid: 'James', offlane: 'Rarity', softSupp: 'Kim0', hardSupp: 'Cartwright' },
      { name: 'HellRaisers', region: 'EEU', rank: 17, carry: 'Swiftending', mid: 'Keyser', offlane: '33', softSupp: 'MiNi', hardSupp: 'j4' },
      { name: 'Fnatic', region: 'SEA', rank: 17, carry: 'Ahjit', mid: 'QO', offlane: 'OhAiYo', softSupp: 'DJ', hardSupp: 'Febby' }
    ],
    TI8: [
      { name: 'Evil Geniuses', region: 'NA', rank: 3, carry: 'Arteezy', mid: 'SumaiL', offlane: 's4', softSupp: 'Cr1t-', hardSupp: 'Fly' },
      { name: 'Team Liquid', region: 'WEU', rank: 4, carry: 'MATUMBAMAN', mid: 'Miracle-', offlane: 'Mind_Control', softSupp: 'GH', hardSupp: 'KuroKy' },
      { name: 'Virtus.pro', region: 'EEU', rank: 5, carry: 'RAMZES666', mid: 'No[o]ne', offlane: '9pasha', softSupp: 'RodjER', hardSupp: 'Solo' },
      { name: 'Team Secret', region: 'WEU', rank: 5, carry: 'Ace', mid: 'MidOne', offlane: 'Fata', softSupp: 'YapzOr', hardSupp: 'Puppey' },
      { name: 'OpTic Gaming', region: 'NA', rank: 7, carry: 'Pajkatt', mid: 'CCnC', offlane: '33', softSupp: 'zai', hardSupp: 'ppd' },
      { name: 'VGJ.Storm', region: 'NA', rank: 7, carry: 'Yawar', mid: 'Resolution', offlane: 'Sneyking', softSupp: 'MSS', hardSupp: 'SVG' },
      { name: 'Vici Gaming', region: 'CN', rank: 9, carry: 'Paparazi', mid: 'Ori', offlane: 'eLeVeN', softSupp: 'Lanm', hardSupp: 'Fenrir' },
      { name: 'Winstrike Team', region: 'EEU', rank: 9, carry: 'Silent', mid: 'Iceberg', offlane: 'Nongata', softSupp: 'ALWAYSWANNAFLY', hardSupp: 'Nofear' },
      { name: 'Newbee', region: 'CN', rank: 13, carry: 'Moogy', mid: 'Sccc', offlane: 'kpii', softSupp: 'Kaka', hardSupp: 'Faith' },
      { name: 'Mineski', region: 'SEA', rank: 9, carry: 'Moon', mid: 'Mushi', offlane: 'iceiceice', softSupp: 'Jabz', hardSupp: 'Ninjaboogie' },
      { name: 'Fnatic', region: 'SEA', rank: 13, carry: 'EE', mid: 'Abed', offlane: 'Universe', softSupp: 'DJ', hardSupp: 'PLD' },
      { name: 'Team Serenity', region: 'CN', rank: 9, carry: 'zhizhizhi', mid: 'Zyd', offlane: 'XCJ', softSupp: 'Pyw', hardSupp: 'RodjER' },
      { name: 'TNC Predator', region: 'SEA', rank: 13, carry: 'Raven', mid: 'Armel', offlane: 'Sam_H', softSupp: 'Tims', hardSupp: 'Kuku' },
      { name: 'VGJ.Thunder', region: 'CN', rank: 13, carry: 'Sylar', mid: 'Freeze', offlane: 'Yang', softSupp: 'Fade', hardSupp: 'ddc' },
      { name: 'Invictus Gaming', region: 'CN', rank: 17, carry: 'Agressif', mid: 'Xxs', offlane: 'Sneyking', softSupp: 'BoBoKa', hardSupp: 'Q' },
      { name: 'paiN Gaming', region: 'SA', rank: 17, carry: 'hOWan', mid: 'w33', offlane: 'tavo', softSupp: 'Kingrd', hardSupp: 'Duster' }
    ],
    TI9: [
      { name: 'PSG.LGD', region: 'CN', rank: 3, carry: 'Ame', mid: 'Somnus`M', offlane: 'Chalice', softSupp: 'fy', hardSupp: 'xNova' },
      { name: 'Team Secret', region: 'WEU', rank: 4, carry: 'Nisha', mid: 'MidOne', offlane: 'zai', softSupp: 'YapzOr', hardSupp: 'Puppey' },
      { name: 'Vici Gaming', region: 'CN', rank: 5, carry: 'Paparazi', mid: 'Ori', offlane: 'Yang', softSupp: 'Fade', hardSupp: 'DY' },
      { name: 'Evil Geniuses', region: 'NA', rank: 5, carry: 'Arteezy', mid: 'SumaiL', offlane: 's4', softSupp: 'Cr1t-', hardSupp: 'Fly' },
      { name: 'Infamous', region: 'SA', rank: 7, carry: 'Hector (K1)', mid: 'Chris Luck', offlane: 'Wisper', softSupp: 'Scofield', hardSupp: 'Stinger' },
      { name: 'Royal Never Give Up', region: 'CN', rank: 7, carry: 'Monet', mid: 'Setsu', offlane: 'Flyby', softSupp: 'AhFu', hardSupp: 'Lanm' },
      { name: 'Newbee', region: 'NA', rank: 9, carry: 'Yawar', mid: 'CCnC', offlane: 'Sneyking', softSupp: 'MSS', hardSupp: 'SVG' },
      { name: 'Virtus.pro', region: 'EEU', rank: 9, carry: 'RAMZES666', mid: 'No[o]ne', offlane: '9pasha', softSupp: 'RodjER', hardSupp: 'Solo' },
      { name: 'TNC Predator', region: 'SEA', rank: 9, carry: 'Gabbi', mid: 'Armel', offlane: 'Kuku', softSupp: 'Tims', hardSupp: 'Eyyou' },
      { name: 'Mineski', region: 'SEA', rank: 9, carry: 'Nikobaby', mid: 'Moon', offlane: 'iceiceice', softSupp: 'Bina', hardSupp: 'Ninjaboogie' },
      { name: 'Alliance', region: 'WEU', rank: 13, carry: 'miCKe', mid: 'qojqva', offlane: 'Boxi', softSupp: 'Taiga', hardSupp: 'iNSaNiA' },
      { name: 'Fnatic', region: 'SEA', rank: 13, carry: 'Jabz', mid: 'Abed', offlane: 'iceiceice', softSupp: 'DJ', hardSupp: 'Dubu' },
      { name: 'Keen Gaming', region: 'CN', rank: 13, carry: 'old chicken', mid: 'dark', offlane: 'eleveN', softSupp: 'Kaka', hardSupp: 'monster' },
      { name: 'Chaos Esports Club', region: 'WEU', rank: 17, carry: 'VTFaded', mid: 'MATUMBAMAN', offlane: 'MISERY', softSupp: 'MSS', hardSupp: 'pieLieDie' },
      { name: 'Natus Vincere', region: 'EEU', rank: 13, carry: 'Vladyslav', mid: 'MagicaL', offlane: 'Blizzy', softSupp: 'Zayac', hardSupp: 'SoNNeikO' },
      { name: 'Ninjas in Pyjamas', region: 'WEU', rank: 17, carry: 'Ace', mid: 'Fata', offlane: '33', softSupp: 'Saksa', hardSupp: 'ppd' }
    ],
    TI10: [
      { name: 'Team Secret', region: 'WEU', rank: 3, carry: 'MATUMBAMAN', mid: 'Nisha', offlane: 'zai', softSupp: 'YapzOr', hardSupp: 'Puppey' },
      { name: 'Invictus Gaming', region: 'CN', rank: 4, carry: 'flyfly', mid: 'Emo', offlane: 'JT-', softSupp: 'Kaka', hardSupp: 'Oli' },
      { name: 'Virtus.pro', region: 'EEU', rank: 5, carry: 'Nightfall', mid: 'gpk', offlane: 'DM', softSupp: 'Save-', hardSupp: 'Kingslayer' },
      { name: 'Vici Gaming', region: 'CN', rank: 5, carry: 'poyoyo', mid: 'Ori', offlane: 'Old eLeVeN', softSupp: 'Pyw', hardSupp: 'Dy' },
      { name: 'OG', region: 'WEU', rank: 7, carry: 'SumaiL', mid: 'Topson', offlane: 'Ceb', softSupp: 'Saksa', hardSupp: 'N0tail' },
      { name: 'T1', region: 'SEA', rank: 7, carry: '23savage', mid: 'Karl', offlane: 'Kuku', softSupp: 'Xepher', hardSupp: 'Whitemon' },
      { name: 'Fnatic', region: 'SEA', rank: 9, carry: 'Raven', mid: 'ChYuan', offlane: 'Deth', softSupp: 'Jabz', hardSupp: 'DJ' },
      { name: 'Quincy Crew', region: 'NA', rank: 9, carry: 'Yawar', mid: 'Quinn', offlane: 'Lelis', softSupp: 'MSS', hardSupp: 'SVG' },
      { name: 'Alliance', region: 'WEU', rank: 9, carry: 'Nikobaby', mid: 'LIMMP', offlane: 's4', softSupp: 'Handsken', hardSupp: 'fng' },
      { name: 'Beastcoast', region: 'SA', rank: 13, carry: 'K1', mid: 'Chris Luck', offlane: 'Wisper', softSupp: 'Scofield', hardSupp: 'Stinger' },
      { name: 'Evil Geniuses', region: 'NA', rank: 9, carry: 'Arteezy', mid: 'Abed', offlane: 'iceiceice', softSupp: 'Cr1t-', hardSupp: 'Fly' },
      { name: 'Elephant', region: 'CN', rank: 13, carry: 'Eurus', mid: 'Somnus', offlane: 'Yang', softSupp: 'fy', hardSupp: 'Super' },
      { name: 'Team Aster', region: 'CN', rank: 13, carry: 'Monet', mid: 'White_Album', offlane: 'Xxs', softSupp: 'BoBoKa', hardSupp: 'LaNm' },
      { name: 'Team Undying', region: 'NA', rank: 13, carry: 'Timado', mid: 'Bryle', offlane: 'SabeRLight-', softSupp: 'MoonMeander', hardSupp: 'DuBu' },
      { name: 'SG esports', region: 'SA', rank: 17, carry: 'Costabile', mid: '4nalog', offlane: 'Tavo', softSupp: 'Thiolicor', hardSupp: 'KJ' },
      { name: 'Thunder Predator', region: 'SA', rank: 17, carry: 'Mnz', mid: 'Leostyle-', offlane: 'Frank', softSupp: 'MoOz', hardSupp: 'Mjz' }
    ],
    TI11: [
      { name: 'Team Liquid', region: 'WEU', rank: 3, carry: 'MATUMBAMAN', mid: 'miCKe', offlane: 'zai', softSupp: 'Boxi', hardSupp: 'iNSaNiA' },
      { name: 'Team Aster', region: 'CN', rank: 4, carry: 'Monet', mid: 'Ori', offlane: 'Xxs', softSupp: 'BoBoKa', hardSupp: 'Siamese.C' },
      { name: 'PSG.LGD', region: 'CN', rank: 5, carry: 'Ame', mid: 'NothingToSay', offlane: 'Faith_bian', softSupp: 'XinQ', hardSupp: 'y`' },
      { name: 'OG', region: 'WEU', rank: 5, carry: 'Yuragi', mid: 'bzm', offlane: 'ATF', softSupp: 'Taiga', hardSupp: 'Misha' },
      { name: 'Beastcoast', region: 'SA', rank: 7, carry: 'K1', mid: 'Chris Luck', offlane: 'Wisper', softSupp: 'Scofield', hardSupp: 'Stinger' },
      { name: 'Thunder Awaken', region: 'SA', rank: 7, carry: 'Pakazs', mid: 'DarkMago', offlane: 'Sacred', softSupp: 'Matthew', hardSupp: 'Pandaboo' },
      { name: 'Entity', region: 'WEU', rank: 9, carry: 'Pure', mid: 'Stormstormer', offlane: 'Tobbi', softSupp: 'Kataomi`', hardSupp: 'Fishman' },
      { name: 'Gaimin Gladiators', region: 'WEU', rank: 9, carry: 'dyrachyo', mid: 'BOOM', offlane: 'Ace', softSupp: 'tOFu', hardSupp: 'Seleri' },
      { name: 'Evil Geniuses', region: 'NA', rank: 9, carry: 'Arteezy', mid: 'Abed', offlane: 'Nightfall', softSupp: 'Cr1t-', hardSupp: 'Fly' },
      { name: 'Royal Never Give Up', region: 'CN', rank: 13, carry: 'Ghost', mid: 'Somnus', offlane: 'Chalice', softSupp: 'Kaka', hardSupp: 'xNova' },
      { name: 'Fnatic', region: 'SEA', rank: 13, carry: 'Palos', mid: 'Armel', offlane: 'Jabz', softSupp: 'DJ', hardSupp: 'Jaunuel' },
      { name: 'Hokori', region: 'SA', rank: 13, carry: 'Lumière', mid: '4nalog', offlane: 'Vitaly', softSupp: 'Thiolicor', hardSupp: 'Gardick' },
      { name: 'Team Spirit', region: 'EEU', rank: 13, carry: 'Yatoro', mid: 'TORONTOTOKYO', offlane: 'Collapse', softSupp: 'Mira', hardSupp: 'Miposhka' },
      { name: 'Talon Esports', region: 'SEA', rank: 17, carry: '23savage', mid: 'Mikoto', offlane: 'kpii', softSupp: 'Q', hardSupp: 'Hyde' },
      { name: 'BetBoom Team', region: 'EEU', rank: 17, carry: 'Daxak', mid: 'Larl', offlane: 'Noticed', softSupp: 'RodjER', hardSupp: 'SoNNeikO' },
      { name: 'Soniqs', region: 'NA', rank: 17, carry: 'Yawar', mid: 'Quinn', offlane: 'Leslao', softSupp: 'MSS', hardSupp: 'Fata' },
      { name: 'TSM', region: 'NA', rank: 17, carry: 'Timado', mid: 'Bryle', offlane: 'SabeRLight-', softSupp: 'Ari', hardSupp: 'DuBu' },
      { name: 'Alliance', region: 'WEU', rank: 17, carry: 'Nikobaby', mid: 'w33', offlane: 'Limitless', softSupp: 'Aramis', hardSupp: 'Dukalis' }
    ],
    TI12: [
      { name: 'LGD Gaming', region: 'CN', rank: 3, carry: 'shiro', mid: 'NothingToSay', offlane: 'niu', softSupp: 'planet', hardSupp: 'y`' },
      { name: 'Azure Ray', region: 'CN', rank: 4, carry: 'Lou', mid: 'Somnus', offlane: 'chalice', softSupp: 'fy', hardSupp: 'LaNm' },
      { name: 'Team Liquid', region: 'WEU', rank: 5, carry: 'miCKe', mid: 'Nisha', offlane: 'zai', softSupp: 'Boxi', hardSupp: 'iNSaNiA' },
      { name: 'Virtus.pro', region: 'EEU', rank: 5, carry: 'Kiritych', mid: 'gpk', offlane: 'Noticed', softSupp: 'sayuw', hardSupp: 'Fng' },
      { name: 'Nouns', region: 'NA', rank: 7, carry: 'K1', mid: 'Gunnar', offlane: 'Moo', softSupp: 'Lelis', hardSupp: 'Yamsun' },
      { name: 'BetBoom Team', region: 'EEU', rank: 7, carry: 'Nightfall', mid: 'gpk', offlane: 'Pure', softSupp: 'Save-', hardSupp: 'TORONTOTOKYO' },
      { name: 'Tundra Esports', region: 'WEU', rank: 9, carry: 'skiter', mid: 'Nine', offlane: '33', softSupp: 'Nine', hardSupp: 'Sneyking' },
      { name: '9Pandas', region: 'EEU', rank: 9, carry: 'RAMZES666', mid: 'kiyotaka', offlane: 'Miero', softSupp: 'Solo', hardSupp: 'Antares' },
      { name: 'Entity', region: 'WEU', rank: 9, carry: 'watson', mid: 'Stormstormer', offlane: 'Gabbi', softSupp: 'Kataomi`', hardSupp: 'Fishman' },
      { name: 'Talon Esports', region: 'SEA', rank: 9, carry: '23savage', mid: 'Mikoto', offlane: 'Jabz', softSupp: 'Q', hardSupp: 'Oli' },
      { name: 'Shopify Rebellion', region: 'NA', rank: 13, carry: 'Arteezy', mid: 'Abed', offlane: 'SabeRLight-', softSupp: 'Cr1t-', hardSupp: 'Fly' },
      { name: 'Keyd Stars', region: 'SA', rank: 13, carry: 'Costabile', mid: '4nalog', offlane: 'KJ', softSupp: 'Kingrd', hardSupp: 'Duster' },
      { name: 'Quest Esports', region: 'WEU', rank: 17, carry: 'TA2000', mid: 'No!ob', offlane: 'TOBI', softSupp: 'OmaR', hardSupp: 'kaori' },
      { name: 'Thunder Awaken', region: 'SA', rank: 17, carry: 'Knight~', mid: 'SLATEM$', offlane: 'ILICH-', softSupp: 'N2O', hardSupp: 'Prada' },
      { name: 'Beastcoast', region: 'SA', rank: 17, carry: 'Parker', mid: 'DarkMago', offlane: 'Sacred', softSupp: 'Scofield', hardSupp: 'Stinger' },
      { name: 'Team SMG', region: 'SEA', rank: 17, carry: 'MidOne', mid: 'No[o]ne', offlane: 'Masaros', softSupp: 'AhFu', hardSupp: 'Jaunuel' },
      { name: 'PSG Quest', region: 'WEU', rank: 17, carry: 'TA2000', mid: 'No!ob', offlane: 'Malik', softSupp: 'OmaR', hardSupp: 'kaori' }
    ],
    TI13: [
      { name: 'Tundra Esports', region: 'WEU', rank: 3, carry: 'Pure', mid: 'Topson', offlane: 'RAMZES666', softSupp: 'Saksa', hardSupp: 'Whitemon' },
      { name: 'Team Falcons', region: 'WEU', rank: 4, carry: 'skiter', mid: 'Malr1ne', offlane: 'ATF', softSupp: 'Cr1t-', hardSupp: 'Sneyking' },
      { name: 'Xtreme Gaming', region: 'CN', rank: 5, carry: 'Ame', mid: 'Xm', offlane: 'Xxs', softSupp: 'XinQ', hardSupp: 'Dy' },
      { name: 'Cloud9', region: 'WEU', rank: 5, carry: 'Watson', mid: 'No[o]ne', offlane: 'DM', softSupp: 'Kataomi`', hardSupp: 'Fishman' },
      { name: 'HEROIC', region: 'SA', rank: 7, carry: 'K1', mid: '4nalog', offlane: 'Wisper', softSupp: 'Scofield', hardSupp: 'KJ' },
      { name: 'BB Team', region: 'EEU', rank: 7, carry: 'Nightfall', mid: 'gpk', offlane: 'Miero', softSupp: 'Save-', hardSupp: 'TORONTOTOKYO' },
      { name: '1win', region: 'EEU', rank: 9, carry: 'Munkushi~', mid: 'CHIRA_JUNIOR', offlane: 'Cloud', softSupp: 'Swedenstrong', hardSupp: 'RESPECT' },
      { name: 'Team Spirit', region: 'EEU', rank: 9, carry: 'Yatoro', mid: 'Larl', offlane: 'Collapse', softSupp: 'Mira', hardSupp: 'Miposhka' },
      { name: 'Beastcoast', region: 'SA', rank: 13, carry: 'payk', mid: 'Lunal', offlane: 'Vitaly', softSupp: 'MoOz', hardSupp: 'Gardick' },
      { name: 'Talon Esports', region: 'SEA', rank: 13, carry: 'Akashi', mid: 'Mikoto', offlane: 'Jhocam', softSupp: 'Ws', hardSupp: 'ponyo' },
      { name: 'Nouns', region: 'NA', rank: 9, carry: 'Yuma', mid: 'Copy', offlane: 'Gunnar', softSupp: 'Lelis', hardSupp: 'Fly' },
      { name: 'G2.iG', region: 'CN', rank: 13, carry: 'Monet', mid: 'NothingToSay', offlane: 'JT-', softSupp: 'BoBoKa', hardSupp: 'xNova' },
      { name: 'Team Zero', region: 'CN', rank: 13, carry: 'Erika', mid: '7e', offlane: 'Beyond', softSupp: 'ponlo', hardSupp: 'zzq' },
      { name: 'Aurora', region: 'SEA', rank: 9, carry: '23', mid: 'Lorenof', offlane: 'Jabz', softSupp: 'Q', hardSupp: 'Oli' }
    ]
  };

  const extraTeams = eraTeamsMap[tiId] || [];
  const existingNames = new Set(existing.map((t) => t.name.toLowerCase()));
  const generated: TITeamProfile[] = [...existing];

  extraTeams.forEach((t) => {
    if (!existingNames.has(t.name.toLowerCase())) {
      generated.push({
        id: `${tiId}-${t.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        name: t.name,
        region: t.region,
        placement: `${t.rank}${t.rank === 1 ? 'st' : t.rank === 2 ? 'nd' : t.rank === 3 ? 'rd' : 'th'} Place`,
        placementRank: t.rank,
        logoUrl: t.logo || `https://steamcdn-a.akamaihd.net/apps/dota2/images/team_logos/36.png`,
        successUpToPoint: `Participating organization at ${tiId}.`,
        roster: [
          { nickname: t.carry, realName: t.carry, role: 'Pos 1 Carry', nationality: 'Global', countryFlag: '🌐', topHeroes: [{ heroName: 'Morphling', matchesPlayed: 5, winRate: '60%' }] },
          { nickname: t.mid, realName: t.mid, role: 'Pos 2 Midlaner', nationality: 'Global', countryFlag: '🌐', topHeroes: [{ heroName: 'Invoker', matchesPlayed: 5, winRate: '60%' }] },
          { nickname: t.offlane, realName: t.offlane, role: 'Pos 3 Offlaner', nationality: 'Global', countryFlag: '🌐', topHeroes: [{ heroName: 'Dark Seer', matchesPlayed: 5, winRate: '60%' }] },
          { nickname: t.softSupp, realName: t.softSupp, role: 'Pos 4 Soft Support', nationality: 'Global', countryFlag: '🌐', topHeroes: [{ heroName: 'Rubick', matchesPlayed: 5, winRate: '60%' }] },
          { nickname: t.hardSupp, realName: t.hardSupp, role: 'Pos 5 Hard Support', nationality: 'Global', countryFlag: '🌐', topHeroes: [{ heroName: 'Lich', matchesPlayed: 5, winRate: '60%' }] }
        ]
      });
    }
  });

  return generated;
}

const CDN = 'https://liangcang-material.alicdn.com/prod/upload/';
const UED = 'https://liangcang-material.alicdn.com/prod/ued/upload/';
const YKIMG = 'http://ykimg.alicdn.com/develop/image/';
const MYKIMG = 'https://m.ykimg.com/';

export const navItems = [
  { id: 'home', label: 'HOME', route: '/', active: true,
    iconActive: `${YKIMG}2025-05-09/3a748f0610739b60b50dd903dfd3571d.png`,
    iconDefault: `${YKIMG}2025-05-09/a141fd99c6be302b8c350cbae3927464.png` },
  { id: 'drama', label: 'TV DRAMA', route: '/drama',
    iconActive: `${YKIMG}2025-05-13/24bbb0c6e5f93b840514f494a6aee34b.png`,
    iconDefault: `${YKIMG}2025-05-13/a22c4ca55750c22341c67d3c6d3efde8.png` },
  { id: 'anime', label: 'ANIME', route: '/anime',
    iconActive: `${YKIMG}2025-05-13/e6a5df93a9da99a479f74f772792c275.png`,
    iconDefault: `${YKIMG}2025-05-13/43e175be70ed52d2c47e016b7a3be4ba.png` },
  { id: 'movie', label: 'MOVIES', route: '/movies',
    iconActive: `${YKIMG}2025-05-13/d2aa4eb8adf691284e9a876a34c029c8.png`,
    iconDefault: `${YKIMG}2025-05-13/551a1f288b8576bd4051138604784070.png` },
  { id: 'variety', label: 'VARIETY', route: '/variety',
    iconActive: `${YKIMG}2025-05-13/b23f403b49f6170947dc7ed2d2977a28.png`,
    iconDefault: `${YKIMG}2025-05-13/a13fd0b66ff7c18dd338694463ead315.png` },
  { id: 'shortdrama', label: 'SHORT', route: '/short',
    iconActive: `${YKIMG}2025-05-13/94fc652eeb0d9f94a9a46cccceb4a299.png`,
    iconDefault: `${YKIMG}2025-05-13/4ed993cf0ae463885d24780192a5cb52.png` },
  { id: 'kids', label: 'KIDS', route: '/kids',
    iconActive: `${YKIMG}2025-05-13/878a9a801977979eaa8a556809dc215e.png`,
    iconDefault: `${YKIMG}2025-05-13/8c1e4ed8c96c1d5da8c0d0163e1fe414.png` },
  { id: 'vip', label: 'VIP', route: '/vip',
    iconActive: 'https://gw.alicdn.com/imgextra/i4/O1CN01z6IRyQ1oD4dWmgzRG_!!6000000005190-55-tps-60-60.svg',
    iconDefault: 'https://gw.alicdn.com/imgextra/i1/O1CN01DvcsDX1eesWX1x3l3_!!6000000003897-55-tps-60-60.svg' },
  { id: 'doc', label: 'DOCS', route: '/documentary',
    iconActive: `${YKIMG}2025-05-13/880e84f4465732acfef7f726b6c4c48a.png`,
    iconDefault: `${YKIMG}2025-05-13/412b0c10e68ff5cde08a557cd56b3c88.png` },
  { id: 'sports', label: 'SPORTS', route: '/sports',
    iconActive: `${YKIMG}2025-05-13/f714343c4dd8611bc0f3c021adf52a63.png`,
    iconDefault: `${YKIMG}2025-05-13/e6a206a320270f68b9e4c0c615099124.png` },
  { id: 'culture', label: 'CULTURE', route: '/culture',
    iconActive: `${YKIMG}2025-05-13/f005572f78c65637b1078d7e263cbdc3.png`,
    iconDefault: `${YKIMG}2025-05-13/dc708f62a7c08982a2a7f454bbbe6d93.png` },
  { id: 'live', label: 'LIVE', route: '/live',
    iconActive: `${YKIMG}2025-05-13/31a0304e88769bbb223d3545718b6a69.png`,
    iconDefault: `${YKIMG}2025-05-13/d6e2d17e0ff28b7791bf59f0e6cbf03b.png` },
  { id: 'game', label: 'GAMES', route: '/games',
    iconActive: `${YKIMG}2025-05-13/8c741db30d0b7984181e27b1463e2021.png`,
    iconDefault: `${YKIMG}2025-05-13/cf04f14f3dd143c9fde1d70a73d09776.png` },
  { id: 'learn', label: 'LEARN', route: '/learning',
    iconActive: `${YKIMG}2026-02-28/6cf20ba955972696163f24548ccf4ca4.png`,
    iconDefault: `${YKIMG}2026-02-28/bfe0544b918217e60d162f2e1eb4c89d.png` },
  { id: 'knowledge', label: 'KNOWLEDGE', route: '/knowledge',
    iconActive: `${YKIMG}2025-05-13/31cb63b7769e6906c38e37626c71adca.png`,
    iconDefault: `${YKIMG}2025-05-13/297f8d877e4b1592860a7ffb9074efdc.png` },
  { id: 'newfilm', label: 'NEW', route: '/new-films',
    iconActive: `${YKIMG}2025-05-13/aa11f35a44c8deae94a3bf4e8286acf9.png`,
    iconDefault: `${YKIMG}2025-05-13/ceb0b251924972178499c425b0e662e5.png` },
  { id: 'health', label: 'HEALTH', route: '/health',
    iconActive: `${YKIMG}2026-02-26/74949aabdf8beced0c40d257c08bb861.png`,
    iconDefault: `${YKIMG}2026-02-26/42cf872bb32da025a2ff168f717a06b4.png` },
  { id: 'public', label: 'CHARITY', route: '/charity',
    iconActive: `${YKIMG}2025-05-13/8eafb948d84976d69d8bc4639f43cf87.png`,
    iconDefault: `${YKIMG}2025-05-13/bc648c2c282ec6232cbb84cf954d6b80.png` },
  { id: 'accessible', label: 'ACCESS', route: '/accessible',
    iconActive: `${YKIMG}2025-05-13/a116b4e6381bd3f59aaadd3efccf981d.png`,
    iconDefault: `${YKIMG}2025-05-13/f0a959130d704c43c83988e4e2974cbe.png` },
];

export interface SwiperSlide {
  id: string;
  image: string;
  isAd?: boolean;
  titleArtUrl?: string;
  titleArtStyle?: 'horizontal_big' | 'horizontal' | 'square';
  titleText?: string;
  tags: Array<{ type: 'vip' | 'exclusive' | 'generic' | 'ad'; text: string }>;
  desc?: string;
}

export const swiperSlides: SwiperSlide[] = [
  {
    id: '0',
    image: `${CDN}a85b39cef4874a34a7866ff3cae07868.webp.jpg`,
    titleArtUrl: `${UED}1773827432460-5e84d543-edc0-4781-9fc5-9241c53c8d89.png`,
    titleArtStyle: 'horizontal_big',
    tags: [
      { type: 'vip', text: 'VIP' },
      { type: 'generic', text: 'VARIETY' },
      { type: 'generic', text: 'EP 5-7 UPDATED' },
    ],
    desc: "ZHEJIANG SATELLITE TV REALITY SHOW WITH THE THEME \"DADS RETURN\", EXPLORING PARENTING, PARENT-CHILD COMMUNICATION AND FAMILY RELATIONSHIPS.",
  },
  {
    id: '1',
    image: 'https://acg.youku.com/webfile/jbtbrSptSW1UUTAhpY0DsKhBKBJNxMMG.jpg',
    isAd: true,
    titleText: 'ZERO KRYPTON DOMINATE THE SERVER! ONE-SHOT THE ENTIRE MAP',
    tags: [{ type: 'ad', text: 'AD' }],
  },
  {
    id: '2',
    image: `${CDN}e4e85e60f6a242c09b801c37ebbdbb52.webp.jpg`,
    titleArtUrl: `${UED}1773138738080-98faed5b-ba9c-48b4-ba54-7246c65997ef.png`,
    titleArtStyle: 'square',
    tags: [
      { type: 'exclusive', text: 'EXCLUSIVE' },
      { type: 'generic', text: 'VARIETY' },
      { type: 'generic', text: 'EP 5-4 UPDATED' },
    ],
    desc: 'THE BEYOND CLASS TOP PRODUCTION TEAM LEADS UNLIMITED ARTISTS IN A PROFESSIONAL BATTLE, FIGHTING WITH ACTING SKILLS AND WRITING DESTINY WITH STRENGTH!',
  },
  {
    id: '3',
    image: `${CDN}092e3dd582fe420893e63955039704c5.webp.jpg`,
    titleArtUrl: `${UED}1776391768484-bcd51896-acad-4a77-84e2-933e1a8ecaa7.png`,
    titleArtStyle: 'horizontal',
    tags: [
      { type: 'vip', text: 'VIP' },
      { type: 'generic', text: 'DRAMA' },
      { type: 'generic', text: 'EP 5-6 UPDATED' },
    ],
    desc: 'CANGHAIZHUAN STARRING XIAO ZHAN AND XIN ZHILEI — TWO PEOPLE CROSSING MOUNTAINS AND RIVERS, EMBARKING ON AN EPIC ANCIENT LOVE STORY.',
  },
  {
    id: '4',
    image: `${CDN}81518d48c7154c04b4e4bde0f2e06223.webp.jpg`,
    titleArtUrl: `${UED}1776134936055-f13e9816-8d3e-4eb2-8867-389a1f369fad.png`,
    titleArtStyle: 'square',
    tags: [
      { type: 'exclusive', text: 'EXCLUSIVE' },
      { type: 'generic', text: 'ANIME' },
      { type: 'generic', text: 'EP 20 UPDATED' },
    ],
    desc: 'IN A CRUEL APOCALYPTIC WORLD, A YOUNG MAN SETS OUT ON A PATH OF VENGEANCE TO SLAY THE GODS — FIGHTING AGAINST HIS TRAGIC FATE!',
  },
  {
    id: '5',
    image: `${CDN}76ac53c450e446d6b2c2e52bb261eb4d.webp.jpg`,
    tags: [
      { type: 'vip', text: 'VIP' },
      { type: 'generic', text: 'KIDS' },
      { type: 'generic', text: '20 EPS COMPLETE' },
    ],
    desc: 'KIDS FIGHT WITH ALL THEIR MIGHT TO FIND THE STAR CORE AND EMBARK ON AN ADVENTURE TO SAVE THE EARTH!',
  },
  {
    id: '6',
    image: `${CDN}8c9490411498480fa932f83bfe57cdaa.webp.jpg`,
    tags: [],
  },
  {
    id: '7',
    image: `${CDN}11803d8ae3d64090b3ef99c6b725b28e.webp.jpg`,
    titleArtUrl: `${UED}1776678261100-e7c3b190-56c7-4a4e-ad52-ef9a2489ae8f.png`,
    titleArtStyle: 'horizontal_big',
    tags: [
      { type: 'vip', text: 'VIP' },
      { type: 'generic', text: 'DOCUMENTARY' },
      { type: 'generic', text: 'EP 5-2 UPDATED' },
    ],
    desc: 'FOLLOW THE FOOTSTEPS OF ANCIENT POETS ACROSS A THOUSAND YEARS, ADMIRING THE SCENERY OF TANG POETRY WITH RENOWNED CULTURAL FIGURES!',
  },
  {
    id: '8',
    image: `${CDN}965fa67023364601ab3421248e940344.webp.jpg`,
    tags: [
      { type: 'vip', text: 'VIP' },
      { type: 'generic', text: 'KIDS' },
      { type: 'generic', text: 'EP 14 UPDATED' },
    ],
    desc: 'SUITABLE FOR CHILDREN UNDER 6 — YOUMI ACCOMPANIES YOU THROUGH JOYFUL GROWING-UP STORIES.',
  },
  {
    id: '9',
    image: `${CDN}03c45975db904e2ab4a7b7124a99a3b8.webp.jpg`,
    tags: [
      { type: 'generic', text: 'KIDS' },
      { type: 'generic', text: 'EP 29 UPDATED' },
    ],
    desc: 'SUITABLE FOR CHILDREN AGES 3-9 — AN ULTIMATE SHOWDOWN OF SPEED AND INTELLIGENCE.',
  },
];

export interface BulletCard {
  id: string;
  slideIndex: number;
  image: string;
  badgeType?: 'vip' | 'exclusive' | 'premiere' | 'free' | 'svip' | 'ad' | null;
  badgeText?: string;
  statusText?: string;
  statusSub?: string;
  episodeText?: string;
  isActive?: boolean;
}

export const bulletCards: BulletCard[] = [
  { id: 'b0', slideIndex: 0, image: `${CDN}a0b877dff7fb4cf8aaba78fdd432085f.webp.jpg`, badgeType: 'vip', badgeText: 'VIP', statusText: 'UPDATED', statusSub: 'NEW', episodeText: 'VAR · EP 5-7', isActive: true },
  { id: 'b1', slideIndex: 1, image: 'https://acg.youku.com/webfile/bQ0vwBeFHhFD0v5DOGSSVC15LUP5CYlt.jpg', badgeType: 'ad', badgeText: 'AD' },
  { id: 'b2', slideIndex: 2, image: `${CDN}9d652fa479fe421f8ffadcc038ff1489.webp.jpg`, badgeType: 'exclusive', badgeText: 'EXCL', episodeText: 'VAR · EP 5-4' },
  { id: 'b3', slideIndex: 3, image: `${CDN}092e3dd582fe420893e63955039704c5.webp.jpg`, badgeType: 'vip', badgeText: 'VIP', episodeText: 'DRAMA · EP 5-6' },
  { id: 'b4', slideIndex: 4, image: `${CDN}81518d48c7154c04b4e4bde0f2e06223.webp.jpg`, badgeType: 'exclusive', badgeText: 'EXCL', statusText: 'HOT CHART', statusSub: 'TOP', episodeText: 'ANIME · EP 20' },
  { id: 'b5', slideIndex: 5, image: `${CDN}76ac53c450e446d6b2c2e52bb261eb4d.webp.jpg`, badgeType: 'vip', badgeText: 'VIP', episodeText: 'KIDS · 20 EPS' },
  { id: 'b6', slideIndex: 6, image: `${CDN}10a2893f60014821af1de814f49a4407.webp.jpg` },
  { id: 'b7', slideIndex: 7, image: `${CDN}c59eade0e9ef43c8aebdc01d02eef080.webp.jpg`, badgeType: 'vip', badgeText: 'VIP', statusText: 'NEW ARRIVAL', statusSub: 'NEW', episodeText: 'DOC · EP 5-2' },
  { id: 'b8', slideIndex: 8, image: `${CDN}ca7f75754d2e475db6527da1443af0c5.webp.jpg`, badgeType: 'vip', badgeText: 'VIP', episodeText: 'KIDS · EP 14' },
  { id: 'b9', slideIndex: 9, image: `${CDN}4bc7902373544a2eb55ba59c1bece4b2.webp.jpg`, badgeType: 'svip', badgeText: 'SVIP', statusText: 'UPDATED', statusSub: 'NEW', episodeText: 'KIDS · EP 29' },
];

export interface FeedCard {
  id: string;
  image: string;
  badgeClass?: string;
  badgeText?: string;
  statusText?: string;
  statusSub?: string;
  episodeText: string;
  title: string;
  subtitle: string;
  playId?: string;
}

export const guessFollowingCards: FeedCard[] = [
  { id: 'f1', image: `${CDN}6d4dc8fa48c04df88294f82b10d002ea.webp.jpg`, badgeClass: 'tag_RED_2-nUp', badgeText: 'FREE NOW', statusText: 'UPDATED', statusSub: 'NEW', episodeText: 'DRAMA · EPS 9-10 FREE', title: 'OCEAN OF DESTINY', subtitle: 'XIAO ZHAN & XIN ZHILEI EPIC LOVE', playId: '1' },
  { id: 'f2', image: `${CDN}c25b56fe64bb4a2ba7be1e1f70d13a61.webp.jpg`, badgeClass: 'tag_RED_2-nUp', badgeText: 'EXCLUSIVE', statusText: 'HOT CHART', statusSub: 'TOP', episodeText: 'DRAMA · 12 EPS COMPLETE', title: 'MAJOR CASE DECODED', subtitle: 'TV DRAMA HOT CHART · TOP 4', playId: '2' },
  { id: 'f3', image: `${CDN}23a2908103db41f5b57c1f15a84c5aef.webp.jpg`, badgeClass: 'tag_RED_2-nUp', badgeText: 'FREE NOW', statusText: 'HOT CHART', statusSub: 'TOP', episodeText: 'DRAMA · EPS 17-18 FREE', title: 'GOLDEN GATE', subtitle: 'TV DRAMA HOT CHART · TOP 3', playId: '3' },
  { id: 'f4', image: `${CDN}31e59671e8b543c0a51624e9cfd83cce.webp.jpg`, badgeClass: 'tag_BLUE_o8YDy', badgeText: 'PREMIERE', statusText: 'NEW ARRIVAL', statusSub: 'NEW', episodeText: 'FILM', title: 'FLYING LIFE 3', subtitle: 'SHEN TENG & YIN ZHENG EXTREME JOURNEY', playId: '4' },
  { id: 'f5', image: `${CDN}e898046028f24755819e499b69588e28.webp.jpg`, badgeClass: 'tag_RED_2-nUp', badgeText: 'EXCLUSIVE', statusText: 'HOT CHART', statusSub: 'TOP', episodeText: 'ANIME · EP 75 UPDATED', title: 'THE GRAY REALM', subtitle: 'ANIME HOT CHART · TOP 1', playId: '5' },
  { id: 'f6', image: `${CDN}d2d82bd126014cc1bd5eafb7fc7c0217.webp.jpg`, badgeClass: 'tag_SVIP_COLORFUL_2rSkq', badgeText: 'SVIP', statusText: 'NEW ARRIVAL', statusSub: 'NEW', episodeText: 'VARIETY · EP 5-6 UPDATED', title: 'KEEP RUNNING S10', subtitle: 'RUNNING FAMILY GATHERS — NEW SEASON', playId: '6' },
  { id: 'f7', image: `${CDN}81518d48c7154c04b4e4bde0f2e06223.webp.jpg`, badgeClass: 'tag_RED_2-nUp', badgeText: 'EXCLUSIVE', statusText: 'HOT CHART', statusSub: 'TOP', episodeText: 'ANIME · EP 20 UPDATED', title: 'BEYOND TIME', subtitle: 'ANIME HOT CHART · TOP 2', playId: '7' },
  { id: 'f8', image: `${CDN}682fec7981b24c18b45897777cca715f.webp.jpg`, badgeClass: 'tag_RED_2-nUp', badgeText: 'EXCLUSIVE', statusText: 'HOT CHART', statusSub: 'TOP', episodeText: 'ANIME · EP 140 UPDATED', title: 'MY SENIOR BROTHER', subtitle: 'ANIME HOT CHART · TOP 3', playId: '8' },
];

export const ancientRomanceCards: FeedCard[] = [
  { id: 'ar1', image: 'https://m.ykimg.com/0527000061275FAB13F7FF094E5774FA', badgeClass: '', badgeText: '', episodeText: 'DRAMA · 25 EPS COMPLETE', title: 'THE COLD SWORDSMAN', subtitle: 'VILLAIN SENIOR SISTER VS CUNNING JUNIOR BROTHER', playId: '9' },
  { id: 'ar2', image: `${CDN}de9c08940cb5442998da0b215c609277.webp.jpg`, badgeClass: 'tag_RED_2-nUp', badgeText: 'EXCLUSIVE', episodeText: 'DRAMA · 30 EPS COMPLETE', title: 'ETERNAL NIGHT SHINING', subtitle: 'NOBLE GIRL & MAD NATIONAL MASTER IN WARTIME ROMANCE', playId: '10' },
  { id: 'ar3', image: `${CDN}bbee6ed1c7554ace8dcb484a068912d4.webp.jpg`, badgeClass: 'tag_RED_2-nUp', badgeText: 'EXCLUSIVE', episodeText: 'DRAMA · 28 EPS COMPLETE', title: 'AN UNUSUAL WULIN', subtitle: 'LITTLE ASSASSIN FAKE-MARRIES THE DEMON LORD', playId: '11' },
  { id: 'ar4', image: `${CDN}218a4f3de16f4f23922f8e1057212b0a.webp.jpg`, badgeClass: 'tag_RED_2-nUp', badgeText: 'EXCLUSIVE', episodeText: 'DRAMA · 24 EPS COMPLETE', title: 'YOUR HEART REVEALED', subtitle: 'THE DUKE FALLS FOR THE LITTLE CELESTIAL', playId: '12' },
  { id: 'ar5', image: `${CDN}451c5cf196d24be6aa040ba1fe48d4ce.webp.jpg`, badgeClass: 'tag_RED_2-nUp', badgeText: 'EXCLUSIVE', episodeText: 'DRAMA · 27 EPS COMPLETE', title: 'THE LAST BID', subtitle: 'BEAUTY ASSASSIN FALLS FOR HER TARGET', playId: '13' },
  { id: 'ar6', image: `${CDN}aaf265e8502c493cb96f5cbf8598e50c.webp.jpg`, badgeClass: 'tag_RED_2-nUp', badgeText: 'EXCLUSIVE', episodeText: 'DRAMA · 24 EPS COMPLETE', title: 'UNTAINTED IMMORTAL ROBES', subtitle: 'EPIC TORTURED LOVE & MUTUAL REDEMPTION', playId: '14' },
  { id: 'ar7', image: `${CDN}a83ded03a6464e5a8589f0462f54221c.webp.jpg`, badgeClass: 'tag_RED_2-nUp', badgeText: 'EXCLUSIVE', episodeText: 'DRAMA · 36 EPS', title: 'LONG NIGHT DYING EMBERS', subtitle: 'LOVE AND REDEMPTION IN THE DARKNESS', playId: '15' },
  { id: 'ar8', image: `${CDN}092e3dd582fe420893e63955039704c5.webp.jpg`, badgeClass: 'tag_YELLOW_3uzKD', badgeText: 'VIP', episodeText: 'DRAMA · 40 EPS COMPLETE', title: 'PHOENIX RETURNS', subtitle: 'NIRVANA AND THE TRIUMPHANT RETURN', playId: '16' },
];

// ================== CATEGORY PAGE DATA ==================

export interface CategoryInfo {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  gradient: string;
  filters: string[];
  cards: FeedCard[];
}

const dramaCards: FeedCard[] = [
  { id: 'd1', image: `${CDN}6d4dc8fa48c04df88294f82b10d002ea.webp.jpg`, badgeClass: 'tag_RED_2-nUp', badgeText: 'FREE NOW', statusText: 'UPDATED', statusSub: 'NEW', episodeText: 'EPS 9-10 FREE', title: 'OCEAN OF DESTINY', subtitle: 'XIAO ZHAN · XIN ZHILEI', playId: '1' },
  { id: 'd2', image: `${CDN}c25b56fe64bb4a2ba7be1e1f70d13a61.webp.jpg`, badgeClass: 'tag_RED_2-nUp', badgeText: 'EXCLUSIVE', statusText: 'HOT CHART', statusSub: 'TOP', episodeText: '12 EPS COMPLETE', title: 'MAJOR CASE DECODED', subtitle: 'CRIME THRILLER', playId: '2' },
  { id: 'd3', image: `${CDN}23a2908103db41f5b57c1f15a84c5aef.webp.jpg`, badgeClass: 'tag_RED_2-nUp', badgeText: 'FREE NOW', episodeText: 'EPS 17-18 FREE', title: 'GOLDEN GATE', subtitle: 'ANCIENT COSTUME DRAMA', playId: '3' },
  { id: 'd4', image: `${CDN}de9c08940cb5442998da0b215c609277.webp.jpg`, badgeClass: 'tag_RED_2-nUp', badgeText: 'EXCLUSIVE', episodeText: '30 EPS COMPLETE', title: 'ETERNAL NIGHT SHINING', subtitle: 'ROMANCE DRAMA', playId: '10' },
  { id: 'd5', image: `${CDN}bbee6ed1c7554ace8dcb484a068912d4.webp.jpg`, badgeClass: 'tag_RED_2-nUp', badgeText: 'EXCLUSIVE', episodeText: '28 EPS COMPLETE', title: 'AN UNUSUAL WULIN', subtitle: 'WUXIA ROMANCE', playId: '11' },
  { id: 'd6', image: `${CDN}218a4f3de16f4f23922f8e1057212b0a.webp.jpg`, badgeClass: 'tag_RED_2-nUp', badgeText: 'EXCLUSIVE', episodeText: '24 EPS COMPLETE', title: 'YOUR HEART REVEALED', subtitle: 'PALACE ROMANCE', playId: '12' },
  { id: 'd7', image: `${CDN}451c5cf196d24be6aa040ba1fe48d4ce.webp.jpg`, badgeClass: 'tag_RED_2-nUp', badgeText: 'EXCLUSIVE', episodeText: '27 EPS COMPLETE', title: 'THE LAST BID', subtitle: 'ACTION ROMANCE', playId: '13' },
  { id: 'd8', image: `${CDN}aaf265e8502c493cb96f5cbf8598e50c.webp.jpg`, badgeClass: 'tag_RED_2-nUp', badgeText: 'EXCLUSIVE', episodeText: '24 EPS COMPLETE', title: 'UNTAINTED IMMORTAL ROBES', subtitle: 'XIANXIA ROMANCE', playId: '14' },
  { id: 'd9', image: `${CDN}a83ded03a6464e5a8589f0462f54221c.webp.jpg`, badgeClass: 'tag_RED_2-nUp', badgeText: 'EXCLUSIVE', episodeText: '36 EPS', title: 'LONG NIGHT DYING EMBERS', subtitle: 'HISTORICAL DRAMA', playId: '15' },
  { id: 'd10', image: 'https://m.ykimg.com/0527000061275FAB13F7FF094E5774FA', badgeClass: '', badgeText: '', episodeText: '25 EPS COMPLETE', title: 'THE COLD SWORDSMAN', subtitle: 'WUXIA COMEDY', playId: '9' },
  { id: 'd11', image: `${CDN}092e3dd582fe420893e63955039704c5.webp.jpg`, badgeClass: 'tag_YELLOW_3uzKD', badgeText: 'VIP', episodeText: '40 EPS COMPLETE', title: 'PHOENIX RETURNS', subtitle: 'IMPERIAL DRAMA', playId: '16' },
  { id: 'd12', image: `${CDN}8c9490411498480fa932f83bfe57cdaa.webp.jpg`, badgeClass: 'tag_RED_2-nUp', badgeText: 'EXCLUSIVE', episodeText: 'EP 8 UPDATING', title: 'RAIN BELL', subtitle: 'YANG YANG · ZHANG RUONAN', playId: '17' },
];

const animeCards: FeedCard[] = [
  { id: 'an1', image: `${CDN}e898046028f24755819e499b69588e28.webp.jpg`, badgeClass: 'tag_RED_2-nUp', badgeText: 'EXCLUSIVE', statusText: 'HOT CHART', statusSub: 'TOP', episodeText: 'EP 75 UPDATED', title: 'THE GRAY REALM', subtitle: 'ANIME HOT CHART · TOP 1', playId: '5' },
  { id: 'an2', image: `${CDN}81518d48c7154c04b4e4bde0f2e06223.webp.jpg`, badgeClass: 'tag_RED_2-nUp', badgeText: 'EXCLUSIVE', statusText: 'HOT CHART', statusSub: 'TOP', episodeText: 'EP 20 UPDATED', title: 'BEYOND TIME', subtitle: 'ANIME HOT CHART · TOP 2', playId: '7' },
  { id: 'an3', image: `${CDN}682fec7981b24c18b45897777cca715f.webp.jpg`, badgeClass: 'tag_RED_2-nUp', badgeText: 'EXCLUSIVE', statusText: 'HOT CHART', statusSub: 'TOP', episodeText: 'EP 140 UPDATED', title: 'MY SENIOR BROTHER', subtitle: 'ANIME HOT CHART · TOP 3', playId: '8' },
  { id: 'an4', image: `${CDN}76ac53c450e446d6b2c2e52bb261eb4d.webp.jpg`, badgeClass: 'tag_YELLOW_3uzKD', badgeText: 'VIP', episodeText: '20 EPS COMPLETE', title: 'STAR CORE KIDS', subtitle: 'ACTION ANIMATION', playId: '18' },
  { id: 'an5', image: `${CDN}c59eade0e9ef43c8aebdc01d02eef080.webp.jpg`, badgeClass: 'tag_YELLOW_3uzKD', badgeText: 'VIP', statusText: 'NEW ARRIVAL', statusSub: 'NEW', episodeText: 'EP 5-2 UPDATED', title: 'POETRY ROAD', subtitle: 'CULTURAL ANIMATION', playId: '19' },
  { id: 'an6', image: `${CDN}4bc7902373544a2eb55ba59c1bece4b2.webp.jpg`, badgeClass: 'tag_SVIP_COLORFUL_2rSkq', badgeText: 'SVIP', statusText: 'UPDATED', statusSub: 'NEW', episodeText: 'EP 29 UPDATED', title: 'SPEED WARRIORS', subtitle: 'KIDS SPORTS ANIME', playId: '20' },
  { id: 'an7', image: `${CDN}a0b877dff7fb4cf8aaba78fdd432085f.webp.jpg`, badgeClass: 'tag_YELLOW_3uzKD', badgeText: 'VIP', episodeText: 'EP 5-7 UPDATED', title: 'OUR DADS S2', subtitle: 'COMEDY FAMILY ANIME', playId: '21' },
  { id: 'an8', image: `${CDN}9d652fa479fe421f8ffadcc038ff1489.webp.jpg`, badgeClass: 'tag_RED_2-nUp', badgeText: 'EXCLUSIVE', episodeText: 'EP 5-4 UPDATED', title: 'BEYOND CLASS', subtitle: 'SCHOOL DRAMA ANIME', playId: '22' },
];

const movieCards: FeedCard[] = [
  { id: 'm1', image: `${CDN}31e59671e8b543c0a51624e9cfd83cce.webp.jpg`, badgeClass: 'tag_BLUE_o8YDy', badgeText: 'PREMIERE', statusText: 'NEW ARRIVAL', statusSub: 'NEW', episodeText: 'FILM', title: 'FLYING LIFE 3', subtitle: 'SHEN TENG · YIN ZHENG', playId: '4' },
  { id: 'm2', image: `${CDN}11803d8ae3d64090b3ef99c6b725b28e.webp.jpg`, badgeClass: 'tag_YELLOW_3uzKD', badgeText: 'VIP', episodeText: 'FILM', title: 'POETS IN THE MOUNTAINS', subtitle: 'CULTURAL DOCUMENTARY FILM', playId: '23' },
  { id: 'm3', image: `${CDN}8c9490411498480fa932f83bfe57cdaa.webp.jpg`, badgeClass: 'tag_RED_2-nUp', badgeText: 'EXCLUSIVE', episodeText: 'FILM', title: 'THE WARLORD SUMMIT', subtitle: 'ACTION THRILLER', playId: '24' },
  { id: 'm4', image: `${CDN}03c45975db904e2ab4a7b7124a99a3b8.webp.jpg`, badgeClass: 'tag_YELLOW_3uzKD', badgeText: 'VIP', episodeText: 'FILM', title: 'VELOCITY DUEL', subtitle: 'RACING ACTION', playId: '25' },
  { id: 'm5', image: `${CDN}965fa67023364601ab3421248e940344.webp.jpg`, badgeClass: '', badgeText: '', episodeText: 'FILM', title: 'WONDERLAND ADVENTURE', subtitle: 'FAMILY FANTASY', playId: '26' },
  { id: 'm6', image: `${CDN}e4e85e60f6a242c09b801c37ebbdbb52.webp.jpg`, badgeClass: 'tag_BLUE_o8YDy', badgeText: 'PREMIERE', episodeText: 'FILM', title: 'THE FINAL MATCH', subtitle: 'SPORTS DRAMA', playId: '27' },
  { id: 'm7', image: `${CDN}092e3dd582fe420893e63955039704c5.webp.jpg`, badgeClass: 'tag_YELLOW_3uzKD', badgeText: 'VIP', episodeText: 'FILM', title: 'THE IRON PHOENIX', subtitle: 'MARTIAL ARTS ACTION', playId: '28' },
  { id: 'm8', image: `${CDN}a85b39cef4874a34a7866ff3cae07868.webp.jpg`, badgeClass: '', badgeText: '', episodeText: 'FILM', title: 'JOURNEY TOGETHER', subtitle: 'FAMILY COMEDY', playId: '29' },
];

const varietyCards: FeedCard[] = [
  { id: 'v1', image: `${CDN}a85b39cef4874a34a7866ff3cae07868.webp.jpg`, badgeClass: 'tag_YELLOW_3uzKD', badgeText: 'VIP', statusText: 'UPDATED', statusSub: 'NEW', episodeText: 'EP 5-7 UPDATED', title: 'OUR DADS S2', subtitle: 'ZHEJIANG TV REALITY SHOW', playId: '30' },
  { id: 'v2', image: `${CDN}d2d82bd126014cc1bd5eafb7fc7c0217.webp.jpg`, badgeClass: 'tag_SVIP_COLORFUL_2rSkq', badgeText: 'SVIP', statusText: 'NEW ARRIVAL', statusSub: 'NEW', episodeText: 'EP 5-6 UPDATED', title: 'KEEP RUNNING S10', subtitle: 'ZHEJIANG TV RUNNING SHOW', playId: '6' },
  { id: 'v3', image: `${CDN}e4e85e60f6a242c09b801c37ebbdbb52.webp.jpg`, badgeClass: 'tag_RED_2-nUp', badgeText: 'EXCLUSIVE', episodeText: 'EP 5-4 UPDATED', title: 'BEYOND CLASS', subtitle: 'ACTING TALENT SHOW', playId: '31' },
  { id: 'v4', image: `${CDN}6d4dc8fa48c04df88294f82b10d002ea.webp.jpg`, badgeClass: 'tag_YELLOW_3uzKD', badgeText: 'VIP', episodeText: 'EP 5-3 UPDATED', title: 'IDOL CAMP S5', subtitle: 'MUSIC VARIETY SHOW', playId: '32' },
  { id: 'v5', image: `${CDN}c25b56fe64bb4a2ba7be1e1f70d13a61.webp.jpg`, badgeClass: 'tag_YELLOW_3uzKD', badgeText: 'VIP', episodeText: '12 EPS COMPLETE', title: 'LAUGH FACTORY', subtitle: 'STAND-UP COMEDY SPECIAL', playId: '33' },
  { id: 'v6', image: `${CDN}23a2908103db41f5b57c1f15a84c5aef.webp.jpg`, badgeClass: '', badgeText: '', episodeText: 'EP 8 UPDATED', title: 'MASTER CHEF CHINA', subtitle: 'COOKING COMPETITION', playId: '34' },
  { id: 'v7', image: `${CDN}de9c08940cb5442998da0b215c609277.webp.jpg`, badgeClass: 'tag_RED_2-nUp', badgeText: 'EXCLUSIVE', episodeText: '10 EPS COMPLETE', title: 'LOVE ISLAND', subtitle: 'ROMANCE REALITY SHOW', playId: '35' },
  { id: 'v8', image: `${CDN}bbee6ed1c7554ace8dcb484a068912d4.webp.jpg`, badgeClass: 'tag_YELLOW_3uzKD', badgeText: 'VIP', episodeText: 'EP 6 UPDATED', title: 'STREET DANCE CHINA', subtitle: 'DANCE COMPETITION', playId: '36' },
];

export const categoryData: Record<string, CategoryInfo> = {
  drama: { id: 'drama', title: 'TV DRAMA', subtitle: 'EXCLUSIVE DRAMAS, ANCIENT COSTUMES, MODERN ROMANCE', color: '#c0392b', gradient: 'linear-gradient(135deg, #1a0a0a, #2d0a0a)', filters: ['ALL DRAMAS', 'ANCIENT COSTUME', 'MODERN', 'ROMANCE', 'CRIME', 'FAMILY', 'COMEDY', '2025', '2024'], cards: dramaCards },
  anime: { id: 'anime', title: 'ANIME', subtitle: 'EPIC ACTION, XIANXIA, SCHOOL LIFE', color: '#1565c0', gradient: 'linear-gradient(135deg, #0a0a1a, #0a0d2d)', filters: ['ALL ANIME', 'ACTION', 'ROMANCE', 'XIANXIA', 'SPORTS', 'COMEDY', 'MECHA', '2025', '2024'], cards: animeCards },
  movies: { id: 'movies', title: 'MOVIES', subtitle: 'BLOCKBUSTERS, INDIE FILMS, WORLD CINEMA', color: '#c07800', gradient: 'linear-gradient(135deg, #1a1200, #2d1e00)', filters: ['ALL FILMS', 'ACTION', 'COMEDY', 'ROMANCE', 'THRILLER', 'SCI-FI', 'ANIMATION', '2025', '2024'], cards: movieCards },
  variety: { id: 'variety', title: 'VARIETY SHOWS', subtitle: 'REALITY, TALENT, COMEDY, TRAVEL', color: '#1a7a4a', gradient: 'linear-gradient(135deg, #001a0e, #002d18)', filters: ['ALL VARIETY', 'REALITY', 'TALENT', 'TRAVEL', 'FOOD', 'COMEDY', 'MUSIC', '2025', '2024'], cards: varietyCards },
  short: { id: 'short', title: 'SHORT DRAMA', subtitle: 'BINGE-WORTHY SHORT SERIES', color: '#c03060', gradient: 'linear-gradient(135deg, #1a0010, #2d0018)', filters: ['ALL SHORT', 'ROMANCE', 'ACTION', 'COMEDY', 'ANCIENT', 'MODERN', 'FANTASY', '2025', '2024'], cards: dramaCards.slice(0, 8) },
  kids: { id: 'kids', title: 'KIDS', subtitle: 'ANIMATION, LEARNING, FUN FOR ALL AGES', color: '#d4800a', gradient: 'linear-gradient(135deg, #1a0e00, #2d1800)', filters: ['ALL KIDS', 'ANIMATION', 'EDUCATION', 'PRESCHOOL', 'ACTION', 'COMEDY', 'ADVENTURE', 'AGES 3-6', 'AGES 6-12'], cards: animeCards.slice(3, 8).concat(dramaCards.slice(0, 3)) },
  vip: { id: 'vip', title: 'VIP CENTER', subtitle: 'EXCLUSIVE MEMBER CONTENT & BENEFITS', color: '#c8a200', gradient: 'linear-gradient(135deg, #1a1400, #2d2300)', filters: ['VIP EXCLUSIVE', 'SVIP EXCLUSIVE', 'VIP MOVIES', 'VIP DRAMA', 'VIP VARIETY', 'OFFLINE PLAY', 'AD-FREE'], cards: [...dramaCards.slice(0, 4), ...movieCards.slice(0, 4)] },
  documentary: { id: 'documentary', title: 'DOCUMENTARY', subtitle: 'NATURE, HISTORY, CULTURE, SCIENCE', color: '#5a4000', gradient: 'linear-gradient(135deg, #0e0a00, #1a1200)', filters: ['ALL DOCS', 'NATURE', 'HISTORY', 'CULTURE', 'SCIENCE', 'SOCIETY', 'TRAVEL', '2025', '2024'], cards: [...animeCards.slice(4, 8), ...movieCards.slice(1, 5)] },
  sports: { id: 'sports', title: 'SPORTS', subtitle: 'FOOTBALL, BASKETBALL, EXTREME SPORTS', color: '#1560a0', gradient: 'linear-gradient(135deg, #000a1a, #00122d)', filters: ['ALL SPORTS', 'FOOTBALL', 'BASKETBALL', 'TENNIS', 'ESPORTS', 'EXTREME', 'HIGHLIGHTS', 'LIVE'], cards: movieCards.slice(0, 8) },
  culture: { id: 'culture', title: 'CULTURE & ART', subtitle: 'HISTORY, MUSIC, THEATER, HUMANITIES', color: '#6a3000', gradient: 'linear-gradient(135deg, #0e0800, #1a1000)', filters: ['ALL CULTURE', 'HISTORY', 'MUSIC', 'THEATER', 'PAINTING', 'TRADITION', 'LITERATURE'], cards: animeCards.slice(0, 8) },
  live: { id: 'live', title: 'LIVE', subtitle: 'LIVE BROADCASTS, EVENTS, CONCERTS', color: '#c00000', gradient: 'linear-gradient(135deg, #1a0000, #2d0000)', filters: ['ALL LIVE', 'NEWS', 'SPORTS LIVE', 'CONCERT', 'ESPORTS LIVE', 'VARIETY LIVE', 'DRAMA LIVE'], cards: varietyCards },
  games: { id: 'games', title: 'GAMES', subtitle: 'MOBILE, PC GAMING, ESPORTS', color: '#00880a', gradient: 'linear-gradient(135deg, #001200, #001e00)', filters: ['ALL GAMES', 'MOBILE', 'PC', 'ESPORTS', 'STRATEGY', 'RPG', 'ACTION'], cards: movieCards.slice(0, 8) },
  learning: { id: 'learning', title: 'LEARNING', subtitle: 'EDUCATION, SKILLS, EXAM PREP', color: '#1878c8', gradient: 'linear-gradient(135deg, #001018, #001528)', filters: ['ALL LEARNING', 'LANGUAGE', 'EXAM PREP', 'SKILLS', 'FINANCE', 'CODING', 'SCIENCE'], cards: animeCards },
  knowledge: { id: 'knowledge', title: 'KNOWLEDGE', subtitle: 'SCIENCE, TECH, CURIOSITY, DISCOVERY', color: '#0050a0', gradient: 'linear-gradient(135deg, #000818, #000d28)', filters: ['ALL KNOWLEDGE', 'SCIENCE', 'TECH', 'BIOLOGY', 'SPACE', 'HISTORY', 'ECONOMICS'], cards: movieCards },
  'new-films': { id: 'new-films', title: 'NEW RELEASES', subtitle: 'JUST DROPPED — LATEST CONTENT', color: '#b07800', gradient: 'linear-gradient(135deg, #181000, #281800)', filters: ['ALL NEW', 'THIS WEEK', 'THIS MONTH', 'DRAMA', 'ANIME', 'MOVIES', 'VARIETY'], cards: [...dramaCards.slice(0, 4), ...movieCards.slice(0, 4)] },
  health: { id: 'health', title: 'HEALTH', subtitle: 'FITNESS, WELLNESS, MEDICAL', color: '#008060', gradient: 'linear-gradient(135deg, #001810, #002818)', filters: ['ALL HEALTH', 'FITNESS', 'NUTRITION', 'MENTAL', 'YOGA', 'MEDICAL', 'LIFESTYLE'], cards: varietyCards },
  charity: { id: 'charity', title: 'CHARITY', subtitle: 'PUBLIC GOOD, SOCIAL IMPACT', color: '#c04020', gradient: 'linear-gradient(135deg, #1a0800, #2d1000)', filters: ['ALL CHARITY', 'ENVIRONMENT', 'EDUCATION', 'POVERTY', 'ANIMALS', 'HEALTH'], cards: movieCards },
  accessible: { id: 'accessible', title: 'ACCESSIBLE', subtitle: 'CONTENT FOR EVERYONE', color: '#404080', gradient: 'linear-gradient(135deg, #080818, #0d0d28)', filters: ['ALL', 'AUDIO DESC', 'SUBTITLED', 'SIGNED', 'SIMPLIFIED'], cards: dramaCards },
};

// ================== PLAY PAGE DATA ==================

export interface RelatedVideo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  badge?: string;
  isPlaying?: boolean;
}

export interface CastMember {
  id: string;
  name: string;
  avatar: string;
}

export interface PlayShow {
  id: string;
  title: string;
  subtitle: string;
  showImg: string;
  category: string;
  badgeClass: string;
  badgeText: string;
  heat: number;
  rank: string;
  tags: string[];
  desc: string;
  totalEps: number;
  completedEps: number;
  cast: CastMember[];
  relatedVideos: RelatedVideo[];
  recommendedCards: FeedCard[];
  videoUrl: string;
  posterUrl: string;
}

export const playShows: Record<string, PlayShow> = {
  '1': {
    id: '1',
    title: 'OCEAN OF DESTINY',
    subtitle: 'XIAO ZHAN PLAYS DETECTIVE IN AN EPIC MARTIAL ARTS ADVENTURE',
    showImg: `${CDN}6d4dc8fa48c04df88294f82b10d002ea.webp.jpg`,
    category: 'TV DRAMA',
    badgeClass: 'tag_RED_2-nUp',
    badgeText: 'FREE NOW',
    heat: 8921,
    rank: 'TV DRAMA HOT CHART · TOP 1',
    tags: ['ANCIENT COSTUME', 'ROMANCE', 'ACTION'],
    desc: 'SET IN THE ANCIENT SEAS, THE FEARLESS DETECTIVE AND HIS UNLIKELY ALLIES VENTURE ACROSS TREACHEROUS WATERS TO UNCOVER A DEADLY CONSPIRACY THREATENING THE THRONE. STARRING XIAO ZHAN AND XIN ZHILEI IN A BREATHTAKING EPIC.',
    totalEps: 40,
    completedEps: 10,
    cast: [
      { id: 'c1', name: 'XIAO ZHAN', avatar: `${MYKIMG}051400006880E2B92B137F15C20B9177` },
      { id: 'c2', name: 'XIN ZHILEI', avatar: `${MYKIMG}0514000060FFAD220474EB08D60D5843` },
      { id: 'c3', name: 'ZHANG YUXI', avatar: `${MYKIMG}0514000065F8F25566ECBC121C025A8D` },
      { id: 'c4', name: 'FANG YILUN', avatar: `${MYKIMG}0514000064A28E9E3F561A0C6C09D688` },
      { id: 'c5', name: 'YUE YANG', avatar: `${MYKIMG}051400005B9A02EA859B5E4D0B045BE0` },
    ],
    relatedVideos: [
      { id: 'rv1', title: 'EPIC MARTIAL ARTS SPECIAL — UNLOCKING THE HIGH-ENERGY WULIN WORLD', thumbnail: `${MYKIMG}054F010169F9692F078A4C154F90590C`, duration: '03:12', badge: 'TRAILER' },
      { id: 'rv2', title: 'BLAZING MARTIAL ARTS JOURNEY — THE FIGHT FRAMES REVEALED', thumbnail: `${MYKIMG}054F010169F2CDD03CE8DE166EA40322`, duration: '00:58' },
      { id: 'rv3', title: 'SACRIFICING EVERYTHING! HUNTED DOWN TO CRACK THE CASE', thumbnail: `${MYKIMG}054F010169EF1BB0E36F4437E0BEDCA3`, duration: '00:15' },
      { id: 'rv4', title: 'HANDCRAFTED MARTIAL ARTS — THE ULTIMATE FIGHT SEQUENCE', thumbnail: `${MYKIMG}054F010169F1EE763D38441639A81D6C`, duration: '04:01', badge: 'TRAILER' },
      { id: 'rv5', title: 'XIAO ZHAN — THE ROLE OF A LIFETIME HAS ARRIVED!', thumbnail: `${MYKIMG}054F010169EF5A37B7C2511FDC7A436E`, duration: '01:02' },
      { id: 'rv6', title: 'THREE HEROES UNITE — OPENING THE DETECTIVE CASE', thumbnail: `${MYKIMG}054F010169CBC8383CB33B1F1E527531`, duration: '01:12' },
    ],
    recommendedCards: [
      { id: 'rec1', image: `${MYKIMG}05840000668E42B67B50C013AE04100E`, badgeClass: 'tag_BLUE_o8YDy', badgeText: 'SHORT', episodeText: '100 EPS COMPLETE', title: 'DIVINE MARTIAL PRINCE RETURNS', subtitle: 'SHORT DRAMA · ACTION', playId: 'r1' },
      { id: 'rec2', image: `${MYKIMG}05840000686770EC203CC7170415F3C1`, badgeClass: 'tag_RED_2-nUp', badgeText: 'EXCLUSIVE', episodeText: '24 EPS COMPLETE', title: 'THE GUILTY HANDMAIDEN', subtitle: 'ANCIENT ROMANCE', playId: 'r2' },
      { id: 'rec3', image: `https://m.ykimg.com/0527000063C495C82052EE0CAB33A2EF`, badgeClass: '', badgeText: '', episodeText: '13 EPS COMPLETE', title: 'A LIFETIME OF GLORY', subtitle: 'HISTORICAL DRAMA', playId: 'r3' },
      { id: 'rec4', image: `https://m.ykimg.com/052700006329826F13E7420BE2AC1314`, badgeClass: '', badgeText: '', episodeText: '20 EPS COMPLETE', title: 'THE EMBROIDERY SHOPKEEPER', subtitle: 'PERIOD COMEDY', playId: 'r4' },
      { id: 'rec5', image: `https://m.ykimg.com/0527000062A187B11408C209A76A2360`, badgeClass: '', badgeText: '', episodeText: '25 EPS COMPLETE', title: 'THE WITTY MAGISTRATE', subtitle: 'HISTORICAL COMEDY', playId: 'r5' },
      { id: 'rec6', image: `https://m.ykimg.com/05270000664C0AF72037570F681C748A`, badgeClass: 'tag_YELLOW_3uzKD', badgeText: 'VIP', episodeText: '18 EPS COMPLETE', title: 'THE HEALING HERO', subtitle: 'MEDICAL DRAMA', playId: 'r6' },
    ],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    posterUrl: `${CDN}6d4dc8fa48c04df88294f82b10d002ea.webp.jpg`,
  },
};

// Default show for unknown IDs
export const defaultPlayShow: PlayShow = {
  ...playShows['1'],
  id: 'default',
};

export function getPlayShow(id: string): PlayShow {
  return playShows[id] || { ...playShows['1'], id };
}

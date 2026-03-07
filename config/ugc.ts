import {
  type UgcGender,
  type UgcAgeGroup,
  type UgcScenePreset,
} from "@/types/ugc";

const COMMON_SCENES: UgcScenePreset[] = [
  {
    id: "mirror-selfie",
    name: "침실 거울 셀카",
    scene: "Standing in front of a full-length bedroom mirror, holding a smartphone to take a mirror selfie. Cozy Korean bedroom with warm lighting, bed visible in the background.",
    category: "indoor",
    emoji: "🪞",
  },
  {
    id: "cafe-selfie",
    name: "카페에서 셀카",
    scene: "Sitting at a Korean cafe table, taking a selfie. A coffee cup and small dessert plate slightly visible on the table. Warm ambient cafe interior with Korean signage.",
    category: "indoor",
    emoji: "☕",
  },
  {
    id: "street-walking",
    name: "거리를 걷는 모습",
    scene: "Walking on a Korean urban sidewalk, candid shot from a friend's perspective. Korean street signs, shops, and buildings in the background. Natural daylight.",
    category: "outdoor",
    emoji: "🚶",
  },
];

const F10_SCENES: UgcScenePreset[] = [
  { id: "f10-school-hallway", name: "학교 복도에서", scene: "Standing in a Korean high school hallway with lockers and classroom doors visible. Bright fluorescent lighting, taking a selfie between classes.", category: "indoor", emoji: "🏫" },
  { id: "f10-photo-booth", name: "포토그레이에서", scene: "Taking a mirror selfie reflected in the dark tinted glass exterior of a Korean photo studio (포토그레이) storefront at night. Smartphone held up at face level, store logo and interior lighting faintly visible through the dark glass behind the reflection. Upper-body framing, dim ambient urban night lighting, the dark glass acting as a natural mirror.", category: "indoor", emoji: "📸" },
  { id: "f10-amusement-park", name: "놀이공원에서", scene: "At a Korean amusement park like Lotte World or Everland, rides and colorful decorations in the blurry background, bright sunny day.", category: "leisure", emoji: "🎢" },
  { id: "f10-study-cafe", name: "스터디카페에서", scene: "Sitting at a partitioned desk in a Korean study cafe, books and tablet visible, warm desk lamp lighting.", category: "indoor", emoji: "📚" },
  { id: "f10-convenience-store", name: "편의점 앞에서", scene: "Standing outside a Korean convenience store (CU, GS25) at night, holding a drink, neon lights reflecting on the street.", category: "outdoor", emoji: "🏪" },
  { id: "f10-bubble-tea", name: "버블티 들고", scene: "Holding a bubble tea cup while walking in a Korean shopping area, candid shot with colorful Korean shop signs behind.", category: "outdoor", emoji: "🧋" },
  { id: "f10-subway-station", name: "지하철역에서", scene: "Standing in a Korean subway station, tiled walls and route map visible in background, taking a quick mirror selfie in station glass.", category: "transport", emoji: "🚇" },
];

const M10_SCENES: UgcScenePreset[] = [
  { id: "m10-basketball-court", name: "농구장에서", scene: "Standing on an outdoor Korean school basketball court, basketball hoop visible, slightly sweaty after a game, candid shot.", category: "leisure", emoji: "🏀" },
  { id: "m10-pc-room", name: "PC방에서", scene: "Sitting in a Korean PC bang (internet cafe), monitors and gaming peripherals visible, blue-tinted ambient lighting.", category: "indoor", emoji: "🖥️" },
  { id: "m10-school-uniform", name: "교실에서", scene: "Sitting at a Korean classroom desk, chalkboard and windows in background, natural afternoon light.", category: "indoor", emoji: "✏️" },
  { id: "m10-skateboard", name: "스케이트파크에서", scene: "At a Korean urban skatepark, holding a skateboard, graffiti walls in background, golden hour lighting.", category: "leisure", emoji: "🛹" },
  { id: "m10-convenience-store", name: "편의점 앞에서", scene: "Leaning against a Korean convenience store wall at night, holding a snack, neon sign glow.", category: "outdoor", emoji: "🏪" },
  { id: "m10-subway", name: "지하철에서", scene: "Sitting in a Korean subway car, holding phone, window reflections and Korean subway interior visible.", category: "transport", emoji: "🚇" },
  { id: "m10-study-cafe", name: "스터디카페에서", scene: "At a Korean study cafe desk, notebooks and laptop visible, focused candid shot from friend's angle.", category: "indoor", emoji: "📖" },
];

const F20_SCENES: UgcScenePreset[] = [
  { id: "f20-ktx-seat", name: "KTX 좌석에서", scene: "Sitting in a KTX (Korean high-speed train) window seat, blurry passing scenery outside, selfie with warm natural light from the window.", category: "transport", emoji: "🚄" },
  { id: "f20-campus-bench", name: "대학 캠퍼스 벤치", scene: "Sitting on a Korean university campus bench, autumn trees and brick buildings in background, friend's candid shot.", category: "outdoor", emoji: "🍂" },
  { id: "f20-convenience-store", name: "편의점 앞에서", scene: "Standing outside a Korean convenience store at night, holding a drink, neon GS25/CU sign glowing, selfie.", category: "outdoor", emoji: "🏪" },
  { id: "f20-photo-booth", name: "포토그레이에서", scene: "Taking a mirror selfie reflected in the dark tinted glass exterior of a Korean photo studio (포토그레이) storefront at night. Smartphone held up at face level, store logo and interior lighting faintly visible through the dark glass behind the reflection. Upper-body framing, dim ambient urban night lighting, the dark glass acting as a natural mirror.", category: "indoor", emoji: "📸" },
  { id: "f20-rooftop", name: "옥상에서", scene: "Standing on a Korean building rooftop, city skyline and apartments in background, golden hour warm lighting, wind in hair.", category: "outdoor", emoji: "🌇" },
  { id: "f20-subway", name: "지하철 안에서", scene: "Standing in a Korean subway car, holding the overhead handle with one hand, taking a selfie with the other, subway interior and passengers blurred.", category: "transport", emoji: "🚇" },
  { id: "f20-fitting-room", name: "피팅룸 거울", scene: "Inside a Korean clothing store fitting room, full-length mirror selfie, curtain and clothes hangers partially visible.", category: "indoor", emoji: "👗" },
];

const M20_SCENES: UgcScenePreset[] = [
  { id: "m20-basketball-court", name: "농구장에서", scene: "On an outdoor Korean basketball court, holding a basketball, slightly sweaty, evening court lights on.", category: "leisure", emoji: "🏀" },
  { id: "m20-pc-room", name: "PC방에서", scene: "At a Korean PC bang, RGB keyboard and monitors glowing, leaning back in gaming chair, selfie.", category: "indoor", emoji: "🖥️" },
  { id: "m20-gym-mirror", name: "헬스장 거울", scene: "In front of a Korean gym mirror, weight racks and machines in background, post-workout selfie.", category: "leisure", emoji: "💪" },
  { id: "m20-convenience", name: "편의점에서", scene: "Inside a Korean convenience store, standing by the ramyeon station, holding a cup noodle, fluorescent lighting.", category: "indoor", emoji: "🏪" },
  { id: "m20-lecture-hall", name: "강의실에서", scene: "Sitting in a Korean university lecture hall, tiered seating and whiteboard visible, candid shot before class.", category: "indoor", emoji: "🎓" },
  { id: "m20-hangang", name: "한강에서", scene: "Sitting on the grass at Hangang Park in Seoul, river and bridge in background, convenience store snacks spread out, golden hour.", category: "outdoor", emoji: "🌊" },
  { id: "m20-studio-apt", name: "원룸에서", scene: "In a small Korean studio apartment (원룸), bed and desk visible, warm LED strip lighting, mirror selfie.", category: "indoor", emoji: "🏠" },
];

const F30_SCENES: UgcScenePreset[] = [
  { id: "f30-office-desk", name: "사무실 책상에서", scene: "At a Korean office desk, monitor and coffee mug visible, professional but casual selfie during break time.", category: "indoor", emoji: "💼" },
  { id: "f30-car-mirror", name: "차 안에서", scene: "In the driver's seat of a car in a Korean parking lot, rearview mirror visible, natural light through windshield, selfie.", category: "transport", emoji: "🚗" },
  { id: "f30-brunch", name: "브런치 카페에서", scene: "At a trendy Korean brunch cafe, beautiful plated food on the table, large window with natural light, candid shot.", category: "indoor", emoji: "🥐" },
  { id: "f30-department-store", name: "백화점에서", scene: "In a Korean department store (Hyundai/Lotte/Shinsegae), luxury brand displays in background, full-length mirror, elegant selfie.", category: "indoor", emoji: "🛍️" },
  { id: "f30-park-walk", name: "공원 산책", scene: "Walking on a tree-lined path in a Korean park (Seoul Forest/Olympic Park), natural dappled sunlight, friend's candid shot.", category: "outdoor", emoji: "🌳" },
  { id: "f30-pilates", name: "필라테스 스튜디오", scene: "In a bright Korean pilates studio, reformer machines in background, post-class selfie in activewear.", category: "leisure", emoji: "🧘" },
  { id: "f30-hotel-lobby", name: "호텔 로비에서", scene: "In a luxurious Korean hotel lobby, marble floor and chandelier visible, elegant full-body shot from concierge angle.", category: "indoor", emoji: "🏨" },
];

const M30_SCENES: UgcScenePreset[] = [
  { id: "m30-commute-subway", name: "출근길 지하철", scene: "Standing in a crowded Korean subway during morning commute, earbuds in, holding overhead strap, candid commuter shot.", category: "transport", emoji: "🚇" },
  { id: "m30-parking-lot", name: "주차장에서", scene: "Standing next to a car in an underground Korean apartment parking garage, concrete walls, fluorescent lighting, quick selfie.", category: "transport", emoji: "🅿️" },
  { id: "m30-office", name: "사무실에서", scene: "At a modern Korean office space, standing by the window with city view, professional casual attire, colleague's candid shot.", category: "indoor", emoji: "🏢" },
  { id: "m30-golf-range", name: "골프 연습장에서", scene: "At a Korean indoor golf range (스크린골프), club in hand, screen showing course, warm indoor lighting.", category: "leisure", emoji: "⛳" },
  { id: "m30-car-sideview", name: "차량 사이드미러", scene: "Leaning against the car door in a Korean street, side mirror visible, urban background, casual confident pose.", category: "transport", emoji: "🚙" },
  { id: "m30-meeting-room", name: "회의실에서", scene: "In a Korean corporate meeting room, glass walls and whiteboard visible, holding coffee, candid shot between meetings.", category: "indoor", emoji: "📋" },
  { id: "m30-bar", name: "바에서", scene: "At a cozy Korean bar (포차/와인바), warm dim lighting, bottles on shelves behind, holding a drink, evening selfie.", category: "indoor", emoji: "🍷" },
];

const F40_SCENES: UgcScenePreset[] = [
  { id: "f40-apartment-lobby", name: "아파트 로비에서", scene: "In a modern Korean apartment building lobby, marble floors, mirror wall, full-body selfie before heading out.", category: "indoor", emoji: "🏢" },
  { id: "f40-hiking-trail", name: "등산로에서", scene: "On a Korean mountain hiking trail (북한산/관악산), autumn foliage, friend's candid shot with scenic view.", category: "outdoor", emoji: "⛰️" },
  { id: "f40-department-store", name: "백화점에서", scene: "In a Korean department store, luxury shopping area, elegant full-body shot near brand displays.", category: "indoor", emoji: "🛍️" },
  { id: "f40-yoga-studio", name: "요가 스튜디오", scene: "In a bright Korean yoga/pilates studio, wooden floor and mirrors, post-class relaxed selfie.", category: "leisure", emoji: "🧘" },
  { id: "f40-garden-cafe", name: "가든 카페에서", scene: "At a Korean garden cafe, plants and flowers surrounding, natural daylight, elegant afternoon tea setting.", category: "outdoor", emoji: "🌿" },
  { id: "f40-golf-course", name: "골프장에서", scene: "At a Korean golf course, green fairway in background, holding a club, sunny day with blue sky.", category: "leisure", emoji: "⛳" },
  { id: "f40-car-interior", name: "차 안에서", scene: "In a luxury car interior, Korean apartment complex visible through window, natural morning light, quick selfie.", category: "transport", emoji: "🚗" },
];

const M40_SCENES: UgcScenePreset[] = [
  { id: "m40-golf-course", name: "골프장에서", scene: "At a Korean golf course, green fairway and mountains in background, wearing golf attire, sunny day.", category: "leisure", emoji: "⛳" },
  { id: "m40-office-window", name: "사무실 창가에서", scene: "Standing by a high-rise office window, Korean cityscape panorama, professional executive look, colleague's shot.", category: "indoor", emoji: "🏢" },
  { id: "m40-apartment-lobby", name: "아파트 로비에서", scene: "In a modern Korean apartment lobby, well-dressed, heading out in the morning, quick mirror selfie.", category: "indoor", emoji: "🏠" },
  { id: "m40-hiking", name: "등산에서", scene: "On a Korean mountain trail summit, Seoul cityscape visible below, slightly windswept, achievement selfie.", category: "outdoor", emoji: "🏔️" },
  { id: "m40-restaurant", name: "레스토랑에서", scene: "At an upscale Korean restaurant, beautiful table setting, warm ambient lighting, candid dinner shot.", category: "indoor", emoji: "🍽️" },
  { id: "m40-parking", name: "주차장에서", scene: "Standing next to a luxury sedan in a Korean building parking lot, car key in hand, quick candid shot.", category: "transport", emoji: "🚗" },
  { id: "m40-fishing", name: "낚시터에서", scene: "At a Korean reservoir or sea fishing spot, fishing rod in hand, calm water and nature in background.", category: "leisure", emoji: "🎣" },
];

const TARGET_SCENES: Record<string, UgcScenePreset[]> = {
  "female-10s": F10_SCENES,
  "male-10s": M10_SCENES,
  "female-20s": F20_SCENES,
  "male-20s": M20_SCENES,
  "female-30s": F30_SCENES,
  "male-30s": M30_SCENES,
  "female-40s+": F40_SCENES,
  "male-40s+": M40_SCENES,
};

export function getUgcScenesForTarget(
  gender: UgcGender,
  ageGroup: UgcAgeGroup,
): UgcScenePreset[] {
  const key = `${gender}-${ageGroup}`;
  const targetScenes = TARGET_SCENES[key] || F20_SCENES;
  return [...COMMON_SCENES, ...targetScenes];
}

export const UGC_SCENE_CATEGORY_LABELS: Record<string, string> = {
  indoor: "실내",
  outdoor: "야외",
  transport: "교통",
  leisure: "레저",
};

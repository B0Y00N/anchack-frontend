import { DONG_DATA } from "../utils/mockData";

export function useDongStats(district, dong) {
  const hash = dong.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 20;
  const d = DONG_DATA[district] ?? { avgRent: 60, safetyScore: 75, transitScore: 75, infraScore: 75, dong: [] };
  const h = hash;

  const stats = {
    safetyScore: Math.min(98, d.safetyScore + (h % 10) - 5),
    transitScore: Math.min(98, d.transitScore + (h % 8) - 4),
    infraScore: Math.min(98, d.infraScore + (h % 12) - 6),
    avgRent: Math.max(30, d.avgRent + h - 10),
    cctv: +(1.2 + (h % 8) * 0.2).toFixed(1),
    crimeRate: +(2.8 - (h % 6) * 0.25).toFixed(1),
    gyms: 1 + (h % 4), convenience: 3 + (h % 6), hospitals: 1 + (h % 3), parks: 1 + (h % 3),
    pharmacies: 1 + (h % 3), banks: 1 + (h % 4), cafes: 4 + (h % 8),
    subwayLine: ["2호선", "4호선", "6호선", "7호선", "경의중앙선"][h % 5],
    avgCommute: 32 + (h % 18),
    population: 7500 + h * 350,
  };

  return { hash, stats };
}

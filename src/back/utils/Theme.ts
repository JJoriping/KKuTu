/*!
 * Rule the words! KKuTu Online
 * Copyright (C) 2020  JJoriping(op@jjo.kr)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * 사전에 등재된 언어별 단어 주제 객체.
 */
export const THEMES = {
  ko: [
    "30", "40", "60", "80", "90",
    "140", "150", "160", "170", "190",
    "220", "230", "240", "270", "310",
    "320", "350", "360", "420", "430",
    "450", "490", "530", "1001"
  ],
  en: [
    "e05", "e08", "e12", "e13", "e15",
    "e18", "e20", "e43"
  ]
};
/**
 * 어인정 규칙으로 사용할 수 있는 언어별 단어 주제 객체.
 */
export const EXTENDED_THEMES = {
  ko: [
    "IMS", "VOC", "KRR", "KTV",
    "NSK", "KOT", "DOT", "DRR", "DGM", "RAG", "LVL",
    "LOL", "MRN", "MMM", "MAP", "MKK", "MNG",
    "MOB", "HYK", "CYP", "HRH", "STA", "OIJ",
    "KGR", "ESB", "ELW", "OIM", "OVW", "NEX",
    "YRY", "KPO", "JLN", "JAN", "ZEL", "POK", "HAI",
    "HSS", "KMV", "HDC", "HOS"
  ],
  en: [
    "LOL"
  ]
};
/**
 * 주제를 선택해서 진행하는 게임 유형 중 선택할 수 없는 주제 목록.
 */
export const UNAVAILABLE_EXTENSIONS = [
  "OIJ"
];
/**
 * 주제를 선택해서 진행하는 게임 유형에서, 사용할 수 있는 언어별 단어 주제 객체.
 */
export const AVAILABLE_THEMES = {
  ko: EXTENDED_THEMES['ko'].concat(THEMES['ko']).filter(v => !UNAVAILABLE_EXTENSIONS.includes(v)),
  en: EXTENDED_THEMES['en'].concat(THEMES['en']).filter(v => !UNAVAILABLE_EXTENSIONS.includes(v))
};

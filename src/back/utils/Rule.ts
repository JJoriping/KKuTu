/*
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

export enum Rule{
  /**
   * 영어 끄투.
   */
  ENGLISH_KKUTU = "EKT",
  /**
   * 영어 끝말잇기.
   */
  ENGLISH_REAR = "ESH",
  /**
   * 한국어 쿵쿵따.
   */
  KOREAN_REAR_3 = "KKT",
  /**
   * 한국어 끝말잇기.
   */
  KOREAN_REAR = "KSH",
  /**
   * 한국어 자음퀴즈.
   */
  CONSONANT_QUIZ = "CSQ",
  /**
   * 한국어 십자말풀이.
   */
  KOREAN_CROSSWORD = "KCW",
  /**
   * 한국어 타자 대결.
   */
  KOREAN_TYPING = "KTY",
  /**
   * 영어 타자 대결.
   */
  ENGLISH_TYPING = "ETY",
  /**
   * 한국어 앞말잇기.
   */
  KOREAN_FRONT = "KAP",
  /**
   * 한국어 훈민정음.
   */
  HUNMINJEONGEUM = "HUN",
  /**
   * 한국어 단어 대결.
   */
  KOREAN_THEME = "KDA",
  /**
   * 영어 단어 대결.
   */
  ENGLISH_THEME = "EDA",
  /**
   * 한국어 솎솎.
   */
  KOREAN_SOCK = "KSS",
  /**
   * 영어 솎솎.
   */
  ENGLISH_SOCK = "ESS"
}
/**
 * 각 게임 유형에서 지원하는 특수 규칙 열거형.
 */
export enum RuleOption{
  /**
   * 매너.
   *
   * 한방 단어를 사용할 수 없게 한다.
   */
  MANNER = "man",
  /**
   * 어인정.
   *
   * 사전에 없지만 데이터베이스에 추가된 단어를 사용할 수 있게 한다.
   */
  EXTENDED = "ext",
  /**
   * 미션.
   *
   * 무작위로 주어지는 미션 글자를 포함시킨 단어로 차례를 넘기면 추가 점수를 얻는다.
   */
  MISSION = "mis",
  /**
   * 우리말.
   *
   * 외래어나 외국어를 사용할 수 없게 한다.
   */
  NO_LOANWORDS = "loa",
  /**
   * 깐깐.
   *
   * 품사가 없거나 명사가 아닌 말, 옛말, 사투리, 북한말을 사용할 수 없게 한다.
   */
  STRICT = "str",
  /**
   * 3232.
   *
   * 한국어 쿵쿵따에서, 세 글자와 두 글자 단어를 번갈아가며 잇도록 한다.
   */
  THREE_TWO = "k32",
  /**
   * 어인정 주제 선택.
   *
   * 특정 주제에 해당하는 단어들로 게임을 진행하는 유형임을 명시한다.
   */
  EXTENSIONS = "ijp",
  /**
   * 속담.
   *
   * 단어 대신 속담을 사용하게 한다.
   */
  PROVERB = "prv",
  /**
   * 두 글자 금지.
   *
   * 두 글자 단어를 사용할 수 없게 한다.
   */
  NO_TWO = "no2"
}

export const RULE_TABLE:{
  [key in Rule]:KKuTu.RuleCharacteristics
} = {
  [Rule.ENGLISH_KKUTU]: {
    locale        : "en",
    name          : "Classic",
    options       : [ RuleOption.MANNER, RuleOption.EXTENDED, RuleOption.MISSION ],
    time          : 1,
    ai            : true,
    big           : false,
    newRoundOnQuit: true
  },
  [Rule.ENGLISH_REAR]: {
    locale        : "en",
    name          : "Classic",
    options       : [ RuleOption.EXTENDED, RuleOption.MISSION ],
    time          : 1,
    ai            : true,
    big           : false,
    newRoundOnQuit: true
  },
  [Rule.KOREAN_REAR_3]: {
    locale : "ko",
    name   : "Classic",
    options: [
      RuleOption.MANNER,
      RuleOption.EXTENDED,
      RuleOption.MISSION,
      RuleOption.NO_LOANWORDS,
      RuleOption.STRICT,
      RuleOption.THREE_TWO
    ],
    time          : 1,
    ai            : true,
    big           : false,
    newRoundOnQuit: true
  },
  [Rule.KOREAN_REAR]: {
    locale : "ko",
    name   : "Classic",
    options: [
      RuleOption.MANNER,
      RuleOption.EXTENDED,
      RuleOption.MISSION,
      RuleOption.NO_LOANWORDS,
      RuleOption.STRICT
    ],
    time          : 1,
    ai            : true,
    big           : false,
    newRoundOnQuit: true
  },
  [Rule.CONSONANT_QUIZ]: {
    locale : "ko",
    name   : "Jaqwi",
    options: [
      RuleOption.EXTENSIONS
    ],
    time          : 1,
    ai            : true,
    big           : false,
    newRoundOnQuit: false
  },
  [Rule.KOREAN_CROSSWORD]: {
    locale        : "ko",
    name          : "Crossword",
    options       : [],
    time          : 2,
    ai            : false,
    big           : true,
    newRoundOnQuit: false
  },
  [Rule.KOREAN_TYPING]: {
    locale : "ko",
    name   : "Typing",
    options: [
      RuleOption.PROVERB
    ],
    time          : 1,
    ai            : false,
    big           : false,
    newRoundOnQuit: false
  },
  [Rule.ENGLISH_TYPING]: {
    locale : "en",
    name   : "Typing",
    options: [
      RuleOption.PROVERB
    ],
    time          : 1,
    ai            : false,
    big           : false,
    newRoundOnQuit: false
  },
  [Rule.KOREAN_FRONT]: {
    locale : "ko",
    name   : "Classic",
    options: [
      RuleOption.MANNER,
      RuleOption.EXTENDED,
      RuleOption.MISSION,
      RuleOption.NO_LOANWORDS,
      RuleOption.STRICT
    ],
    time          : 1,
    ai            : true,
    big           : false,
    newRoundOnQuit: true
  },
  [Rule.HUNMINJEONGEUM]: {
    locale : "ko",
    name   : "Hunmin",
    options: [
      RuleOption.EXTENDED,
      RuleOption.MISSION,
      RuleOption.NO_LOANWORDS,
      RuleOption.STRICT
    ],
    time          : 1,
    ai            : true,
    big           : false,
    newRoundOnQuit: true
  },
  [Rule.KOREAN_THEME]: {
    locale : "ko",
    name   : "Daneo",
    options: [
      RuleOption.EXTENSIONS,
      RuleOption.MISSION
    ],
    time          : 1,
    ai            : true,
    big           : false,
    newRoundOnQuit: true
  },
  [Rule.ENGLISH_THEME]: {
    locale : "en",
    name   : "Daneo",
    options: [
      RuleOption.EXTENSIONS,
      RuleOption.MISSION
    ],
    time          : 1,
    ai            : true,
    big           : false,
    newRoundOnQuit: true
  },
  [Rule.KOREAN_SOCK]: {
    locale : "ko",
    name   : "Sock",
    options: [
      RuleOption.NO_TWO
    ],
    time          : 1,
    ai            : false,
    big           : true,
    newRoundOnQuit: true
  },
  [Rule.ENGLISH_SOCK]: {
    locale : "en",
    name   : "Sock",
    options: [
      RuleOption.NO_TWO
    ],
    time          : 1,
    ai            : false,
    big           : true,
    newRoundOnQuit: true
  }
};

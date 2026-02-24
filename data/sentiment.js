export const clusters = {
  dark: {
    color: { h: 265, s: 25, l: 18 },
    label: "Dark / Grief / Death",
    poet: "Poe",
    keywords: {
      death: 3, die: 3, died: 3, dying: 3, grave: 3, dirge: 3,
      mourning: 3, elegy: 3, shroud: 3, despair: 3, abyss: 3,
      entomb: 3, sepulchre: 3, midnight: 3, moonless: 3,
      tomb: 3, bones: 3, coffin: 3, widow: 3, nevermore: 3,
      dark: 2, shadow: 2, sorrow: 2, grief: 2, weep: 2, wept: 2,
      hollow: 2, ashes: 2, ash: 2, black: 2, woe: 2, lament: 2,
      ravens: 2, darkness: 2, dusk: 2, loss: 3, lonely: 2,
      loneliness: 2, night: 2, barren: 2,
      cold: 1, silence: 1, alone: 1, solitude: 1, pale: 1
    }
  },

  joy: {
    color: { h: 45, s: 85, l: 60 },
    label: "Warm / Joy / Celebration",
    poet: "Whitman",
    keywords: {
      joy: 3, jubilee: 3, celebrate: 3, exult: 3, rejoice: 3,
      radiant: 3, bliss: 3,
      laughter: 2, bright: 2, warmth: 2, abundance: 2, feast: 2,
      sing: 2, dance: 2, triumph: 2, vivid: 2,
      sun: 2, golden: 1, light: 1, glory: 1
    }
  },

  contemplation: {
    color: { h: 210, s: 30, l: 45 },
    label: "Cool / Calm / Contemplation",
    poet: "Stevens & cummings",
    keywords: {
      suspended: 3,
      still: 2, grey: 2, gray: 2, mist: 2, reflect: 2, reflection: 2,
      observe: 2, consider: 2, empty: 2, quiet: 2, pause: 2,
      distant: 2, cool: 2, measured: 2, cathedral: 2, wait: 2,
      waiting: 2, nothing: 2, nowhere: 2,
      glass: 1, stone: 1, thought: 1, thinking: 1, between: 1,
      silence: 2, alone: 1, solitude: 1, silent: 1, dream: 1
    }
  },

  spring: {
    color: { h: 105, s: 60, l: 65 },
    label: "Spring",
    poet: "Hopkins",
    keywords: {
      blossom: 3, bloom: 3, bud: 3, thaw: 3, april: 3,
      robin: 3, crocus: 3, primrose: 3, unfurl: 3, spring: 3,
      tender: 2, shoots: 2, nest: 2, egg: 2, lamb: 2, petal: 2,
      renewal: 2, birth: 2, warbler: 2, fresh: 2,
      may: 2, green: 1, rain: 1, meadow: 1, dew: 1, easter: 1
    }
  },

  summer: {
    color: { h: 130, s: 55, l: 45 },
    label: "Summer",
    poet: "Clare",
    keywords: {
      harvest: 3, noon: 3, august: 3, cicada: 3, haystack: 3,
      lush: 3, clover: 3, summer: 3,
      heat: 2, drought: 2, cricket: 2, humid: 2, abundance: 2,
      canopy: 2, sunflower: 2, lazy: 2, drowsy: 2, bramble: 2,
      thistle: 2, swallow: 2, meadow: 2,
      july: 2, june: 2, field: 1, dew: 1, ripple: 1
    }
  },

  autumn: {
    color: { h: 30, s: 75, l: 45 },
    label: "Autumn",
    poet: "Keats",
    keywords: {
      amber: 3, rust: 3, copper: 3, ochre: 3, acorn: 3,
      stubble: 3, gleaner: 3, gourd: 3, october: 3, autumn: 3,
      swallow: 3,
      harvest: 2, fallen: 2, leaves: 2, decay: 2, fade: 2,
      cider: 3, apple: 2, waning: 2, crisp: 2, golden: 2,
      september: 2, november: 2,
      fall: 2, mist: 1, dusk: 1, hollow: 1
    }
  },

  winter: {
    color: { h: 205, s: 20, l: 80 },
    label: "Winter",
    poet: "Frost",
    keywords: {
      snow: 3, frost: 3, ice: 3, frozen: 3, blizzard: 3,
      december: 3, sleet: 3, flurry: 3, icicle: 3, solstice: 3,
      hibernate: 3, tundra: 3, winter: 3,
      bare: 2, stark: 2, drift: 2, brittle: 2, hearth: 2,
      wolf: 2, crow: 2, cold: 2,
      january: 2, february: 2,
      silent: 1, grey: 1, gray: 1, pale: 1, solitude: 1, barren: 2
    }
  },

  love: {
    color: { h: 345, s: 70, l: 45 },
    label: "Love / Longing / Passion",
    poet: "Neruda & cummings",
    keywords: {
      love: 3, desire: 3, longing: 3, beloved: 3, kiss: 3,
      embrace: 3, ache: 3, passion: 3, devotion: 3, yearn: 3,
      adore: 3, lips: 3,
      heart: 2, hunger: 2, burn: 2, touch: 2, skin: 2,
      breath: 2, absence: 3, carry: 2, infinite: 2, rose: 2,
      forever: 2,
      tender: 1, alone: 1, dream: 1
    }
  },

  spiritual: {
    color: { h: 275, s: 45, l: 65 },
    label: "Spiritual / Transcendent / Wonder",
    poet: "Blake & Rumi",
    keywords: {
      soul: 3, divine: 3, eternal: 3, heaven: 3, sacred: 3,
      holy: 3, prayer: 3, grace: 3, transcend: 3, angel: 3,
      hymn: 3, illuminate: 3, revelation: 3, mystic: 3,
      awe: 3, wonder: 3, radiance: 3, boundless: 3, immortal: 3,
      celestial: 3, rapture: 3, prophet: 3, ecstasy: 3, free: 2,
      freedom: 2,
      universe: 2, cosmos: 2, surrender: 2, vision: 2,
      pilgrim: 2, blessed: 2, infinite: 2,
      dream: 1, glory: 1, birth: 1, easter: 1, light: 1,
      cathedral: 1
    }
  }
};

export const fallbackColor = { h: 35, s: 50, l: 55 };

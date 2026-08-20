import { ARMOUR } from '$lib/data/armour';
import { WEAPONS } from '$lib/data/weapons';
import { coerceEquipmentValue } from '$lib/data/equipment';

const STORAGE_KEY = 'keybind_config';

export type KeyBindings = Record<string, string>;

type AbilityLookup = Record<string, { title?: string }>;

type ExtraActionEntry =
    | string
    | {
          title?: string;
          value?: string | number;
      }
    | null
    | undefined;

const DEFAULT_BINDINGS: KeyBindings = {
    'greater ricochet': 'e',
    'piercing shot': 'r',
    'galeshot': 't',
    'ranged auto': 'y',
    'snipe': 'u',
    'snap shot': 'i',
    'rapid fire': 'd',
    'shadow tendrils': 'f',
    'greater death\'s swiftness': 'g',
    'imbue shadows': 'h',
    'igneous_deadshot': 'j',
    'corruption shot': 'k',
    'balance by force': 's',
    'split soul ecb': 'f3 a',
    'crystal rain': 'f4 a',
    'shadowfall': 'f5 a',
    [String(ARMOUR.WEN_ARROWS)]: 'q',
    [String(ARMOUR.FUL_ARROWS)]: 'w',
    [String(ARMOUR.DEATHSPORE_ARROWS)]: 'w',
    'spellbook swap': 'x',
    'vengeance': 'v',
    'disruption shield': 'c',
    'anticipation': '\\',
    'resonance': 'z',
    'surge': 'f1',
    'dive': 'f2',
    'barricade': '/',
    'reflect': '.',
    'devotion': ',',
    'natural instinct': 'm',

    'adrenaline renewal potion': '0',
    'vulnerability bomb': '1',
    'soul split': '2',
    'deflect magic': '3',
    'deflect ranged': '4',
    'deflect melee': '5',
    'spiritual prayer potion': '6',
    'ingenuity of the humans': '7',
    [String(WEAPONS.ROAR_OF_AWAKENING)]: '8',
    [String(WEAPONS.ODE_TO_DECEIT)]: '9',
    'soulfire': '0',

    'EoF (blue)': 'f3',
    'EoF (black)': 'f4',
    'EoF (purple)': 'f5',
};

function normalizeBindings(bindings: Record<string, string> | null | undefined): KeyBindings {
    const normalized: KeyBindings = {};
    for (const [key, value] of Object.entries(bindings ?? {})) {
        const equipmentKey = coerceEquipmentValue(key);
        normalized[String(equipmentKey)] = value;
    }
    return normalized;
}

export const keybindStore = $state({
    bindings: { ...DEFAULT_BINDINGS } as KeyBindings
});

export const keybindActions = {
    loadBindings() {
        if (typeof localStorage === 'undefined') {
            keybindStore.bindings = { ...DEFAULT_BINDINGS };
            return;
        }
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                // Use stored bindings as-is (don't merge defaults, so clearing stays cleared)
                keybindStore.bindings = normalizeBindings(JSON.parse(stored) as KeyBindings);
            }
        } catch (e) {
            console.error('Failed to load keybinds:', e);
            keybindStore.bindings = { ...DEFAULT_BINDINGS };
        }
    },

    saveBindings() {
        if (typeof localStorage === 'undefined') {
            return;
        }
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(keybindStore.bindings));
        } catch (e) {
            console.error('Failed to save keybinds:', e);
        }
    },

    setBinding(abilityKey: string | number, keyString: string | null | undefined) {
        const normalizedKey = String(coerceEquipmentValue(abilityKey));
        if (keyString && keyString.trim()) {
            keybindStore.bindings[normalizedKey] = keyString.trim();
        } else {
            delete keybindStore.bindings[normalizedKey];
        }
        this.saveBindings();
    },

    clearAllBindings() {
        keybindStore.bindings = {};
        this.saveBindings();
    },

    /**
     * Generate a keypress string from the current rotation.
     * Groups main-bar abilities and extra actions per tick.
     */
    generateKeypressSequence(
        abilityBar: (string | null)[],
        extraActionBar: (ExtraActionEntry[] | null)[],
        abilityLookup: AbilityLookup,
        extraActionLookup: AbilityLookup
    ): { keys: string[]; ticks: number[] } {
        const keys: string[] = [];
        const ticks: number[] = [];

        for (let i = 0; i < abilityBar.length; i++) {
            const mainAbility = abilityBar[i];
            const extras = extraActionBar[i];
            const hasMain = mainAbility != null;
            const hasExtras = extras != null && extras.some(e => e != null);

            if (!hasMain && !hasExtras) continue;

            const tickKeys: string[] = [];

            // Extra actions first (off-GCD, pressed before GCD ability)
            if (hasExtras && extras) {
                for (const extra of extras) {
                    if (!extra) continue;
                    // Gear items are objects with .title, abilities are strings
                    const extraKey = typeof extra === 'object' ? (extra.value ?? extra.title) : extra;
                    const extraTitle = typeof extra === 'object' ? extra.title : extraKey;
                    const bind =
                        keybindStore.bindings[String(extraKey)] ||
                        (extraTitle != null ? keybindStore.bindings[String(extraTitle)] : undefined) ||
                        (extraTitle != null ? keybindStore.bindings[String(extraTitle).toLowerCase()] : undefined);
                    tickKeys.push(
                        bind ||
                            (extraKey != null ? extraActionLookup[String(extraKey)]?.title : undefined) ||
                            (extraTitle != null ? String(extraTitle) : undefined) ||
                            String(extraKey)
                    );
                }
            }

            // Main GCD ability
            if (hasMain && mainAbility) {
                const bind = keybindStore.bindings[mainAbility];
                tickKeys.push(bind || abilityLookup[mainAbility]?.title || mainAbility);
            }

            for (const key of tickKeys) {
                keys.push(key);
                ticks.push(i);
            }
        }

        return { keys, ticks };
    }
};

// Load on module init
keybindActions.loadBindings();

import {applyActionAmmo} from '$lib/calc/rotation_builder/quiver';
import catalog from '$lib/data/pvmeEmojis.json';
import {paletteAbilities} from '$lib/data/abilityPalette';
import {allExtraActions, CONSUMABLES} from '$lib/special/abilities';
import {specialAttackReference} from '$lib/data/specialAttackReference';
import {ABILITIES} from '$lib/data/abilities';
import {getEquipment, equipmentMechanicId} from '$lib/data/equipment';
import {weaponSelectionUpdates} from '$lib/data/equipmentSlots';
import {SETTINGS} from '$lib/calc/settings_rb';
import {resolveQuiverAmmo, selectQuiverSlot, QUIVER_SLOT_1, QUIVER_SLOT_2} from '$lib/calc/rotation_builder/quiver';
import {toPvmeName} from './pvmeExport';

const normalize = (value: any) => String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
const emojis = new Map<string, typeof catalog.emojis[number]>();
for (const entry of catalog.emojis) {
    for (const name of [entry.id, entry.name, ...entry.aliases]) emojis.set(normalize(name), entry);
}
export type PreviewAction = {
    title: string; icon: string; fallbackIcon: string; discord: string; prefix: string; label: string;
    ammo?: PreviewAction; special?: 'spec' | 'eofspec'; specialMarker?: PreviewAction;
};
export type PreviewRow = {tick: number; phase?: string; nulled: boolean; actions: PreviewAction[]};

function action(key: any, prefix = '', fallback: any = {}, label = ''): PreviewAction {
    const item = getEquipment(key);
    const info = item ?? paletteAbilities[key] ?? allExtraActions[key] ?? fallback;
    const title = info.title ?? info.name ?? fallback.title ?? String(key);
    const emoji = emojis.get(normalize(toPvmeName(String(key)))) ?? emojis.get(normalize(title))
        ?? (/arrow$/i.test(title) ? emojis.get(normalize(title + 's')) : undefined);
    const fallbackIcon = info.icon ?? fallback.icon ?? '';
    return {
        title, prefix, label, fallbackIcon,
        icon: emoji ? `https://cdn.discordapp.com/emojis/${emoji.emoji_id}.png?size=48` : fallbackIcon,
        discord: emoji ? `<:${emoji.id}:${emoji.emoji_id}>` : `[${title}]`,
    };
}

const specialName = (value: string) => normalize(value.replace(/\(ecb\)| ecb/gi, ''));
function specialLabel(key: string, settings: Record<string, any>): 'spec' | 'eofspec' | undefined {
    const info = paletteAbilities[key];
    if (info?.abilityType !== 'special attack') return undefined;
    if (key === ABILITIES.RAMPAGE) return 'spec';
    const reference = specialAttackReference.find(entry => entry.style === info.mainStyle &&
        [key, info.title ?? ''].some(name => specialName(name) === specialName(entry.name)));
    const style = info.mainStyle === 'necromancy' ? 'necro' : info.mainStyle;
    const typeKey = 'weapon type ' + style;
    const twoHand = settings[typeKey] === 'two-hand';
    const equipped = getEquipment(equipmentMechanicId(settings[`${style} ${twoHand ? 'two-hand' : 'main-hand'} weapon`]));
    const weaponName = equipped?.name.replace(/ \[IM\]$|\+$/, '') ?? '';
    return reference && weaponName && normalize(reference.weapons).includes(normalize(weaponName)) ? 'spec' : 'eofspec';
}

/** Ammo annotates its next ranged attack, rather than becoming a separate step. */
export function rotationPreview(rotation: any, initialSettings: Record<string, any>): PreviewRow[] {
    const settings = JSON.parse(JSON.stringify(initialSettings));
    const rows: PreviewRow[] = [];
    let displayedAmmo: any = undefined;
    let previousCast: {key: string; tick: number} | undefined;
    const length = Math.max(...['abilityBar', 'extraActionBar', 'stalledAbilities', 'releasedAbilities', 'tickEvents']
        .map(key => rotation[key]?.length ?? 0));
    for (let tick = 0; tick < length; tick++) {
        const actions: PreviewAction[] = [];
        const phase = rotation.tickEvents?.[tick]?.phase;
        const append = (key: string, prefix = '', fallback: any = {}) => {
            if (normalize(key) === normalize(CONSUMABLES.ADRENALINE_CRYSTAL)) return;
            const entry = action(key, prefix, fallback);
            if (!prefix && [ABILITIES.SNIPE, ABILITIES.SNIPE_FLANK].includes(key as ABILITIES)
                && previousCast && [ABILITIES.DEATHS_SWIFTNESS, ABILITIES.GREATER_DEATHS_SWIFTNESS].includes(previousCast.key as ABILITIES)
                && tick - previousCast.tick > 3) {
                entry.prefix = `${tick - previousCast.tick}t`;
            }
            entry.special = specialLabel(key, settings);
            if (entry.special) {
                const eof = entry.special === 'eofspec';
                entry.specialMarker = action(entry.special, '', {
                    title: eof ? 'Essence of Finality' : 'Weapon Special Attack',
                    icon: `/rs-rot/ability_icons/current/${eof ? 'essence_of_finality' : 'weapon_special_attack'}.png`,
                });
                // Use the Wiki ability artwork locally in the preview and image export.
                entry.specialMarker.icon = entry.specialMarker.fallbackIcon;
            }
            const info = paletteAbilities[key];
            if (prefix !== 's' && info?.mainStyle === 'ranged' && info.abilityClassification !== 'self cast' && !info.offGcd) {
                const ammo = resolveQuiverAmmo(settings);
                if (ammo !== displayedAmmo) {
                    if (getEquipment(ammo)) entry.ammo = action(ammo, '', {}, 'Ammo');
                    displayedAmmo = ammo;
                }
            }
            actions.push(entry);
        };
        for (const extra of rotation.extraActionBar?.[tick] ?? []) {
            if (!extra) continue;
            const value = typeof extra === 'string' ? extra : extra.value;
            if (normalize(value) === normalize(CONSUMABLES.ADRENALINE_CRYSTAL)) continue;
            if (extra.type === 'gear' && extra.slot) {
                settings[extra.slot] = value;
                Object.assign(settings, weaponSelectionUpdates(extra.slot, value));
                settings._gearInstances ??= {};
                settings._gearInstances[extra.slot] = {itemKey: value, instanceId: extra.instanceId};
                if (extra.slot === SETTINGS.RANGED_AMMO_SLOT) continue;
            }
            if (value === QUIVER_SLOT_1 || value === QUIVER_SLOT_2) {
                selectQuiverSlot(settings, value === QUIVER_SLOT_2 ? 1 : 0);
            } else append(value, '', extra);
        }
        if (rotation.stalledAbilities?.[tick]) append(rotation.stalledAbilities[tick], 's');
        if (rotation.releasedAbilities?.[tick]) {
            applyActionAmmo(settings, rotation.tickEvents?.[tick]?.releaseAmmo);
            append(rotation.releasedAbilities[tick], 'r');
        }
        if (rotation.abilityBar?.[tick]) {
            applyActionAmmo(settings, rotation.tickEvents?.[tick]?.castAmmo);
            append(rotation.abilityBar[tick]);
            previousCast = {key: rotation.abilityBar[tick], tick};
        }
        if (actions.length || phase) rows.push({tick, phase, actions, nulled: !!rotation.nulledTicks?.[tick]});
    }
    return rows;
}

export function rotationPreviewText(rows: PreviewRow[], discord = true, showSpecials = true) {
    let text = '';
    for (const row of rows) {
        if (row.phase) text += `${text ? '\n\n' : ''}**${row.phase}**\n`;
        if (!row.actions.length) continue;
        if (text && !text.endsWith('\n')) text += ' → ';
        text += row.actions.map(item => `${item.prefix ? item.prefix + ' ' : ''}${item.ammo ? (discord ? item.ammo.discord : item.ammo.title) + ' ' : ''}${discord ? item.discord : item.title}${showSpecials && item.special ? ' ' + (discord ? item.specialMarker?.discord ?? item.special : item.special) : ''}`).join(' + ');
        if (row.nulled) text += ' (null)';
    }
    return text;
}

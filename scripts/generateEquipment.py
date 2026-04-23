"""
    Script to generate an equipment.json of all the equipment on the RS Wiki, and downloads images for each item.
    Based on the script of the same name in the OSRS DPS calc https://github.com/weirdgloop/osrs-dps-calc/blob/main/scripts/generateEquipment.py
    The JSON file is placed in ../src/lib/equipment.json.

    The images are placed in ../cdn/equipment/. This directory is NOT included in the Next.js app bundle, and should
    be deployed separately to our file storage solution.

    Written for Python 3.9.
"""
import os
import requests
import json
import urllib.parse
import sys

FILE_DIR = '../cdn/json'
FILE_NAME = f'{FILE_DIR}/equipment.json'
WIKI_BASE = 'https://runescape.wiki'
API_BASE = WIKI_BASE + '/api.php'
IMG_PATH = '../cdn/equipment/'

BUCKET_API_FIELDS = [
    'page_name',
    'page_name_sub',
    'item_name',
    'image',
    'item_id',
    'version_anchor',
    'infobox_bonuses.combat_class',
    'infobox_bonuses.equipment_slot',
    'infobox_bonuses.equipment_type',
    'infobox_bonuses.weapon_damage',
    'infobox_bonuses.weapon_accuracy',
    'infobox_bonuses.attack_style',
    'infobox_bonuses.attack_range',
    'infobox_bonuses.equipment_armour',
    'infobox_bonuses.equipment_life_points',
    'infobox_bonuses.weapon_attack_speed',
    'infobox_bonuses.prayer_bonus',
    'infobox_bonuses.strength_bonus',
    'infobox_bonuses.ranged_bonus',
    'infobox_bonuses.magic_bonus',
    'infobox_bonuses.necromancy_bonus',
    'infobox_bonuses.equipment_tier',
    'infobox_bonuses.pvm_damage_reduction',
    'infobox_bonuses.pvp_damage_reduction',
]

ITEMS_TO_SKIP = [
]

def try_float(x, defl=0):
    try:
        return float(x)
    except ValueError:
        return defl
def try_int(x, defl=0):
    try:
        return int(x)
    except ValueError:
        return defl

def getEquipmentData():
    equipment = []
    offset = 0
    fields_csv = ",".join(map(repr, BUCKET_API_FIELDS))
    while True:
        print('Fetching equipment info: ' + str(offset))
        query = {
            'action': 'bucket',
            'format': 'json',
            'query': 
            (
                f"bucket('infobox_item')"
                f".select({fields_csv})"
                f".limit(500).offset({offset})"
                f".where('infobox_bonuses.equipment_slot', '!=', bucket.Null())"
                f".where('item_id', '!=', bucket.Null())"
                f".where('infobox_bonuses.is_cosmetic_recolour', '!=', true)"
                ".where(bucket.Not({'infobox_item.location_restriction', '!=', bucket.Null()}))"
                f".join('infobox_bonuses', 'infobox_bonuses.page_name_sub', 'infobox_item.page_name_sub')"
                f".orderBy('page_name_sub', 'asc').run()"
            )
        }

        r = requests.get(API_BASE + '?' + urllib.parse.urlencode(query), headers={
            'User-Agent': 'rs-rotations (https://github.com/weirdgloop/rs-rotations)'
        })
        #print(r.url)

        data = r.json()

        if 'bucket' not in data:
            # No results?
            break

        equipment = equipment + data['bucket']

        # Bucket's API doesn't tell you when there are more results, so we'll just have to guess
        if len(data['bucket']) == 500:
            offset += 500
        else:
            # If we are at the end of the results, break out of this loop
            break

    return equipment


def main(get_images=False):
    # Grab the equipment info using Bucket
    wiki_data = getEquipmentData()

    # Use an object rather than an array, so that we can't have duplicate items with the same page_name_sub
    data = {}
    required_imgs = []

    # Loop over the equipment data from the wiki
    for v in wiki_data:
        if v['page_name_sub'] in data:
            continue

        print(f"Processing {v['page_name_sub']}")

        try:
            item_id = int(v.get('item_id')[0]) if v.get('item_id') else None
        except ValueError:
            # Item has an invalid ID, do not show it here as it's probably historical or something.
            print("Skipping - invalid item ID (not an int)")
            continue

        equipment = {
            'name': v['page_name'],
            'id': item_id,
            'version': v.get('version_anchor', ''),
            'image': '' if not v.get('image') else v.get('image')[-1].replace('File:', ''),
            'bonuses': {
                'class': v.get('infobox_bonuses.combat_class', ''),
                'slot': v.get('infobox_bonuses.equipment_slot', ''),
                'type': v.get('infobox_bonuses.equipment_type', ''),
                'damage': try_float(v.get('infobox_bonuses.weapon_damage', '')),
                'accuracy': try_int(v.get('infobox_bonuses.weapon_accuracy', '')),
                'style': v.get('infobox_bonuses.attack_style', ''),
                'attack_range': try_int(v.get('infobox_bonuses.attack_range', '')),
                'armour': try_float(v.get('infobox_bonuses.equipment_armour', '')),
                'life': v.get('infobox_bonuses.equipment_life_points', 0),
                'speed': try_int(v.get('infobox_bonuses.weapon_attack_speed', '')),
                'prayer': v.get('infobox_bonuses.prayer_bonus', 0),
                'strength': v.get('infobox_bonuses.strength_bonus', 0),
                'ranged': v.get('infobox_bonuses.ranged_bonus', 0),
                'magic': v.get('infobox_bonuses.magic_bonus', 0),
                'necromancy': v.get('infobox_bonuses.necromancy_bonus', 0),
                'tier': v.get('infobox_bonuses.equipment_tier', ''),
                'pvm_reduction': v.get('infobox_bonuses.pvm_damage_reduction', ''),
                'pvp_reduction': v.get('infobox_bonuses.pvp_damage_reduction', ''),
            }
        }
        is_cosmetic = True
        for bon in ['damage', 'accuracy', 'armour', 'life', 'speed', 'prayer', 'strength', 'ranged', 'magic', 'necromancy', 'tier']:
            is_cosmetic &= equipment['bonuses'].get(bon) == 0
        if is_cosmetic:
            continue

        if equipment['name'] in ITEMS_TO_SKIP:
            continue

        # Set the current equipment item to the calc's equipment list
        data[v['page_name_sub']] = equipment

        if not equipment['image'] == '':
            required_imgs.append(equipment['image'])

    new_data = list(data.values())

    # add manual equipment that isn't pulled from the wiki
    # this should ONLY be used for upcoming items that are not yet released
    with open('manual_equipment.json', 'r') as f:
        manual_data = json.load(f)
        new_data = new_data + manual_data

    print('Total equipment: ' + str(len(new_data)))
    new_data.sort(key=lambda d: d.get('name'))

    if not os.path.exists(FILE_DIR):
        os.makedirs(FILE_DIR, exist_ok=True)
    with open(FILE_NAME, 'w') as f:
        print('Saving to JSON at file: ' + FILE_NAME)
        json.dump(new_data, f, ensure_ascii=False, indent=2)

    success_img_dls = 0
    failed_img_dls = 0
    skipped_img_dls = 0
    required_imgs = set(required_imgs)
    
    # Fetch all the images from the wiki and store them for local serving
    if not os.path.exists(IMG_PATH):
        os.makedirs(IMG_PATH, exist_ok=True)
    for idx, img in enumerate(required_imgs):
        if os.path.isfile(IMG_PATH + img):
            skipped_img_dls += 1
            continue

        print(f'({idx}/{len(required_imgs)}) Fetching image: {img}')
        r = requests.get(WIKI_BASE + '/w/Special:Filepath/' + img, headers={
            'User-Agent': 'rs-rotations (https://github.com/weirdgloop/rs-rotations)'
        })
        if r.ok:
            with open(IMG_PATH + img, 'wb') as f:
                f.write(r.content)
                print('Saved image: ' + img)
                success_img_dls += 1
        else:
            print('Unable to save image: ' + img)
            failed_img_dls += 1

    print('Total images saved: ' + str(success_img_dls))
    print('Total images skipped (already exists): ' + str(skipped_img_dls))
    print('Total images failed to save: ' + str(failed_img_dls))

get_images = False
if len(sys.argv) > 1:
    get_images = sys.argv[1] == 'y'
main(get_images)
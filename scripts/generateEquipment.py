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
import sys
import time

#FILE_DIR = '../cdn/json'
FILE_DIR = '.'
FILE_NAME = f'{FILE_DIR}/equipment.json'
FILE_NAME_m = f'{FILE_DIR}/equipment_names_mainslots.txt'
FILE_NAME_w = f'{FILE_DIR}/equipment_names_weapons.txt'
FILE_NAME_o = f'{FILE_DIR}/equipment_names_other.txt'
MANUAL_EQUIP = f'{FILE_DIR}/scripts/manual_equipment.json'
IMG_PATH = f'{FILE_DIR}/images/equipment/'
WIKI_BASE = 'https://runescape.wiki'
API_BASE = WIKI_BASE + '/api.php'

BUCKET_API_FIELDS = [
    'page_name',
    'page_name_sub',
    'infobox_bonuses.json',
    'infobox_item.item_name',
    'infobox_item.image',
    'infobox_item.item_id',
    'infobox_item.version_anchor',
    'infobox_item.location_restriction'
]

ITEMS_TO_SKIP = [
]

s = requests.Session()
s.headers.update({'User-Agent': 'rs-rotations (https://github.com/weirdgloop/rs-rotations)'})

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
                f"bucket('infobox_bonuses')"
                f".join('infobox_item', 'infobox_bonuses.page_name_sub', 'infobox_item.page_name_sub')"
                f".select({fields_csv})"
                f".limit(500).offset({offset})"
                f".where('infobox_bonuses.equipment_slot', '!=', bucket.Null())"
                f".where('infobox_bonuses.is_cosmetic_recolour', '!=', true)"
                #f".where(bucket.Not('Category:Recurring content'))"
                #".where(bucket.Not({'infobox_item.location_restriction', '!=', bucket.Null()}))"
                f".orderBy('page_name_sub', 'asc').run()"
            )
        }

        time.sleep(0.2)
        r = s.get(API_BASE, params=query)
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

    items = {}
    offset = 0
    while True:
        print('Fetching item info: ' + str(offset))
        query = {
            'action': 'bucket',
            'format': 'json',
            'query': 
            (
                f"bucket('infobox_item')"
                f".select('page_name','page_name_sub','image','item_id','version_anchor','location_restriction')"
                f".limit(500).offset({offset})"
                f".where('item_id', '!=', bucket.Null())"
                f".where('Category:Equipment')"
                f".orderBy('page_name_sub', 'asc').run()"
            )
        }

        time.sleep(0.2)
        r = s.get(API_BASE, params=query)
        #print(r.url)

        data = r.json()

        if 'bucket' not in data:
            # No results?
            break

        for val in data['bucket']:
            pn = val['page_name']
            if pn in items:
                items[pn].append(val)
            else:
                items[pn] = [val]
        # Bucket's API doesn't tell you when there are more results, so we'll just have to guess
        if len(data['bucket']) == 500:
            offset += 500
        else:
            # If we are at the end of the results, break out of this loop
            break
    
    return equipment, items


BONUS_PARAMS = frozenset(['damage', 'accuracy', 'armour', 'life', 'speed', 'prayer', 'strength', 'ranged', 'magic', 'necromancy', 'tier'])
TIER_SLOTS = frozenset(['head', 'torso', 'legs', 'hands', 'feet', 'main hand weapon', 'off-hand weapon', '2h weapon', 'off-hand', 'ammo'])
OK_RESTRICTION = frozenset([None, 'surface'])

def tryint(x):
    try:
        return int(x)
    except ValueError:
        return None

def main(get_images=False):
    # Grab the equipment info using Bucket
    wiki_data, item_data = getEquipmentData()

    # Use an object rather than an array, so that we can't have duplicate items with the same page_name_sub
    data = {}
    required_imgs = []
    dedupe = {}

    # Loop over the equipment data from the wiki
    for v in wiki_data:
        if v['page_name_sub'] in data:
            continue

        print(f"Processing {v['page_name_sub']}")

        iteminfo = item_data.get(v['page_name'])
        try:
            item_ids = list(map(int, v.get('infobox_item.item_id'))) if 'infobox_item.item_id' in v else None
        except ValueError:
            # Item has an invalid ID, do not show it here as it's probably historical or something.
            print("Skipping - invalid item ID (not an int)")
            continue

        itemname = v['page_name']
        itemname_sub = v['page_name_sub']

        if itemname_sub in data:
            continue

        if itemname.startswith('Augmented'):
            continue

        if itemname in ITEMS_TO_SKIP:
            continue

        img = []
        if 'infobox_item.item_name' in v:
            # successful join
            if v.get('infobox_item.location_restriction', 'surface') not in OK_RESTRICTION:
                continue
            imgs = v.get('infobox_item.image')
            if imgs is not None:
                img = list(map(lambda x: x.replace('File:', ''), imgs))
        else:
            if iteminfo is None:
                continue
            #failed join
            imgs = []
            item_ids = []
            bad_lr = False
            for item in iteminfo:
                if item.get('location_restriction', 'surface') not in OK_RESTRICTION:
                    bad_lr = True
                    break
                imgs += item.get('image')
                item_ids += list(filter(lambda x: x is not None, map(tryint, item.get('item_id'))))
            if bad_lr:
                continue
            img = list(map(lambda x: x.replace('File:', ''), imgs))
        
        img.sort(key=len)
        if item_ids is not None:
            item_ids.sort()

        bonuses = json.loads(v['infobox_bonuses.json'])

        equipment = {
            'name': itemname,
            'id': item_ids,
            'version': v.get('infobox_item.version_anchor', ''),
            'image': img,
            'bonuses': {
                'class': bonuses.get('class', ''),
                'slot': bonuses.get('slot', ''),
                'type': bonuses.get('type', ''),
                'damage': try_float(bonuses.get('damage', '')),
                'ability_damage': try_float(bonuses.get('ability_damage', '')),
                'accuracy': try_int(bonuses.get('accuracy', '')),
                'style': bonuses.get('style', ''),
                'attack_range': try_int(bonuses.get('attack_range', '')),
                'armour': try_float(bonuses.get('armour', '')),
                'life': bonuses.get('lp', 0),
                'speed': try_int(bonuses.get('speed', '')),
                'prayer': bonuses.get('prayer', 0),
                'strength': bonuses.get('strength', 0),
                'ranged': bonuses.get('ranged', 0),
                'magic': bonuses.get('magic', 0),
                'necromancy': bonuses.get('necromancy', 0),
                'tier': bonuses.get('tier', ''),
                #'pvm_reduction': bonuses.get('infobox_bonuses.pvm_damage_reduction', ''),
                #'pvp_reduction': bonuses.get('infobox_bonuses.pvp_damage_reduction', ''),
            }
        }
        for tv in ['tier_damage', 'tier_accuracy', 'tier_armour', 'tier_armour_damage']:
            if bonuses.get(tv) is not None:
                equipment['bonuses'][tv] = bonuses.get(tv)
        is_cosmetic = True
        for bon in BONUS_PARAMS:
            is_cosmetic &= equipment['bonuses'].get(bon) == 0
        if is_cosmetic:
            continue
        if equipment['bonuses']['slot'] in TIER_SLOTS:
            t = equipment['bonuses'].get('tier')
            if (type(t) == int or type(t) == float) and t < 70:
                continue

        # Set the current equipment item to the calc's equipment list
        data[itemname_sub] = equipment

        if not equipment['image'] == '':
            required_imgs.append(equipment['image'])

    new_data = list(data.values())

    # add manual equipment that isn't pulled from the wiki
    # this should ONLY be used for upcoming items that are not yet released
    with open(MANUAL_EQUIP, 'r') as f:
        manual_data = json.load(f)
        new_data = new_data + manual_data

    print('Total equipment: ' + str(len(new_data)))
    new_data.sort(key=lambda d: d.get('name'))

    if not os.path.exists(FILE_DIR):
        os.makedirs(FILE_DIR, exist_ok=True)
    with open(FILE_NAME, 'w') as f:
        print('Saving to JSON at file: ' + FILE_NAME)
        json.dump(new_data, f, ensure_ascii=False, indent=2)
    
    def getname(x):
        if 'version' in x:
            if not (x['version'] == 'DEFAULT' or x['version'] == ''):
                return f"{x['name']}#{x['version']}"
        return x['name']
                
    with open(FILE_NAME_m, 'w') as f:
        print('Saving to names at file: ' + FILE_NAME_m)
        f.write('\n'.join(list(sorted(map(getname, filter(lambda x: x['bonuses']['slot'] in ['head', 'torso', 'legs', 'hands', 'feet'], new_data))))))
    with open(FILE_NAME_o, 'w') as f:
        print('Saving to names at file: ' + FILE_NAME_o)
        f.write('\n'.join(list(sorted(map(getname, filter(lambda x: x['bonuses']['slot'] not in ['head', 'torso', 'legs', 'hands', 'feet', 'main hand weapon', 'off-hand weapon', '2h weapon', 'off-hand'], new_data))))))
    with open(FILE_NAME_w, 'w') as f:
        print('Saving to names at file: ' + FILE_NAME_w)
        f.write('\n'.join(list(sorted(map(getname, filter(lambda x: x['bonuses']['slot'] in ['main hand weapon', 'off-hand weapon', '2h weapon', 'off-hand'], new_data))))))

    if not get_images:
        return
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
        r = requests.get(WIKI_BASE + '/images/' + img)
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
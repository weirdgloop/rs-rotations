<script>
    import Header from '$components/Layout/Header.svelte';
    import Navbar from '$components/Layout/Navbar.svelte';
    import TabButton from '$components/UI/TabButton.svelte';
    import GradientSeparator from '$components/UI/GradientSeparator.svelte';
    import Button from '$components/UI/Button.svelte';
    
    // Define sections for the guide with subheadings
    const sections = [
        {
            id: 'getting-started',
            title: 'Getting Started',
            subheadings: [
                { id: 'settings', title: 'Settings' },
                { id: 'adding-abilities', title: 'Adding Abilities' },
                { id: 'filtering', title: 'Filtering' },
                { id: 'reading-results', title: 'Reading the Results' }
            ]
        },
        {
            id: 'advanced',
            title: 'Advanced Features',
            subheadings: [
                { id: 'tool-modes', title: 'Tool Modes' },
                { id: 'extra-actions', title: 'Extra Actions' },
                { id: 'familiars', title: 'Familiars' },
                { id: 'dreadnips', title: 'Dreadnips' },
                { id: 'poison', title: 'Poison' },
                { id: 'boss-presets', title: 'Boss Presets' },
                { id: 'keybinds', title: 'Keybinds' },
                { id: 'saving-loading', title: 'Save & Load' }
            ]
        },
        {
            id: 'shortcuts',
            title: 'Keyboard Shortcuts',
            subheadings: []
        },
        {
            id: 'faq',
            title: 'FAQ',
            subheadings: []
        }
    ];
    
    // Track the active section and subheading
    let activeSection = sections[0].id;
    let activeSubheading = '';
    
    // Function to handle section change
    function setActiveSection(sectionId, subheadingId = '') {
        activeSection = sectionId;
        activeSubheading = subheadingId;
        
        // Scroll to the section or subheading
        const elementId = subheadingId ? subheadingId : sectionId;
        document.getElementById(elementId).scrollIntoView({ behavior: 'smooth' });
    }
</script>

<Navbar />
<Header img="/rota_background.png" text="Rotation Builder Guide" textColour="#b2dbee" shadow={true} />


<div class="space-y-14 z-20">
    <div class="responsive-container">
        <section class="grid grid-cols-5 gap-6">
            <!-- Main Content - takes up 4/5 of the width -->
            <div class="col-span-4 md:pt-6">
                <div class="flex flex-col">
                    <h2 class="main-header mb-6 ml-3 main_heading">User Guide</h2>
                    
                    
                    <GradientSeparator />
                    
                    <!-- Getting Started Section -->
                    <div id="getting-started" class="card card-home mt-6">
                        <div class="card-title pb-5 section-heading">Getting Started</div>

                        <h3 id="settings" class="subsection-heading">Settings</h3>
                        <p class="mb-4">
                            The <strong>Settings</strong> panel on the right defines your starting state. Select your gear,
                             perks, prayers, stats, buffs, familiars, etc. 
                        </p>
                        <h3 id="adding-abilities" class="subsection-heading">Adding Abilities</h3>
                        <p class="mb-4">
                            Select a combat style tab
                            (<span class="keybind">1</span> <span class="text-style text-ranged">Ranged</span>,
                            <span class="keybind">2</span> <span class="text-style text-magic">Magic</span>,
                            <span class="keybind">3</span> <span class="text-style text-melee">Melee</span>,
                            <span class="keybind">4</span> <span class="text-style text-necro">Necromancy</span>,
                            <span class="keybind">5</span> <span class="text-style text-defence">Defence</span>)
                            to see available abilities.
                        </p>
                        <p class="mb-4">
                            <strong>Left click</strong> to add an ability to the next free slot on the bar.
                            You can also <strong>drag</strong> abilities from the panel onto a specific tick.
                            To remove an ability, <strong>right click</strong> it on the bar.
                        </p>

                        <h3 id="filtering" class="subsection-heading">Filtering Abilities & Gear</h3>
                        <p class="mb-4">
                            Both the ability panel and gear dropdowns have a filter toggle that cycles between
                            <strong>Popular</strong>, <strong>Owned</strong>, and <strong>All</strong>.
                        </p>
                        <ul class="list-disc pl-5 space-y-2 mb-4">
                            <li><strong>Popular</strong> &mdash; shows commonly used abilities and gear (the default).</li>
                            <li><strong>Owned</strong> &mdash; shows only the items you've marked as owned. This lets you quickly filter to just your gear.</li>
                            <li><strong>All</strong> &mdash; shows everything in the game.</li>
                        </ul>
                        <p class="mb-4">
                            To manage which items you own, open the <strong>Keybind Configuration</strong> modal.
                            Each ability and gear item has a checkbox to mark it as owned.
                            Use the <strong>Own All</strong> and <strong>Unown All</strong> buttons to bulk-select items in the current tab.
                            Your owned items are saved to your browser and persist between sessions.
                        </p>
                        <p class="mb-4">
                            For gear, you can also <strong>right click</strong> any equipped slot to quickly unequip it (set to None).
                        </p>

                        <h3 id="reading-results" class="subsection-heading">Reading the Results</h3>
                        <p class="mb-4">
                            As you build your rotation, the calculator updates automatically.
                            <strong>Buffs</strong> appear as coloured bars below the timeline.
                            <strong>Stacks</strong> show as icons with numeric values.
                            <strong>Cooldowns</strong> are shown as small icons on the tick an ability comes off cooldown.
                            <strong>Adrenaline</strong> is tracked tick by tick.
                        </p>

                        <img src="/guide_images/buffs_stacks_cds.svg" alt="Buffs, stacks and cooldowns on the rotation timeline" class="my-4 rounded-lg border border-gray-700" style="max-width: 100%;" />

                        
                        <p class="mb-4">
                            The total damage is displayed at the top of the page, broken down by source:
                            ability damage,
                            <span style="color: var(--color-poison)">poison</span> damage (if using Cinderbane Gloves or weapon poison),
                            <span style="color: var(--color-familiar)">familiar</span> damage,
                            and  <span style="color: var(--color-dreadnip)">dreadnip</span> damage.
                            The <strong>damage plot</strong> below the bar shows cumulative damage over time with each source as a separate line.
                        </p>
                        <p class="mb-4">
                            Click any tick on the bar to open the <strong>extra actions panel</strong>, which also shows a per-tick damage breakdown,
                            active buffs, and stack values at that point in the rotation.
                        </p>
                    </div>

                    <!-- Advanced Features Section -->
                    <div id="advanced" class="card card-home mt-6">
                        <div class="card-title pb-5 section-heading">Advanced Features</div>

                        <h3 id="tool-modes" class="subsection-heading">Tool Modes</h3>
                        <p class="mb-4">
                            There are four tool modes, switchable via the toolbar or keyboard shortcuts:
                        </p>
                        <p class="mb-4">
                            <span class="tool-name">Regular</span> (<span class="keybind">r</span>)<br>
                            Default mode. Left click to add abilities, right click to remove, and drag to reorder.
                        </p>
                        <p class="mb-4">
                            <span class="tool-name">Stall</span> (<span class="keybind">s</span>)<br>
                            Left click an ability to select it, then left click a tick on the bar to place the ability.
                            Click an existing stall to remove it. Channelled abilities cannot be stalled.
                        </p>
                        <p class="mb-4">
                            <span class="tool-name">Null</span> (<span class="keybind">n</span>) <br>
                            Left click to mark a tick as nulled.
                            Nulled ticks deal 0 damage but still apply buffs, stacks, and adrenaline as normal &mdash;
                            useful for simulating boss phase transitions or prebuilding on dummies.
                            Left click a nulled tick again to un-null it.
                        </p>
                        <p class="mb-4">
                            <span class="tool-name">Insert</span> (<span class="keybind">i</span>)<br>
                            Left click to insert ticks into a rotation, moving everything afterwards to the right. 
                            Right click to delete ticks in a rotation, moving everything afterwards to the left.
                        </p>

                        <h3 id="extra-actions" class="subsection-heading">Extra Actions</h3>
                        <p class="mb-4">
                            Click any tick on the bar to open the extra actions panel. This gives you access to off-GCD abilities
                            (Ingenuity of the Humans, Limitless, prayers, Surge, Escape, etc.),
                            consumables (adrenaline potions, Spiritual Prayer, Vulnerability Bomb),
                            and gear swaps (weapons, armour, Essence of Finality amulets).
                        </p>
                        <p class="mb-4">
                            Each tick has up to 12 extra action slots. Add items by left clicking and remove them by right clicking.
                            Press <span class="keybind keybind-wide">space</span> to close the panel.
                            The extra actions panel also shows the Info tab with per-tick damage breakdown, active buffs, and stack values.
                        </p>

                        <h3 id="familiars" class="subsection-heading">Familiars</h3>
                        <p class="mb-4">
                            Select a combat familiar in settings (Ripper Demon, Kal'gerion Demon, or Steel Titan).
                            The familiar attacks automatically at fixed intervals based on its attack rate.
                        </p>
                        <p class="mb-4">
                            If <strong>scrolls</strong> are enabled, the familiar uses its special attack whenever it has enough spec points,
                            otherwise it falls back to a regular auto-attack.
                            Spec points start at 60 and regenerate at ~0.3 points/tick.
                            This is boosted by <strong>Summoning Renewal</strong>, <strong>Prism of Restoration</strong>,
                            <strong>Spirit Cape</strong> (20% scroll cost reduction), and <strong>Spirit Weed Incense</strong>.
                        </p>
                        <p class="mb-4">
                            Familiars stop attacking after the last ability in your rotation.
                            Their damage is tracked separately in the damage breakdown and plot.
                        </p>

                        <h3 id="dreadnips" class="subsection-heading">Dreadnips</h3>
                        <p class="mb-4">
                            Deploy a dreadnip by adding it via the extra actions panel on any tick.
                            Once deployed, it attacks every 4 ticks for up to 45 seconds (75 ticks, max 18 attacks),
                            then expires. A cooldown timer shows when it will run out.
                        </p>
                        <p class="mb-4">
                            Dreadnip hit chance is calculated against the selected boss preset (defence, armour, and affinities).
                            If no boss is selected, it assumes 100% accuracy.
                            Dreadnips also stop attacking after your last ability.
                        </p>

                        <h3 id="poison" class="subsection-heading">Poison</h3>
                        <p class="mb-4">
                            Enable weapon poison in settings to include poison damage in your rotation analysis.
                            Poison damage scales with <strong>Bik arrow</strong> stacks when using ranged.
                            It is tracked as a separate damage source in both the total breakdown and the damage plot.
                        </p>

                        <h3 id="boss-presets" class="subsection-heading">Boss Presets</h3>
                        <p class="mb-4">
                            Select a boss preset in settings to apply its defence level, armour rating, and style affinities.
                            This affects your familiar and dreadnip accuracy, but not <strong>your</strong> accuracy (yet).
                        </p>
                        <p class="mb-4">
                            Some bosses support <strong>enrage scaling</strong> (Telos, Araxxor, Arch-Glacor) &mdash;
                            use the enrage slider to adjust the boss's stats and HP accordingly.
                        </p>

                        <h3 id="keybinds" class="subsection-heading">Keybinds</h3>
                        <p class="mb-4">
                            Open the keybind configuration modal to assign keyboard keys to abilities, gear swaps, and consumables.
                            Once configured, use the <strong>keypress output</strong> modal to view your rotation in two ways:
                        </p>
                        <ul class="list-disc pl-5 space-y-2 mb-4">
                            <li><strong>Sequence</strong> &mdash; shows the key presses for each tick in order, useful for practising your rotation.</li>
                            <li><strong>Keyboard</strong> &mdash; a visual keyboard layout highlighting which keys have abilities bound, showing the ability icons on each key.</li>
                        </ul>

                        <h3 id="saving-loading" class="subsection-heading">Save & Load</h3>
                        <p class="mb-4">
                            Save your rotation and settings to a named slot using the save/load panel.
                            Rotations are stored in your browser's local storage and persist between sessions.
                            You can maintain multiple saved rotations and switch between them.
                        </p>
                    </div>

                    <!-- Keyboard Shortcuts Section -->
                    <div id="shortcuts" class="card card-home mt-6">
                        <div class="card-title pb-5 section-heading">Keyboard Shortcuts</div>
                        <ul class="list-disc pl-5 space-y-2">
                            <li><span class="keybind">r</span>: <span class="tool-name">Regular</span> tool</li>
                            <li><span class="keybind">s</span>: <span class="tool-name">Stall</span> tool</li>
                            <li><span class="keybind">n</span>: <span class="tool-name">Null</span> tool</li>
                            <li><span class="keybind">i</span>: <span class="tool-name">Insert</span> tool</li>
                            <li><span class="keybind">1</span>: <span class="text-style text-ranged">Ranged</span></li>
                            <li><span class="keybind">2</span>: <span class="text-style text-magic">Magic</span></li>
                            <li><span class="keybind">3</span>: <span class="text-style text-melee">Melee</span></li>
                            <li><span class="keybind">4</span>: <span class="text-style text-necro">Necromancy</span></li>
                            <li><span class="keybind">5</span>: <span class="text-style text-defence">Defence</span></li>
                            <li><span class="keybind keybind-wide">space</span>: Close extra actions panel</li>
                        </ul>
                    </div>

                    <!-- FAQ Section -->
                    <div id="faq" class="card card-home mt-6">
                        <div class="card-title pb-5 section-heading">FAQ</div>

                        <div class="mb-4">
                            <h3 class="text-xl font-semibold mb-2">How accurate is the damage calculation?</h3>
                            <p>
                                Pretty accurate! A few things are impossible to reasonably calculate exactly, but for the most part we
                                aim to be more or less 100%. If you do find anything wrong, please let us know in the Discord.
                            </p>
                        </div>

                        <div class="mb-4">
                            <h3 class="text-xl font-semibold mb-2">Which combat styles are supported?</h3>
                            <p class="mb-4">
                                <span class="text-style text-ranged">Ranged</span> is the most polished style with near-complete gear interactions and buff support.
                                <span class="text-style text-magic">Magic</span>, <span class="text-style text-melee">Melee</span>, and
                                <span class="text-style text-necro">Necromancy</span> all work for core rotations but are missing some gear interactions and niche buffs.
                                If you find something that's not working or not implemented, please let us know in the Discord.
                            </p>
                            <p class="mb-2"><strong>Known limitations:</strong></p>
                            <ul class="list-disc pl-5 space-y-1 mb-4">
                                <li>Player hit chance is not yet calculated from boss defence/armour &mdash; you set it manually. Familiar and dreadnip accuracy <em>are</em> calculated from boss presets.</li>
                                <li>Multi-hit abilities (e.g. Greater Ricochet, Wild Magic) resolve all hits on the same tick rather than spreading them across their actual hit timings.</li>
                                <li>Some necromancy interactions are still being refined.</li>
                                <li>Off-style gear accuracy penalties (e.g. wearing melee armour while maging) are not modelled.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 class="text-xl font-semibold mb-2">How do I report bugs or suggest features?</h3>
                            <p>
                                Join the RSA Discord server or submit issues through our GitHub repository.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Sidebar for navigation - takes up 1/5 of the width -->
            <div class="col-span-1">
                <div class="sticky top-8 pt-8">
                    <div class="card card-home">
                        <div class="card-title pb-5">Quick Navigation</div>
                        <ul class="space-y-4">
                            {#each sections as section}
                                <li>
                                    <button 
                                        class="text-left w-full px-3 py-2 rounded hover:bg-gray-700 {activeSection === section.id ? 'bg-gray-700 font-semibold' : ''}"
                                        on:click={() => setActiveSection(section.id)}
                                    >
                                        {section.title}
                                    </button>
                                    
                                    <!-- Subheadings -->
                                    {#if section.subheadings && section.subheadings.length > 0}
                                        <ul class="ml-4 mt-1 space-y-1">
                                            {#each section.subheadings as subheading}
                                                <li>
                                                    <button 
                                                        class="text-left w-full px-3 py-1 text-sm rounded hover:bg-gray-700 {activeSubheading === subheading.id ? 'bg-gray-700 font-semibold' : ''}"
                                                        on:click={() => setActiveSection(section.id, subheading.id)}
                                                    >
                                                        {subheading.title}
                                                    </button>
                                                </li>
                                            {/each}
                                        </ul>
                                    {/if}
                                </li>
                            {/each}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    </div>
</div>

<style>
    /* Add any custom styles here */
    h3 {
        color: #e2c08d;
    }

    p {
        font-size: 1.2rem;
    }

    .main_heading {
        color: #b2dbee;
        text-align: center;
        font-size: 3rem;
        font-weight: 700;
        padding-top: 1rem;
    }
    
    .section-heading {
        font-size: 3rem;
        font-weight: 600;
        color: #c1c1c1;
        margin-bottom: 0.5rem;
        padding-top: 1rem;
    }

    .subsection-heading {
        font-size: 2rem;
        font-weight: 600;
        color: var(--color-text-primary);
        margin-bottom: 0.5rem;
        padding-top: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .card-home {
        transition: all 0.3s ease;
        padding: 1.0rem; 
        /* override inherited padding from .card{} */
    }
 
    /* TODO make header user this  */
    /* Add text shadow to the header for better readability */
    .banner-text {
        text-shadow: 0 4px 20px rgba(94, 0, 63, 0.95), 0 0 8px rgb(0, 0, 0, 0.95);
        font-weight: 700;
        animation: pulse 24s infinite;
    }

    
    @keyframes pulse {
        0% {
            color: #b2dbee;
            opacity: 1;
        }
        
        20% {
            color: var(--color-magic);
            opacity: 1;
        }
        40% {
            color: var(--color-necro);
            opacity: 0.9;
        }
        60% {
            color: var(--color-melee);
            opacity: 1;
        }
        80% {
            color: var(--color-ranged);
            opacity: 1;
        }
        100% {
            color: #b2dbee;
            opacity: 1;
        }
    }

    
    .responsive-container{
        margin-left: 0% !important;
        margin-right: 0% !important;
        padding-left: 3% !important;
        padding-right: 3% !important;
        max-width: 100% !important;
    }


    
    /* Tool name styling */
    .tool-name {
        display: inline-block;
        font-weight: 600;
        color: #4fd1c5; /* Teal color */
        background-color: rgba(45, 55, 72, 0.5); /* Dark blue-gray background */
        padding: 0.15rem 0.5rem;
        border-radius: 0.25rem;
        border: 1px solid rgba(79, 209, 197, 0.3); /* Subtle teal border */
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        letter-spacing: 0.05em;
        transition: all 0.2s ease;
    }
    
    .tool-name:hover {
        background-color: rgba(45, 55, 72, 0.8);
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    /* Keybind styling - more subtle than tool-name */
    .keybind {
        display: inline-block;
        font-family: monospace;
        font-weight: 500;
        color: #fbd38d; /* Light amber color */
        background-color: rgba(45, 45, 45, 0.3); /* Very subtle dark background */
        padding: 0.1rem 0.4rem;
        border-radius: 0.2rem;
        border-bottom: 1px solid rgba(251, 211, 141, 0.3); /* Subtle bottom border */
        letter-spacing: 0.03em;
    }

    .keybind-wide {
        min-width: 60px;
        text-align: center;
    }
    
    /* Fancy but lighter style classes for text */
    .text-style {
        display: inline-block;
        font-weight: 600;
        padding: 0 0.2rem;
        position: relative;
        transition: all 0.2s ease;
        letter-spacing: 0.03em;
    }
    
    .text-style::after {
        content: '';
        position: absolute;
        width: 100%;
        height: 1px;
        bottom: 0px;
        left: 0;
        transform: scaleX(0.80);
        transition: all 0.2s ease;
        opacity: 0.5;
    }
    
    .text-style:hover {
        transform: translateY(-1px);
    }
    
    .text-style:hover::after {
        transform: scaleX(1);
        opacity: 1;
    }
    
    .text-ranged {
        color: var(--color-ranged);
    }
    
    .text-ranged::after {
        background-color: var(--color-ranged);
    }
    
    .text-magic {
        color: var(--card-border-magic);
    }
    
    .text-magic::after {
        background-color: var(--card-border-magic);
    }
    
    .text-melee {
        color: var(--card-border-melee);
    }
    
    .text-melee::after {
        background-color: var(--card-border-melee);
    }
    
    .text-necro {
        color: var(--card-border-necro);
    }
    
    .text-necro::after {
        background-color: var(--card-border-necro);
    }
    
    .text-defence {
        color: #a0a0a0;
    }
    
    .text-defence::after {
        background-color: #a0a0a0;
    }
</style>

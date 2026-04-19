<script>
    import Navbar from '$components/Layout/Navbar.svelte';
</script>

<Navbar />

<header
    class="bg-center bg-cover relative z-0 h-64 md:h-96 mt-10 lg:mt-0"
    style="background-image:url(/bg_main.png)"
></header>

<div class="space-y-14 z-20">
    <div class="responsive-container">
        <section class="grid xl:grid-cols-12 gap-6 xl:gap-8">
            <div class="xl:col-span-9 xl:row-start-1 xl:row-span-4 md:pt-6">
                <div class="flex flex-col">
                    <h1 class="main-header mb-6 ml-3">Welcome to RS Analysis</h1>
                    <div class="card border-b border-card-light">
                        <div class="pb-5">
                            <div class="card-title">About</div>
                            <div>
                                <p>
                                    We are a community of RuneScape players who are passionate about
                                    the game and its mechanics. We aim to provide the community with
                                    accurate and up-to-date information about the game, and to help
                                    players make informed decisions about their gear and ability
                                    rotations. We are always working on new projects ranging from
                                    web based damage analysis tools to comprehensive research
                                    papers. If you want to stay up to date with our latest projects
                                    or get involved with research and development check out our
                                    discord community linked below!
                                </p>
                            </div>
                        </div>
                    </div>
                    <a href="/magic" class="flex flex-col group">
                        <div class="card border-b border-card-light">
                            <div
                                class="flex items-center transform-gpu translate-x-0 group-hover:translate-x-2 transition-all"
                            >
                                <img class="card-icon" src="/style_icons/magic.svg" alt="" />
                                <div class="card-title">Magic Damage Calculator</div>
                            </div>
                        </div>
                    </a>
                    <a href="/melee" class="flex flex-col group">
                        <div class="card border-b border-card-light">
                            <div
                                class="flex items-center transform-gpu translate-x-0 group-hover:translate-x-2 transition-all"
                            >
                                <img class="card-icon" src="style_icons/melee.svg" alt="" />
                                <div class="card-title">Melee Damage Calculator</div>
                            </div>
                        </div>
                    </a>
                    <a href="/ranged" class="flex flex-col group">
                        <div class="card border-b border-card-light">
                            <div
                                class="flex items-center transform-gpu translate-x-0 group-hover:translate-x-2 transition-all"
                            >
                                <img class="card-icon" src="style_icons/ranged.svg" alt="" />
                                <div class="card-title">Ranged Damage Calculator</div>
                            </div>
                        </div>
                    </a>
                    <a href="/necromancy" class="flex flex-col group">
                        <div class="card border-b border-card-light">
                            <div
                                class="flex items-center transform-gpu translate-x-0 group-hover:translate-x-2 transition-all"
                            >
                                <img class="card-icon" src="style_icons/necro.svg" alt="" />
                                <div class="card-title">Necromancy Damage Calculator</div>
                            </div>
                        </div>
                    </a>
                    <a href="/rotation_builder" class="flex flex-col group">
                        <div class="card">
                            <div class="flex items-center transform-gpu translate-x-0 group-hover:translate-x-2 transition-all">
                                <div class="icon-position">
                                    <!-- Static base icon (invisible during hover) -->
                                    <img class="card-icon base-icon" src="style_icons/rota_icon_white.svg" alt="" />
                                    <!-- Spinning overlay icon (only visible during hover) -->
                                    <img class="card-icon spin-icon" src="style_icons/rota_icon2.svg" alt="" />
                                </div>
                                <div class="card-title">Rotation Builder</div>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
            <div class="xl:col-span-9 xl:row-start-5">
                <div class="flex flex-col">
                    <h1 class="main-header mb-6 ml-3">Most Recent Publication</h1>
                    <div class="card card-home">
                        <a href="/pdf/2024.001.pdf">
                            <div class="card-title hover:text-link">
                                Quantitative Analysis of RuneScape 3 Combat
                            </div>
                        </a>
                        <div class="pb-5">
                            <em>Akritia, Kyroh, Gamedolf, Sfox</em>
                        </div>
                        <div class="pl-5 pb-5">
                            <p>
                                RuneScape Player versus Monster (PvM) encounters are fundamentally
                                static. In most cases, Non-Player Character (NPC) behavior is
                                structured the same across all instances of an encounter. Players
                                execute predetermined sequences of abilities called rotations which
                                have been optimized for speed and consistency. The PvM Encyclopedia
                                offers publicly available rotations for every boss, although they
                                are primarily human-generated through trial and error. We propose
                                that RuneScape can be solved and we explore the potential of
                                statistical methods to evaluate both individual actions as well as
                                complete rotations. Player-derived damage in a rotation can be
                                interpreted as discrete random variables with non-identical
                                distributions. We find that the distribution of sequences of
                                abilities obtain Gaussian characteristics over time and show that
                                sufficiently long rotations can be approximated with a Gaussian
                                Probability Mass Function (PMF). These methods are useful for
                                comparative analysis of existing rotations. However, we aim to
                                transcend intuition-based rotation optimization through
                                reinforcement learning&#8212;and briefly examine the mathematical
                                landscape of solving stochastic Markov Decision Processes (MDPs) for
                                massively large spaces in the context of RuneScape combat.
                            </p>
                        </div>
                        <div class="text-xs pb-5">
                            <p>Comments:</p>
                            <p>Subjects: Statistics - Methods, Dynamic Programming, Game Theory</p>
                        </div>
                        <a href="/pdf/2024.001.pdf" class="hover:text-link">Open PDF</a>
                    </div>
                </div>
            </div>
            <div class="xl:col-span-3 xl:row-start-1 xl:row-span-1 md:pt-20">
                <div class="flex flex-col">
                    <div class="card card-home">
                        <div class="card-title">Other Resources</div>
                        <div class="effect-container">
                            <img class="effect-icon" src="google_icons/book-blue.svg" alt="" />
                            <ul>
                                <li class="block transition-all duration-75 relative">
                                    <a
                                        href="/research"
                                        class="py-2 font-normal text-xl hover:text-link"
                                        title=""
                                    >
                                        Research
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div class="effect-container">
                            <img class="effect-icon" src="google_icons/hammer-blue.svg" alt="" />
                            <ul>
                                <li class="block transition-all duration-75 relative">
                                    <a
                                        href="/projects"
                                        class="py-2 font-normal text-xl hover:text-link"
                                        title=""
                                    >
                                        Upcoming Projects
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div class="effect-container">
                            <img class="effect-icon" src="google_icons/discord-blue.svg" alt="" />
                            <ul>
                                <li class="block transition-all duration-75 relative">
                                    <a
                                        href="https://discord.gg/RBWwPy4NkJ"
                                        class="py-2 font-normal text-xl hover:text-link"
                                        title=""
                                    >
                                        Discord
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div class="effect-container">
                            <img class="effect-icon" src="google_icons/faq-blue.svg" alt="" />
                            <ul>
                                <li class="block transition-all duration-75 relative">
                                    <a
                                        href="/faq"
                                        class="py-2 font-normal text-xl hover:text-link"
                                        title=""
                                    >
                                        FAQ
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div class="xl:col-span-3 xl:row-start-2 xl:row-span-6">
                <div class="flex flex-col">
                    <div class="card card-home">
                        <div class="card-title pb-10">Credit</div>
                        <div class="flex flex-row flex-wrap xl:flex-nowrap xl:gap-12 w-full">
                            <div class="w-1/2 pb-8 md:w-1/4 lg:w-1/6 xl:w-full">
                                <div
                                    class="mx-auto w-24 h-24 rounded-full bg-none overflow-hidden mb-3"
                                >
                                    <img src="/contributors/akritia.webp" alt="" />
                                </div>
                                <div class="text-center text-gray-light">Akritia</div>
                                <div class="text-center text-gray-light">
                                    Research and Development
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-row flex-wrap xl:flex-nowrap xl:gap-12 w-full">
                            <div class="w-1/2 pb-8 md:w-1/4 lg:w-1/6 xl:w-full">
                                <div
                                    class="mx-auto w-24 h-24 rounded-full bg-black overflow-hidden mb-3"
                                >
                                    <img src="/contributors/kyroh.webp" alt="" />
                                </div>
                                <div class="text-center text-gray-light">Kyroh</div>
                                <div class="text-center text-gray-light">
                                    Research and Development
                                </div>
                            </div>
                        </div>
                        <div class="flex flex-row flex-wrap xl:flex-nowrap xl:gap-12 w-full">
                            <div class="w-1/2 pb-8 md:w-1/4 lg:w-1/6 xl:w-full">
                                <div
                                    class="mx-auto w-24 h-24 rounded-full bg-black overflow-hidden mb-3"
                                >
                                    <img src="/contributors/sfox.webp" alt="" />
                                </div>
                                <div class="text-center text-gray-light">Sfox</div>
                                <div class="text-center text-gray-light">Research</div>
                            </div>
                        </div>
                        <div class="flex flex-row flex-wrap xl:flex-nowrap xl:gap-12 w-full">
                            <div class="w-1/2 pb-8 md:w-1/4 lg:w-1/6 xl:w-full">
                                <div
                                    class="mx-auto w-24 h-24 rounded-full bg-black overflow-hidden mb-3"
                                >
                                    <img src="/contributors/hight.webp" alt="" />
                                </div>
                                <div class="text-center text-gray-light">HightDetal</div>
                                <div class="text-center text-gray-light">Development</div>
                            </div>
                        </div>
                        <div class="flex flex-row flex-wrap xl:flex-nowrap xl:gap-12 w-full">
                            <div class="w-1/2 pb-8 md:w-1/4 lg:w-1/6 xl:w-full">
                                <div
                                    class="mx-auto w-24 h-24 rounded-full bg-black overflow-hidden mb-3"
                                >
                                    <img src="/contributors/code.webp" alt="" />
                                </div>
                                <div class="text-center text-gray-light">Codemati</div>
                                <div class="text-center text-gray-light">Development</div>
                            </div>
                        </div>
                        <div class="flex flex-row flex-wrap xl:flex-nowrap xl:gap-12 w-full">
                            <div class="w-1/2 pb-8 md:w-1/4 lg:w-1/6 xl:w-full">
                                <a href="https://discord.gg/BGjvs8Y28n">
                                    <div
                                        class="mx-auto w-24 h-24 rounded-full bg-black overflow-hidden mb-3"
                                    >
                                        <img src="/contributors/dolf.webp" alt="" />
                                    </div>
                                    <div class="text-center text-gray-light">Gamedolf</div>
                                    <div class="text-center text-gray-light">RS Math</div>
                                </a>
                            </div>
                        </div>
                        <div class="flex flex-row flex-wrap xl:flex-nowrap xl:gap-12 w-full">
                            <div class="w-1/2 pb-8 md:w-1/4 lg:w-1/6 xl:w-full">
                                <div
                                    class="mx-auto w-24 h-24 rounded-full bg-black overflow-hidden mb-3"
                                >
                                    <img src="/contributors/rex.webp" alt="" />
                                </div>
                                <div class="text-center text-gray-light">RexT</div>
                                <div class="text-center text-gray-light">Legacy Sheet</div>
                            </div>
                        </div>
                        <div class="flex flex-row flex-wrap xl:flex-nowrap xl:gap-12 w-full">
                            <div class="w-1/2 pb-8 md:w-1/4 lg:w-1/6 xl:w-full">
                                <div
                                    class="mx-auto w-24 h-24 rounded-full bg-black overflow-hidden mb-3"
                                >
                                    <img src="/style_icons/rota_icon2.svg" alt="" />
                                </div>
                                <div class="text-center text-gray-light">Lo Sugar</div>
                                <div class="text-center text-gray-light">Rotation Builder</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="xl:col-span-9 xl:row-span-1">
                <div class="flex flex-col">
                    <div class="card card-home">
                        <div class="container mx-auto pb-5">
                            <div>
                                <h1 class="sm:text-2xl pb-2 uppercase font-bold mb-0">
                                    Join us on discord
                                </h1>
                                <a href="https://discord.gg/RBWwPy4NkJ">
                                    <img class="w-7/8 sm:w-1/3 pb-2" src="/logo.png" alt="" />
                                </a>
                                <div class="flex flex-row items-center">
                                    <a href="https://discord.gg/RBWwPy4NkJ">
                                        <img
                                            class="w-auto mr-4"
                                            src="/google_icons/discord-blue.svg"
                                            alt=""
                                        />
                                    </a>
                                    <a
                                        href="https://discord.gg/RBWwPy4NkJ"
                                        class="py-2 font-normal text-xl hover:text-link"
                                        title=""
                                    >
                                        <h2 class="text-md sm:text-2xl font-bold mb-0">
                                            discord.gg/RBWwPy4NkJ
                                        </h2>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div class="card-title pb-2">Affiliates</div>
                        <div class="flex flex-row flex-wrap xl:flex-nowrap xl:gap-12 w-full">
                            <div class="effect-container">
                                <div class="card-icon rounded-full bg-black overflow-hidden mb-3">
                                    <a href="https://discord.gg/pvme">
                                        <img src="/contributors/pvme.jpeg" alt="" />
                                    </a>
                                </div>
                                <ul>
                                    <li class="block transition-all duration-75 relative">
                                        <a
                                            href="https://discord.gg/pvme"
                                            class="py-2 font-normal text-xl hover:text-link"
                                            title=""
                                        >
                                            PvM Encyclopedia
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div class="effect-container">
                                <div class="card-icon rounded-full bg-black overflow-hidden mb-3">
                                    <a href="https://discord.gg/BGjvs8Y28n">
                                        <img src="/contributors/rsmath.png" alt="" />
                                    </a>
                                </div>
                                <ul>
                                    <li class="block transition-all duration-75 relative">
                                        <a
                                            href="https://discord.gg/BGjvs8Y28n"
                                            class="py-2 font-normal text-xl hover:text-link"
                                            title=""
                                        >
                                            RS Math Discord
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</div>

<style>
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(-3600deg); }
    }
    
    .icon-position {
        position: relative;
        width: 50px;
        height: 50px;
        margin-right: 10px;
    }
    
    .base-icon {
        width: 100%;
        height: auto;
        opacity: 1;
        transition: opacity 0.7s ease-in-out;
    }
    
    .spin-icon {
        position: absolute;
        top: 0;
        left: 0;
        width: 120%;
        height: auto;
        opacity: 0;
        transition: opacity 0.7s ease-in-out;
        /* Pre-apply animation but with 0 opacity */
        animation: spin 18s cubic-bezier(0.1, 0.25, 0.7, 1) infinite;
        animation-play-state: paused;
    }
    
    .group:hover .base-icon {
        opacity: 0;
    }
    
    .group:hover .spin-icon {
        opacity: 1;
        animation-play-state: running;
    }
</style>

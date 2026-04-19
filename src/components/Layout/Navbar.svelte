<script>
    let isDropdownOpen = $state(false);
    let isNavDropdownOpen = $state(false);

    const handleDropdownClick = () => {
        isDropdownOpen = !isDropdownOpen;
    };

    const handleNavDropdownClick = () => {
        isNavDropdownOpen = !isNavDropdownOpen;
    };
</script>

<nav class="bg-card border-gray-200">
    <div
        class="responsive-container max-w-screen-xl flex flex-wrap items-center justify-between p-4"
    >
        <a href="/" class="flex items-center space-x-3 rtl:space-x-reverse">
            <span class="text-2xl font-bold">RS Analysis</span>
        </a>
        <button
            onclick={handleDropdownClick}
            type="button"
            class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm rounded-lg md:hidden"
            aria-controls="navbar-dropdown"
            aria-expanded="false"
        >
            <span class="sr-only">Open main menu</span>
            <svg
                class="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 14"
            >
                <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M1 1h15M1 7h15M1 13h15"
                />
            </svg>
        </button>
        <div class:hidden={!isDropdownOpen} class="w-full md:block md:w-auto" id="navbar-dropdown">
            <ul
                class="flex flex-col font-medium p-2 md:p-0 mt-4 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 max-md:divide-y max-md:divide-[#C2BA9E]"
            >
                <li>
                    <a
                        href="/"
                        class="block py-2 px-3 rounded md:p-0 hover:text-link text-xl"
                        aria-current="page">Home</a
                    >
                </li>
                <li>
                    <button
                        onclick={handleNavDropdownClick}
                        class="flex items-center justify-between w-full py-2 px-3 rounded md:border-0 md:p-0 md:w-auto hover:text-link text-xl"
                        >Ability Analysis <svg
                            class="w-2.5 h-2.5 ms-2.5"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 10 6"
                        >
                            <path
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="m1 1 4 4 4-4"
                            />
                        </svg></button
                    >

                    <div
                        class:hidden={!isNavDropdownOpen}
                        class="z-10 font-normal rounded-lg md:absolute bg-[#171d21] md:p-3 shadow w-full md:w-48"
                    >
                        <ul class="pt-2" aria-labelledby="dropdownLargeButton">
                            <li>
                                <a
                                    href="/magic"
                                    class="block py-2 px-3 md:hover:bg-transparent md:border-0 md:p-0 hover:text-link tracking-wide block mb-2 text-xl"
                                >
                                    <img
                                        class="size-10 inline mr-1"
                                        src="/style_icons/magic.svg"
                                        alt=""
                                    /> Magic
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/melee"
                                    class="block py-2 px-3 md:hover:bg-transparent md:border-0 md:p-0 hover:text-link tracking-wide block mb-2 text-xl"
                                >
                                    <img
                                        class="size-10 inline mr-1"
                                        src="/style_icons/melee.svg"
                                        alt=""
                                    /> Melee
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/ranged"
                                    class="block py-2 px-3 md:hover:bg-transparent md:border-0 md:p-0 hover:text-link tracking-wide block mb-2 text-xl"
                                >
                                    <img
                                        class="size-10 inline mr-1"
                                        src="/style_icons/ranged.svg"
                                        alt=""
                                    /> Ranged
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/necromancy"
                                    class="block py-2 px-3 md:hover:bg-transparent md:border-0 md:p-0 hover:text-link tracking-wide block mb-2 text-xl"
                                >
                                    <img
                                        class="size-10 inline mr-1"
                                        src="/style_icons/necro.svg"
                                        alt=""
                                    /> Necromancy
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/rotation_builder"
                                    class="block py-2 px-3 md:hover:bg-transparent md:border-0 md:p-0 hover:text-link tracking-wide block mb-2 text-xl"
                                >
                                    <img
                                        class="size-10 inline mr-1"
                                        src="/style_icons/rota_icon_white.svg"
                                        alt=""
                                    /> Rotation
                                </a>
                            </li>
                        </ul>
                    </div>
                </li>
                <li>
                    <a
                        href="/research"
                        class="block py-2 px-3 md:hover:bg-transparent md:border-0 md:p-0 hover:text-link tracking-wide block mb-2 text-xl"
                        >Research</a
                    >
                </li>
            </ul>
        </div>
    </div>
</nav>

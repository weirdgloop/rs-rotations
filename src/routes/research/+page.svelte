<script>
    import Header from '$components/Layout/Header.svelte';
    import Navbar from '$components/Layout/Navbar.svelte';
</script>

<Navbar />
<Header img="/main_background.png" />

<!--MAIN CONTENT-->
<div class="space-y-14 z-20">
    <div class="responsive-container">
        <section class="grid xl:grid-cols-12 gap-6 xl:gap-8">
            <div class="xl:col-span-12 xl:row-start-1 xl:row-span-1 md:pt-6">
                <div class="flex flex-col">
                    <h1 class="main-header mb-6 ml-3">Research Papers</h1>
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
        </section>
    </div>
</div>

<script>
    import Header from '$components/Layout/Header.svelte';
    import Navbar from '$components/Layout/Navbar.svelte';
</script>

<Navbar />
<Header img="/main_background.png" />

<div class="space-y-14 z-20">
    <div class="responsive-container">
        <section class="grid xl:grid-cols-12 gap-6 xl:gap-8">
            <div class="xl:col-span-9 xl:row-start-1 xl:row-span-1 md:pt-6">
                <div class="flex flex-col">
                    <h1 class="main-header mb-6 ml-3">Active Projects</h1>
                    <div class="card card-home">
                        <div class="card-title pb-5">Features and fixes</div>
                        <p>Add perk damages - Aftershock, Crackling, Lunging</p>
                        <p>Fix all the things that are inevitably broken with a v1 build</p>
                    </div>
                </div>
            </div>
            <div class="xl:col-span-9 xl:row-span-1 md:pt-6">
                <div class="flex flex-col">
                    <h1 class="main-header mb-6 ml-3">Backlog</h1>
                    <div class="card card-home">
                        <div class="card-title pb-5">Comparison Tool</div>
                        <p>
                            A web tool that takes in short sequences of abilities and outputs the
                            damage distribution and some basic statistics.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    </div>
</div>

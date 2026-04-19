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
                    <h1 class="main-header mb-6 ml-3">Frequently Asked Questions</h1>
                    <div class="card card-home">
                        <div class="card-title pb-5">We Just Launched!</div>
                        <p>This page will be updated with FAQs as they come in.</p>
                    </div>
                </div>
            </div>
        </section>
    </div>
</div>

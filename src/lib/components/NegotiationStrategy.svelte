<!-- src/lib/components/NegotiationStrategy.svelte -->
<script lang="ts">
    import type { NegotiationStrategy } from '$lib/types/marketdata';

    export let strategy: NegotiationStrategy;
</script>

<div class="bg-white p-4 rounded-lg shadow-md">
    <h2 class="text-xl font-bold mb-4">Negotiation Strategy</h2>

    <div class="mb-6">
        <h3 class="text-lg font-semibold mb-2">Price Targets</h3>

        <div class="grid grid-cols-2 gap-4">
            <div>
                <p class="text-gray-600">Starting Offer</p>
                <p class="text-xl font-bold">${strategy.startingOffer.toLocaleString()}</p>
            </div>

            <div>
                <p class="text-gray-600">Target Price</p>
                <p class="text-xl font-bold text-green-600">${strategy.targetPrice.toLocaleString()}</p>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
            <h3 class="text-lg font-semibold mb-2">Key Advantages</h3>

            {#if strategy.advantages.length === 0}
                <p class="text-gray-500 italic">No significant advantages identified</p>
            {:else}
                <ul class="space-y-2">
                    {#each strategy.advantages as advantage}
                        <li class="flex items-start">
                            <span class="text-green-500 mr-2">✓</span>
                            <span>{advantage}</span>
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>

        <div>
            <h3 class="text-lg font-semibold mb-2">Concerns</h3>

            {#if strategy.concerns.length === 0}
                <p class="text-gray-500 italic">No significant concerns identified</p>
            {:else}
                <ul class="space-y-2">
                    {#each strategy.concerns as concern}
                        <li class="flex items-start">
                            <span class="text-red-500 mr-2">●</span>
                            <span>{concern}</span>
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
    </div>

    <div class="mb-6">
        <h3 class="text-lg font-semibold mb-2">Negotiation Scripts</h3>

        <div class="space-y-4">
            <div class="border-l-4 border-blue-500 pl-3 py-1">
                <h4 class="font-medium">Opening Offer</h4>
                <p class="text-gray-700 italic">{strategy.scripts.opening}</p>
            </div>

            <div class="border-l-4 border-purple-500 pl-3 py-1">
                <h4 class="font-medium">Counter Offer</h4>
                <p class="text-gray-700 italic">{strategy.scripts.counterOffer}</p>
            </div>

            <div class="border-l-4 border-green-500 pl-3 py-1">
                <h4 class="font-medium">Closing</h4>
                <p class="text-gray-700 italic">{strategy.scripts.closing}</p>
            </div>
        </div>
    </div>

    <div>
        <h3 class="text-lg font-semibold mb-2">Additional Tips</h3>

        <ul class="space-y-2">
            {#each strategy.additionalTips as tip}
                <li class="flex items-start">
                    <span class="text-blue-500 mr-2">•</span>
                    <span>{tip}</span>
                </li>
            {/each}
        </ul>
    </div>
</div>
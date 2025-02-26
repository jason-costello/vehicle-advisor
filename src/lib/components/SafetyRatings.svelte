<!-- src/lib/components/SafetyRatings.svelte -->
<script lang="ts">
    import type { SafetyRating } from '$lib/types/safety';

    export let ratings: SafetyRating[] = [];

    function getRatingColor(rating: number, max: number): string {
        const percentage = rating / max;
        if (percentage >= 0.8) return 'bg-green-500';
        if (percentage >= 0.6) return 'bg-yellow-500';
        return 'bg-red-500';
    }
</script>

<div class="bg-white p-4 rounded-lg shadow-md">
    <h2 class="text-xl font-bold mb-4">Safety Ratings</h2>

    {#if ratings.length === 0}
        <p class="text-gray-500">No safety ratings available for this vehicle.</p>
    {:else}
        <div class="space-y-4">
            {#each ratings as rating}
                <div>
                    <div class="flex justify-between mb-1">
                        <span class="font-medium">{rating.category}</span>
                        <span>{rating.rating} / {rating.maxRating}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                                class="{getRatingColor(rating.rating, rating.maxRating)} h-2.5 rounded-full"
                                style="width: {(rating.rating / rating.maxRating) * 100}%"
                        ></div>
                    </div>
                    <p class="text-sm text-gray-500 mt-1">{rating.description}</p>
                </div>
            {/each}
        </div>
    {/if}
</div>

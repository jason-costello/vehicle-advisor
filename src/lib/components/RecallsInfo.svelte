<!-- src/lib/components/RecallsInfo.svelte -->
<script lang="ts">
    import type { Recall, Complaint } from '$lib/types/safety';

    export let recalls: Recall[] = [];
    export let complaints: Complaint[] = [];
</script>

<div class="bg-white p-4 rounded-lg shadow-md">
    <h2 class="text-xl font-bold mb-4">Safety Recalls & Complaints</h2>

    <div class="mb-6">
        <h3 class="text-lg font-semibold mb-2">Recalls ({recalls.length})</h3>

        {#if recalls.length === 0}
            <p class="text-green-600">No recalls found for this vehicle.</p>
        {:else}
            <div class="space-y-4">
                {#each recalls as recall}
                    <div class="border border-red-200 bg-red-50 p-3 rounded">
                        <h4 class="font-medium text-red-800">{recall.component}</h4>
                        <p class="text-sm text-gray-700 mt-1">{recall.summary}</p>
                        <div class="mt-2 text-xs text-gray-500">
                            <span>Campaign #{recall.campaignNumber}</span>
                            <span class="mx-1">•</span>
                            <span>Reported: {recall.reportDate}</span>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>

    <div>
        <h3 class="text-lg font-semibold mb-2">Complaints ({complaints.length})</h3>

        {#if complaints.length === 0}
            <p class="text-green-600">No complaints found for this vehicle model.</p>
        {:else}
            <div class="space-y-4">
                {#each complaints.slice(0, 5) as complaint}
                    <div class="border border-yellow-200 bg-yellow-50 p-3 rounded">
                        <h4 class="font-medium text-yellow-800">{complaint.component}</h4>
                        <p class="text-sm text-gray-700 mt-1">{complaint.summary}</p>
                        <div class="mt-2 text-xs text-gray-500 flex justify-between">
                            <span>Date: {complaint.date}</span>
                            <span>Mileage: {complaint.mileage.toLocaleString()}</span>
                            {#if complaint.crashInvolved}
                                <span class="text-red-600">Crash involved</span>
                            {/if}
                        </div>
                    </div>
                {/each}

                {#if complaints.length > 5}
                    <p class="text-sm text-gray-500">
                        + {complaints.length - 5} more complaints not shown
                    </p>
                {/if}
            </div>
        {/if}
    </div>
</div>

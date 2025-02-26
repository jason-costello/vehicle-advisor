<script lang="ts">
    import type { ComparableVehicle } from '$lib/types/marketdata';

    export let vehicle: ComparableVehicle;
    export let isSubjectVehicle: boolean = false;

    function getMileageClass(mileage: number, avgMileage: number): string {
        if (mileage < avgMileage * 0.85) return 'text-green-600';
        if (mileage > avgMileage * 1.15) return 'text-red-600';
        return 'text-gray-700';
    }
</script>

<div class={`border rounded-lg p-3 ${isSubjectVehicle ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
    <div class="flex justify-between items-start">
        <div>
            <h3 class="font-medium">
                {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
                {#if isSubjectVehicle}
                    <span class="ml-2 text-sm bg-blue-600 text-white px-2 py-0.5 rounded">This Vehicle</span>
                {/if}
            </h3>

            <p class="text-sm text-gray-600 mt-1">
                {vehicle.location.city}, {vehicle.location.state}
                ({vehicle.location.distance} miles away)
            </p>
        </div>

        <div class="text-right">
            <p class="text-lg font-bold">${vehicle.price.toLocaleString()}</p>
            <p class="text-sm text-gray-600">{vehicle.daysOnMarket} days on market</p>
        </div>
    </div>

    <div class="mt-3 flex items-center justify-between">
        <div class="flex items-center space-x-4">
            <div>
                <p class="text-xs text-gray-500">Mileage</p>
                <p class="text-sm font-medium">{vehicle.mileage.toLocaleString()}</p>
            </div>

            <div>
                <p class="text-xs text-gray-500">Color</p>
                <p class="text-sm font-medium">{vehicle.exteriorColor}</p>
            </div>
        </div>

        <div class="flex space-x-3">
            {#if vehicle.oneOwner}
                <span class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">One Owner</span>
            {/if}

            {#if vehicle.accidentFree}
                <span class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Clean Title</span>
            {/if}
        </div>
    </div>

    {#if !isSubjectVehicle && vehicle.link}
        <div class="mt-3 text-right">
            <a href={vehicle.link} target="_blank" rel="noopener noreferrer" class="text-blue-600 text-sm">
                View Listing →
            </a>
        </div>
    {/if}
</div>
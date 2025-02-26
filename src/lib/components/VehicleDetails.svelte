<!-- src/lib/components/VehicleDetails.svelte -->
<script lang="ts">
    import type { DecodedVIN } from '$lib/types/vehicle';

    export let vehicleDetails: DecodedVIN;
</script>

<div class="bg-white p-4 rounded-lg shadow-md">
    <h2 class="text-xl font-bold mb-4">Vehicle Details</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <h3 class="text-lg font-semibold mb-2">
                {vehicleDetails.year} {vehicleDetails.make} {vehicleDetails.model} {vehicleDetails.trim}
            </h3>

            <ul class="space-y-2">
                <li class="flex justify-between">
                    <span class="text-gray-600">Engine:</span>
                    <span class="font-medium">{vehicleDetails.engine}</span>
                </li>
                <li class="flex justify-between">
                    <span class="text-gray-600">Transmission:</span>
                    <span class="font-medium">{vehicleDetails.transmission}</span>
                </li>
                <li class="flex justify-between">
                    <span class="text-gray-600">Drivetrain:</span>
                    <span class="font-medium">{vehicleDetails.drivetrain}</span>
                </li>
                <li class="flex justify-between">
                    <span class="text-gray-600">Body Type:</span>
                    <span class="font-medium">{vehicleDetails.bodyType}</span>
                </li>
                <li class="flex justify-between">
                    <span class="text-gray-600">Fuel Type:</span>
                    <span class="font-medium">{vehicleDetails.fuelType}</span>
                </li>
            </ul>
        </div>

        <div>
            <h3 class="text-lg font-semibold mb-2">Colors & MSRP</h3>

            <ul class="space-y-2">
                <li class="flex justify-between">
                    <span class="text-gray-600">Exterior Color:</span>
                    <span class="font-medium">{vehicleDetails.exteriorColor}</span>
                </li>
                <li class="flex justify-between">
                    <span class="text-gray-600">Interior Color:</span>
                    <span class="font-medium">{vehicleDetails.interiorColor}</span>
                </li>
                <li class="flex justify-between">
                    <span class="text-gray-600">Original MSRP:</span>
                    <span class="font-medium">${vehicleDetails.msrp.toLocaleString()}</span>
                </li>
            </ul>
        </div>
    </div>
</div>

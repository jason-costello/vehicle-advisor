<!-- src/routes/+page.svelte -->
<script lang="ts">
    import VehicleInput from '$lib/components/VehicleInput.svelte';
    import VehicleDetails from '$lib/components/VehicleDetails.svelte';
    import RecallsInfo from '$lib/components/RecallsInfo.svelte';
    import SafetyRatings from '$lib/components/SafetyRatings.svelte';
    import PriceComparison from '$lib/components/PriceComparison.svelte';
    import ComparableListing from '$lib/components/ComparableListing.svelte';
    import NegotiationStrategy from '$lib/components/NegotiationStrategy.svelte';
    import LoadingState from '$lib/components/LoadingState.svelte';

    import type { VehicleInput as VehicleInputType } from '$lib/types/vehicle';
    import type { DecodedVIN } from '$lib/types/vehicle';
    import type { SafetyData } from '$lib/types/safety';
    import type { PriceAnalysis, NegotiationStrategy as NegotiationStrategyType } from '$lib/types/marketdata';
    let isLoading = false;
    let loadingMessage = '';
    let currentTab = 'details';

    let vehicleInput: VehicleInputType | null = null;
    let decodedVin: DecodedVIN | null = null;
    let safetyData: SafetyData | null = null;
    let priceAnalysis: PriceAnalysis | null = null;
    let negotiationStrategy: NegotiationStrategyType | null = null;

    async function handleVehicleSubmit(input: VehicleInputType) {
        try {
            isLoading = true;
            vehicleInput = input;

            // Reset all data
            decodedVin = null;
            safetyData = null;
            priceAnalysis = null;
            negotiationStrategy = null;

            // Step 1: Decode VIN
            loadingMessage = 'Decoding VIN information...';
            const vinResponse = await fetch('/api/vin-lookup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vin: input.vin })
            });

            if (!vinResponse.ok) {
                throw new Error('Failed to decode VIN');
            }

            decodedVin = await vinResponse.json();

            // Step 2: Get safety data
            loadingMessage = 'Retrieving safety information...';
            const safetyResponse = await fetch('/api/recalls', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vin: input.vin,
                    make: decodedVin.make,
                    model: decodedVin.model,
                    year: decodedVin.year
                })
            });

            if (!safetyResponse.ok) {
                throw new Error('Failed to get safety data');
            }

            safetyData = await safetyResponse.json();

            // Step 3: Get market data and price analysis
            loadingMessage = 'Analyzing market and pricing data...';
            const marketResponse = await fetch('/api/market-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vin: input.vin,
                    zipCode: input.zipCode,
                    mileage: input.mileage
                })
            });

            if (!marketResponse.ok) {
                throw new Error('Failed to get market data');
            }

            priceAnalysis = await marketResponse.json();

            // Step 4: Generate negotiation strategy
            loadingMessage = 'Generating negotiation strategy...';
            const negotiationResponse = await fetch('/api/negotiation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    decodedVin,
                    safetyData,
                    priceAnalysis,
                    mileage: input.mileage
                })
            });

            if (!negotiationResponse.ok) {
                throw new Error('Failed to generate negotiation strategy');
            }

            negotiationStrategy = await negotiationResponse.json();

            // Reset to default tab
            currentTab = 'details';

        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        } finally {
            isLoading = false;
            loadingMessage = '';
        }
    }
</script>

<svelte:head>
    <title>Vehicle Advisor - Make Informed Car Buying Decisions</title>
    <meta name="description" content="Analyze vehicle VIN for recalls, safety ratings, market price, and get AI-powered negotiation strategies">
</svelte:head>

<main class="container mx-auto px-4 py-8 max-w-6xl">
    <header class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-blue-800">Vehicle Advisor</h1>
        <p class="text-gray-600 mt-2">Make informed decisions when purchasing a used vehicle</p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
            <VehicleInput onSubmit={handleVehicleSubmit} isLoading={isLoading} />

            {#if decodedVin && !isLoading}
                <div class="mt-6">
                    <h2 class="text-xl font-bold mb-4">Results Summary</h2>

                    <div class="bg-white p-4 rounded-lg shadow-md">
                        <h3 class="font-semibold text-lg">
                            {decodedVin.year} {decodedVin.make} {decodedVin.model}
                        </h3>

                        <div class="mt-4 space-y-2">
                            {#if safetyData}
                                <div class="flex items-center justify-between">
                                    <span>Safety Rating:</span>
                                    <span class="font-medium">
    {safetyData.overallRating > 0
        ? `${safetyData.overallRating}/5`
        : 'N/A'}
    </span>
                                </div>

                                <div class="flex items-center justify-between">
                                    <span>Recalls:</span>
                                    <span class={safetyData.recalls.length > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
    {safetyData.recalls.length}
    </span>
                                </div>
                            {/if}

                            {#if priceAnalysis}
                                <div class="flex items-center justify-between">
                                    <span>Price Analysis:</span>
                                    <span class={priceAnalysis.isPriceGood ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
    {priceAnalysis.isPriceGood ? 'Good Deal' : 'Overpriced'}
    </span>
                                </div>

                                <div class="flex items-center justify-between">
                                    <span>vs. Market Avg:</span>
                                    <span class={priceAnalysis.percentageDifference <= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
    {priceAnalysis.percentageDifference > 0 ? '+' : ''}
                                        {priceAnalysis.percentageDifference.toFixed(1)}%
    </span>
                                </div>
                            {/if}
                        </div>
                    </div>
                </div>
            {/if}
        </div>

        <div class="md:col-span-2">
            {#if isLoading}
                <LoadingState message={loadingMessage} />
            {:else if decodedVin}
                <div>
                    <div class="border-b border-gray-200 mb-6">
                        <nav class="flex space-x-4">
                            <button
                              class={`py-2 px-1 border-b-2 font-medium text-sm ${currentTab === 'details' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                              on:click={() => currentTab = 'details'}
                            >
                                Vehicle Details
                            </button>

                            <button
                              class={`py-2 px-1 border-b-2 font-medium text-sm ${currentTab === 'safety' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                              on:click={() => currentTab = 'safety'}
                            >
                                Safety & Recalls
                            </button>

                            <button
                              class={`py-2 px-1 border-b-2 font-medium text-sm ${currentTab === 'price' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                              on:click={() => currentTab = 'price'}
                            >
                                Price Analysis
                            </button>

                            <button
                              class={`py-2 px-1 border-b-2 font-medium text-sm ${currentTab === 'negotiation' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                              on:click={() => currentTab = 'negotiation'}
                            >
                                Negotiation
                            </button>
                        </nav>
                    </div>
                    {#if currentTab === 'details' && decodedVin}
                        <VehicleDetails vehicleDetails={decodedVin} />
                    {:else if currentTab === 'safety' && safetyData}
                        <div class="space-y-6">
                            <SafetyRatings ratings={safetyData.categoryRatings} />
                            <RecallsInfo recalls={safetyData.recalls} complaints={safetyData.complaints} />
                        </div>
                    {:else if currentTab === 'price' && priceAnalysis}
                        <div class="space-y-6">
                            <PriceComparison priceAnalysis={priceAnalysis} />

                            <div class="bg-white p-4 rounded-lg shadow-md">
                                <h2 class="text-xl font-bold mb-4">Comparable Vehicles</h2>

                                <div class="space-y-4">
                                    {#each priceAnalysis.similarVehicles as vehicle}
                                        <ComparableListing
                                                vehicle={vehicle}
                                                isSubjectVehicle={vehicle.vin === vehicleInput?.vin}
                                        />
                                    {/each}
                                </div>
                            </div>
                        </div>
                    {:else if currentTab === 'negotiation' && negotiationStrategy}
                        <NegotiationStrategy strategy={negotiationStrategy} />
                    {/if}
                </div>
            {:else}
                <div class="bg-white p-8 rounded-lg shadow-md text-center">
                    <h2 class="text-xl font-bold mb-2">Enter a Vehicle VIN</h2>
                    <p class="text-gray-600">
                        Enter the vehicle VIN, ZIP code, and mileage to get a comprehensive analysis
                    </p>

                    <div class="mt-6 text-gray-500 flex flex-col items-center space-y-4">
                        <div class="flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span>Safety ratings and recall information</span>
                        </div>

                        <div class="flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Market price analysis and comparisons</span>
                        </div>

                        <div class="flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                            </svg>
                            <span>AI-powered negotiation strategies</span>
                        </div>
                    </div>
                </div>
            {/if}
        </div>
    </div>
</main>

// src/routes/api-test/+page.svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { getValidToken } from '$lib/api/marketcheck-auth';
	import { decodeVIN, getComparableListings } from '$lib/api/marketcheck';
	import { logEnvironmentConfig } from '$lib/config/environment';

	let testVin = '1HGCM82633A004352'; // Honda Accord
	let testZip = '90210';
	let testMileage = 50000;

	let token = '';
	let tokenStatus = 'Not fetched';
	let tokenError = '';

	let vinResult: any = null;
	let vinStatus = 'Not tested';
	let vinError = '';

	let comparablesResult: any = null;
	let comparablesStatus = 'Not tested';
	let comparablesError = '';

	// Log environment config
	onMount(() => {
		logEnvironmentConfig();
	});

	async function testToken() {
		tokenStatus = 'Fetching...';
		tokenError = '';
		try {
			token = await getValidToken();
			tokenStatus = 'Success';
		} catch (error) {
			tokenStatus = 'Error';
			tokenError = error instanceof Error ? error.message : String(error);
			console.error('Token error:', error);
		}
	}

	async function testVinDecode() {
		vinStatus = 'Fetching...';
		vinError = '';
		try {
			vinResult = await decodeVIN(testVin);
			vinStatus = 'Success';
		} catch (error) {
			vinStatus = 'Error';
			vinError = error instanceof Error ? error.message : String(error);
			console.error('VIN decode error:', error);
		}
	}

	async function testComparables() {
		comparablesStatus = 'Fetching...';
		comparablesError = '';
		try {
			comparablesResult = await getComparableListings(testVin, testZip, testMileage);
			comparablesStatus = 'Success';
		} catch (error) {
			comparablesStatus = 'Error';
			comparablesError = error instanceof Error ? error.message : String(error);
			console.error('Comparables error:', error);
		}
	}
</script>

<svelte:head>
	<title>MarketCheck API Test</title>
</svelte:head>

<main class="container mx-auto p-4 max-w-4xl">
	<h1 class="text-2xl font-bold mb-6">MarketCheck API Test</h1>

	<div class="mb-8 p-4 border rounded bg-gray-50">
		<h2 class="text-xl font-semibold mb-2">Test Parameters</h2>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<div>
				<label class="block text-sm font-medium text-gray-700">VIN</label>
				<input type="text" bind:value={testVin} class="mt-1 p-2 w-full border rounded" />
			</div>
			<div>
				<label class="block text-sm font-medium text-gray-700">ZIP Code</label>
				<input type="text" bind:value={testZip} class="mt-1 p-2 w-full border rounded" />
			</div>
			<div>
				<label class="block text-sm font-medium text-gray-700">Mileage</label>
				<input type="number" bind:value={testMileage} class="mt-1 p-2 w-full border rounded" />
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
		<div>
			<button
				on:click={testToken}
				class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
			>
				Test OAuth Token
			</button>
			<div class="mt-2">
				Status: <span class={tokenStatus === 'Success' ? 'text-green-600 font-medium' : tokenStatus === 'Error' ? 'text-red-600 font-medium' : ''}>{tokenStatus}</span>
				{#if tokenError}
					<p class="text-red-600 text-sm mt-1">{tokenError}</p>
				{/if}
			</div>
			{#if token}
				<div class="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
					<p class="text-xs break-all">{token}</p>
				</div>
			{/if}
		</div>

		<div>
			<button
				on:click={testVinDecode}
				class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
			>
				Test VIN Decode
			</button>
			<div class="mt-2">
				Status: <span class={vinStatus === 'Success' ? 'text-green-600 font-medium' : vinStatus === 'Error' ? 'text-red-600 font-medium' : ''}>{vinStatus}</span>
				{#if vinError}
					<p class="text-red-600 text-sm mt-1">{vinError}</p>
				{/if}
			</div>
		</div>

		<div>
			<button
				on:click={testComparables}
				class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
			>
				Test Comparables
			</button>
			<div class="mt-2">
				Status: <span class={comparablesStatus === 'Success' ? 'text-green-600 font-medium' : comparablesStatus === 'Error' ? 'text-red-600 font-medium' : ''}>{comparablesStatus}</span>
				{#if comparablesError}
					<p class="text-red-600 text-sm mt-1">{comparablesError}</p>
				{/if}
			</div>
		</div>
	</div>

	{#if vinResult}
		<div class="mb-8">
			<h2 class="text-xl font-semibold mb-2">VIN Decode Results</h2>
			<div class="bg-white p-4 border rounded shadow">
				<h3 class="font-medium text-lg">
					{vinResult.year} {vinResult.make} {vinResult.model} {vinResult.trim}
				</h3>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
					<div>
						<p><span class="font-medium">Engine:</span> {vinResult.engine}</p>
						<p><span class="font-medium">Transmission:</span> {vinResult.transmission}</p>
						<p><span class="font-medium">Drivetrain:</span> {vinResult.drivetrain}</p>
						<p><span class="font-medium">Body Type:</span> {vinResult.bodyType}</p>
					</div>
					<div>
						<p><span class="font-medium">Exterior Color:</span> {vinResult.exteriorColor}</p>
						<p><span class="font-medium">Interior Color:</span> {vinResult.interiorColor}</p>
						<p><span class="font-medium">Style ID:</span> {vinResult.styleId}</p>
						<p><span class="font-medium">MSRP:</span> ${vinResult.msrp.toLocaleString()}</p>
					</div>
				</div>
			</div>
		</div>
	{/if}

	{#if comparablesResult}
		<div>
			<h2 class="text-xl font-semibold mb-2">Comparable Vehicles ({comparablesResult.length})</h2>
			<div class="bg-white p-4 border rounded shadow">
				{#if comparablesResult.length === 0}
					<p class="text-gray-600">No comparable vehicles found.</p>
				{:else}
					<div class="space-y-4">
						{#each comparablesResult as vehicle}
							<div class="border-b pb-4 last:border-b-0 last:pb-0">
								<h3 class="font-medium">
									{vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
								</h3>
								<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
									<div>
										<p><span class="font-medium">Price:</span> ${vehicle.price.toLocaleString()}</p>
										<p><span class="font-medium">Mileage:</span> {vehicle.mileage.toLocaleString()}</p>
										<p><span class="font-medium">Location:</span> {vehicle.location.city}, {vehicle.location.state} (Distance: {vehicle.location.distance} miles)</p>
									</div>
									<div>
										<p><span class="font-medium">Days on Market:</span> {vehicle.daysOnMarket}</p>
										<p><span class="font-medium">Color:</span> {vehicle.exteriorColor}</p>
										<p>
											<span class="font-medium">Features:</span>
											{vehicle.oneOwner ? 'One Owner, ' : ''}
											{vehicle.accidentFree ? 'Clean Title' : ''}
										</p>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<div class="mt-8 text-sm text-gray-500">
		<p>This page allows direct testing of the MarketCheck API implementation. Check your browser console for detailed logs.</p>
	</div>
</main>
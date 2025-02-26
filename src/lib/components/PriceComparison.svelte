<!-- src/lib/components/PriceComparison.svelte -->
<script lang="ts" context="module">
    import { onMount } from 'svelte';
    import type { PriceAnalysis } from '$lib/types/marketdata';
    export let priceAnalysis: PriceAnalysis;

    let chartElement: HTMLCanvasElement;

    // onMount(() => {
    //     // In a real implementation, we would use a charting library like Chart.js
    //     // For this example, we'll use a simple SVG-based chart
    //     renderPriceComparisonChart();
    // });

    function renderPriceComparisonChart() {
        // Simple implementation - in a real app, use a proper charting library
        const width = chartElement.clientWidth;
        const height = 100;
        const padding = 40;

        const minPrice = priceAnalysis.minPrice;
        const maxPrice = priceAnalysis.maxPrice;
        const range = maxPrice - minPrice;

        const ctx = chartElement.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw price range bar
        const barHeight = 20;
        const barY = height / 2 - barHeight / 2;

        // Draw background bar
        ctx.fillStyle = '#e5e7eb';
        ctx.fillRect(padding, barY, width - padding * 2, barHeight);

        // Draw average marker
        const avgX = padding + ((priceAnalysis.avgMarketPrice - minPrice) / range) * (width - padding * 2);
        ctx.fillStyle = '#6b7280';
        ctx.beginPath();
        ctx.moveTo(avgX, barY - 10);
        ctx.lineTo(avgX - 5, barY - 5);
        ctx.lineTo(avgX + 5, barY - 5);
        ctx.fill();

        // Draw subject vehicle marker
        const subjectX = padding + ((priceAnalysis.subjectVehiclePrice - minPrice) / range) * (width - padding * 2);
        ctx.fillStyle = priceAnalysis.isPriceGood ? '#10b981' : '#ef4444';
        ctx.beginPath();
        ctx.arc(subjectX, barY + barHeight / 2, 8, 0, Math.PI * 2);
        ctx.fill();

        // Draw min and max labels
        ctx.fillStyle = '#374151';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`$${minPrice.toLocaleString()}`, padding, barY + barHeight + 20);
        ctx.textAlign = 'right';
        ctx.fillText(`$${maxPrice.toLocaleString()}`, width - padding, barY + barHeight + 20);

        // Draw average label
        ctx.textAlign = 'center';
        ctx.fillText('Market Average', avgX, barY - 15);

        // Draw subject vehicle label
        ctx.fillStyle = priceAnalysis.isPriceGood ? '#10b981' : '#ef4444';
        ctx.fillText('This Vehicle', subjectX, barY + barHeight + 35);
    }
</script>

<div class="bg-white p-4 rounded-lg shadow-md">
    <h2 class="text-xl font-bold mb-4">Price Analysis</h2>

    <div class="mb-6">
        <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold">Market Position</h3>

            <div class="text-right">
                <p class="text-lg font-bold">
                    ${priceAnalysis.subjectVehiclePrice.toLocaleString()}
                </p>
                <p class={priceAnalysis.isPriceGood ? 'text-green-600' : 'text-red-600'}>
                    {priceAnalysis.percentageDifference > 0 ? '+' : ''}
                    {priceAnalysis.percentageDifference.toFixed(1)}%
                    vs. Average
                </p>
            </div>
        </div>

        <div class="mt-4">
            <canvas bind:this={chartElement} width="100%" height="120"></canvas>
        </div>

        <div class="grid grid-cols-2 gap-4 mt-4">
            <div>
                <p class="text-gray-600">Market Average</p>
                <p class="font-medium">${priceAnalysis.avgMarketPrice.toLocaleString()}</p>
            </div>
            <div>
                <p class="text-gray-600">Price Difference</p>
                <p class="font-medium {priceAnalysis.priceDifference <= 0 ? 'text-green-600' : 'text-red-600'}">
                    {priceAnalysis.priceDifference <= 0 ? '-' : '+'}
                    ${Math.abs(priceAnalysis.priceDifference).toLocaleString()}
                </p>
            </div>
        </div>
    </div>

    <div>
        <h3 class="text-lg font-semibold mb-2">Price Factors</h3>

        <div class="space-y-3">
            {#each priceAnalysis.priceFactors as factor}
                <div class="border-l-4 {factor.impact >= 0 ? 'border-green-500' : 'border-red-500'} pl-3">
                    <h4 class="font-medium">{factor.factor}</h4>
                    <p class="text-sm text-gray-600">{factor.description}</p>
                </div>
            {/each}
        </div>
    </div>
</div>
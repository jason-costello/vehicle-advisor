<!-- src/lib/components/LoadingState.svelte -->
<script lang="ts">
    export let message: string = "Analyzing vehicle data...";
</script>

<div class="flex flex-col items-center justify-center p-8">
    <div class="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    <p class="mt-4 text-lg text-gray-700">{message}</p>
</div>
<!-- src/lib/components/VehicleInput.svelte -->
<script lang="ts">
    import { createForm } from 'svelte-forms-lib';
    import { vinValidator } from '$lib/utils/vinValidator';

    export let onSubmit: (data: { vin: string; zipCode: string; mileage: number }) => void;
    export let isLoading: boolean = false;

    // Sample VINs for testing
    const sampleVINs = [
        { vin: '1HGCM82633A004352', description: 'Honda Accord' },
        { vin: 'JH4DA1851JS011825', description: 'Acura Integra' },
        { vin: '1GNEK13T2YJ204560', description: 'Chevrolet Tahoe' }
    ];

    const { form, errors, handleChange, handleSubmit, setField } = createForm({
        initialValues: {
            vin: '',
            zipCode: '',
            mileage: ''
        },
        validate: values => {
            const errors: Record<string, string> = {};

            if (!values.vin) {
                errors.vin = 'VIN is required';
            } else if (!vinValidator(values.vin)) {
                errors.vin = 'Please enter a valid 17-character VIN';
            }

            if (!values.zipCode) {
                errors.zipCode = 'ZIP code is required';
            } else if (!/^\d{5}$/.test(values.zipCode)) {
                errors.zipCode = 'Please enter a valid 5-digit ZIP code';
            }

            if (!values.mileage) {
                errors.mileage = 'Mileage is required';
            } else if (isNaN(Number(values.mileage)) || Number(values.mileage) < 0) {
                errors.mileage = 'Please enter a valid mileage';
            }

            return errors;
        },
        onSubmit: values => {
            onSubmit({
                vin: values.vin,
                zipCode: values.zipCode,
                mileage: Number(values.mileage)
            });
        }
    });

    function useSampleVIN(vin: string) {
        setField('vin', vin);
    }

    // Detect user's location for ZIP code
    function detectLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                try {
                    const response = await fetch(
                      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}`
                    );
                    const data = await response.json();
                    if (data.postcode) {
                        setField('zipCode', data.postcode.slice(0, 5));
                    }
                } catch (error) {
                    console.error('Error getting location:', error);
                }
            });
        }
    }
</script>

<div class="vehicle-input-container p-4 bg-white rounded-lg shadow-md">
    <h2 class="text-xl font-bold mb-4">Enter Vehicle Information</h2>

    <form on:submit={handleSubmit} class="space-y-4">
        <div class="form-group">
            <label for="vin" class="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Identification Number (VIN)
            </label>
            <input
              type="text"
              id="vin"
              name="vin"
              class="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter 17-character VIN"
              bind:value={$form.vin}
              on:change={handleChange}
              maxlength="17"
              autocomplete="off"
            />
            {#if $errors.vin}
                <p class="mt-1 text-sm text-red-600">{$errors.vin}</p>
            {/if}

            <div class="mt-2">
                <p class="text-xs text-gray-500 mb-1">For testing, use a sample VIN:</p>
                <div class="flex flex-wrap gap-2">
                    {#each sampleVINs as sample}
                        <button
                          type="button"
                          class="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-700"
                          on:click={() => useSampleVIN(sample.vin)}
                        >
                            {sample.description}
                        </button>
                    {/each}
                </div>
            </div>
        </div>

        <div class="form-group">
            <label for="zipCode" class="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code
            </label>
            <div class="flex">
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  class="w-full p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter 5-digit ZIP code"
                  bind:value={$form.zipCode}
                  on:change={handleChange}
                  maxlength="5"
                  inputmode="numeric"
                />
                <button
                  type="button"
                  class="bg-gray-100 px-3 text-gray-600 rounded-r-md border border-gray-300 border-l-0 hover:bg-gray-200"
                  on:click={detectLocation}
                >
                    Detect
                </button>
            </div>
            {#if $errors.zipCode}
                <p class="mt-1 text-sm text-red-600">{$errors.zipCode}</p>
            {/if}
        </div>

        <div class="form-group">
            <label for="mileage" class="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Mileage
            </label>
            <input
              type="number"
              id="mileage"
              name="mileage"
              class="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter current mileage"
              bind:value={$form.mileage}
              on:change={handleChange}
              min="0"
              inputmode="numeric"
            />
            {#if $errors.mileage}
                <p class="mt-1 text-sm text-red-600">{$errors.mileage}</p>
            {/if}
        </div>

        <button
          type="submit"
          class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
            {#if isLoading}
                <span class="spinner mr-2"></span>
                Analyzing...
            {:else}
                Analyze Vehicle
            {/if}
        </button>
    </form>
</div>

<style>
    .spinner {
        display: inline-block;
        width: 1rem;
        height: 1rem;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s ease-in-out infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }
</style>
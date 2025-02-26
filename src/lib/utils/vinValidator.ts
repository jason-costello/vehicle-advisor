/* Validates a Vehicle Identification Number (VIN)
*
* @param vin The VIN to validate
* @returns boolean indicating if the VIN is valid
*/
export function vinValidator(vin: string): boolean {
    // Basic validation - VINs are 17 characters for vehicles after 1981
    if (!vin || vin.length !== 17) {
        return false;
    }

    // VINs should only contain alphanumeric characters (no I, O, or Q)
    const validPattern = /^[A-HJ-NPR-Z0-9]{17}$/i;
    if (!validPattern.test(vin)) {
        return false;
    }

    // Optional: Implement the VIN check digit validation
    // This is a more complex algorithm that verifies the 9th character
    // against a calculation based on the other characters

    return true;
}
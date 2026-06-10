/**
 * Example usage of PersonBasedPricing in your database
 * 
 * To test the PersonBasedPricing functionality, you can create entries like this in your database:
 */

-- Example 1: Property with base price for 3 people, discount for 2 people
INSERT INTO "PersonBasedPricing" ("propertyId", "basePersonCount", "adjustments", "createdAt", "updatedAt")
VALUES (
  1, -- replace with your property ID
  3, -- base person count
  '{
    "2": {
      "enabled": true,
      "percent": 10,
      "user": "marsidorowicz@gmail.com"
    }
  }',
  NOW(),
  NOW()
);

-- Example 2: Property with base price for 2 people, surcharge for more people
INSERT INTO "PersonBasedPricing" ("propertyId", "basePersonCount", "adjustments", "createdAt", "updatedAt")
VALUES (
  2, -- replace with your property ID
  2, -- base person count
  '{
    "3": {
      "enabled": true,
      "percent": 15,
      "user": "marsidorowicz@gmail.com"
    },
    "4": {
      "enabled": true,
      "percent": 25,
      "user": "marsidorowicz@gmail.com"
    }
  }',
  NOW(),
  NOW()
);

/**
 * How it works:
 * 
 * 1. Base price calculation: The property has a standard price for the "basePersonCount"
 * 2. Person adjustments: For different person counts, apply percentage adjustments
 * 3. Calculation logic:
 *    - If guests < basePersonCount: Apply discount (reduce price)
 *    - If guests > basePersonCount: Apply surcharge (increase price)
 *    - If guests = basePersonCount: No adjustment (use base price)
 * 
 * Example with your sample data:
 * - Property has basePersonCount: 3
 * - Base price: 1000 PLN
 * - For 2 people: 1000 * (1 - 0.10) = 900 PLN (10% discount)
 * - For 3 people: 1000 PLN (no adjustment)
 * - For 4 people: 1000 PLN (no adjustment configured, so base price)
 */

<!-- @format -->

# PersonBasedPricing Implementation Guide

## Overview

The PersonBasedPricing system allows properties to have different pricing based on the number of guests. This is useful for scenarios where you want to offer discounts for fewer guests or surcharges for additional guests beyond a base occupancy.

## Database Schema

The `PersonBasedPricing` model in your Prisma schema:

```prisma
model PersonBasedPricing {
  id               Int      @id @default(autoincrement())
  property         Property @relation(fields: [propertyId], references: [id])
  propertyId       Int
  basePersonCount  Int
  adjustments      Json     // { [personCount: number]: { enabled: boolean, percent: number } }
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

## Data Structure

### `adjustments` JSON field structure:

```json
{
	"2": {
		"enabled": true,
		"percent": 10,
		"user": "marsidorowicz@gmail.com"
	},
	"4": {
		"enabled": true,
		"percent": 15,
		"user": "marsidorowicz@gmail.com"
	}
}
```

- **Key**: Person count as string (e.g., "2", "4")
- **enabled**: Boolean to activate/deactivate this adjustment
- **percent**: Percentage adjustment (positive number)
- **user**: Optional field to track who configured this adjustment

## Pricing Logic

### Base Pricing Concept

- Each property has a `basePersonCount` (e.g., 3 people)
- The property's standard price applies to this base person count
- Adjustments are made for different person counts

### Calculation Rules

1. **Fewer guests than base**: Typically discount (reduce price)
2. **More guests than base**: Typically surcharge (increase price)
3. **Same as base**: No adjustment (use standard price)

### Formula

```typescript
if (personCount < basePersonCount) {
	// Discount: reduce price by percentage
	adjustedPrice = basePrice * (1 - adjustmentPercent / 100);
} else {
	// Surcharge: increase price by percentage
	adjustedPrice = basePrice * (1 + adjustmentPercent / 100);
}
```

## Implementation Example

### Sample Data

Property with base price for 3 people:

```json
{
	"basePersonCount": 3,
	"adjustments": {
		"2": {
			"enabled": true,
			"percent": 10,
			"user": "marsidorowicz@gmail.com"
		}
	}
}
```

### Price Calculations

- **Base price**: 1000 PLN for 3 people
- **2 people**: 1000 \* (1 - 0.10) = 900 PLN (10% discount)
- **3 people**: 1000 PLN (no adjustment)
- **4 people**: 1000 PLN (no adjustment configured)

## Integration Points

The PersonBasedPricing system has been integrated into:

### 1. API Endpoints

- `/api/availability/re/route.tsx` - Applies adjustments during availability search
- `/api/properties/mountain/route.ts` - Includes pricing data in property listings
- `/api/properties/mountain/[id]/route.ts` - Includes pricing data for individual properties

### 2. Components

- `ReservationEngine.tsx` - Main price calculations
- `AdditionalServices.tsx` - Service and total price calculations
- `ReservationForm.tsx` - Payment amount calculations
- `PropertyList.tsx` - Display of adjusted prices

### 3. Utility Functions

- `utilities/functions/pricing/personBasedPricing.ts` - Core pricing logic

## Usage in ReservationEngine

The system automatically:

1. **Fetches** PersonBasedPricing data with property information
2. **Calculates** adjusted prices based on guest count
3. **Applies** adjustments throughout the reservation flow
4. **Updates** totals for payments and display

## Configuration Steps

### 1. Database Setup

Create PersonBasedPricing entries for your properties:

```sql
INSERT INTO "PersonBasedPricing" ("propertyId", "basePersonCount", "adjustments")
VALUES (
  1, -- your property ID
  3, -- base person count
  '{
    "2": {"enabled": true, "percent": 10, "user": "your@email.com"}
  }'
);
```

### 2. Testing

- Search for accommodations with different guest counts
- Verify prices adjust according to your configuration
- Check that adjustments appear in payment calculations

## Benefits

1. **Flexible Pricing**: Different rates for different occupancy levels
2. **Revenue Optimization**: Encourage bookings through strategic pricing
3. **Automated Calculation**: No manual price adjustments needed
4. **Transparent**: Clear calculation logic throughout the system

## Notes

- Person-based pricing is optional - properties without configuration use standard pricing
- Multiple adjustments can be configured for different person counts
- The system gracefully handles missing configurations (falls back to base price)
- User tracking helps with audit trails for pricing changes

## Future Enhancements

Potential improvements could include:

- Season-based person adjustments
- Different adjustments for weekdays vs weekends
- Minimum/maximum price limits
- Bulk configuration tools

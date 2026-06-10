<!-- @format -->

# Property URL Slugs System

## Overview

Properties now support SEO-friendly URLs with language-specific slugs. The new URL format is:

```
/[lang]/property/[id]-[slug]
```

Example:

-   `/pl/property/57-apartament-z-widokiem-na-giewont`
-   `/en/property/57-apartment-with-giewont-view`
-   `/de/property/57-appartement-mit-giewont-blick`
-   `/es/property/57-apartamento-con-vista-a-giewont`

## Database Schema

The `Property` model now includes a `slugs` field:

```prisma
model Property {
  // ... other fields
  slugs Json? // {"pl": "apartament-z-widokiem-na-giewont", "en": "apartment-with-giewont-view", ...}
}
```

## How It Works

### 1. Route Structure

-   **New route**: `/app/[lang]/property/[id-slug]/page.tsx` - Main route for property pages
-   **Old route**: `/app/[lang]/property/[id]/page.tsx` - Redirects to new format for backwards compatibility

### 2. Slug Storage Format

Slugs are stored as JSON in the database:

```json
{
	"pl": "apartament-z-widokiem-na-giewont",
	"en": "apartment-with-giewont-view",
	"de": "appartement-mit-giewont-blick",
	"es": "apartamento-con-vista-a-giewont"
}
```

### 3. Automatic Slug Generation

If a property doesn't have slugs in the database, the system automatically generates one from the property name:

```typescript
// Property name: "Apartament z widokiem na Giewont"
// Generated slug: "apartament-z-widokiem-na-giewont"
```

### 4. Slug Validation & Redirects

The route automatically validates and redirects to the correct URL:

-   ✅ Missing slug → Redirects to URL with slug
-   ✅ Wrong slug → Redirects to correct slug
-   ✅ Old format (`/property/57`) → Redirects to new format with slug
-   ✅ Language switch → Uses slug for that language

## Usage

### Building Property URLs

Use the utility function to build property URLs:

```typescript
import { buildPropertyUrl } from "@/utilities/functions/propertyUrl"

// With slugs from database
const url = buildPropertyUrl(property.id, property.name, lang, property.slugs)
// Result: "/pl/property/57-apartament-z-widokiem-na-giewont"

// Without slugs (auto-generated)
const url = buildPropertyUrl(property.id, property.name, lang)
// Result: "/pl/property/57-apartament-z-widokiem-na-giewont"
```

### Example in Components

```tsx
import { buildPropertyUrl } from "@/utilities/functions/propertyUrl"

function PropertyCard({ property, lang }) {
	const href = buildPropertyUrl(
		property.id,
		property.name,
		lang,
		property.slugs
	)

	return <Link href={href}>{property.name}</Link>
}
```

## Adding Slugs to Properties

### Option 1: In Your Admin Panel

When creating/editing properties, add slugs as JSON:

```json
{
	"pl": "apartament-z-widokiem-na-giewont-zakopane",
	"en": "apartment-with-giewont-view-zakopane",
	"de": "appartement-mit-giewont-blick-zakopane",
	"es": "apartamento-con-vista-a-giewont-zakopane"
}
```

### Option 2: Database Migration (Optional)

You can create a script to generate slugs for existing properties:

```typescript
import { PrismaClient } from "@prisma/client"
import { generateSlug } from "./utilities/functions/propertyUrl"

const prisma = new PrismaClient()

async function addSlugsToProperties() {
	const properties = await prisma.property.findMany()

	for (const property of properties) {
		const slugs = {
			pl: generateSlug(property.name),
			en: generateSlug(property.name), // Translate if needed
			de: generateSlug(property.name), // Translate if needed
			es: generateSlug(property.name), // Translate if needed
		}

		await prisma.property.update({
			where: { id: property.id },
			data: { slugs },
		})
	}
}
```

## SEO Benefits

1. **Language-specific URLs**: Each language has its own SEO-friendly slug
2. **Better rankings**: Descriptive URLs improve search engine rankings
3. **Canonical URLs**: Each page has proper canonical and alternate language tags
4. **User-friendly**: URLs are readable and memorable
5. **Automatic redirects**: Always shows the correct URL format

## Backwards Compatibility

✅ Old URLs (`/property/57`) still work and automatically redirect to the new format
✅ Missing slugs are auto-generated from property names
✅ No breaking changes to existing functionality

## Utility Functions

### `buildPropertyUrl(propertyId, propertyName, lang, slugs?)`

Builds a complete property URL with the appropriate slug.

### `generateSlug(text)`

Generates a URL-friendly slug from any text.

### `extractIdFromSlug(idSlug)`

Extracts the property ID from an id-slug parameter.

### `extractSlug(idSlug)`

Extracts the slug portion from an id-slug parameter.

## Notes

-   Slugs are optional - the system works without them
-   Each language can have a different slug
-   Slugs are automatically validated and corrected
-   Old format URLs automatically redirect to new format
-   The system is fully backwards compatible

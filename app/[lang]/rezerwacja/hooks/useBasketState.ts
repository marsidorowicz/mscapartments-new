import { useState, useEffect } from "react";
import { useLocalStorageNew } from "@/utilities/hooks/useLocalStorage";
import {
    type BasketItem,
    type ItemState,
    buildInitialState,
    createServicesFromProperty
} from "../functions/basketHelpers";

export function useBasketState(basketItems: BasketItem[]) {
    // Shared state stored in local storage instead of component state
    const [itemStates, setItemStates] = useLocalStorageNew<Record<string, ItemState>>("rootBasketStates", {});

    useEffect(() => {
        setItemStates((prev) => {
            const next: Record<string, ItemState> = { ...prev };
            basketItems.forEach((item) => {
                const key = item.id.toString();
                if (!next[key]) {
                    next[key] = buildInitialState(item, prev[key]);
                }
            });
            return next;
        });
    }, [basketItems, setItemStates]);

    useEffect(() => {
        if (!basketItems.length) return;

        const loadPropertyDetails = async () => {
            // Find items that need their property details loaded
            const itemsToLoad = basketItems.filter(item => {
                const state = itemStates[item.id.toString()];
                return !state?.property; // assuming only if property is null we didn't fetch
            });

            if (itemsToLoad.length === 0) return;

            const promises = itemsToLoad.map(async (item) => {
                const id = item.id.toString();
                try {
                    const response = await fetch(`/api/properties/mountain/${id}`);
                    if (!response.ok) return { id, data: null };
                    const json = await response.json();
                    return { id, data: json.property };
                } catch {
                    return { id, data: null };
                }
            });

            const results = await Promise.all(promises);
            let hasUpdates = false;

            setItemStates((prev) => {
                const next = { ...prev };
                results.forEach((result) => {
                    if (!result.data) return;

                    const key = result.id;
                    const existing = next[key];
                    if (!existing || existing.property) return; // avoid infinite updates

                    hasUpdates = true;
                    
                    // We merge just like BasketPageClient
                    next[key] = {
                        ...existing,
                        maxOccupancy: result.data.maxOccupancy || existing?.maxOccupancy || 1,
                        parkingQuantity: result.data.parkingQuantity ?? existing?.parkingQuantity ?? 0,
                        petsMax: result.data.extended?.petsMax ?? existing?.petsMax ?? 0,
                        propertyName: result.data.name || existing?.propertyName,
                        breakfastAllowed: result.data.extended?.breakfastAllowed ?? existing?.breakfastAllowed,
                        petsAllowed: result.data.extended?.petsAllowed ?? existing?.petsAllowed,
                        babyCribAllowed: result.data.extended?.babyCribAllowed ?? existing?.babyCribAllowed,
                        placeName: result.data.place?.name || existing?.placeName,
                        property: result.data,
                        services: createServicesFromProperty(existing?.services, result.data),
                    };
                });
                return hasUpdates ? next : prev;
            });
        };

        loadPropertyDetails();
    }, [basketItems, itemStates, setItemStates]); // we trigger when base items arrive

    return { itemStates, setItemStates };
}

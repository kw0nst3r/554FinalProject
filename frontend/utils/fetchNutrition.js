export async function fetchNutritionData(query) {
    try {
        const response = await fetch(`https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`, {
            headers: {'X-Api-Key': process.env.NEXT_PUBLIC_CALORIE_NINJAS_API_KEY}
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        return data.items[0];
    } catch(error) {
        console.error('Nutrition fetch failed:', error);
        return null;
    }
}
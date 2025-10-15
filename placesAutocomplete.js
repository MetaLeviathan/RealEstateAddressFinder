import wixSecretsBackend from "wix-secrets-backend";
import {fetch} from "wix-fetch";

let autocomplete;

export async function getAutocomplete(inputString) {
    const googleMapsSecret = JSON.parse(await wixSecretsBackend.getSecret('googleMapsSecret'));
    const apiKey = googleMapsSecret.key;

    const swLat = 32.5;
    const swLng = -119.0;
    const neLat = 35.0;
    const neLng = -114.0;

    const box = encodeURIComponent(`${swLat},${swLng}|${neLat},${neLng}`);

    // Get autocomplete results
    const autoCompleteUrl =
    `https://maps.googleapis.com/maps/api/place/autocomplete/json`
    + `?input=${encodeURIComponent(inputString)}`
    + `&components=country:us`
    + `&locationrestriction=rectangle:${box}`
    + `&types=address`
    + `&key=${apiKey}`;

    let autoCompleteResponse = await fetch(autoCompleteUrl, { method: 'get' });
    console.log(autoCompleteResponse);
    if (!autoCompleteResponse.ok) {
        console.error("Google Places Autocomplete API Error: getAutocomplete has returned with an error");
        return { predictions: [] }; 
    }

    let autoCompleteData = await autoCompleteResponse.json();

    if (autoCompleteData.predictions.length === 0) {
        return { predictions: [] };
    }
    console.log(autoCompleteData);
    console.log(autoCompleteData.predictions);
    console.log(autoCompleteData.postal_code);
    console.log(autoCompleteData.place_id);
    return { predictions: autoCompleteData.predictions };
}

// Extract place_id from the chosen prediction
export async function getZipcode(autoCompleteData) {
    const googleMapsSecret = JSON.parse(await wixSecretsBackend.getSecret('googleMapsSecret'));
    const apiKey = googleMapsSecret.key;

    // Get Place Details including ZIP code
    let PlaceIdUrl = "https://maps.googleapis.com/maps/api/place/details/json?place_id=" + autoCompleteData + "&fields=address_component&key=" + apiKey;

    let placeDetailsResponse = await fetch(PlaceIdUrl, { method: 'get' });

    if (!placeDetailsResponse.ok) {
        console.error("Google Places API Error: Failed to fetch place details.");
        return { predictions: autoCompleteData.predictions, zipcode: null };
    }

    let placeDetailsData = await placeDetailsResponse.json();
    console.log("Full Data: ", placeDetailsData)

    // Extract ZIP code from address components
    let zipValue = null;
    if (placeDetailsData.result && placeDetailsData.result.address_components) {
        let addressComponents = placeDetailsData.result.address_components;
        let postalCodeComponent = addressComponents.find(comp => comp.types.includes("postal_code"));
        if (postalCodeComponent) {
            zipValue = postalCodeComponent.long_name;
        }
    }
    
    console.log("Zip Info: ", zipValue)
    return zipValue;
}

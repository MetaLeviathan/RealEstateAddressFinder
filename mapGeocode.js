import wixSecretsBackend from "wix-secrets-backend";
import {fetch} from "wix-fetch";

export async function  getGeocode(inputAddress) {
    const googleMapsSecret = JSON.parse(await wixSecretsBackend.getSecret('googleMapsSecret'));
    const apiKey = googleMapsSecret.key;

    let cleanedAddress = inputAddress.trim();
    var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + cleanedAddress + "&key=" + apiKey;

    return fetch (url, {method: 'get'}).then( (httpResponse) => {
        if (httpResponse.ok) {
            console.log("HTTP OK");
            return httpResponse.json();
        }
    })
}

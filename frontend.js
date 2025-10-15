import { getGeocode } from "backend/mapGeocode.jsw";
import { getAutocomplete, getZipcode } from "backend/placesAutocomplete.jsw"

$w.onReady(function () {
    let lastAddress = "";
    let currentAddress = "";

    let initialLat = 33.487007;
    let initialLng = -117.143784;

    let mapValues;
    let currentStep = 1;
    let delay = 300;

    // Simple debounce function
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    $w("#selectionMap").onMessage((event) => {
        if (event.data.type === "mapReady") {

            mapValues = {
                "lat": initialLat,
                "lng": initialLng,
                "zoom": 10,
                "marker": false
            }

            console.log(mapValues);
            $w("#selectionMap").postMessage(JSON.stringify(mapValues));
        }
    });

    let debouncedAutocomplete = debounce((inputText) => {
        if (!inputText || inputText.trim() === "") return; // Prevent empty calls

        getAutocomplete(inputText)
            .then((res) => {            
                // Handle invalid responses to prevent frontend crashes
                if (!res || !res.predictions) {
                    console.error("Invalid Autocomplete Response", res);
                    return;
                }

                // Format predictions into suggestions for repeater
                let suggestions = res.predictions.map(prediction => ({
                    "_id": getRandomString(),
                    "place_id": prediction.place_id,
                    "address": prediction.description
                }));

                console.log("Formatted Suggestions:", suggestions);

                // Update repeater data
                $w("#repeaterSuggestions").data = suggestions;
                $w("#repeaterSuggestions").show();

                $w("#repeaterSuggestions").onItemReady(($item, itemData) => {
                    repeaterSuggestionsReady($item, itemData);
                });
            })
            .catch((error) => console.error("Autocomplete Fetch Error: ", error));
    }, delay); // Adjust debounce delay (in ms) - set to 500

    $w('#addressForm').onFieldValueChange((updatedValues) => {
        // Ensure updatedValues is correctly retrieved
        delay = 300;

        if(updatedValues == null || updatedValues === "")
        {
            return;
        }

        if (updatedValues["address_a928"] && currentStep === 1) {
            // Access field values by their ID
            if (updatedValues["address_a928"] != null) {
                currentAddress = updatedValues["address_a928"] || "";
            }

            // Start attempting to use Places API to help autocomplete the address for increased accuracy of data
           debouncedAutocomplete(currentAddress);
        }
    });

    $w('#addressForm').onStepNumberChange(() => {
        if($w("#repeaterSuggestions").isVisible) {
            $w("#repeaterSuggestions").hide();
        }

        currentStep = $w('#addressForm').getStepNumber();

        if (lastAddress != currentAddress) {
            lastAddress = currentAddress;

            // Geocode address string using currentAddress
            getGeocode(currentAddress)
                .then((geocode) => {
                    mapValues = {
                        "lat": geocode.results[0].geometry.location.lat,
                        "lng": geocode.results[0].geometry.location.lng,
                        "zoom": 18,
                        "marker": true
                    }

                    // Hand houseValues to html block code to update map
                    console.log(mapValues);
                    $w("#selectionMap").postMessage(JSON.stringify(mapValues));
                })
                .catch((error) => console.error("Geocode Error: ", error));
        }
    });

    // Uses the repeater to show Places API results for user selection
    function repeaterSuggestionsReady($item, itemData) {
        if (!itemData || !itemData.address) return; // Prevent errors if no data

        console.log("Repeater item ready:", itemData);

        // Set the text of the suggestion inside the repeater item
        $item("#textSuggestions").text = itemData.address;

        // Add click event to update the address field when suggestion is selected
        $item("#textSuggestions").onClick(() => {
            handleSuggestionClick(itemData)
        });
    }

    async function handleSuggestionClick(itemData) {
        try {
            const zip = await getZipcode(itemData.place_id);
            console.log("Address zipcode: ", zip);

            let formattedAddress = itemData.address;
            if (zip && formattedAddress.includes(", CA, USA")) {
                formattedAddress = formattedAddress.replace(", CA, USA", `, CA ${zip}, USA`);
            }

            currentAddress = formattedAddress;

            $w("#addressForm").setFieldValues({ address_a928: formattedAddress });
            $w("#repeaterSuggestions").hide();
        } catch (error) {
            console.error("Zipcode lookup failed:", error);
        }
    }

    // Assists in Places API address generation through randomization of string values
    function getRandomString(length = 10) {
        return Math.random().toString(20).substring(2, length);
    }
});

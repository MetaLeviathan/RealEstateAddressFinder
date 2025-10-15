# RealEstateAddressFinder
A Google Maps and Places API integrated script for a Wix website that uses Velo (An offshoot of JavaScript).

The goal of this project was to enable a website to utilize user input text to suggest appropriate addresses in
the Southern California area for a Real Estate website. These suggestions through the Google Places API are used
to decrease improper address values and give the user more ease of use when attempting to input their address
when opting into a free home evaluation analysis.

- The frontend.js file handles user inputs and parses the JSON responses retrieved from the backend placesAutocomplete.js
  script. This actively updates the repeater block on the website to enable suggestions retrieved from the backend
  that allows users to click in order to automatically fill the text input box with the correctly formatted address.
  Once the user proceeds through the form by clicking "Next", the geocode information will be requested and given to
  the HTML block that contains the Google Map to update the maps position to assist users in verification that the
  input address is correct.
- The placesAutocomplete.js file simply requests autocomplete information from the Google Places API using the Wix
  secrets locker that stores the API key. When appropriate matches are achieved they are pushed to the frontend code
  via JSON in order to update the repeater block. This also generates geocode data to update the HTML block on the
  frontend.
- The HTML block is simple and starts with default geocode data to display the map before being updated via the frontend
  code to display the user input address upon user form submital.

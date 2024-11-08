import axios from 'axios';

// form fields
const form = document.querySelector('.form-data');
const region1 = document.querySelector('.region-name1');
const region2 = document.querySelector('.region-name2');
const region3 = document.querySelector('.region-name3');
const apiKey = document.querySelector('.api-key');

// results
const errors = document.querySelector('.errors');
const loading = document.querySelector('.loading');
const results = document.querySelector('.result-container');

// Region-specific result elements
const myregion1 = document.querySelector('.my-region1');
const myregion2 = document.querySelector('.my-region2');
const myregion3 = document.querySelector('.my-region3');
const usage1 = document.querySelector('.carbon-usage1');
const usage2 = document.querySelector('.carbon-usage2');
const usage3 = document.querySelector('.carbon-usage3');
const fossilfuel1 = document.querySelector('.fossil-fuel1');
const fossilfuel2 = document.querySelector('.fossil-fuel2');
const fossilfuel3 = document.querySelector('.fossil-fuel3');
const clearBtn = document.querySelector('.clear-btn');

const calculateColor = async (value) => {
    let co2Scale = [0, 150, 600, 750, 800];
    let colors = ['#2AA364', '#F5EB4D', '#9E4229', '#381D02', '#381D02'];

    // Sorting to find the closest CO2 value
    let closestNum = co2Scale.sort((a, b) => Math.abs(a - value) - Math.abs(b - value))[0];
    let num = (element) => element > closestNum;
    let scaleIndex = co2Scale.findIndex(num);
    let closestColor = colors[scaleIndex];

    console.log(scaleIndex, closestColor);
    chrome.runtime.sendMessage({ action: 'updateIcon', value: { color: closestColor } });
};

const displayCarbonUsage = async (apiKey, region, regionIndex) => {
    try {
        await axios.get('https://api.co2signal.com/v1/latest', {
            params: { countryCode: region },
            headers: { 'auth-token': apiKey }
        })
        .then((response) => {
            let CO2 = Math.floor(response.data.data.carbonIntensity);
            calculateColor(CO2);

            loading.style.display = 'none';
            form.style.display = 'none';

            // Displaying results for specific regions
            if (regionIndex === 1) {
                myregion1.textContent = region;
                usage1.textContent = Math.round(response.data.data.carbonIntensity) + ' grams (grams CO2 emitted per kilowatt hour)';
                fossilfuel1.textContent = response.data.data.fossilFuelPercentage.toFixed(2) + '% (percentage of fossil fuels used to generate electricity)';
            } else if (regionIndex === 2) {
                myregion2.textContent = region;
                usage2.textContent = Math.round(response.data.data.carbonIntensity) + ' grams (grams CO2 emitted per kilowatt hour)';
                fossilfuel2.textContent = response.data.data.fossilFuelPercentage.toFixed(2) + '% (percentage of fossil fuels used to generate electricity)';
            } else if (regionIndex === 3) {
                myregion3.textContent = region;
                usage3.textContent = Math.round(response.data.data.carbonIntensity) + ' grams (grams CO2 emitted per kilowatt hour)';
                fossilfuel3.textContent = response.data.data.fossilFuelPercentage.toFixed(2) + '% (percentage of fossil fuels used to generate electricity)';
            }

            results.style.display = 'block';
        });
    } catch (error) {
        console.log(error);
        loading.style.display = 'none';
        results.style.display = 'none';
        errors.textContent = 'Sorry, we have no data for the region you have requested.';
    }
};

function setUpUser(apiKey, regionNames) {
    localStorage.setItem('apiKey', apiKey);
    localStorage.setItem('regionNames', JSON.stringify(regionNames));
    loading.style.display = 'block';
    errors.textContent = '';
    clearBtn.style.display = 'block';

    // Display results for each region
    regionNames.forEach((region, index) => {
        displayCarbonUsage(apiKey, region, index + 1); // Passing region index (1, 2, or 3)
    });
}

function handleSubmit(e) {
    e.preventDefault();

    // Collect all region names
    const regionNames = [region1.value, region2.value, region3.value];
    setUpUser(apiKey.value, regionNames);
}

function init() {
    const storedApiKey = localStorage.getItem('apiKey');
    const storedRegionNames = JSON.parse(localStorage.getItem('regionNames'));

    // Set icon to a generic green color
    chrome.runtime.sendMessage({ action: 'updateIcon', value: { color: 'green' } });

    if (storedApiKey === null || !storedRegionNames || storedRegionNames.length === 0) {
        form.style.display = 'block';
        results.style.display = 'none';
        loading.style.display = 'none';
        clearBtn.style.display = 'none';
        errors.textContent = '';
    } else {
        storedRegionNames.forEach((region, index) => {
            displayCarbonUsage(storedApiKey, region, index + 1); // Passing region index (1, 2, or 3)
        });
        results.style.display = 'none';
        form.style.display = 'none';
        clearBtn.style.display = 'block';
    }
}

function reset(e) {
    e.preventDefault();
    localStorage.removeItem('regionNames');
    document.querySelector('.result-container').innerHTML = ''; // Clear previous results
    init(); // Reinitialize
}

form.addEventListener('submit', (e) => handleSubmit(e));
clearBtn.addEventListener('click', (e) => reset(e));

init();

const userTab = document.querySelector('[data-userWeather]');
const searchTab = document.querySelector('[data-searchWeather]');
const userContainer = document.querySelector('.weather-container');
const grantAccess = document.querySelector('.grant-location-container');
const searchForm = document.querySelector('.form-container');
const loadingScreen = document.querySelector('.loading-container');
const showWeather = document.querySelector('.show-user-weather');
const grantAccessBtn = document.querySelector('[data-grantAccess]');

// variables
let currentTab = userTab;
let API_key = '3a37a240c6139dc22db72e9b205c8969';
currentTab.classList.add('current-tab');
//something pending
if(currentTab == userTab){
    getFromSessionStorage();
}


function switchTab(clickedTab){
    if (clickedTab != currentTab){
        currentTab.classList.remove('current-tab');
        currentTab = clickedTab;
        currentTab.classList.add('current-tab');

        if (!searchForm.classList.contains('active')){
            // if search form container is invisible then make it visible
            showWeather.classList.remove('active');
            grantAccess.classList.remove('active');
            searchForm.classList.add('active');
        }
        else{
            //I am already in the search form now going back to weather tab
            searchForm.classList.remove('active');
            showWeather.classList.remove('active'); 
            notFound.classList.remove('active')
            //now I am back in waether tab, so i have display the weather
            //for this I have to check local coordinates(if we have saved them).
            getFromSessionStorage();
        }
    }
}

//check if coordinates are already present in session storage
function getFromSessionStorage(){
    const localCoordinates = sessionStorage.getItem('user-coordinates');
    if (!localCoordinates){
        //if there are no local coordinates 
        //that means the permission was not granted
        grantAccess.classList.add('active');
    }
    else{
        //the coordinates are present
        //use them to make an api call
        const coordinates = JSON.parse(localCoordinates);
        fetchUserweatherInfo(coordinates);
    }
}

async function fetchUserweatherInfo(coordinates){
    const{lat, lon} = coordinates;
    //make useraccess container invisible
    grantAccess.classList.remove('active');
    //make loader visible
    loadingScreen.classList.add('active');

    // api call
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_key}&units=metric`);
        const data = await response.json(); 

        loadingScreen.classList.remove('active');
        notFound.classList.remove('active');
        showWeather.classList.add('active');
        renderWeatherInfo(data);
    }
    catch(err){
        loadingScreen.classList.remove('active');
        alert(err);
    }
}

function renderWeatherInfo(weatherInfo){
    //firstly, we have to fetch all the elements
    const cityName = document.querySelector('[data-cityName]');
    const countryIcon = document.querySelector('[data-countryIcon]');
    const desc = document.querySelector('[data-weatherDescription]');
    const weatherIcon = document.querySelector('[data-weatherIcon]');
    const temp = document.querySelector('[data-temp]');
    const windspeed = document.querySelector('[data-windSpeed]');
    const humidity = document.querySelector('[data-humidity]');
    const cloudiness = document.querySelector('[data-clouds]');

    //fetch the values and display in UI
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed}m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}   

// Function to retrieve the user's location using the browser's geolocation API
function getUserLocation(){
    // Check if geolocation is supported by the browser
    if (navigator.geolocation){
        // If supported, call the function showPosition to handle the location data
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        //alert for no geolocation
        alert('No support for geolocation!');
    }
}

function showPosition(position){
    // Extract latitude and longitude from the position object
    const userCoordinates ={
        lat:position.coords.latitude,
        lon:position.coords.longitude,
    }

    //store the coordinates in session storage
    sessionStorage.setItem('user-coordinates', JSON.stringify(userCoordinates));
    // Call a function to fetch weather information using the user's coordinates
    fetchUserweatherInfo(userCoordinates);
}

// When the userTab is clicked, switch to the user tab
userTab.addEventListener('click', () => {
    switchTab(userTab);
});

// When the searchTab is clicked, switch to the search tab
searchTab.addEventListener('click', () => {
    switchTab(searchTab);
});

// When the grantAccessBtn is clicked, request and get the user's location
grantAccessBtn.addEventListener('click', getUserLocation);

// Getting the search input element and adding a submit event listener
const searchInput = document.querySelector('[data-searchInput]');
searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    let cityName = searchInput.value;

    // Check if the cityName is empty; if not, fetch city information
    if (cityName ==='')
        return;
    else{
        fetchsearchCityInfo(cityName);
    }
});

// Selecting the .notFound element
const notFound = document.querySelector('.notFound');

// Asynchronously fetch city weather information
async function fetchsearchCityInfo(city){
    // Show loading screen and hide other elements
    loadingScreen.classList.add('active');
    showWeather.classList.remove('active');
    grantAccess.classList.remove('active');

    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}&units=metric`);

        if (response.status === 404){
            console.log('City Not Found!');
            loadingScreen.classList.remove('active');
            notFound.classList.add('active');
        }else if(!response.ok){
            console.error('Error: ', response.status);
        }
        else{
            // Hide loading screen and notFound, show weather information
            const data = await response.json();
            loadingScreen.classList.remove('active');
            notFound.classList.remove('active');
            showWeather.classList.add('active');
            renderWeatherInfo(data); // Render the weather information
        }
    }
    catch(error){
        console.log('Error: ', error);
    }
}
/* eslint-disable max-len */

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
  }
  
  function injectHTML(list) {
    console.log("fired injectHTML");
    const target = document.querySelector("#restaurant_list");
    target.innerHTML = "";
    list.forEach((item) => {
      const str = `<li>${item.name}</li>`;
      target.innerHTML += str;
    });
  }
  
  function filterList(list, query) {
    return list.filter((item) => {
      const lowerCaseName = item.name.toLowerCase();
      const lowerCaseQuery = query.toLowerCase();
      return lowerCaseName.includes(lowerCaseQuery);
    });
  }
  
  function processRestaurants(list) {
    console.log("fired restaurants list");
    const range = [...Array(15).keys()];
    return (newArray = range.map((item) => {
      const index = getRandomIntInclusive(0, list.length - 1);
      return list[index];
    }));
  
    /*
          ## Process Data Separately From Injecting It
            This function should accept your 1,000 records
            then select 15 random records
            and return an object containing only the restaurant's name, category, and geocoded location
            So we can inject them using the HTML injection function
      
            You can find the column names by carefully looking at your single returned record
            https://data.princegeorgescountymd.gov/Health/Food-Inspection/umjn-t2iz
      
          ## What to do in this function:
      
          - Create an array of 15 empty elements (there are a lot of fun ways to do this, and also very basic ways)
          - using a .map function on that range,
          - Make a list of 15 random restaurants from your list of 100 from your data request
          - Return only their name, category, and location
          - Return the new list of 15 restaurants so we can work on it separately in the HTML injector
        */
  }
  
  function initMap(){
      const carto = L.map('map').setView([38.98, -76.93], 13);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(carto);
  return carto;
  }
  
  function markerPlace(array, map){
      console.log('array for markers', array);
  
      map.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            layer.remove();
          }
        });
  
      array.forEach((item) => {
          console.log('markerPlace', item);
          const {coordinates} = item.geocoded_column_1;
  
          L.marker([coordinates[1], coordinates[0]]).addTo(map);
      })
  }
  
  async function mainEvent() {
    // the async keyword means we can make API requests
    const form = document.querySelector(".main_form"); // This class name needs to be set on your form before you can listen for an event on it
    const loadDataButton = document.querySelector("#data_load");
    const clearDataButton = document.querySelector("#data_clear");
    const generateListButton = document.querySelector("#generate");
    const textField = document.querySelector("#resto");
  
    const loadAnimation = document.querySelector("#data_load_animation");
    loadAnimation.style.display = "none";
    generateListButton.classList.add("hidden");
  
    const carto = initMap();
  
    const storedData = localStorage.getItem("storedData");
    let parsedData = JSON.parse(storedData);
    if (parsedData?.length > 0) {
      generateListButton.classList.remove("hidden");
    }
  
    let currentList = [];
  
    loadDataButton.addEventListener("click", async (submitEvent) => {
      // async has to be declared on every function that needs to "await" something
      console.log("Loading Data"); // this is substituting for a "breakpoint"
      loadAnimation.style.display = "inline-block";
  
      const results = await fetch(
        "https://data.princegeorgescountymd.gov/resource/umjn-t2iz.json"
      );
  
      const storedList = await results.json();
      localStorage.setItem("storedData", JSON.stringify(storedList));
      parsedData = storedList
      
      if(parsedData?.length > 0){
          generateListButton.classList.remove("hidden");
      }
      loadAnimation.style.display = "none";
      // console.table(storedList);
    });
  
    generateListButton.addEventListener("click", (event) => {
      console.log("generate new list");
      currentList = processRestaurants(parsedData);
      console.log(currentList);
      injectHTML(currentList);
      markerPlace(currentList, carto);
    });
  
    textField.addEventListener("input", (event) => {
      console.log("input", event.target.value);
      const newList = filterList(currentList, event.target.value);
      console.log(newList);
      injectHTML(newList);
      markerPlace(newList, carto);
    });
  
    clearDataButton.addEventListener("click", (event) => {
      console.log('clear browser data');
      localStorage.clear();
      console.log('localStorage Check', localStorage.getItem("storedData"))
    })
  }
  
  document.addEventListener("DOMContentLoaded", async () => mainEvent()); // the async keyword means we can make API requests
  
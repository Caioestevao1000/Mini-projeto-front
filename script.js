const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("pilot-search");
const inputError = document.getElementById("input-error");

async function searchFunction(inputValue){

    const response = await fetch("https://api.openf1.org/v1/drivers?&session_key=latest");

    const pilots = await response.json();

    const pilot = pilots.find(p => p.full_name.toLowerCase().includes(inputValue.toLowerCase()));

    console.log(pilot);
}

searchButton.addEventListener("click", function(){
    const inputValue = searchInput.value;

    if (inputValue.length < 3){
        inputError.textContent = "Digite pelo menos 3 caracteres";
        return;
    }
    
    inputError.textContent = "Buscando..";

    searchFunction(inputValue);
})



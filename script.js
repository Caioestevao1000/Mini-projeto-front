const searchButton = document.getElementById("search-button")
const searchInput = document.getElementById("pilot-search")
const inputError = document.getElementById("input-error")


searchButton.addEventListener("click", function(){
    const inputValue = searchInput.value;

    if (inputValue.length < 3){
        inputError.textContent = "Digite pelo menos 3 caracteres";
        return;
    }
    
    inputError.textContent = "Buscando..";

    async function searchFunction(){

        const response = await fetch("https://api.openf1.org/v1/drivers?driver_number=1&session_key=latest");

        const data = await response.json();

    }
})



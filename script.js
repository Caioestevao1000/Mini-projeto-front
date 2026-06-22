const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("pilot-search");
const inputError = document.getElementById("input-error");
const pilotDialog = document.getElementById("pilot-dialog")
const pilotContent = document.getElementById("pilot-status")

//API search -> returns all pilots once
async function searchFunction(inputValue){

    const response = await fetch("https://api.openf1.org/v1/drivers?&session_key=latest");

    const pilots = await response.json();

    const pilot = pilots.find(p => p.full_name.toLowerCase().includes(inputValue.toLowerCase()));

    return pilot;
}

//click event -> validation -> dialog opening
searchButton.addEventListener("click", async function(){
    const inputValue = searchInput.value;

    if (inputValue.length < 3){
        inputError.textContent = "Digite pelo menos 3 caracteres";
        return;
    }

    inputError.textContent = "Buscando..";
    const pilotData = await searchFunction(inputValue);

    if (!pilotData) {
        inputError.textContent = "Piloto não encontrado";
        return;
    }

    console.log(pilotData);

    renderDialog(pilotData);

    openDialog();
})
//rendering dialog in HTML
function renderDialog(pilotData){
    pilotContent.innerHTML = `
    <img src="${pilotData.headshot_url}" alt="${pilotData.full_name}"/>
    <h2>${pilotData.full_name}</h2>
    <p>${pilotData.team_name}</p>
    <button onclick="closeDialog()">Fechar</button>
    `;
}

// function to open the dialog
function openDialog(){
    pilotDialog.showModal();
}

// function to close the dialog
function closeDialog(){
    pilotDialog.close();
}



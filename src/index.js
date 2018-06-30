import Dropdown from './ui-dropdown.js'
import httpService from "./http.service";

let http = new httpService();

http.get('./data.json')

  .then((users)=>{

  let dropdowns = document.getElementsByClassName('ui-dropdown');
  for(let i = 0; i < dropdowns.length; i++){
    let item = new Dropdown(dropdowns[i], users);
  }

  })
  .catch(()=>{

    let dropdowns = document.getElementsByClassName('ui-dropdown');
    for(let i = 0; i < dropdowns.length; i++){
      let item = new Dropdown(dropdowns[i], [{"name": "Произошла ошибка. Попробуйте позже.", "disabled": true}]);
    }

  })


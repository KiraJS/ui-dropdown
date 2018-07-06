import Dropdown from './ui-dropdown.js'
import httpService from "./http.service";

(function() {

  let http = new httpService();

  let dropdowns = document.querySelectorAll('[ui-dropdown]');
  if(!dropdowns) return;

  http.get('http://10.0.1.8:8081/users')

    .then((users)=>{
      if(!users.length) throw new Error('Ошибка загрузки данных');

      for(let i = 0; i < dropdowns.length; i++){
        let element = dropdowns[i];
        new Dropdown(element, users);
      }

      })

    .catch((e)=>{
      console.log(e)

      for(let i = 0; i < dropdowns.length; i++){
        new Dropdown(dropdowns[i], [{"first_name": "Произошла ошибка.", "last_name": "Попробуйте позже.", "disabled": true}]);
      }

    })

})();
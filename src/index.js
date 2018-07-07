import Dropdown from './ui-dropdown.js'
import httpService from "./http.service";

(function() {

  let http = new httpService();

  let dropdowns = document.querySelectorAll('[ui-dropdown]');
  if(!dropdowns) return;

  http.get('http://localhost:3000/users')

    .then((users)=>{
      if(!users.length) throw new Error();

      for(let i = 1; i < dropdowns.length; i++){
        let element = dropdowns[i];
        new Dropdown(element, users);
      }
      // Для демонстрации обработки ошибки
        new Dropdown(dropdowns[0], null, "Ошибка загрузки данных")

      })

    .catch((e)=>{
      console.log(e);

      for(let i = 0; i < dropdowns.length; i++){
        new Dropdown(dropdowns[i], null, "Ошибка загрузки данных");
      }

    })

})();
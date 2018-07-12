import Dropdown from './ui-dropdown.js';

const users = JSON.stringify([
  {
    "id": 6492,
    "first_name": "Андрей",
    "last_name": "Рогозов",
    "domain": "andrew",
    "photo_50": "https://pp.userapi.com/c837536/v837536492/2f070/HT6-ucTq-cQ.jpg?ava=1"
  },
  {
    "id": 1,
    "first_name": "Павел",
    "last_name": "Дуров",
    "domain": "durov",
    "photo_50": "https://pp.userapi.com/c836333/v836333001/31191/qC6rVW5YSD8.jpg?ava=1"
  },
  {
    "id": 302531686,
    "first_name": "Алёна",
    "last_name": "Хроменкова",
    "domain": "thecirrus",
    "photo_50": "https://pp.userapi.com/c824602/v824602215/15b40f/HlEi35OGct8.jpg?ava=1"
  },
  {
    "id": 79153907,
    "first_name": "Александр",
    "last_name": "Колобов",
    "domain": "iamaleko",
    "photo_50": "https://pp.userapi.com/c830209/v830209217/ec260/B4VZ7vFxF-A.jpg?ava=1"
  },
  {
    "id": 529834,
    "first_name": "Женя",
    "last_name": "Найдёнышев",
    "domain": "imgood",
    "photo_50": "https://pp.userapi.com/c845120/v845120123/7b9a6/afdoS2swnOM.jpg?ava=1"
  },
  {
    "id": 319289,
    "first_name": "Павел",
    "last_name": "Федоров",
    "domain": "abbsol",
    "photo_50": "https://pp.userapi.com/c831308/v831308404/e92af/EuorguiP1jw.jpg?ava=1"
  },
  {
    "id": 7337161,
    "first_name": "Александр",
    "last_name": "Щепилов",
    "domain": "alx",
    "photo_50": "https://pp.userapi.com/c637230/v637230183/791c2/5Awt2DEjVK0.jpg?ava=1"
  },
  {
    "id": 53448,
    "first_name": "Андрей",
    "last_name": "Новосельский",
    "domain": "andrewnovoselsky",
    "photo_50": "https://pp.userapi.com/c836220/v836220448/3c509/RoI_4QjA1xo.jpg?ava=1"
  },
  {
    "id": 5944,
    "first_name": "Андрей",
    "last_name": "Законов",
    "domain": "andrewz",
    "photo_50": "https://pp.userapi.com/c616127/v616127944/122dc/gjntDfK_USg.jpg?ava=1"
  },
  {
    "id": 623275,
    "first_name": "Александр",
    "last_name": "Круглов",
    "domain": "avk",
    "photo_50": "https://pp.userapi.com/c638621/v638621275/2f613/1xawEowmD4g.jpg?ava=1"
  },
  {
    "id": 1324639,
    "first_name": "Константин",
    "last_name": "Сидорков",
    "domain": "sidorkov",
    "photo_50": "https://pp.userapi.com/c840633/v840633180/78a81/FI7hEzBCNUk.jpg?ava=1"
  },
  {
    "id": 2314852,
    "first_name": "Ирина",
    "last_name": "Денежкина",
    "domain": "apiwoman",
    "photo_50": "https://pp.userapi.com/c836333/v836333553/5b138/2eWBOuj5A4g.jpg?ava=1"
  },
  {
    "id": 2050,
    "first_name": "Катя",
    "last_name": "Лебедева",
    "domain": "me",
    "photo_50": "https://pp.userapi.com/c841237/v841237273/7b3ec/E3PMHRcn7c0.jpg?ava=1"
  },
  {
    "id": 382170,
    "first_name": "Даша",
    "last_name": "Рузанова",
    "domain": "fire",
    "photo_50": "https://pp.userapi.com/c623900/v623900483/67538/a1yqTeGDSyA.jpg?ava=1"
  },
  {
    "id": 2985476,
    "first_name": "Александр",
    "last_name": "Грановский",
    "domain": "alex_gran",
    "photo_50": "https://pp.userapi.com/c617218/v617218476/1d32a/4q3QUasNnl0.jpg?ava=1"
  },
  {
    "id": 1122996,
    "first_name": "Илья",
    "last_name": "Таратухин",
    "domain": "darkilfa",
    "photo_50": "https://pp.userapi.com/c834103/v834103540/c9fd5/erpoAe_6io4.jpg?ava=1"
  },
  {
    "id": 2775899,
    "first_name": "Георгий",
    "last_name": "Белоусов",
    "domain": "gb",
    "photo_50": "https://pp.userapi.com/c840326/v840326067/5239f/OPwfKC6tLt8.jpg?ava=1"
  },
  {
    "id": 9637095,
    "first_name": "Александр",
    "last_name": "Проскурин",
    "domain": "pr",
    "photo_50": "https://pp.userapi.com/c837623/v837623095/2c17e/IitepYbZVQM.jpg?ava=1"
  }
]);

(function() {

  let dropdowns = document.querySelectorAll('[ui-dropdown]');
  if(!dropdowns) return;

  for(let i = 0; i < dropdowns.length; i++){
    let element = dropdowns[i];
    new Dropdown(element, users,  "Ошибка загрузки данных");
  }

})();

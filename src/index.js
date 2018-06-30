let users = [
  {
    "id": "0",
    "name": "Андрей Рогозов",
    "domain": "andrew",
    "photo": "https://pp.userapi.com/c837536/v837536492/2f070/HT6-ucTq-cQ.jpg?ava=1"
  },
  {
    "id": "1",
    "name": "Павел Дуров",
    "domain": "durov",
    "photo": "https://pp.userapi.com/c836333/v836333001/31191/qC6rVW5YSD8.jpg?ava=1"
  },
  {
    "id": "2",
    "name": "Алёна Хроменкова",
    "domain": "thecirrus",
    "photo": "https://pp.userapi.com/c824602/v824602215/15b40f/HlEi35OGct8.jpg?ava=1"
  },
  {
    "id": "3",
    "name": "Александр Колобов",
    "domain": "iamaleko",
    "photo": "https://pp.userapi.com/c830209/v830209217/ec260/B4VZ7vFxF-A.jpg?ava=1"
  },
  {
    "id": "4",
    "name": "Женя Найдёнышев",
    "domain": "imgood",
    "photo": "https://pp.userapi.com/c845120/v845120123/7b9a6/afdoS2swnOM.jpg?ava=1"
  },
  {
    "id": "5",
    "name": "Павел Федоров",
    "domain": "abbsol",
    "photo": "https://pp.userapi.com/c831308/v831308404/e92af/EuorguiP1jw.jpg?ava=1"
  },
  {
    "id": "6",
    "name": "Александр Щепилов",
    "domain": "alx",
    "photo": "https://pp.userapi.com/c637230/v637230183/791c2/5Awt2DEjVK0.jpg?ava=1"
  },
  {
    "id": "7",
    "name": "Андрей Новосельский",
    "domain": "andrewnovoselsky",
    "photo": "https://pp.userapi.com/c836220/v836220448/3c509/RoI_4QjA1xo.jpg?ava=1"
  },
  {
    "id": "8",
    "name": "Андрей Законов",
    "domain": "andrewz",
    "photo": "https://pp.userapi.com/c616127/v616127944/122dc/gjntDfK_USg.jpg?ava=1"
  },
  {
    "id": "9",
    "name": "Александр Круглов",
    "domain": "avk",
    "photo": "https://pp.userapi.com/c638621/v638621275/2f613/1xawEowmD4g.jpg?ava=1"
  },
  {
    "id": "10",
    "name": "Константин Сидорков",
    "domain": "sidorkov",
    "photo": "https://pp.userapi.com/c840633/v840633180/78a81/FI7hEzBCNUk.jpg?ava=1"
  },
  {
    "id": "11",
    "name": "Ирина Денежкина",
    "domain": "apiwoman",
    "photo": "https://pp.userapi.com/c836333/v836333553/5b138/2eWBOuj5A4g.jpg?ava=1"
  },
  {
    "id": "12",
    "name": "Катя Лебедева",
    "domain": "me",
    "photo": "https://pp.userapi.com/c841237/v841237273/7b3ec/E3PMHRcn7c0.jpg?ava=1"
  },
  {
    "id": "13",
    "name": "Даша Рузанова",
    "domain": "fire",
    "photo": "https://pp.userapi.com/c623900/v623900483/67538/a1yqTeGDSyA.jpg?ava=1"
  },
  {
    "id": "14",
    "name": "Александр Грановский",
    "domain": "alex_gran",
    "photo": "https://pp.userapi.com/c617218/v617218476/1d32a/4q3QUasNnl0.jpg?ava=1"
  },
  {
    "id": "15",
    "name": "Илья Таратухин",
    "domain": "darkilfa",
    "photo": "https://pp.userapi.com/c834103/v834103540/c9fd5/erpoAe_6io4.jpg?ava=1"
  },
  {
    "id": "16",
    "name": "Георгий Белоусов",
    "domain": "gb",
    "photo": "https://pp.userapi.com/c840326/v840326067/5239f/OPwfKC6tLt8.jpg?ava=1"
  },
  {
    "id": "17",
    "name": "Александр Проскурин",
    "domain": "pr",
    "photo": "https://pp.userapi.com/c837623/v837623095/2c17e/IitepYbZVQM.jpg?ava=1"
  }
];

import Dropdown from './ui-dropdown.js'

let dropdowns = document.getElementsByClassName('ui-dropdown');
for(let i = 0; i < dropdowns.length; i++){
  let item = new Dropdown(dropdowns[i], users);
}

import correctEntryService from './correctEntry.service.js';

let correctEntry = new correctEntryService();

export default class Dropdown {

  constructor(element, users) {

    this.element = element;
    this.multiselect = element.getAttribute('ui-multiselect') !== null;
    this.photo = element.getAttribute('ui-photo') !== null;
    this.serversearch = element.getAttribute('ui-serversearch') !== null;
    this.users = JSON.parse(users);
    this.render();
    this.setlisteners();
  }

  filterUsers(data, query){

    function filter(elem1, elem2, str){
      return elem1.toLowerCase().indexOf(str.toLowerCase()) === 0
        || elem2.toLowerCase().indexOf(str.toLowerCase()) === 0;
    }
    let current = query;
    let newList = data.filter((item) => {
      let elem = item.name.split(' ');
      return filter(elem[0], elem[1], current);
    });
    if(newList.length){
      return newList;
    }

    current = correctEntry.ru(query);
    newList = data.filter((item) => {
      let elem = item.name.split(' ');
      return filter(elem[0], elem[1], current);
    });
    if(newList.length){
      return newList;
    }

    current = correctEntry.translate(query);
    newList = data.filter((item) => {
      let elem = item.name.split(' ');
      return filter(elem[0], elem[1], current);
    });
    if(newList.length){
      return newList;
    }

    current = correctEntry.translate(correctEntry.en(query));
    newList = data.filter((item) => {
      let elem = item.name.split(' ');
      return filter(elem[0], elem[1], current);
    });
    if(newList.length){
      return newList;
    }

    return [{"name": "Ничего не найдено", "disabled": true}]

  }

  createUsersList(data){

    let ul = document.createElement('ul');
    ul.setAttribute('id', 'users-list');
    data.forEach((user) => {
      let li = document.createElement('li');
      if(user.disabled) li.setAttribute('disabled', 'true')
      ul.appendChild(li);
      if (this.photo && user.photo) {
        let img = document.createElement('img');
        img.setAttribute('src', user.photo );
        li.appendChild(img);
      }
      let text =  document.createElement('span');
      text.textContent = user.name;
      li.appendChild(text);
    });

    return ul;

  }

  updateUsersList(data){

    let newUsersList = this.createUsersList(data);
    newUsersList.setAttribute('id', 'users-list');
    let usersList = this.element.querySelector('#users-list');
    this.element.replaceChild(newUsersList, usersList);

  }

  setlisteners(){

    let input = this.element.getElementsByTagName('input')[0];
    input.addEventListener('input', (event)=>{
      this.updateUsersList(this.filterUsers(this.users, event.target.value))
    })

  }

  render(){

    let fragment = document.createDocumentFragment();
    let input = document.createElement('input');
    let selection = document.createElement('div');
    let list = this.createUsersList(this.users);
    fragment.appendChild(selection);
    fragment.appendChild(input);
    fragment.appendChild(list);
    this.element.appendChild(fragment);

  }

}
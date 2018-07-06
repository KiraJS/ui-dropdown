import correctEntryService from './correctEntry.service.js';

const correctEntry = new correctEntryService();

export default class Dropdown {

  constructor(element, users) {
    this.usersCollection = JSON.parse(users);
    this.dropdownBlock = element;
    this.isMultiselect = element.getAttribute('multiselect') !== null;
    this.isNeedPhoto = element.getAttribute('photo') !== null;
    this.isServerSearch = element.getAttribute('serversearch') !== null;
    this.placeholder = element.getAttribute('placeholder') || "Введите имя друга";
    this.buttonText = element.getAttribute('button-text') || "Добавить";
    this.render();
    this.selectionBlock = this.dropdownBlock.querySelector('#dpd-selection');
    this.usersListBlock = this.dropdownBlock.querySelector('#dpd-users');
    this.usersList = this.dropdownBlock.querySelector('#dpd-users-list');
    this.input = this.dropdownBlock.querySelector('#dpd-input');
    this.addButton = this.dropdownBlock.querySelector('#dpd-add-button');
    this.selectedUsersCollection = [];
    this.setListeners();

  }

  filterUsers(data, query){

    function _filter(elem1, elem2, str){
      return elem1.toLowerCase().indexOf(str.toLowerCase()) === 0
        || elem2.toLowerCase().indexOf(str.toLowerCase()) === 0;
    }

    let current = query;
    let newList = data.filter((item) => {
      return _filter(item.first_name, item.last_name, current);
    });
    if(newList.length){
      return newList;
    }

    current = correctEntry.ru(query);
    newList = data.filter((item) => {
      return _filter(item.first_name, item.last_name, current);
    });
    if(newList.length){
      return newList;
    }

    current = correctEntry.translate(query);
    newList = data.filter((item) => {
      return _filter(item.first_name, item.last_name, current);
    });
    if(newList.length){
      return newList;
    }

    current = correctEntry.translate(correctEntry.en(query));
    newList = data.filter((item) => {
      return _filter(item.first_name, item.last_name, current);
    });

    if(newList.length){
      return newList;
    }

    return [{first_name: "Пользователь", last_name: "не найден", "disabled": true}];

  }

  createUsersList(data){

    const ul = document.createElement('ul');
    ul.setAttribute('id', 'dpd-users-list');
    ul.className = 'dpd__users-list';
    data.forEach((user) => {
      ul.appendChild(this.createUserListItem(user));
    });

    return ul;

  }

  updateUsersList(data){

    const newUsersList = this.createUsersList(data);
    newUsersList.setAttribute('id', 'dpd-users-list');
    newUsersList.className = 'dpd__users-list';
    this.usersListBlock.replaceChild(newUsersList, this.usersList);
    this.usersList = newUsersList;

  }

  createUserListItem(user){

    const li = document.createElement('li');
    if(user.disabled) li.setAttribute('disabled', 'true');
    li.setAttribute('user-id', user.id);
    if (this.isNeedPhoto && user.photo_50) {
      const img = document.createElement('img');
      img.setAttribute('src', user.photo_50 );
      li.appendChild(img);
    }
    const text = document.createElement('span');//можно убрать
    text.textContent = `${user.first_name} ${user.last_name}`;
    li.appendChild(text);
    return li;

  }

  deleteUser(id, element){

    this.selectionBlock.removeChild(element.parentElement);
    let user;
    for(let i = 0; i < this.selectedUsersCollection.length; i++){
      if(this.selectedUsersCollection[i].id === id){
        user = this.selectedUsersCollection[i];
        this.selectedUsersCollection.splice(i, 1);
        break;
      }
    }
    if(!this.selectedUsersCollection.length) {
      this.input.classList.remove('dpd__input--disabled');
      this.addButton.classList.remove('dpd__add-button--show');
      this.input.focus();
    }
    this.usersCollection.push(user);
    this.updateUsersList(this.usersCollection);
  }

  selectUser(id){

    let indexOfUser = 0;
    for(let i = 0; i < this.usersCollection.length; i++){
      if(this.usersCollection[i].id === id){
        indexOfUser = i;
        break;
      }
    }
    if(!this.isMultiselect){
      if(this.selectedUsersCollection.length) this.usersCollection.push(this.usersCollection[indexOfUser])
      this.selectedUsersCollection[0] = this.usersCollection.splice(indexOfUser, 1)[0];
      this.input.classList.add('dpd__input--disabled');

    } else {
        this.selectedUsersCollection.push(this.usersCollection.splice(indexOfUser, 1)[0]);
        this.addButton.classList.add('dpd__add-button--show');
        this.input.classList.add('dpd__input--disabled');
    }
    this.updateUsersList(this.usersCollection);
    this.createSelection();
    this.input.value = '';
  }

  createSelection(){

    this.selectionBlock.innerHTML = '';
    const fragment = document.createDocumentFragment();
    for(let i = 0; i < this.selectedUsersCollection.length; i++){
      fragment.appendChild(this.createSelectionButton(this.selectedUsersCollection[i]));
    }
    fragment.appendChild(this.input);
    fragment.appendChild(this.addButton);
    this.selectionBlock.appendChild(fragment);

  }

  createSelectionButton(user){

    const label = document.createElement('span');
    const deleteBtn = document.createElement('button');
    label.innerText = `${user.first_name} ${user.last_name}`;
    deleteBtn.setAttribute('user-id', user.id);
    label.className = 'dpd__user-label';
    deleteBtn.className = 'dpd__user-button';
    label.appendChild(deleteBtn)
    return label;
  }

  setListeners(){

    document.addEventListener('click', (event)=>{
      let clickOutside = true;
      event.path.forEach((item)=>{///Кроссбраузерность?
        if(item === this.dropdownBlock){
          clickOutside = false;
        }
      })
      if(clickOutside) this.usersList.classList.remove('dpd__users-list--show');
    })

    this.input.addEventListener('input', (event)=>{
      this.updateUsersList(this.filterUsers(this.usersCollection, event.target.value));
      this.usersList.classList.add('dpd__users-list--show');
    });

    this.usersListBlock.addEventListener('click', (event)=>{
      let target = event.target.tagName === 'LI' ? event.target : event.target.parentElement;//тонкое место
      let userId = Number(target.getAttribute('user-id'));
      this.selectUser(userId, target);
    });

    this.selectionBlock.addEventListener('click', (event)=>{
      const target = event.target;
      if( target.tagName !== "BUTTON" && target.tagName !== "SPAN" ) {
        this.usersList.classList.toggle('dpd__users-list--show');
        this.addButton.classList.remove('dpd__add-button--show');
        if(this.isMultiselect){
          this.input.classList.remove('dpd__input--disabled');
          this.input.focus();
        }
      }
      if( target.tagName === "BUTTON" && target.classList.contains('dpd__add-button') ){
        this.addButton.classList.remove('dpd__add-button--show');
        this.input.classList.remove('dpd__input--disabled');
        this.input.focus();
      }
      if(target.tagName === "BUTTON" && !target.classList.contains('dpd__add-button') ){
        let userId = Number(target.getAttribute('user-id'));
        this.deleteUser(userId, target);
      }
    });
  }

  render(){

    const fragment = document.createDocumentFragment();
    const selection = document.createElement('div');
    const users = document.createElement('div');
    const addButton = document.createElement('button');
    const input = document.createElement('input');
    const list = this.createUsersList(this.usersCollection);
    selection.setAttribute('id', 'dpd-selection');
    selection.className = 'dpd__selection';
    users.setAttribute('id', 'dpd-users');
    users.className = 'dpd__users';
    addButton.setAttribute('id', 'dpd-add-button');
    addButton.className = 'dpd__add-button';
    addButton.innerText = this.buttonText;
    input.setAttribute('id', 'dpd-input');
    input.className = 'dpd__input';
    input.setAttribute('placeholder', this.placeholder);
    selection.appendChild(addButton);
    selection.appendChild(input);
    users.appendChild(list);
    fragment.appendChild(selection);
    fragment.appendChild(users);
    this.dropdownBlock.appendChild(fragment);

    if(input === document.getElementsByTagName('input')[0]){
      input.focus();
    }

  }

}
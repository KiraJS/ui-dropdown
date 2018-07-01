import correctEntryService from './correctEntry.service.js';

let correctEntry = new correctEntryService();

export default class Dropdown {

  constructor(element, users) {

    this.dropdownBlock = element;
    this.isMultiselect = element.getAttribute('ui-multiselect') !== null;
    this.isNeedPhoto = element.getAttribute('ui-photo') !== null;
    //this.isServerSearch = element.getAttribute('ui-serversearch') !== null;
    this.usersCollection = JSON.parse(users);
    this.selectedUsersCollection = [];
    this.render();
    this.selectionBlock = this.dropdownBlock.querySelector('#ui-selection');
    this.usersListBlock = this.dropdownBlock.querySelector('#ui-users');
    this.usersList = this.dropdownBlock.querySelector('#ui-users-list');
    this.inputButton = this.dropdownBlock.querySelector('#ui-input');
    this.setListeners();

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

    return [{"name": "Ничего не найдено", "disabled": true}];

  }

  createUsersList(data){

    let ul = document.createElement('ul');
    ul.setAttribute('id', 'ui-users-list');
    data.forEach((user) => {
      ul.appendChild(this.createUserListItem(user));
    });

    return ul;

  }

  updateUsersList(data){

    let newUsersList = this.createUsersList(data);
    newUsersList.setAttribute('id', 'ui-users-list');
    this.usersListBlock.replaceChild(newUsersList, this.usersList);
    this.usersList = newUsersList;

  }

  createUserListItem(user){

    let li = document.createElement('li');
    if(user.disabled) li.setAttribute('disabled', 'true');
    li.setAttribute('user-id', user.id);
    if (this.isNeedPhoto && user.photo) {
      let img = document.createElement('img');
      img.setAttribute('src', user.photo );
      li.appendChild(img);
    }
    let text =  document.createElement('span');
    text.textContent = user.name;
    li.appendChild(text);
    return li;

  }

  deleteUser(id, element){

    element.style.display = 'none';
    let user;
    for(let i = 0; i < this.selectedUsersCollection.length; i++){
      if(this.selectedUsersCollection[i].id === id){
        user = this.selectedUsersCollection[i];
        break;
      }
    }
    this.usersCollection.push(user);
    this.usersList.insertBefore(this.createUserListItem(user), this.usersList.firstChild);

  }

  selectUser(id, el){

    let user;
    let indexOfUser = 0;
    for(let i = 0; i < this.usersCollection.length; i++){
      if(this.usersCollection[i].id === id){
        user = this.usersCollection[i];
        indexOfUser = i;
        break;
      }
    }
    if(!this.isMultiselect){
       if(this.selectedUsersCollection.length) {
         let oldUser = this.selectedUsersCollection[0];
         this.usersCollection.push(oldUser);
         this.usersList.replaceChild(this.createUserListItem(oldUser), el);
         this.selectedUsersCollection[0] = user;
       } else {
         this.selectedUsersCollection.push(user);
         el.style.display='none';
       }
       this.selectedUsersCollection.push(this.usersCollection.splice(indexOfUser, 1)[0]);

    } else {
       this.selectedUsersCollection.push(this.usersCollection.splice(indexOfUser, 1)[0]);
       el.style.display = 'none';
    }
    this.showSelectedUsers(user);

  }

  createSelectionButton(user){

    let btn = document.createElement('button');
    btn.innerText = user.name;
    btn.setAttribute('user-id', user.id);
    return btn;
  }
  showSelectedUsers(user){
    this.selectionBlock.insertBefore(this.createSelectionButton(user), this.inputButton);

  }

  setListeners(){

    this.inputButton.addEventListener('input', (event)=>{
      this.updateUsersList(this.filterUsers(this.usersCollection, event.target.value));
    });

    this.usersListBlock.addEventListener('click', (event)=>{
      let target = event.target.tagName === 'LI' ? event.target : event.target.parentElement;
      let userId = target.getAttribute('user-id');
      this.selectUser(userId, target);
    });

    this.selectionBlock.addEventListener('click', (event)=>{
      let target = event.target;
      if( target.tagName === "BUTTON" ){
        let userId = target.getAttribute('user-id');
        this.deleteUser(userId, target);
      }
    });

  }

  render(){

    let fragment = document.createDocumentFragment();
    let selection = document.createElement('div');
    let users = document.createElement('div');
    selection.setAttribute('id', 'ui-selection');
    users.setAttribute('id', 'ui-users');
    let input = document.createElement('input');
    input.setAttribute('id', 'ui-input');
    let list = this.createUsersList(this.usersCollection);
    fragment.appendChild(selection);
    fragment.appendChild(users);
    selection.appendChild(input);
    users.appendChild(list);
    this.dropdownBlock.appendChild(fragment);

  }

}
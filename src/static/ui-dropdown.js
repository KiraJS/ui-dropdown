import convertService from './convert.service.js';

const convert = new convertService();

export default class Dropdown {

  constructor( element, users, error ) {
    if( !users ) {
      element.innerText = error;
      element.className = 'dpd--error';
      return;
    }
    this.usersCollection = JSON.parse( users );
    this.dropdownBlock = element;
    this.isMultiselect = element.getAttribute( 'multiselect' ) !== null;
    this.isNeedPhoto = element.getAttribute( 'photo' ) !== null;
    this.isServerSearch = element.getAttribute( 'serversearch' ) !== null;
    this.isArrowsActive = false;
    this.buttonText = element.getAttribute( 'button-text' ) || "Добавить";
    this.notFoundText = element.getAttribute( 'not-found-text' ) || "Пользователь не найден";
    this.usersListActiveItem = null;
    this.render();
    this.selectionBlock = this.dropdownBlock.querySelector( '#dpd-selection' );
    this.usersListBlock = this.dropdownBlock.querySelector( '#dpd-users' );
    this.usersList = this.dropdownBlock.querySelector( '#dpd-users-list' );
    this.input = this.dropdownBlock.querySelector( '#dpd-input' );
    this.addButton = this.dropdownBlock.querySelector( '#dpd-add-button' );
    this.selectedUsersCollection = [];
    this.setListeners();

  }

  filterUsers( data, query ) {

    let correctQuery = query;
    const stringifyData = JSON.stringify( data.map( (item ) => item.first_name.toLowerCase() + item.last_name.toLowerCase() ) );
    let filteredData;
    const queryesWithCorrection = {
      wrongEnToEn: convert.wrongEnToEn( query ),
      wrongRuToRu: convert.wrongRuToRu( query ),
      translitEnToRu: convert.translitEnToRu( query ),
      translitRuToEn: convert.translitRuToEn( query )
    };
    for ( let key in queryesWithCorrection ) {
      if ( stringifyData.indexOf(queryesWithCorrection[key]) !== -1 ) correctQuery = queryesWithCorrection[key];
    }
    filteredData = data.filter( ( item ) => {
      return item.first_name.toLowerCase().indexOf( correctQuery ) !== -1 || item.last_name.toLowerCase().indexOf( correctQuery ) !== -1;
    });

    if( filteredData.length ){
      this.updateUsersList( filteredData );
      return;
    }
    if( !filteredData.length && !this.isServerSearch ){
      this.updateUsersList( null );
      return;
    }
    if( !filteredData.length && this.isServerSearch ) {
      this.serachOnServer( query, this.selectedUsersCollection );
    }

  }

  serachOnServer( query, selectedUsers ){

    let self = this;
    const data = '&users=' + JSON.stringify( selectedUsers )
    const params = '?search=' + query;
    var xhr = new XMLHttpRequest();
    xhr.open( 'GET', '/users' + params + data );
    xhr.onload = function () {
      if ( this.status >= 200 && this.status < 300 ) {
        let answer = JSON.parse( xhr.response );
        if(answer.length) {
          self.updateUsersList( JSON.parse(xhr.response ) );
        } else{
          self.updateUsersList( null );
        }
      } else {
        self.updateUsersList( null );
      }
      self.showUsersList();
    };
    xhr.send();

  }

  createUsersList( data ){

    data.sort((a, b)=> a.id - b.id);
    const ul = document.createElement( 'ul' );
    ul.setAttribute( 'id', 'dpd-users-list' );
    ul.className = 'dpd__users-list';
    if( data ){
      data.forEach(( user ) => {
        ul.appendChild( this.createUsersListItem( `${user.first_name} ${user.last_name}`, user.id, user.photo_50 ) );
      });
      if(ul.children.length && !ul.children[0].getAttribute( 'disabled' )){
        const activeItem = ul.children[0];
        activeItem.classList.add( 'pd__users-list-item--active' );
        this.usersListActiveItem = activeItem;
      }
      return ul;
    }
    this.usersListActiveItem = null;
    ul.setAttribute( 'disabled', 'true' );
    this.usersListBlock.setAttribute( 'disabled', 'true' );
    ul.appendChild( this.createUsersListItem() );
    return ul;

  }

  updateUsersList( data ){

    data.sort((a, b)=> a.id - b.id);
    const newUsersList = this.createUsersList( data );
    newUsersList.setAttribute( 'id', 'dpd-users-list' );
    newUsersList.className = 'dpd__users-list';
    this.usersListBlock.replaceChild( newUsersList, this.usersList );
    this.usersList = newUsersList;

  }

  createUsersListItem( name, id, photo ){

    const li = document.createElement( 'li' );
    if( !name ){
      li.textContent = this.notFoundText;
      li.setAttribute( 'disabled', 'true' );
      return li;
    }
    if ( this.isNeedPhoto ) {
      const img = document.createElement( 'img' );
      img.setAttribute( 'src', photo );
      img.setAttribute( 'user-id', id );
      li.appendChild( img );
    }
    const span = document.createElement( 'span' );
    span.innerText = name;
    span.setAttribute( 'user-id', id );
    li.setAttribute( 'user-id', id );
    li.className = 'pd__users-list-item';
    li.appendChild( span );
    return li;

  }

  deleteUser( _id, element ){

    const id = Number( _id );
    if(!this.isMultiselect){
      this.selectionBlock.classList.add( 'dpd__selection--active' );
    }

    this.selectionBlock.firstElementChild.removeChild( element.parentElement );
    let user;
    for( let i = 0; i < this.selectedUsersCollection.length; i++ ){
      if( this.selectedUsersCollection[i].id === id ){
        user = this.selectedUsersCollection[i];
        this.selectedUsersCollection.splice( i, 1 );
        break;
      }
    }
    this.usersCollection.push( user );
    this.updateUsersList( this.usersCollection );
    this.hideUsersList();

  }

  selectUser( _id ){

    this.input.value = '';
    const id = Number( _id );
    let indexOfUser = 0;
    for( let i = 0; i < this.usersCollection.length; i++ ){
      if( this.usersCollection[i].id === id ){
        indexOfUser = i;
        break;
      }
    }
    let newSelectedUser = this.usersCollection.splice( indexOfUser, 1 )[0];
    if( !this.isMultiselect ){
      this.selectionBlock.classList.remove('dpd__selection--active');
      if( this.selectedUsersCollection.length ) {
        const oldUser =  this.selectionBlock.firstElementChild.firstElementChild;
        this.usersCollection.push( this.selectedUsersCollection[0] );
        this.selectionBlock.firstElementChild.replaceChild(this.createSelectionButton( newSelectedUser ), oldUser);
      }
      else{
        this.selectionBlock.firstElementChild.appendChild( this.createSelectionButton( newSelectedUser ) );

      }
      this.selectedUsersCollection[0] = newSelectedUser;

    } else {
        this.selectedUsersCollection.push( newSelectedUser );
        this.selectionBlock.firstElementChild.appendChild( this.createSelectionButton( newSelectedUser ) );

    }
    this.updateUsersList( this.usersCollection );

  }

  createSelectionButton( user ){

    const label = document.createElement( 'span' );
    const deleteBtn = document.createElement( 'button' );
    label.innerText = `${user.first_name} ${user.last_name}`;
    deleteBtn.setAttribute( 'user-id', user.id );
    label.className = 'dpd__user-label';
    deleteBtn.className = 'dpd__user-button';
    label.appendChild( deleteBtn );
    return label;
  }

  showUsersList(){

    this.usersList.classList.add( 'dpd__users-list--show' );
    if( !this.isMultiselect ){
      this.showInput();
      this.hideAddButton();
      return;
    }
    if( !this.isMultiselect && this.selectedUsersCollection.length ){
      this.hideAddButton();
      this.hideInput();
      return;
    }
    this.showInput();
    this.input.focus();
    this.hideAddButton();

  }

  hideUsersList(){

    this.usersList.classList.remove('dpd__users-list--show');
    if( !this.isMultiselect && !this.selectedUsersCollection.length ){
      this.showInput();
      this.hideAddButton();
      return;
    }
    if( !this.isMultiselect && this.selectedUsersCollection.length ){
      this.hideAddButton();
      this.hideInput();
      return;
    }
    if( this.isMultiselect && this.selectedUsersCollection.length ){
      this.showAddButton();
      this.hideInput();
      return;
    }
    if( this.isMultiselect && !this.selectedUsersCollection.length ){
      this.showInput();
      this.hideAddButton();
    }

  }

  showAddButton(){

    this.addButton.classList.add( 'dpd__add-button--show' );

  }

  showInput(){

    this.input.classList.remove( 'dpd__input--disabled' );

  }

  hideAddButton(){

    this.addButton.classList.remove( 'dpd__add-button--show' );

  }

  hideInput(){

    this.input.classList.add( 'dpd__input--disabled' );

  }

  switchActiveUsersListItem( next, direction ){

    if( next ){
      this.usersListActiveItem.classList.remove( 'pd__users-list-item--active' );
      next.classList.add( 'pd__users-list-item--active' );
      this.usersListActiveItem = next;

      if ( direction === 'down' && ( next.offsetTop + next.offsetHeight > this.usersList.offsetHeight ) ){
        this.usersList.scrollTop = next.offsetTop + next.offsetHeight - this.usersList.offsetHeight;
        return;
      }
      if ( direction === 'up' && ( this.usersList.offsetHeight + next.offsetTop < this.usersList.offsetHeight + this.usersList.scrollTop ) ){
        this.usersList.scrollTop = next.offsetTop;
      }
    }
  }

  onMouseOver( event ){

    const target = event.target.tagName === 'LI' ? event.target : event.target.parentElement;
    if( !this.isArrowsActive ){
      this.usersList.style.cursor = 'pointer';
      this.switchActiveUsersListItem( target );
    }
  };

  onMouseMove(){

    this.isArrowsActive = false;

  }

  onKeyDown( event ){

    const keycodes = {
      27: "Escape",
      13: "Enter",
      40: "ArrowDown",
      38: "ArrowUp"
    };
    if( !this.usersList.classList.contains( 'dpd__users-list--show' ) ) return;
    switch ( keycodes[event.keyCode] ){
      case ( 'Escape' ):
        this.input.blur();
        break;
      case ( 'Enter' ):
        if(this.usersListActiveItem){
          this.selectUser( this.usersListActiveItem.getAttribute( 'user-id' ) );
          this.input.blur();
        }
        break;
      case ( 'ArrowDown' ):
        event.preventDefault();
        this.usersList.style.cursor = 'none';
        if(this.usersListActiveItem){
          const next = this.usersListActiveItem.nextElementSibling;
          this.switchActiveUsersListItem( next, 'down' );
          this.isArrowsActive = true;
        }
        break;
      case ( 'ArrowUp' ):
        event.preventDefault();
        this.usersList.style.cursor = 'none';
        if(this.usersListActiveItem){
          const prev = this.usersListActiveItem.previousElementSibling;
          this.switchActiveUsersListItem( prev,  'up' );
          this.isArrowsActive = true;
        }
        break;
    }
  }

  onInput( event ){

    if( event.target.value ){
      this.filterUsers( this.usersCollection, event.target.value ) ;
      this.showUsersList();
    }

  }

  onFocus(event){

    if(event.target === this.input){
      this.showUsersList();
    }

  }

  onBlur(event){

    if(event.target === this.input){
      this.hideUsersList();
    }

  }

  onSelectionClick( event ){

    const target = event.target;
    if( target === event.currentTarget ) {
      if(this.isMultiselect) this.showInput()
      this.input.focus();
      return;
    }
    if( target.id === 'dpd-add-button' ){
      this.showUsersList();
      return;
    }
    if( target.tagName === "BUTTON"
      && target.id !== 'dpd-add-button' ){
      let userId = target.getAttribute( 'user-id' );
      this.deleteUser( userId, target );
    }
  }

  onUsersBlockClick( event ){

    let userId = event.target.getAttribute( 'user-id' );
    if(userId){
      this.selectUser( userId );
      this.hideUsersList();
    }
  }

  setListeners(){

    document.addEventListener( 'keydown', this.onKeyDown.bind(this) );
    this.usersListBlock.addEventListener( 'mouseover', this.onMouseOver.bind(this) );
    this.usersListBlock.addEventListener( 'mousedown', this.onUsersBlockClick.bind(this) );
    this.dropdownBlock.addEventListener( 'mousemove', this.onMouseMove.bind(this) );
    this.selectionBlock.addEventListener( 'click', this.onSelectionClick.bind(this) );
    this.input.addEventListener( 'input', this.onInput.bind(this) );
    this.input.addEventListener( 'focus', this.onFocus.bind(this) );
    this.input.addEventListener( 'blur', this.onBlur.bind(this) );

  }

  render(){

    const fragment = document.createDocumentFragment();
    const selection = document.createElement( 'div' );
    const selectionContainer = document.createElement( 'div' );
    const users = document.createElement( 'div' );
    const addButton = document.createElement( 'button' );
    const input = document.createElement( 'input' );
    const list = this.createUsersList( this.usersCollection );
    selection.setAttribute( 'id', 'dpd-selection' );
    selection.className = 'dpd__selection dpd__selection--active';
    users.setAttribute( 'id', 'dpd-users' );
    users.className = 'dpd__users';
    addButton.setAttribute( 'id', 'dpd-add-button' );
    addButton.className = 'dpd__add-button';
    addButton.innerText = this.buttonText;
    input.setAttribute( 'id', 'dpd-input' );
    input.setAttribute( 'autocomplete', "off" );
    input.className = 'dpd__input';
    input.type = 'text';
    input.placeholder = 'Enter name';
    selection.appendChild( selectionContainer );
    selection.appendChild( input );
    selection.appendChild( addButton );
    users.appendChild( list );
    fragment.appendChild( selection );
    fragment.appendChild( users );
    this.dropdownBlock.appendChild( fragment );

  }

}

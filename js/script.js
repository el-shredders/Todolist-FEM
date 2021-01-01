/******************************/
/***   GLOBAL VARIABLES     ***/
/******************************/

let todoArray = [];
let todoId = 0;
let currentFilter = 'all';
const LOCAL_TODOS = "local_todos";

const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const itemsLeft = document.getElementById("items-left");
const todoFilters = document.querySelectorAll("input[name='filter']");
const btnClear = document.getElementById('clear-completed');


const themeSwitch = document.getElementById('theme-toggle');
const themeLogos = document.querySelectorAll('.btn--theme img');


/******************************/
/***  EVENT LISTENERS       ***/
/******************************/

btnClear.addEventListener('click', () => {
   const toRemove = todoArray.filter((obj) => obj.active === false);

   if (toRemove.length > 0 &&  confirm(`You are about to remove ${toRemove.length} completed task. Are  you sure?`)) {
      toRemove.forEach((elem) => {
         removeElem(elem.DOMelem);
      });
   }
});

themeSwitch.addEventListener('click', themeSwitcher);

todoInput.addEventListener("keyup", (e) => {
   if (e.key === "Enter") {
      if (e.target.value !== "") {
// event listener adds a todo elem on key press
         addTodoElem(e.target.value);
         todoInput.value = "";
         //if filter is on, refresh the display of todo elems regarding the active filter
         refreshFilters();
      }
   }
});

todoFilters.forEach((filter) => {
   //event listener on radio button change that controls the filters
   filter.addEventListener('change', filterCallback);
});

/************************************/
/***  event listeners and other callbacks  ***/
/**********************************/

function themeSwitcher(e) {
   console.log(e.target);
   //change the logo to sun or moon
   themeLogos.forEach(logo => logo.classList.toggle("todo__elem--hide"));
   //add theme class to main container
   // document.body.classList.toggle("todo--darkMode");
   if (!document.body.dataset.theme) {
      document.body.dataset.theme = "darkTheme";
   } else {
      document.body.dataset.theme = "";
   }

}

function filterCallback(e) {
   //update the current Filter and calls fonction that takes care of filters
   currentFilter = e.target.value;
   refreshFilters();
   
}

 function refreshFilters() {
   if (currentFilter === 'completed') {
      completedCB();
  } else if (currentFilter === 'all') {
   allCB();
  } else { // if active
   activeCB();
  }
}


// check all items in array and chose to display add or remove class that displays the elems if it is active or not
function completedCB() {
   todoArray.forEach(function (arrayObj)  {
      if (!arrayObj.active && arrayObj.DOMelem.classList.contains("todo__elem--hide")) {
         arrayObj.DOMelem.classList.remove("todo__elem--hide");
      }
      else if (arrayObj.active && !arrayObj.DOMelem.classList.contains("todo__elem--hide")) {
         arrayObj.DOMelem.classList.add("todo__elem--hide");      
   }
});
}

// check all items in array and chose to display add or remove class that displays the elems if it is active or not
function allCB() {
   todoArray.forEach(function (arrayObj)  {
      if (arrayObj.DOMelem.classList.contains("todo__elem--hide")) {
         arrayObj.DOMelem.classList.remove("todo__elem--hide");
      }
   });

}

// check all items in array and chose to display add or remove class that displays the elems if it is active or not
function activeCB() {
   todoArray.forEach(function (arrayObj)  {
      if (arrayObj.active && arrayObj.DOMelem.classList.contains("todo__elem--hide")) {
         arrayObj.DOMelem.classList.remove("todo__elem--hide");
      }
      else if (arrayObj.active === false && !arrayObj.DOMelem.classList.contains("todo__elem--hide")) {
         arrayObj.DOMelem.classList.add("todo__elem--hide");
   
      }
   });
}

/******************************/
/***  FUNCTIONS             ***/
/******************************/

/**  MISCELLANEOUS  FUNCTIONS**/
/******************************/

function updateActiveCount() {
   // counts the number of active elements in global array and sets the counts
   let count = todoArray.reduce((count, todoObj) => {
      if (todoObj.active) count++;
      return count;
   }, 0);
   itemsLeft.innerText = count;
}

function updateCurrentId() {
   // need to make sure the current ID is up to date after deletion
   if (!todoArray.length) {
      todoId = 0;
   } else {
      todoId = todoArray[todoArray.length - 1].id + 1;
   }
}

/**  localSTorage functions **/
/******************************/

function getLocalStorage() {
   //update active count in case local is empty
  
   // if localstorage variable doesn t exists, create it
   if (localStorage.getItem(LOCAL_TODOS) === null) {
      localStorage.setItem(LOCAL_TODOS, JSON.stringify([]));
   } else if (JSON.parse(localStorage.getItem(LOCAL_TODOS)).length) {
      //else if storage exists and is not empty,  load the todos from localstorage and  add them to the DOM
      todoArray = JSON.parse(localStorage.getItem(LOCAL_TODOS));
      todoArray.forEach((todoElem) => {
         if (todoId < +todoElem.id) todoId = +todoElem.id;
         addTodoElem(todoElem.content, false);
      });
      todoId++;
   }
   // update the active element counts
   updateActiveCount();
}

function updateLocalStorage() {
   // replace the localstorage variable with an up-to-date one
   localStorage.setItem(LOCAL_TODOS, JSON.stringify(todoArray));
}

function removeFromStorage(id) {
   //remove element from global array by id
   todoArray = todoArray.filter((todoObj) => {
      return todoObj.id !== +id;
   });

   // update the localstorage with the changes

   updateLocalStorage();
}

/**  DOM EFFECT FUNCTIONS    **/
/******************************/


function changeActiveStatus(elem) {
 //  toggle the check class on elements and the set active variable in the element array to correct value
   elem.classList.toggle("todo__elem--checked");
   let isActive = true;


   if (elem.classList.contains("todo__elem--checked")) {
      isActive = false;
   }

   todoArray.forEach((arrayObj) => {
      if (arrayObj.id === +elem.id) arrayObj.active = isActive;
   });
   
   // reflect changes on the global variable in the localStorage and update active element count
   updateLocalStorage();
   updateActiveCount();
}

function removeElem(element) {
   removeElemfromDom(element);
   removeFromStorage(+element.id);
   // need to update current Id to make sure that the next element will be created with the next highest unique id
   updateCurrentId();
   updateActiveCount();
   //in case a filter is active, we update the display of elements accordingly
   refreshFilters();
}

function removeElemfromDom(elem) {
   // remove element from DOM 
   elem.remove();
}

function addTodoElem(todoText, isNew = true) {
   //create a todo element and fill the content/text / etc
   const todoEl = document.createElement("li");
   todoEl.classList.add("todo__elem");
   todoEl.id = "" + todoId;
   todoEl.innerHTML = `
   <button class=" btn todo__check">
      <img src="./img/icon-check.svg" alt="" class="" />
   </button>
   <p>${todoText}</p>
   <button class="btn todo__delete"><img src="./img/icon-cross.svg" alt=""/></button>
   `;

   // push to array of elements to keep track of them if it is new and refresh the localstorage with the new element
   // if the element is new, we store the todoEL DOM element in the element object before pushing, else, we update it

   if (isNew) {
      todoArray.push({
         active: true,
         content: todoText,
         DOMelem: todoEl,
         id: todoId++,
      });
      updateLocalStorage();
   } else {
      // check if element has status active or not and add the class todo__elem--checked and update the current todoEl
      todoArray.forEach((arrayObj) => {
         if (arrayObj.id === todoId  ) {
            arrayObj.DOMelem = todoEl;
            if (!arrayObj.active) {
               todoEl.classList.add("todo__elem--checked");
            }
         }
      });
   }

   //insert into the DOM
   todoList.appendChild(todoEl);

   // add an event listener to the delete button
   const todo_delete = todoEl.querySelector(".todo__delete");

   todo_delete.addEventListener("click", function()  {
      removeElem(todoEl);
   });

   // add an event listener to the check button

   const todo_check = todoEl.querySelector(".todo__check");

   todo_check.addEventListener("click", function ()  {
      // change the checked status of the element
      changeActiveStatus(todoEl);
      // refresh display of elements accordingly
       refreshFilters();
   });

   // update the items count
   updateActiveCount();
}

/***  START OF INSTRUCTIONS     ***/
/**********************************/

function init() {
   const starterList = [
      "Complete online JavaScript course",
      "Jog around the park 3x",
      "10 minutes meditation",
      "Read for 1 hour",
      "Pick up groceries",
      "Complete Todo App on Frontend Mentor",   
   ];

   if (localStorage.getItem("isFirstVisit") === null || localStorage.getItem("isFirstVisit") === false){
      localStorage.setItem("isFirstVisit", true);
      starterList.forEach((item) => {
         addTodoElem(item);
      });
      changeActiveStatus(todoArray[0].DOMelem);
   }
   else {
      getLocalStorage();
   }
}

init();

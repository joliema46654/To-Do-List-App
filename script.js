//this line makes sure the script runs after html content is done loading
document.addEventListener("DOMContentLoaded", () => {
  //create a variable to store the user input of the id name task-input
  const taskInput = document.getElementById("task-input");

  //grabs the add task button element from html by it's id and stores it so we can listen for clicks
  const addTaskBtn = document.getElementById("add-task-btn");

  //grabs the task-list element and stores it in a variable tasklist so we can add task to it
  const taskList = document.getElementById("task-list");

  //create variable to hold the empty state image
  const emptyImage = document.querySelector(".empty-image");
  //create a function to show or hide image based on whether task exist

  //use todo container in html to adjust width of task dynamically
  const todosContainer = document.querySelector(".todos-container");

  //store the progressbar and progress numbers in variable to use in script
  const progressBar = document.getElementById("progress");
  const progressNumbers = document.getElementById("numbers");

  const toggleEmptyState = () => {
    emptyImage.style.display =
      //if tasklist has 0 children(sub elements like for ul it's li), set the display to 'block' (visible empty state image), else 'none'(hidden)
      taskList.children.length === 0 ? "block" : "none";

    //this tells JS to access and change the elements CSS style, specifically width according to condition
    //expands the container width to 100% when task exist, or shrinks it to 50% when the list is empty
    todosContainer.style.width = taskList.children.length > 0 ? "100%" : "50%";
  };

  //create a updateProgress function that takes parameter checkCompletion set to true
  const updateProgress = (checkCompletion = true) => {
    //counts all the <li> task items currently inside task list
    const totalTasks = taskList.children.length;
    //count all checkboxes that are currently checked
    const completetedTasks =
      taskList.querySelectorAll(".checkbox:checked").length;

    //set the CSS width percentage if tasks exist, or resets it to 0% if empty
    progressBar.style.width = totalTasks
      ? `${(completetedTasks / totalTasks) * 100}% `
      : `0%`;

    //updates the text display to show the current "completed/total" task
    progressNumbers.textContent = `${completetedTasks} / ${totalTasks}`;

    //call the confetti function, if all task are completed and checkCompletion is true, confetti function will run
    if (checkCompletion && totalTasks > 0 && completetedTasks === totalTasks) {
      Confetti();
    }
  };

  //create a function to save task in local storage
  const saveTaskToLocalStorage = () => {
    //use taskList.querySelectorAll to select all task and convert this list into an array using Array.from,
    //then use .map to turn each task into an object with two properties,
    const task = Array.from(taskList.querySelectorAll("li")).map((li) => ({
      //text property which gets the text inside the span element in each task
      text: li.querySelector("span").textContent,
      //completed whihc checks if the checkbox is checked
      completed: li.querySelector(".checkbox").checked,
    }));
    //store array in localStorage with localStorage.setItem
    //first argument is 'task' the key and the second is JSON.stringify tasks, which converts the array into a JSON string
    localStorage.setItem("task", JSON.stringify(task));
  };

  //create a load task from local storage, which will get and rerender the task from local storage
  const loadTaskFromLocalStorage = () => {
    //using JSON parse to convert json string back into an array of task if no task save, return an empty array
    const savedTasks = JSON.parse(localStorage.getItem("task")) || [];
    //loop through each task and use add task to add it back to the list with text, completed status and false to prevent automatic editing
    savedTasks.forEach(({ text, completed }) =>
      addTask(text, completed, false),
    );
    //toggleEmptyState function checks if list is empty and shows message if it is
    toggleEmptyState();
    //update progress - updates the task progression like a progress bar
    updateProgress();
  };

  //create a function that runs when an event(like button clicked) happens
  //text parameter rep task text, the complete parameter default to false, checkCompletion parameter to true when box is checked
  const addTask = (text, completed = false, checkCompletion = true) => {
    //read text typed into input box and trim(remove any extra space)
    const taskText = text || taskInput.value.trim();
    //if the input is empty (user typed nothing or only space), stop the function immediately
    if (!taskText) {
      return;
    }

    //Create a brand new <li> html elementn in memory
    const li = document.createElement("li");
    //use innerHTML(used so it can update html which each task added - dynamic programming) + backticks to convert multi-line HTML string into real DOM elements
    //create list item with internal HTML with a checkbox(used to mark whether a task is completed or not completed) and a html span element to display text of task
    //the $ insert value of taskText variable showing task sescription entered by user
    //add div element with class task button and it will hold two buttons
    //first button is to edit task, second is to delete task
    //if completed is true the string checked is added to the checkbox, if false, it leaves it unchecked
    li.innerHTML = `
    <input type="checkbox" class="checkbox"
    ${completed ? "checked" : ""} /> 
    <span>${taskText}</span> 
    <div class="task-buttons">
        <button class= "edit-btn"><i class="fa-solid fa-pen"></i></button>
        <button class ="delete-btn"><i class="fa-solid fa-trash"></i></button>
    </div>
    `;
    //finds and stores checkbox elements inside a specific list item
    const checkbox = li.querySelector(".checkbox");

    //adding functionality for delete button and edit button
    //select the edit-btn inside each element using querySelector(returns first html element that match that CSS selector)
    const editBtn = li.querySelector(".edit-btn");

    //checks if task is 'complete'
    if (completed) {
      //add 'completed' CSS class to the li element so the css can automatically style that task as finished
      li.classList.add("completed");
      //disable the edit buttone so it cannot be clicked
      editBtn.disabled = true;
      //fades the edit button to show that it's inactive
      editBtn.style.opacity = "0.5";
      //blocks all pointer clicks and hover interactions on edit button
      editBtn.style.pointerEvents = "none";
    }
    //listen for the 'change' even on the checkbox(when user checks or uncheckit)
    checkbox.addEventListener("change", () => {
      //check if checkbox is currently checked and save that boolean state(true or false)
      const isChecked = checkbox.checked;
      //toggle the 'complete' class on <li> (adds if id isChecked is true, removed it if false)
      li.classList.toggle("completed", isChecked);
      //sets the button's disable property based on checkbox state (disabled when checked, enabled when unchecked)
      editBtn.disabled = isChecked;
      // Sets opacity to 0.5 (faded) if checked, or 1 (full opacity) if unchecked
      editBtn.style.opacity = isChecked ? "0.5" : "1";
      // Prevents mouse events ('none') if checked, or restores normal clicking ('auto') if unchecked
      editBtn.style.pointerEvents = isChecked ? "none" : "auto";
      //add updateProgress to update progress bar and number when task is checked
      updateProgress();
      //call this to save task to local storage
      saveTaskToLocalStorage();
    });

    //add click event listener inside each element
    //when button is clicked,
    editBtn.addEventListener("click", () => {
      //check if the checkbox inside task is not checked/completed
      if (!checkbox.checked) {
        //grab the text from span element inside the list element and place it into the main task input field
        taskInput.value = li.querySelector("span").textContent;
        li.remove(); //if a task is being edited the existing task will be removed
        //add updateProgress false to update progress bar without checking task completion during editing or update
        updateProgress(false);
        //call saveTaskToLocalStorage to keep the task list updated for when task is deleted
        saveTaskToLocalStorage();
      }
    });

    //select the delete-btn inside each elements and add a click event listener
    //when button is click
    li.querySelector(".delete-btn").addEventListener("click", () => {
      li.remove(); //task will be removed
      toggleEmptyState(); //this will be called when all the task are removed
      //add update progressBar after deleting a task to update total number of task
      updateProgress();
      //call saveTaskToLocalStorage to keep the task list updated for when task is edited
      saveTaskToLocalStorage();
    });

    //add the new list element to task list <ul> on the page
    taskList.appendChild(li);
    //clear out the input box so it's ready for the user's next task
    taskInput.value = " ";
    //call toggleEmptyState function to check state if task exist in list
    toggleEmptyState();
    //add updateProgress checkcCompletion to update progress bar when a task is added
    updateProgress(checkCompletion);
  };
  //add click event listener to the button so that the addTask function runs when clicked
  addTaskBtn.addEventListener("click", () => addTask());

  //add keypress listener to the input field so pressing 'Enter' also adds task
  //when a key is pressed, an event occurs, it creates an event object(e, it's the action that happened), which is then passed to function and executes code based on action occured during event
  taskInput.addEventListener("keypress", (e) => {
    //check if the key that was pressed is 'Enter' key (action that occured was pressing enter)
    if (e.key == "Enter") {
      e.preventDefault(); //stop default of action key
      //run the addTask function and pass along the event object
      addTask();
    }
  });
  //call loadTaskFromLocalStorage() when the page starts or when it's refreshed to load the saved
  loadTaskFromLocalStorage();
});

//create a confetti functions and paste confetti function
const Confetti = () => {
  const defaults = {
    spread: 360,
    ticks: 50,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    shapes: ["star"],
    colors: ["FFE400", "FFBD00", "E89400", "FFCA6C", "FDFFB8"],
  };

  function shoot() {
    confetti({
      ...defaults,
      particleCount: 40,
      scalar: 1.2,
      shapes: ["star"],
    });
    confetti({
      ...defaults,
      particleCount: 10,
      scalar: 0.75,
      shapes: ["circle"],
    });
  }
  setTimeout(shoot, 0);
  setTimeout(shoot, 100);
  setTimeout(shoot, 200);
};

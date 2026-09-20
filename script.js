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

  //variables to store the DOM elements connected to calender
  const monthYearDisplay = document.getElementById("month-year-display");
  const calendarDaysContainer = document.getElementById("calender-days");
  const taskTextInput = document.getElementById("task-text");
  const taskDateInput = document.getElementById("task-date");

  //variables to store DOM references connected to each category section
  const taskCategorySelect = document.getElementById("task-category");
  const newCategoryRow = document.getElementById("new-category-row");
  const newCategoryNameInput = document.getElementById("new-category-name");
  const newCategoryColorInput = document.getElementById("new-category-color");
  const confirmCategoryBtn = document.getElementById("confirm-category-btn");
  const editCategoryBtn = document.getElementById("edit-category-btn");
  const deleteCategoryBtn = document.getElementById("delete-category-btn");
  let editingCategoryName = null; // tracks whether the row is in "edit" mode vs "add" mode

  //category logic
  //TODO: what does this do
  //create a section for category name to be add
  const addCategoryValue = "add_new";

  //create a list of default category and assign them a default color
  const defaultCategories = {
    Work: "#ff6b6b",
    Personal: "#4ecdc4",
    Other: "#94a3b8",
  };

  //TODO: get comment for function of why empty object is being created
  let categories = {};

  //reload categories from local storage or prev save
  const loadCategories = () => {
    const saved = JSON.parse(localStorage.getItem("categories"));
    categories =
      saved && Object.keys(saved).length ? saved : { ...defaultCategories };
    saveCategories();
  };

  //create a function to save categories created
  const saveCategories = () => {
    localStorage.setItem("categories", JSON.stringify(categories));
  };

  //create a function to generate options of categories for dropdown
  const populateCategorySelect = (selectValue) => {
    taskCategorySelect.innerHTML = "";
    Object.keys(categories).forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      taskCategorySelect.appendChild(opt);
    });

    //TODO: add comment and figure out how it works
    const addOpt = document.createElement("option");
    addOpt.value = addCategoryValue;
    addOpt.textContent = "➕ Add new category";
    taskCategorySelect.appendChild(addOpt);

    //TODO: add comment and figure out how it works
    if (selectValue && categories[selectValue]) {
      taskCategorySelect.value = selectValue;
    }
  };

  //TODO: add comment and figure out how it works
  const addCategory = (name, color) => {
    const cleanName = name.trim();
    if (!cleanName) return null;

    //TODO: add comment and figure out how it works
    const existingKey = Object.keys(categories).find(
      (key) => key.toLowerCase() === cleanName.toLowerCase(),
    );
    const finalName = existingKey || cleanName;

    //TODO: add comment and figure out what to do
    categories[finalName] = color || categories[finalName] || "#94a3b8";
    saveCategories();
    populateCategorySelect(finalName);
    return finalName;
  };

  //add a editCategory function to be able to rename the category
  //TODO: add comments to explain what each line does
  const editCategory = (oldName, newName, color) => {
    const cleanNew = newName.trim();
    if (!cleanNew) return;

    const collision = Object.keys(categories).find(
      (key) => key.toLowerCase() == cleanNew.toLowerCase() && key !== oldName,
    );
    const finalName = collision || cleanNew;

    delete categories[oldName];
    categories[finalName] = color;
    saveCategories();

    taskList.querySelectorAll("li").forEach((li) => {
      if (li.dataset.category === oldName) {
        li.dataset.category = finalName;
        li.style.borderLeftColor = color;
        const badge = li.querySelector(".category-badge");
        badge.textContent = finalName;
        badge.style.background = color;
      }
    });
    saveTaskToLocalStorage();
    populateCategorySelect(finalName);
    renderCalendar();
  };

  //add a deleteCategory function to delete unneeded categories
  //TODO: figure out what each line in this function does
  const deleteCategory = (name) => {
    if (Object.keys(categories).length <= 1) {
      alert("You need at least one category");
      return;
    }
    if (!confirm(`Delete category "${name}"? Its tasks will move to "Other".`))
      return;

    delete categories[name];
    if (!categories.Other) categories.Other = "#94a3b8";
    saveCategories();

    taskList.querySelectorAll("li").forEach((li) => {
      if (li.dataset.category === name) {
        li.dataset.category = "Other";
        li.style.borderLeftColor = categories.Other;
        const badge = li.querySelector(".category-badge");
        badge.textContent = "Other";
        badge.style.background = categories.Other;
      }
    });
    saveTaskToLocalStorage();
    populateCategorySelect();
    renderCalendar();
  };

  //TODO: add comment for the rest and figure out what it does
  const ensureCategoryExists = (name) => {
    if (!categories[name]) {
      addCategory(name, "#94a3b8");
    }
  };

  //TODO: add comment for the rest and figure out what it does
  const showNewCategoryRow = () => {
    newCategoryRow.style.display = "flex";
    taskDateInput.style.display = "none"; // hide the date field while adding/editing a category
    newCategoryNameInput.value = "";
    newCategoryNameInput.focus();
  };

  //TODO: add comment for the rest and figure out what it does
  const hideNewCategoryRow = () => {
    newCategoryRow.style.display = "none";
    taskDateInput.style.display = ""; // restore it once category editing is done
  };

  //TODO: add comment for the rest and figure out what it does
  taskCategorySelect.addEventListener("change", () => {
    if (taskCategorySelect.value === addCategoryValue) {
      editingCategoryName = null;
      confirmCategoryBtn.textContent = "Add";
      showNewCategoryRow();
    } else {
      hideNewCategoryRow();
    }
  });

  //TODO: add comment for the rest and figure out what it does
  confirmCategoryBtn.addEventListener("click", () => {
    const name = newCategoryNameInput.value.trim();
    const color = newCategoryColorInput.value;
    if (!name) return;

    if (editingCategoryName) {
      editCategory(editingCategoryName, name, color);
      editingCategoryName = null;
      confirmCategoryBtn.textContent = "Add";
    } else {
      addCategory(name, color);
    }
    hideNewCategoryRow();
  });

  //TODO: add comment for the rest and figure out what it does
  newCategoryNameInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      confirmCategoryBtn.click();
    }
  });

  //TODO: add comment explain what each line does
  //add event listener for the edit category buttons
  editCategoryBtn.addEventListener("click", () => {
    const current = taskCategorySelect.value;
    if (!current || current === addCategoryValue) return;
    editingCategoryName = current;
    newCategoryNameInput.value = current;
    newCategoryColorInput.value = categories[current];
    confirmCategoryBtn.textContent = "Save";
    showNewCategoryRow();
  });

  //TODO: add comment and figure what this does
  //add event listener for the delete category buttons
  deleteCategoryBtn.addEventListener("click", () => {
    const current = taskCategorySelect.value;
    if (!current || current === addCategoryValue) return;
    deleteCategory(current);
  });

  //create variables to store calender elements
  let currentDate = new Date();
  let selectedDate = new Date().toISOString().split("T")[0]; //returns current date

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
      text: li.querySelector(".task-text").textContent,
      //completed which checks if the checkbox is checked
      completed: li.querySelector(".checkbox").checked,
      date: li.dataset.date || selectedDate, //stores the date
      category: li.dataset.category || "Other", //save the categories to local storage
    }));
    //store array in localStorage with localStorage.setItem
    //first argument is 'task' the key and the second is JSON.stringify tasks, which converts the array into a JSON string
    localStorage.setItem("task", JSON.stringify(task));
  };

  //this function class addTask() for every saved task and addTask() needs the categories object ot gave entries in it
  //create a load task from local storage, which will get and rerender the task from local storage
  const loadTaskFromLocalStorage = () => {
    //using JSON parse to convert json string back into an array of task if no task save, return an empty array
    const savedTasks = JSON.parse(localStorage.getItem("task")) || [];
    //loop through each task and use add task to add it back to the list with text, completed status and false to prevent automatic editing
    savedTasks.forEach(({ text, completed, date, category }) =>
      addTask(text, completed, false, date, category),
    );
    //toggleEmptyState function checks if list is empty and shows message if it is
    toggleEmptyState();
    //update progress - updates the task progression like a progress bar
    updateProgress();
    //reload calender after loading all the task
    renderCalendar();
  };

  //create a function that runs when an event(like button clicked) happens
  //text parameter rep task text, the complete parameter default to false, checkCompletion parameter to true when box is checked
  const addTask = (
    text,
    completed = false,
    checkCompletion = true,
    // Sets a default fallback value of null for the taskDate parameter if no date argument is passed
    taskDate = null,
    taskCategory = null,
  ) => {
    //read text typed into input box and trim(remove any extra space)
    const taskText = text || taskInput.value.trim();
    //if the input is empty (user typed nothing or only space), stop the function immediately
    if (!taskText) {
      return;
    }

    //Create a brand new <li> html elementn in memory
    const li = document.createElement("li");
    //resolve's the task's date by checking the provided parameter, the manual date input field, or defaulting to the highlighted calendar date
    const dateToUse = taskDate || taskDateInput.value || selectedDate;

    //TODO: add comment and figure out what this function does
    let categoryToUse =
      taskCategory ||
      (taskCategorySelect.value !== addCategoryValue
        ? taskCategorySelect.value
        : null) ||
      "Other";
    ensureCategoryExists(categoryToUse);
    const categoryColor = categories[categoryToUse];

    // Store the date on the element
    li.dataset.date = dateToUse;
    //TODO: how does this work + comments
    li.dataset.category = categoryToUse;
    li.style.borderLeftColor = categoryColor;
    //use innerHTML(used so it can update html which each task added - dynamic programming) + backticks to convert multi-line HTML string into real DOM elements
    //create list item with internal HTML with a checkbox(used to mark whether a task is completed or not completed) and a html span element to display text of task
    //the $ insert value of taskText variable showing task description entered by user
    // Injects a small inline-styled metadata text element showing the resolved date string inside the list item
    //add div element with class task button and it will hold two buttons
    //first button is to edit task, second is to delete task
    //if completed is true the string checked is added to the checkbox, if false, it leaves it unchecked
    //TODO: add category elements to innerHTML
    li.innerHTML = `
    <input type="checkbox" class="checkbox"
    ${completed ? "checked" : ""} /> 
    <span class="task-text">${taskText}</span> 
    <span class="category-badge" style="background:${categoryColor};">${categoryToUse}</span>
    <small style="color: black; font-size: 1rem; margin-left: 15px;">${dateToUse}</small>
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
      //update calandar when task changes
      renderCalendar();
    });

    //add click event listener inside each element
    //when button is clicked,
    editBtn.addEventListener("click", () => {
      //check if the checkbox inside task is not checked/completed
      if (!checkbox.checked) {
        //grab the text from task-text element inside the list element and place it into the main task input field
        taskInput.value = li.querySelector(".task-text").textContent;
        //TODO: add comment
        taskDateInput.value = li.dataset.date;
        //TODO: add comment
        taskCategorySelect.value = li.dataset.category;
        li.remove(); //if a task is being edited the existing task will be removed
        //add updateProgress false to update progress bar without checking task completion during editing or update
        updateProgress(false);
        //call saveTaskToLocalStorage to keep the task list updated for when task is deleted
        saveTaskToLocalStorage();
        //re renders the calendar view to clear the date marder for this task
        renderCalendar();
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
      //re renders the calander view to remove the data marker for the deleted task
      renderCalendar();
    });

    //add the new list element to task list <ul> on the page
    taskList.appendChild(li);
    //clear out the input box so it's ready for the user's next task
    taskInput.value = " ";
    //call toggleEmptyState function to check state if task exist in list
    toggleEmptyState();
    //add updateProgress checkcCompletion to update progress bar when a task is added
    updateProgress(checkCompletion);
    //update calender when task is add
    renderCalendar();
  };

  //create calender rendering function
  const renderCalendar = () => {
    //clears all existing day elements inside the calendar grid container
    calendarDaysContainer.innerHTML = "";
    //extracts the four-digit year from the currentDate objects
    const year = currentDate.getFullYear();
    //extracts the z-indexed month integer(0-11) from the currentDate object
    const month = currentDate.getMonth();

    //display month and year
    monthYearDisplay.textContent = currentDate.toLocaleDateString("en-US", {
      month: "long", //format it to display full name of month
      year: "numeric", //formate to display complete four-digit calendar year
    });

    //display the each date in a month
    // Determines the numeric day of the month for the very first calendar block (always returns 1)
    const firstDay = new Date(year, month, 1).getDate();
    // Finds the exact final day count of the current month by querying the "0th" day of the subsequent month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    //create empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      //create a blank div element to act as a calander gird layout
      const emptyDiv = document.createElement("div");
      //appends the empty spacer div into the calendar grid layout
      calendarDaysContainer.appendChild(emptyDiv);
    }
    //loop through each day of the current month to create its calender cell
    for (let day = 1; day <= daysInMonth; day++) {
      //create a new div element where the day number is created
      const dayDiv = document.createElement("div");
      //create a separate span for the day number so it can be crossed out independently from category lines
      const dayNumber = document.createElement("span");
      //sets the text of the calendar cell to the day number
      dayNumber.textContent = day;
      dayNumber.className = "day-number";
      dayDiv.appendChild(dayNumber);
      //chnage the cursor style to a pointer when hovering over the cell
      dayDiv.style.cursor = "pointer";

      //formats the day number into Year-Month-Day string
      const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      //indicator for todays date
      const today = new Date();
      //check if the iterated calendar cell matched today's exact dates
      if (
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()
      ) {
        //highlights today's cell background with this color
        dayDiv.style.backgroundColor = "rgba(94, 188, 219, 0.3)";
        //sets today's cell text color to white
        dayDiv.style.color = "white";
        //add rounded corners to today's highlighted cell
        dayDiv.style.borderRadius = "4px";
      }

      //TODO: explain what this does
      //find every task assigned to this calendar date
      const tasksOnDate = Array.from(taskList.querySelectorAll("li")).filter(
        (li) => li.dataset.date === dateString,
      );

      if (tasksOnDate.length > 0) {
        //draws a line colored line per task, stacked vertically, each in task's own category color
        const linesWrap = document.createElement("div");
        linesWrap.className = "category-lines";
        tasksOnDate.forEach((li) => {
          const line = document.createElement("div");
          line.className = "category-line";
          line.style.backgroundColor =
            categories[li.dataset.category] || "#94a3b8";
          linesWrap.appendChild(line);
        });
        dayDiv.appendChild(linesWrap);

        //if every task due this day is checked off, mark the whole cell as done
        const allComplete = tasksOnDate.every(
          //.every returns true only if callback is true for every item in the array
          (li) => li.querySelector(".checkbox").checked,
        );
        if (allComplete) {
          dayDiv.classList.add("all-complete");
        }
      }

      //create an event listener for user to select date
      dayDiv.addEventListener("click", () => {
        //updayes the global selectedDate variable to match the clicked day
        selectedDate = dateString;
        //sets the date input value to match the clicked date string
        taskDateInput.value = dateString;
      });
      //appends the completed day cell into the calendar container
      calendarDaysContainer.appendChild(dayDiv);
    }
  };

  //add month navigation buttons
  const prevMonthBtn = document.getElementById("prev-month");
  const nextMonthBtn = document.getElementById("next-month");

  //prev month navigation
  prevMonthBtn.addEventListener("click", () => {
    //when prev button clicked set the month of the current date and move to the prev month
    currentDate.setMonth(currentDate.getMonth() - 1);
    //update calendar
    renderCalendar();
  });

  //next month navigation buttons
  nextMonthBtn.addEventListener("click", () => {
    //when next button pressed, get the current month and date
    currentDate.setMonth(currentDate.getMonth() + 1);
    //update calendar
    renderCalendar();
  });

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
  //load saved categories before anything else needs them
  loadCategories();
  //fill the dropdown with those categories
  populateCategorySelect();
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

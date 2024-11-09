document.getElementById('add-task').addEventListener('click', () => {
    const taskInput = document.getElementById('new-task');
    const timeInput = document.getElementById('task-time'); // Input for time
    const task = taskInput.value;
    const time = timeInput.value; // Get the time value
    const domain = window.location.hostname;

    if (task && time) {
        chrome.storage.sync.get([domain], (result) => {
            let tasks = result[domain] || [];
            tasks.push({ text: task, time: time, completed: false });

            chrome.storage.sync.set({ [domain]: tasks }, () => {
                scheduleTaskNotification(task, time); // Schedule notification
                displayTasks();
                taskInput.value = '';
                timeInput.value = ''; // Clear the time input
            });
        });
    }
});

function scheduleTaskNotification(task, time) {
    const taskTime = new Date();
    const [hours, minutes] = time.split(':'); // Split input time
    taskTime.setHours(hours, minutes, 0, 0); // Set task time

    const delay = taskTime.getTime() - Date.now(); // Calculate delay

    if (delay > 0) {
        chrome.alarms.create(task, { when: Date.now() + delay });
    }
}

function displayTasks() {
    const domain = window.location.hostname;
    chrome.storage.sync.get([domain], (result) => {
        const taskList = document.getElementById('task-list');
        taskList.innerHTML = '';
        const tasks = result[domain] || [];

        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.textContent = `${task.text} at ${task.time}`; // Display task and time
            li.style.backgroundColor = task.completed ? 'red' : '#87CEEB';

            // Toggle task completion when clicked
            li.addEventListener('click', () => {
                tasks[index].completed = !tasks[index].completed;
                li.style.backgroundColor = tasks[index].completed ? 'red' : '#87CEEB';
                chrome.storage.sync.set({ [domain]: tasks }, displayTasks);
            });

            // Add a delete button for removing tasks
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation();
                tasks.splice(index, 1);
                chrome.storage.sync.set({ [domain]: tasks }, displayTasks);
            });

            li.appendChild(deleteButton);
            taskList.appendChild(li);
        });
    });
}

// Listen for the alarm and show notification
chrome.alarms.onAlarm.addListener((alarm) => {
    chrome.notifications.create('', {
        title: 'Task Reminder',
        message: `Task: ${alarm.name}`,
        iconUrl: 'icons/icon48.png',
        type: 'basic'
    });
});

document.addEventListener('DOMContentLoaded', displayTasks);

chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.create('taskReminder', { periodInMinutes: 1440 });
});

chrome.alarms.onAlarm.addListener(() => {
    chrome.storage.sync.get(null, (result) => {
        const now = new Date().toISOString().split('T')[0];
        Object.keys(result).forEach(domain => {
            const tasks = result[domain];
            tasks.forEach(task => {
                if (task.date === now) {
                    // Create a rich notification
                    chrome.notifications.create('', {
                        type: 'basic',  // Template type
                        iconUrl: 'icons/icon48.png',  // Path to the icon
                        title: 'Task Reminder',
                        message: `Task due on ${domain}: ${task.text}`,
                        contextMessage: `Click to view tasks`,
                        priority: 2,  // Higher priority for more visibility
                        buttons: [
                            { title: 'Mark as Complete' },
                            { title: 'View Tasks' }
                        ]
                    });
                }
            });
        });
    });
});

// Listen for notification button clicks
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
    if (buttonIndex === 0) {
        console.log('Mark as Complete clicked');
        // Logic to mark the task as completed
    } else if (buttonIndex === 1) {
        console.log('View Tasks clicked');
        // Logic to open task list or UI
    }
});

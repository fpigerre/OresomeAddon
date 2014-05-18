var url = "http://oresomecraft.com/forums/";

var popupWindow = {

    /**
     * Pulls alerts from the OresomeCraft forums
     * and displays them in a neat popup
     *
     * @public
     */
    showAlerts: function () {
        console.log("Connecting to OresomeCraft...");
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url + '.json', true);
        xhr.onload = function () {
            var alerts = parseInt(window.JSON.parse(xhr.responseText)._visitor_alertsUnread);
            var conversations = parseInt(window.JSON.parse(xhr.responseText)._visitor_conversationsUnread);

            for (var i = 0; i < alerts.length; i++) {
                var alert = document.getElementById("alerts").createElement("div");
                alert.innerHTML = "<h2>" + window.JSON.parse(xhr.responseText) + "</h2>";
            }
        };
    }
};

var conversations_old = 0;
var alerts_old = 0;
var total = 0;

/**
 * Checks if the user has any new OresomeCraft notifications.
 * If so, the add-on plays a sound and updates the add-on icon.
 *
 * @public
 */
function getAlerts() {
    console.log("Getting alerts...");

    total = 0;

    console.log("Connecting to OresomeCraft...");
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url + '.json', true);
    xhr.onload = function () {
        var alerts = parseInt(window.JSON.parse(xhr.responseText)._visitor_alertsUnread);
        var conversations = parseInt(window.JSON.parse(xhr.responseText)._visitor_conversationsUnread);
        console.log("Connected to OresomeCraft. Alerts: " + alerts + ", Conversations: " + conversations + ".");

        if (alerts > alerts_old) {
            console.log("Incoming alert notification!");
            notify(alerts, alerts == 1 ? "alert" : "alerts", url + "account/alerts");
            alerts_old = alerts;
            total += alerts;
            updateBadge();
        }
        if (conversations > conversations_old) {
            console.log("Incoming conversation notification!");
            notify(conversations, conversations == 1 ? "conversation" : "conversations", url + "conversations");
            conversations_old = conversations;
            total += conversations;
            updateBadge();
        }
    };
    xhr.onerror = function () {
        console.log("An error occurred while connecting to OresomeCraft!");
        chrome.browserAction.setBadgeText({text: "Error"});
    };
    xhr.send();
    setTimeout(getAlerts, 30000);
}

/**
 * Updates the add-on icon
 */
function updateBadge() {
    chrome.browserAction.setBadgeText({text: '' + total});
    chrome.browserAction.setBadgeBackgroundColor({color: "#FF0000"});
}

/**
 * Creates a new notification
 *
 * @param number The amount of unread OresomeCraft notifications a user has
 * @param type   The type of OresomeCraft notifications
 * @param url    The OresomeCraft alerts URL
 */
function notify(number, type, url) {
    // At the moment, webkit notifications can't be resolved, although 'notifications' has been added as a manifest permission
    var notification = window.webkitNotifications.createNotification(
        'img/48.png',
        'Attention:',
        'You have ' + number + ' unread OresomeCraft ' + type + '!'
    );
    notification.show();
    playSound();
    notification.onclick = function (tabs) {
        chrome.tabs.create({'url': url});
        chrome.browserAction.setBadgeText({text: ''});
        notification.cancel();
    };

    setTimeout(function () {
        notification.cancel();
    }, 60000);
}

/**
 * Plays a notification sound
 */
function playSound() {
    var snd = new Audio('notification.mp3');
    snd.play();
}

// Run our alerts generation script as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function () {
    notify(10, "alerts", "http://oresomecraft.com");
    popupWindow.showAlerts();
});
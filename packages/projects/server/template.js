'use strict';

module.exports = {
  project_notification_email: function(notification, project, req, mailOptions) {
    var itemsHTML = function(notification){
      var theHTML = '<ul>'
      for(var x in notification.items){
        theHTML = theHTML + '<li>' + notification.items[i] + '</li>';
      }
      theHTML = theHTML + '</ul>';

      return theHTML;
    };
    mailOptions.html = [
      'Hi ' + notification.username + ',',
      '<p>A new project has been requested and needs your assistance with ' + notification.items.length.toString() + ' item/s listed below.</p>',
      itemsHTML ,
      '<p>Please log in to the portal to view more details about the project.</p>'
    ].join('\n\n');
    mailOptions.subject = 'New Project Request';
    return mailOptions;
  }
};
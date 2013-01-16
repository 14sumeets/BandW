/*News Model
* _id
* author_id
* text
* type ('photo' or 'album')
* album_name (if type is 'album')
* story
* album_previous (if type is 'album')


/*
* Album Model
* _id
* ownerid = the userid  of the owner
* name
* number of photos
* album cover 
*/

/*
* Photo Model
* _id
* album_id
* src (a URL)
*/

/*
* Comment Model
* _id
* commentnumber (possibly not necessary, will keep for now)
* text
* author_id
* photo_id
*/

/*
* Messages Model
* _id
* to_id (id of recipient)
* from_id (id of sender)
* body (body of the message)
* new (boolean that is true when message hasn't been looked at, false when it has been)
*/

/*
* Notifications Model
* _id
* owner_id
* text
* type ("contact request",...)
* from_id (user id of contact requester. defined if type is "contact request")
* new (true if notification hasn't been "read")
* accepted (true if in the case its a contact request, the request was accepted)
*/

/*
* Contacts Model
* _id
* owner_id
* username (of contact)
*/

News = new Meteor.Collection("news");
Albums = new Meteor.Collection("albums");
Photos = new Meteor.Collection("photos");
Comments = new Meteor.Collection("comments");
Messages = new Meteor.Collection("messages");
Notifications = new Meteor.Collection("notifications");
Contacts = new Meteor.Collection("contacts");
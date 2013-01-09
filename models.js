/*
* Album Model
* _id
* ownerid = the userid  of the owner
* album name
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
Albums = new Meteor.Collection("albums");
Photos = new Meteor.Collection("photos");
Comments = new Meteor.Collection("comments");
Messages = new Meteor.Collection("messages");
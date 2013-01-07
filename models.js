//Photo Album Model
// album id (by default)
// ownerid = the userid  of the owner
// album name
// number of photos
// album cover

Albums = new Meteor.Collection("albums");
Photos = new Meteor.Collection("photos");
Comments = new Meteor.Collection("comments");
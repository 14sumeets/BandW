if (Meteor.isClient) {
	/*Template.hello.greeting = function () {
    	return "elcome to bandw.";
  	};*/
	
	
	
	Template.userhome.loggedInPageIs = function(p) {
		var page = Session.get('loggedInPage');
		if (p=='welcomeuser' && page == undefined) {
			return true;
		}
		return page == p;
	}
	
	Template.viewalbum.album = function() {
		return Albums.findOne({_id: Session.get('currentalbumid')});
	}
	Template.viewalbum.photosFrom = function(album) {
		return Photos.find({album_id: album._id})
	}
	Template.viewalbum.events({
		'keydown, click button': function(e) {
			if ((e.which == 1 || (e.which == 13 && document.activeElement == $('.inputbox')[0])) && $('.inputbox')[0].value != "Enter a URL to a photo..." && $('.inputbox')[0].value != "") {
				console.log("adding a new photo!")
				var photoURL = $('.inputbox')[0].value;
				$('.inputbox')[0].value = "Enter a URL to a photo...";
				Photos.insert({album_id: Session.get('currentalbumid'), src: photoURL});
				var prevNumPhotos = Albums.findOne({_id: Session.get('currentalbumid')}).numphotos;
				console.log("previous number of photos: "+prevNumPhotos);
				Albums.update({_id:Session.get('currentalbumid')},{$set: {numphotos : prevNumPhotos+1 }}  )
				$('.inputbox')[0].blur()
				console.log(photoURL)
			}
		},
		'click img.photo': function(e) {
			Session.set('loggedInPage','viewphoto')
			Session.set('currentPhoto',e.target.id)
		}
	});
	Template.viewphoto.photo = function() {
		return Photos.findOne({_id:Session.get('currentPhoto')});
	};
	Template.viewphoto.comments = function() {
		return Comments.find({photo_id:Session.get('currentPhoto')}).fetch();
	}
	Template.viewphoto.commentauthorname = function(id) {
		return Meteor.users.findOne({_id:id}).profile.displayname;
	}
	Template.viewphoto.events({
		'click a#returntoalbum' : function() {
			Session.set('loggedInPage','viewalbum')
		},
		'keydown , click button#newcommentbutton' : function(e) {
			if ( (e.which == 13 || e.which == 1) && $('#newcomment')[0].value != "Add a comment..." && $('#newcomment')[0].value != "") {
				var comment = $('#newcomment')[0].value;
				Comments.insert({commentnumber: Comments.find({photo_id:Session.get('currentPhoto')}).fetch().length,text:comment, author_id:Meteor.userId(), photo_id:Session.get('currentPhoto')  })
				$("#newcomment")[0].value = "Add a comment...";
				$("#newcomment").blur();
			}
		}
	});
	
	
	
	
	
	
	
	
	Template.seeall.events({
		'click a' : function(e) {
			//Template.viewalbum.album = Albums.findOne({_id:e.toElement.id })
			Session.set('loggedInPage',"viewalbum")
			Session.set('currentalbumid',e.toElement.id)
		}
	});
	Template.seeall.albums = function() {
		return Albums.find({owner_id: Meteor.user()._id});
	}
	
	
	Template.userhomeleftmenu.events({
		'click li#seeall' : function() {
			Session.set('loggedInPage','seeall')
		},
		'click li#newalbum' : function() {
			Session.set('loggedInPage','newalbum')
		},
		'click li#home' : function() {
			Session.set('loggedInPage','welcomeuser')
		},
		'click li#inbox' : function () {
			console.log("clicked on inbox");
		}
	});
	Template.newalbum.events({
		'keydown, click button': function (e) {
			if ((e.which == 1 || (e.which == 13 && document.activeElement == $('.inputbox')[0])) && $('.inputbox')[0].value != "Enter an album name..." && $('.inputbox')[0].value != "") {
				var albumname = $('.inputbox')[0].value;
				console.log("creating a new album named: "+albumname)
				if (Meteor.user() != null && Albums.findOne({owner_id: Meteor.user()._id, name: albumname}) == undefined) {
					Albums.insert({owner_id: Meteor.user()._id, name: albumname, numphotos: 0, albumcover: "/placeholder.png"}, function(err,id) {
						Session.set('loggedInPage',"viewalbum")
						Session.set('currentalbumid',id)	
					});
					console.log("Album created!")
				} else {
					$("#newalbumerror").text("Error: An album with that name already exists.");
				}
			}
		}
	});
	Template.newlyregistered.events({	
		'click button': function () {
			var pw = $('#pw1')[0].value
			if (  pw == $('#pw2')[0].value ) {
				$('#setpwerror').text("")
				Meteor.call('resetPw',pw,function(error,result) {
					if (result == "success") {
						Session.set('loggedInPage','welcomeuser');
						$("#setpwerror").text("Success!")
					} else {
						$("#setpwerror").text(result)
					}
				});
			} else {
				$('#setpwerror').text("Error: Passwords entered do not match.")
			}
		}
	});
	
	Template.userhomeheader.events({
		'click button#logout': function () {
			Meteor.logout();
		}
	});
	Template.welcomeuser.needtomakepw = function() {
		return Meteor.user() != null && Meteor.user().profile != undefined && Meteor.user().profile.makepw == true;
	}
	
	Template.signup_form.events({
		'click button#createUser': function () {
			var username = $('#newusername')[0].value;
			var pw = Math.random().toString().substring(7);
			console.log("Creating a user!")
			console.log(pw)
			var options = {
				username: username,
				password: pw,
				profile: {makepw: true, displayname: username}
			};
			Accounts.createUser(options,function (err) {
				console.log("Creating user...");
				console.log(err);
				if (err != undefined) {
					console.log("Error: "+err.reason)
					$('#signup_error').text("Error: "+err.reason)
				} else {
					Session.set('loggedInPage','welcomeuser');
					$('#signup_error').text("")
				}
				
			});
		}
	});
	Template.login_form.events({
		'click button#loginUser': function () {
			Meteor.loginWithPassword($('#oldusername')[0].value,$('#oldpassword')[0].value,function(err) {
				if (err == undefined) {
					console.log("Login successful!")
					Session.set('loggedInPage','welcomeuser');
					$('#login_error').text("")
				} else {
					$('#login_error').text("Error: "+err.reason)
				}
			})
		}
	});
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
	Meteor.methods({
		resetPw: function(pw) {
			if (Meteor.user() != null) {
				Accounts.setPassword(Meteor.user()._id,pw);
				Meteor.users.update({_id:Meteor.user()._id},{$set: {profile : {makepw:false, displayname: Meteor.user().profile.displayname}}}  )
				console.log("Password reset!")
				return "success";
			}
			return "Error: Not logged in";	
		}
	});


	//Albums.remove({}); Comments.remove({}); Photos.remove({}); Meteor.users.remove({});
	//Meteor.users.find().forEach(function(o){ console.log(o)});
	//console.log("DONE")
  });
}

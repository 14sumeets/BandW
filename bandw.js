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
	//hide notifications window if user clicks outside the notifications window
	$(document).on('click', function () {
        Session.set('notificationspanel',undefined)
    });
	
	Template.userhomeleftmenu.newmsgs = function() {
		var numnew = Messages.find({to_id:Meteor.userId(), new:true}).fetch().length
		if (numnew > 0) {
			return "("+numnew+")"
		}
		return "";
	}
	Template.userhomeheader.username = function() {
		return Meteor.user().username;
	}
	Template.userhomeheader.numnewnotifications = function() {
		var numnew = Notifications.find({owner_id:Meteor.userId(), new:true}).fetch().length
		if (numnew > 0) {
			return " ("+numnew+")"
		}
		return "";
	}
	Template.userhomeheader.newnotification = function() {
		var numnew = Notifications.find({owner_id:Meteor.userId(), new:true}).fetch().length
		if (numnew > 0 || Session.get('notificationspanel')=='open') {
			return "active "
		}
		return "";
	}
	Template.userhomeheader.iscontactrequest = function(type) {
		return type=="contact request"
	}
	Template.userhomeheader.notifications_panel_open = function() {
		if (Session.get('notificationspanel') == undefined) {
			return "none"
		} else {
			return "block"
		}
	}
	Template.userhomeheader.notifications = function() {
		var notifications = Notifications.find({owner_id: Meteor.userId()}).fetch().reverse()
		if (notifications.length > 0) {
			return notifications
		}
		return [{text: "You have no notifications to display."}]
	}

	Template.userhomeheader.events({
		'click a#notificationsbutton': function() {
			if (Session.get('notificationspanel')==undefined) {
				Session.set('notificationspanel','open')
				var numnew = Notifications.find({owner_id:Meteor.userId(),new:true}).fetch().length
				for (var i=0;i<numnew;i++) {
					Notifications.update({owner_id:Meteor.userId(), new:true},{$set: {new: false}})
				}
			} else{
				Session.set('notificationspanel',undefined)
			}
		},
		'click ul#notificationspanel':function(e) {
			console.log(e.toElement.className)
			e.stopPropagation();
			if (e.toElement.className == "btn btn-primary accept") {
				var n = Notifications.findOne({_id:e.toElement.id})
				Notifications.update({_id:e.toElement.id},{$set: {accepted : true }}  )
				Meteor.call('getUsernameOf',n.from_id,function(error,result) {
					Notifications.insert({owner_id:n.from_id,text:Meteor.user().username+" has accepted your contact request.",new:true})
					Contacts.insert({owner_id: Meteor.userId(), username: result});
					Contacts.insert({owner_id: n.from_id, username: Meteor.user().username});
				})
			}
		},
	});
	
	Template.viewalbum.album = function() {
		return Albums.findOne({_id: Session.get('currentalbumid')});
	}
	Template.viewalbum.photosFrom = function(album) {
		return Photos.find({album_id: album._id})
	}
	Template.viewalbum.events({
		'keydown, click button#newphoto': function(e) {
			if ((e.which == 1 || (e.which == 13 && document.activeElement == $('.inputbox')[0])) && $('.inputbox')[0].value != "Enter a URL to a photo..." && $('.inputbox')[0].value != "") {
				console.log("adding a new photo!")
				var photoURL = $('.inputbox')[0].value;
				Photos.insert({album_id: Session.get('currentalbumid'), src: photoURL});
				var prevNumPhotos = Albums.findOne({_id: Session.get('currentalbumid')}).numphotos;
				console.log("previous number of photos: "+prevNumPhotos);
				Albums.update({_id:Session.get('currentalbumid')},{$set: {numphotos : prevNumPhotos+1 }}  )
				$('.inputbox')[0].blur()
				$('.inputbox')[0].value = "Enter a URL to a photo..."
			}
		},
		'click button#sharealbum' : function(e) {
			News.insert({author_id:Meteor.user()._id,album_name:Albums.findOne({_id: Session.get('currentalbumid')}).name,text:"posted a new album",type:"album",album_id:Session.get('currentalbumid') })
			Session.set('loggedInPage','photostream')
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
		},
		'click a#makealbumcover' : function(e) {
			e.preventDefault()
			$("#updatecover").show()
			$("#updatecover").text("Updated!")
			$("#updatecover").fadeOut(1500)
			Albums.update({_id:Session.get('currentalbumid')},{$set: {albumcover : Photos.findOne({_id:Session.get('currentPhoto')}).src }}  )
		},
		'click a#photostreamphoto':function(e) {
			News.insert({author_id:Meteor.user()._id,album_name:Albums.findOne({_id: Session.get('currentalbumid')}).name,text:"shared a photo from the album",type:"photo",album_id:Session.get('currentalbumid'),photo_src:$('#photostreamphoto').attr('photosrc'),photo_id:Session.get('currentPhoto') })
			Session.set('loggedInPage','photostream')
		}
	
	});
	
	Template.sendmessage.events({
		'click button' : function() {
			var body = $("#messagebody").val();
			var to = $("#messageto").val();
			Meteor.call('lookUpUsername',to,function(error,result){
				var recipient = result
				if (recipient != undefined) {
					$("#sendmessageerror").text("Successfully sent message!")
					$("#messagebody").val("");
					$("#messageto").val("");
					Messages.insert({to_id: recipient._id, from_id: Meteor.user()._id, body:body, new:true})
				} else {
					$("#sendmessageerror").text("Error: Your specified recipient username was not found.")
				}
			});
		}
	});
	Template.viewinbox.messages = function() {
		return Messages.find({to_id: Meteor.userId()}).fetch().reverse()
	}
	Template.viewinbox.from = function(id) {
		return Meteor.users.findOne({_id: id}).profile.displayname
	}
	Template.viewinbox.events({
	});
	Template.viewcontacts.events({
		'click button#newcontactbutton' : function() {
			var newusername = $("#newcontact").val();
			Meteor.call('lookUpUsername',newusername,function(error,newcontact) {//Meteor.users.findOne({username: newusername})
				var sentAlready = Notifications.findOne({})
				if (newcontact != undefined) {
					var sentAlready = Notifications.findOne({owner_id: newcontact._id, type:"contact request",from_id:Meteor.userId() })
					var acceptedAlready = Contacts.findOne({owner_id:Meteor.userId(),username:newusername})
					if (sentAlready == undefined) {
						if (acceptedAlready == undefined) {
							Notifications.insert({owner_id: newcontact._id, type:"contact request",from_id:Meteor.userId(),new:true,accepted:false,text:Meteor.user().profile.displayname+" wants to add you as a contact." })
							$("#newcontacterror").show()
							$("#newcontacterror").text("Successfully sent contact request!")
							$("#newcontacterror").fadeOut(2000)
						} else {
							$("#newcontacterror").show()
							$("#newcontacterror").text("Error: This user is already a contact of yours.")
							$("#newcontacterror").fadeOut(2000)
						}
					} else {
						$("#newcontacterror").show()
						$("#newcontacterror").text("Error: You have already sent a contact request to this user.")
						$("#newcontacterror").fadeOut(2000)
					}
				} else {
					$("#newcontacterror").show()
					$("#newcontacterror").text("Error: The specified username does not exist.")
					$("#newcontacterror").fadeOut(2000)
				}
			});
		}
	});
	Template.viewcontacts.contacts = function() {
		return Contacts.find({owner_id:Meteor.userId()})
	}
	Template.photostream.news = function() {
		var mycontacts = []
		Contacts.find({username:Meteor.user().username}).forEach(function(c) {
			mycontacts.push(c.owner_id)
		})
		mycontacts.push(Meteor.userId())
		return News.find({author_id: {$in: mycontacts  }        }).fetch().reverse()
	}
	Template.photostream.events({
		'click img.photostream_photo': function(e) {
			console.log(e)
			Session.set('loggedInPage','viewphoto')
			Session.set('currentPhoto',e.target.id)
			console.log(e.target.attributes.getNamedItem('album_id').value)
			Session.set('currentalbumid',e.target.attributes.getNamedItem('album_id').value)
		},
		'click img.album_preview_image': function(e) {
			console.log(e)
			Session.set('loggedInPage','viewphoto')
			Session.set('currentPhoto',e.target.id)
			console.log(e.target.attributes.getNamedItem('album_id').value)
			Session.set('currentalbumid',e.target.attributes.getNamedItem('album_id').value)
		}
	})
	Template.photostream.getuserprofpic = function(id) {
		return Meteor.users.findOne({_id:id}).profile.profpic
	}
	Template.photostream.getuserdisplayname = function(id) {
		return Meteor.users.findOne({_id:id}).profile.displayname
	}
	Template.photostream.typeisphoto = function(type) {
		return type=="photo"
	}
	Template.photostream.typeisalbum = function(type) {
		return type=="album"
	}
	Template.photostream.previewphotosfrom = function(albumid) {
		return Photos.find({album_id: albumid }).fetch()  //look for boolean "use_as_preview"
	}
	
	
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
		'click li#photostream' : function() {
			Session.set('loggedInPage','photostream')
		},
		'click li#seeall' : function() {
			Session.set('loggedInPage','seeall')
		},
		'click li#newalbum' : function() {
			Session.set('loggedInPage','newalbum')
		},
		'click li#home' : function() {
			Session.set('loggedInPage','welcomeuser')
		},
		'click li#contacts' : function() {
			Session.set('loggedInPage','viewcontacts')
		},
		'click li#inbox' : function () {
			Session.set('loggedInPage','viewinbox')
			var numnew = Messages.find({to_id:Meteor.userId(),new:true}).fetch().length
			for (var i=0;i<numnew;i++) {
				Messages.update({to_id:Meteor.userId(), new:true},{$set: {new: false}})
			}
		},
		'click li#sendmessage' : function () {
			Session.set('loggedInPage','sendmessage')
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
			Accounts._makeClientLoggedOut()
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
				profile: {makepw: true, displayname: username, profpic: '/profile-default.jpg'}
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
				Meteor.users.update({_id:Meteor.user()._id},{$set: {profile : {makepw:false, displayname: Meteor.user().profile.displayname, profpic: '/profile-default.jpg'}}}  )
				return "success";
			}
			return "Error: Not logged in";	
		},
		lookUpUsername:function(username) {
			return Meteor.users.findOne({username:username});
		},
		getUsernameOf:function(id) {
			return Meteor.users.findOne({_id:id}).username;
		},
	});


	//News.remove({}); Albums.remove({}); Comments.remove({}); Photos.remove({}); Meteor.users.remove({}); Messages.remove({}); Notifications.remove({}); Contacts.remove({});
	//Meteor.users.find().forEach(function(o){ console.log(o)});
	//console.log("DONE")
  });
}

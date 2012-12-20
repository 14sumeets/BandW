if (Meteor.isClient) {
	/*Template.hello.greeting = function () {
    	return "elcome to bandw.";
  	};*/
	Template.page.isLoggedIn = function() {
		return Meteor.user() != null
	};
	
	Template.newlyregistered.events({
		'click button': function () {
			var pw = $('#pw1')[0].value
			if (  pw == $('#pw2')[0].value ) {
				$('#setpwerror').text("")
				Meteor.call('resetPw',pw,function(error,result) {
					if (result == "success") {
						$("#setpwerror").text("Success!")
						$("#newlyregistered").animate({height: 0, opacity: 0}, 'slow', function() {
						        $(this).remove();
						    });
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
		'click button': function () {
			console.log("LOG ME OUT!")
			Meteor.logout();
		}
	});
	Template.rightofmenu.needtomakepw = function() {
		return Meteor.user().profile != undefined && Meteor.user().profile.makepw == true;
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
				profile: {makepw: true}
			};
			Accounts.createUser(options,function (err) {
				console.log("Creating user...");
				console.log(err);
				if (err != undefined) {
					console.log("Error: "+err.reason)
					$('#signup_error').text("Error: "+err.reason)
				} else {
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
					Session.set("isLoggedIn",true);
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
				Meteor.users.update({_id:Meteor.user()._id},{$set: {profile : {makepw:false}}}  )
				console.log("Password reset!")
				return "success";
			}
			return "Error: Not logged in";	
		}
	});



	//Meteor.users.remove({});
	//Meteor.users.find().forEach(function(o){ console.log(o)});
	//console.log("DONE")
  });
}

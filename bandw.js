if (Meteor.isClient) {
	/*Template.hello.greeting = function () {
    	return "elcome to bandw.";
  	};*/
	Template.page.isLoggedIn = function() {
		return Meteor.user() != null
	};
	Template.signup_form.events({
		'click button#createUser': function () {
			var username = $('#newusername')[0].value;
			var pw = Math.random().toString().substring(7);
			console.log("Creating a user!")
			console.log(pw)
			var options = {
				username: username,
				password: pw
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
  });
}

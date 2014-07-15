/**
 * The classes in this file are merely here for the purpose of generating a
 * diagram for using the JOII-plugin and provide absolutely no functionality
 * whatsoever.
 */

// Create some simple "namespaces".
Application = {};
Application.System = {};
Application.User = {};


// Authentication Interface & Class
Application.System.AuthenticationManagerInterface = Interface({
    authenticate: 'function'
});

Application.System.AuthenticationManager = Class({
    implements: Application.System.AuthenticationManagerInterface
}, {
    __construct: function() {
        // Public API
        return {
            authenticate: this.authenticate
        };
    },
    authenticate: function(username, password) {},
    getUserByUsername: function(username) {}
});

Application.User.UserProvider = Class({
    addUser: function(User) {},
    getUser: function(name) {},
    removeUser: function(name) {}
});

Application.User.UserInterface = Interface({
    getUsername: 'function',
    getName: 'function',
    getSurname: 'function',
    getEmail: 'function',
});
Application.User.User = Class({
    implements: Application.User.UserInterface
}, {
    getUsername: function() {},
    getName: function() {},
    getSurname: function() {},
    getEmail: function() {}
});

Application.User.Administrator = Class({
    extends: Application.User.User
}, {});

Application.User.Moderator = Class({
    extends: Application.User.User
}, {});

Application.User.Guest = Class({
    extends: Application.User.User
}, {});

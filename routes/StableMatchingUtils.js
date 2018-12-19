// Stable Matching


// take unequal size of user prefs and team prefs
// add in new instances of users and teams to balance out sizes
function equalSets(userPrefs, teamPrefs, teamQuota) {

	// create new team prefs dictionary
	var teamPrefsMod = {};
	var userPrefsMod = {};

	var teamMap = {}

	// iterate through all teams
	for (var team in teamPrefs) {
		var quota = teamQuota[team];
		var teamCopies = []
		// iterate through quota amount
		for (var j=0; j < quota; j++) {
			var key = team + j;
			var value = teamPrefs[team];
			teamPrefsMod[key] = value;
			teamCopies.push(key);
		}
		teamMap[team] = teamCopies;
	}

	for (var user in userPrefs) {
		var key = user;
		var value = [];
		var teams = userPrefs[user];
		for (var i=0; i < teams.length; i++) {
			var team = teamMap[teams[i]];
			for (var j=0; j < team.length; j++) {
				value.push(team[j]);
			}
		}
		userPrefsMod[key] = value;
 	}

	var output = [];
	output.push(userPrefsMod);
	output.push(teamPrefsMod);
	output.push(teamMap);
	return output;
}


// Stable Matching algorithm adapted from:
// https://rosettacode.org/wiki/Stable_marriage_problem
function Person(name) {
 
    var candidateIndex = 0;
 
    this.name = name;
    this.teamMatched = null;
    this.candidates = [];
 
    this.rank = function(student) {
        for (i = 0; i < this.candidates.length; i++)
            if (this.candidates[i] === student) return i;
        return this.candidates.length + 1;
    }
 
    this.prefers = function(student) {
        return this.rank(student) < this.rank(this.teamMatched);
    }
 
    this.nextCandidate = function() {
        if (candidateIndex >= this.candidates.length) return null;
        return this.candidates[candidateIndex++];
    }
 
    this.matchWith = function(student) {
        if (student.teamMatched) student.teamMatched.teamMatched = null;
        student.teamMatched = this;
        if (this.teamMatched) this.teamMatched.teamMatched = null;
        this.teamMatched = student;
    }
 
    this.swapWith = function(student) {
        var thisTeam = this.teamMatched;
        var pFiance = student.teamMatched;
        this.matchWith(pFiance);
        student.matchWith(thisTeam);
    }
}
 
function isStable(users, team) {
    for (var i = 0; i < users.length; i++)
        for (var j = 0; j < team.length; j++)
            if (users[i].prefers(team[j]) && team[j].prefers(users[i]))
                return false;
    return true;
}
 
function matchAll(users) {
    var done;
    do {
        done = true;
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            if (!user.teamMatched) {
                done = false;
                var team = user.nextCandidate();
                if (!team.teamMatched || team.prefers(user))
                    user.matchWith(team);
            }
        }
    } while (!done);
}
 
// given team prefs, user prefs, and team quotas
// output a mapping between each team and its matched users
function doMatching(teamPrefs, userPrefs, teamQuota) {

	var allPrefs = equalSets(userPrefs, teamPrefs, teamQuota);
	var userPrefs = allPrefs[0];
	var teamPrefs = allPrefs[1];
	var teamMap = allPrefs[2];

	var all = [];
	var users = [];
	var teams = [];

	// create user objects
	for (var user in userPrefs) {
		var temp = new Person(user);
		users.push(temp);
		all.push(temp);
	}

	// create team objects
	for (var team in teamPrefs) {
		var temp = new Person(team);
		teams.push(temp);
		all.push(temp);
	}

	// define each user's preferences
	for (var i = 0; i < users.length; i++) {
		var prefs = userPrefs[users[i].name];
		var candidates = [];
		for (var  j = 0; j < prefs.length; j++) {
			var prefName = prefs[j];
			for (var k = 0; k < all.length; k++) {
				if (prefName == all[k].name) {
					candidates.push(all[k]);
				}
			}
		}
		users[i].candidates = candidates;
	}

	// define each team's preferences
	for (var i = 0; i < teams.length; i++) {
		var prefs = teamPrefs[teams[i].name];
		var candidates = [];
		for (var  j = 0; j < prefs.length; j++) {
			var prefName = prefs[j];
			for (var k = 0; k < all.length; k++) {
				if (prefName == all[k].name) {
					candidates.push(all[k]);
				}
			}
		}
		teams[i].candidates = candidates;
	}

    matchAll(users);

    var matchTemp = {};
 	
 	// map the newly created instance team to original team
    for (var i = 0; i < users.length; i++) {
    	var userName = users[i].name;
    	var teamName = users[i].teamMatched.name;
    	for (var team in teamMap) {
    		if (teamMap[team].includes(teamName)) {
    			teamName = team;
    		}
    	}
    	matchTemp[userName] = teamName;
    }

    var matchings = {};

    // map teams its respective list of students
    for (var team in teamMap) {
    	var students = [];
    	for (var user in matchTemp) {
    		if (matchTemp[user] == team) {
    			students.push(user);
    		}
    	}
    	matchings[team] = students;
    }

    return matchings;
}

module.exports = {
	doMatching
};



// //example test case
// teamPrefs = {"d1": ["s1", "s2", "s3", "s4"],
// 		     "d2": ["s4", "s3", "s2", "s1"]}

// userPrefs = {"s1": ["d1", "d2"],
// 			 "s2": ["d2", "d1"],
// 			 "s3": ["d2", "d1"],
// 			 "s4": ["d1", "d2"]}

// teamQuota = {"d1": 2,
// 			 "d2": 2}

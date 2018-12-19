const express = require('express');

const Users = require('../models/Users');
const Teams = require('../models/Teams');
const Groups = require('../models/Groups');


const sanitizer = require('sanitizer');

const router = express.Router();

/**
 * Sign up a new user
 * @name POST/api/users/
 */
router.post('/', async (req, res) => {
  const username = sanitizer.sanitize(req.body.username);
  const password = sanitizer.sanitize(req.body.password);
  const user = await Users.findUserByUsername(username);
  if (user !== undefined) {
    res.status(400).json(`User with username ${username} already exists.`).end();
  } else {
    let createdUser = await Users.addUser(username, password);
      if (createdUser) {
        req.session.userID = createdUser.userID;
        res.status(200).end();
      } else {
        res.status(500).send();
      }
  }
});


/**
 * Sign in
 * @name POST/api/users/signin
 */
router.post('/signin', async (req, res) => {
  const username = sanitizer.sanitize(req.body.username);
  const password = sanitizer.sanitize(req.body.password);
  const user = await Users.authenticate(username, password);
  if (!!user) {
    req.session.userID = user.userID;
    res.status(200).end();
  } else {
    req.session.userID = "";
    res.status(401).json('Incorrect username or password.').end();
  }
});


/**
 * Edit username or password of a user
 * @name PUT/api/users/
 */
router.put('/', async (req, res) => {
  const userID = req.session.userID;
  if (userID) {
    const username = sanitizer.sanitize(req.body.username);
    if (username) {
      const user = await Users.findUserByUsername(username);
      if (user) {
        res.status(401).json("User with this username already exists.").end();
      } else {
        await Users.changeUsername(userID, username);
      }
    } else {
      await Users.changePassword(userID, sanitizer.sanitize(req.body.password));
    }
    res.status(200).end();
  } else {
    res.status(401).json("Not logged in.").end();
  }
});

/**
 * Get logged in user
 * @name GET/api/users/loggedin
 */
router.get('/loggedin', async (req, res) => {
  const userID = req.session.userID;
  if (!userID) {
    res.status(200).json(null).end();
  } else {
    const user = await Users.findUserByID(userID);
    res.status(200).json(user).end();
  }
});




/** 
Prevent non logged in user from perfoming certain restriced operations 
*/
router.use(function(req, res, next) {
  if (req.session.userID) {
    next();
  } else {
    res.status(401).json({error: "User not logged in. Please log in"});
  }
});



/**
 * Delete user
 * @name DELETE/api/users/
 */
router.delete('/currentuser', async (req, res) => {
  const userID = req.session.userID;
  await Users.deleteUser(userID);
  req.session.userID = "";
  res.status(200).end();
});


/**
 * Sign out
 * @name POST/api/users/signout
 */
router.post('/signout', (req, res) => {
  req.session.userID = "";
  res.status(200).end();
});



/**
 * Get users
 * @name GET/api/users/
 */
router.get('/', async(req, res) => {
  const userID = req.session.userID;
  const users = await Users.getUsers(userID);
  res.status(200).json(users).end();
});

/**
 * Check if Admin
 * @name GET/api/users/checkAdmin
 */
router.get('/checkAdmin', async(req, res) => {
  const userID = req.session.userID;
  const isAdmin = await Users.isExecOfAnyGroup(userID);
  res.status(200).json(isAdmin).end();
});

/**
 * Lists groups current logged user is a member of
 * @name GET/api/users/currentuser/groups
 * @param{userID} ID of current user
 * @Returns {groups[]} all groups the current user belongs to
 */
router.get('/currentuser/groups', async(req, res) => {
  const userID = req.session.userID;
  const userGroups = await Users.groupsIn(userID);
  console.log("GROUPS IN:", userGroups);
  res.status(200).json(userGroups);
});

/**
 * Adds the current user to a group
 *
 */
router.post('/currentuser/groups', async(req, res) => {
  const userID = req.session.userID;
  const groupName = req.body.name;
  console.log("JOINED GROUP: ", groupName);
  const joinGroup = await Groups.joinGroup(userID, groupName);  
  res.status(200).json(joinGroup);
})

/**
 * Lists teams current user is a part of
 * @name GET/api/users/currentuser/teams
 * @param{userID} ID of current user
 */
router.get('/currentuser/teams', async(req, res) => {
  console.log('here');
  const userID = req.session.userID;
  const userTeams = await Teams.teamsIn(userID);
  console.log("user teams");
  console.log(userTeams);
  res.status(200).json(userTeams);
});

// /**
//  * Check if the currentuser is an admin of a specific group
//  * @name GET/api/users/currentuser/isAdmin
//  * 
//  */
// router.get('/currentuser/isAdmin', async(req, res) => {
//   console.log('IN HERE');
//   const userID = req.session.userID;
//   const isAdmin = await Users.isExecByGroupID(userID, req.body.groupID);
//   console.log('Is Amin', isAdmin);
//   res.status(200).json(isAdmin).end();
// });


/**
* Posts team preferences of the current logged in user
* @param{userID} ID of the current user
*/
router.post('/:groupID/preferences', async(req, res) => {
  const userID = req.session.userID;
  const groupID = req.params.groupID;
  const preferences = req.body.preferences;
  const postPref = await Users.prefTeams(userID, groupID, preferences);
  res.status(200).end();
});



router.get('/currentuser/announcements', async(req, res) => {
  const userID = req.session.userID;
  const announcements = await Users.displayAllAnnouncements(userID);
  res.status(200).json(announcements);
});


/**
 * Check if user has already ranked teams
 * @name GET/api/users/currentuser/hasRankedTeams
 * @param{userID} ID of group
 */
 router.get('/:groupID/hasRankedTeams', async(req, res) => {
  const userID = req.session.userID;
  const groupID = req.params.groupID;  
  const hasRanked = await Users.hasRankedTeams(userID, groupID);
  res.status(200).json(hasRanked);
 });



module.exports = router;

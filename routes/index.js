var ObjectId = require('mongodb').ObjectID;
var express = require('express');
const passport = require('passport');
var router = express.Router();

const userModel = require("./users")
const addFrndModel = require("./addfriend")
const postModel = require("./post")
const msgModel = require("./message")

const localStrategy = require("passport-local")
const multer = require("multer");
const moment = require('moment/moment');

passport.use(new localStrategy({ usernameField: 'email' }, userModel.authenticate()))

//multer for profilePic
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + Math.random() + file.originalname;
    cb(null, uniqueSuffix)
  }
})

const upload = multer({ storage: storage })

router.post('/profilePic', upload.single("profilePic"), async function (req, res, next) {
  var userIsLoggedIn = await userModel.findOne({ email: req.user.email })
  userIsLoggedIn.profilePic = req.file.filename
  userIsLoggedIn.save()
  res.redirect(req.headers.referer)
});

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('login');
});
router.post('/create', function (req, res, next) {

  const newUser = new userModel({
    username: req.body.username,
    email: req.body.email,
    age: req.body.age,
    dob: req.body.dob
  })
  userModel.register(newUser, req.body.password).then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/")
    })
  })

});


router.post('/login', passport.authenticate("local", {
  successRedirect: "/homepage",
  failureRedirect: "/"
}), function (req, res, next) {


});


router.get('/homepage', isLoggedIn, async function (req, res, next) {
  const loggedInUser = await userModel.findOne({ email: req.user.email })
  const allUsers = await userModel.find({ _id: { $ne: loggedInUser._id } })

  const allPosts = await postModel.find().populate("user")
  console.log(loggedInUser + "loggedIN banda");

  // console.log(allUsers);
  console.log(allPosts + "all posts");
  res.render("homepage", { user: loggedInUser, peoples: allUsers, posts: allPosts })
});

router.get('/register', function (req, res, next) {
  res.render('register');
});

router.get('/allusers', isLoggedIn, async function (req, res, next) {
  const allUsers = await userModel.find()
  console.log(allUsers);
  res.render("allusers", { peoples: allUsers })

});


router.get("/add-friend/:id", async function (req, res, next) {
  const loginuser = await userModel.findOne({ username: req.user.username });
  const frndAdded = await userModel.findOne({ _id: req.params.id })
  console.log(frndAdded + "frndAdded");
  const newFrnd = await addFrndModel.create({
    frndId: req.params.id, //frnd who is being added
    user: loginuser._id, //user who is adding new frnd
  })

  console.log(newFrnd + "bana?");
  await loginuser.friends.push(newFrnd._id)
  const susscessAdded = await loginuser.save()
  console.log(susscessAdded + " ho gya bc add");
});

router.get("/messages", async function (req, res, next) {
  var loggInU = await userModel.findOne({ email: req.user.email })
  // var donepop = await loggInU.populate({
  //   path:"friends", 
  //   populate:{
  //     path:"user"
  //   }
  // })

  var donepop = await loggInU.populate({ path: "friends", populate: { path: "frndId" } })
  console.log(donepop + "populated");
  // res.json(donepop)
  res.render("messages", { allFriends: donepop })
});

router.get("/chatInterface/:chattingWithId", async function (req, res, next) {
  const chattingWith = await userModel.findOne({ _id: req.params.chattingWithId })
  const whooisLog = await userModel.findOne({ username: req.user.username })
  const sentSuccPopulatedOfLogg = await whooisLog.populate("sentMessages")
  const receivedMessages = await chattingWith.populate("receivedMessages")

  // const messages = await msgModel.find()
  console.log(sentSuccPopulatedOfLogg + "sentSuccPopulatedOfLogg 132");
  console.log(whooisLog + "okokokok");

  console.log(chattingWith + "chattingWith");
  res.render("chatinterface", { frndInfo: chattingWith, loggInU: whooisLog })


});

router.post("/compose/:logInUserId/:frndId", async function (req, res, next) {
  const loggguzer = await userModel.findOne({ _id: req.params.logInUserId })
  const frnd = await userModel.findOne({ _id: req.params.frndId })
  console.log(loggguzer + "mil gyaa");
  // res.json(loggguzer)

  const newMsg = await msgModel.create({
    messageText: req.body.messageText,
    user: loggguzer._id
  })

  loggguzer.sentMessages.push(newMsg._id)
  const msgCreatedAndSaved = await loggguzer.save()
  console.log(msgCreatedAndSaved + "msgCreatedAndSaved 154");
  res.redirect(req.headers.referer)

  frnd.receivedMessages.push(newMsg._id)
  const ourMsgAddedToFrndReceiver = await frnd.save()
  console.log(ourMsgAddedToFrndReceiver + "ourMsgAddedToFrndReceiver 162");



  // console.log(newMsg + "msg created 152" );
  // // res.redirect(`/chatInterface/${}`) // kind of difficult
  // res.redirect(req.headers.referer)
  // res.redirect(`/chatInterface/${req.params.frndId}`)

  // res.redirect(req.headers.referer)
  next(req.headers.referer)




});


router.get("/likeThis/:postId", async function (req, res, next) {
  const whichPost = await postModel.findOne({ _id: req.params.postId })
  const userLog = await userModel.findOne({ email: req.user.email })

  var index = whichPost.likes.indexOf(userLog._id)
  console.log(index + " log index");

  if (whichPost.likes.includes(userLog._id, index)) {
    whichPost.likes.splice(index, 1)
    whichPost.save()
    res.redirect(req.headers.referer)
  } else {
    const whichPost = await postModel.findOne({ _id: req.params.postId })
    const userLog = await userModel.findOne({ email: req.user.email })
    whichPost.likes.push(userLog._id)
    whichPost.save()
    res.redirect(req.headers.referer)
  }
});




// router.get("/likeThis/:id", async (req, res) => {

//   const post = await postModel.findOne({ _id:req.params.id });

//   post.likes += 1;
//   post.save()


//   // const updateDocument = await postModel.findOneAndUpdate(
//   //   { _id: post_id },
//   //   post,
//   //   {
//   //     new: true,
//   //   }
//   // );

//   // return res.status(201).json({ msg: "Liked post" });
//   res.redirect(req.headers.referer)
// });


















router.get("/logout", async function (req, res, next) {
  req.logout(function (err) {
    if (err) throw err
    res.redirect("/")
  })

});

router.post("/postUploads", upload.single("postImage"), async function (req, res, next) {
  const loggeeusser = await userModel.findOne({ email: req.user.email })
  const newPost = await postModel.create({
    caption: req.body.caption,
    datetime: moment().format('LLL'),
    postimage: req.file.filename,
    user: loggeeusser._id
  })

  console.log(newPost + "new post");
  res.redirect("/homepage")
  // res.json(newPost)


});

//forgot page form
router.get("/forgot", async function (req, res, next) {
  res.render("forgotpass")

});


//forgot password
router.post("/forgot/password", async function (req, res, next) {

  // req.body.forgotEmail //typed by user to forgot password
  // console.log(forgotEmail);

  var forgotEmailTypedExist = await userModel.findOne({ email: req.body.forgotEmail }) // checking if this email exists in userModel
  console.log(forgotEmailTypedExist + "../././hui");

  if (forgotEmailTypedExist === null) {
    res.send("LogIn link sent successfully if this email exist")
  } else {
    const otp = Math.floor(Math.random() * 10000)
    forgotEmailTypedExist.otp = otp
    const tomorrow = new Date(); // The Date object returns today's timestamp


    forgotEmailTypedExist.expiresAt = tomorrow.setDate(tomorrow.getDate() + 1);
    forgotEmailTypedExist.save()

    const nodemailer = require("nodemailer");
    const googleApis = require("googleapis");

    const REDIRECT_URI = `https://developers.google.com/oauthplayground`;
    const CLIENT_ID = "1045029850027-u3r9vc94erldmahvna7areb95d4g2d84.apps.googleusercontent.com";
    const CLIENT_SECRET = "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";
    const REFRESH_TOKEN = "1//04IV0YLKFTd_kCgYIARAAGAQSNwF-L9IrsjeDMIQHrnwsvw-tPpBi03H7fGH2duiP6ctqSHkns57nwMeggTEA7OJQF5sDU07mnlQ";

    const authClient = new googleApis.google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    authClient.setCredentials({ refresh_token: REFRESH_TOKEN });


    async function mailer(receiver, username, otp) {
      try {
        const ACCESS_TOKEN = await authClient.getAccessToken();

        const transport = nodemailer.createTransport({
          service: "gmail",
          auth: {
            type: "OAuth2",
            user: "zking2842@gmail.com",
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: ACCESS_TOKEN
          }
        })

        const details = {
          from: "Zeus King <zking2842@gmail.com>",
          to: receiver,
          subject: "let us help you to login to your account",
          text: "afaegfg",
          html: `<h2>here is your Otp , ${username} </h2>
              <h1>${otp}</h1>
            `
        }

        const result = await transport.sendMail(details);
        return result;

      }
      catch (err) {
        return err;
      }
    }

    mailer(forgotEmailTypedExist.email, forgotEmailTypedExist.username, forgotEmailTypedExist.otp).then(res => {
      console.log("sent mail !", res);
    })
    res.render("otpsubmit", { forgotEmailTypedExist })

  }
});


// //now with axios 
// //forgot password
// router.post("/forgot/password/:email", async function (req, res, next) {

//   // req.body.forgotEmail //typed by user to forgot password
//   // console.log(forgotEmail);

//   var forgotEmailTypedExist = await userModel.findById(req.params.email) // checking if this email exists in userModel
//   console.log(forgotEmailTypedExist + "../././hui");

//   if (forgotEmailTypedExist === null) {
//     res.send("LogIn link sent successfully if this email exist")
//   } else {
//     const otp = Math.floor(Math.random() * 10000)
//     forgotEmailTypedExist.otp = otp
//     forgotEmailTypedExist.expiresAt= Date.now()
//     forgotEmailTypedExist.save()

//     const nodemailer = require("nodemailer");
//     const googleApis = require("googleapis");

//     const REDIRECT_URI = `https://developers.google.com/oauthplayground`;
//     const CLIENT_ID = "1045029850027-u3r9vc94erldmahvna7areb95d4g2d84.apps.googleusercontent.com";
//     const CLIENT_SECRET = "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";
//     const REFRESH_TOKEN = "1//04IV0YLKFTd_kCgYIARAAGAQSNwF-L9IrsjeDMIQHrnwsvw-tPpBi03H7fGH2duiP6ctqSHkns57nwMeggTEA7OJQF5sDU07mnlQ";

//     const authClient = new googleApis.google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
//     authClient.setCredentials({ refresh_token: REFRESH_TOKEN });


//     async function mailer(receiver, username, otp) {
//       try {
//         const ACCESS_TOKEN = await authClient.getAccessToken();

//         const transport = nodemailer.createTransport({
//           service: "gmail",
//           auth: {
//             type: "OAuth2",
//             user: "zking2842@gmail.com",
//             clientId: CLIENT_ID,
//             clientSecret: CLIENT_SECRET,
//             refreshToken: REFRESH_TOKEN,
//             accessToken: ACCESS_TOKEN
//           }
//         })

//         const details = {
//           from: "Zeus King <zking2842@gmail.com>",
//           to: receiver,
//           subject: "let us help you to login to your account",
//           text: "afaegfg",
//           html: `<h2>here is your Otp , ${username} </h2>
//               <h1>${otp}</h1>
//             `
//         }

//         const result = await transport.sendMail(details);
//         return result;

//       }
//       catch (err) {
//         return err;
//       }
//     }

//     mailer(forgotEmailTypedExist.email, forgotEmailTypedExist.username, forgotEmailTypedExist.otp).then(res => {
//       console.log("sent mail !", res);
//     })
//     res.render("otpsubmit" , {forgotEmailTypedExist})

//   }
// });


//verify otp
router.post("/verify/otp/:toForgotEmail", async function (req, res, next) {

  var EmailToForgot = await userModel.findOne({ email: req.params.toForgotEmail })
  console.log(EmailToForgot + "...line 414");
  var enteredOtp = req.body.otp
  console.log(enteredOtp + "...line 415");


  if (EmailToForgot.otp === enteredOtp || EmailToForgot.expiresAt > Date.now()) {
    // res.redirect("/homepage")
    const allUsers = await userModel.find({ _id: { $ne: EmailToForgot._id } })

    const allPosts = await postModel.find().populate("user")

    // console.log(allUsers);
    console.log(allPosts + "all posts");
    res.render("homepage", { user: EmailToForgot, peoples: allUsers, posts: allPosts })
    // res.json("otp - matched")
  } else {
    res.json("bhag lavde")
  }



});












function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/");
  }
}

module.exports = router;

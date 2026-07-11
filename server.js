require("dotenv").config();

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;

const app = express();


app.use(express.static("public"));


app.use(session({
    secret: "texas-state-guide",
    resave: false,
    saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());



passport.use(
    new DiscordStrategy(
        {
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: process.env.CALLBACK_URL,
            scope: ["identify", "guilds"]
        },

        (accessToken, refreshToken, profile, done) => {

            return done(null, profile);

        }
    )
);



passport.serializeUser((user, done) => {
    done(null, user);
});


passport.deserializeUser((user, done) => {
    done(null, user);
});




// LOGIN BUTTON

app.get("/login",
passport.authenticate("discord")
);




// DISCORD CALLBACK

app.get(
"/callback",

passport.authenticate("discord", {
    failureRedirect: "/"
}),

(req,res)=>{


const guild = req.user.guilds?.find(
g => g.id === process.env.GUILD_ID
);



if(!guild){

return res.send("You are not in the server.");

}



const hasRole = guild.roles.includes(
process.env.STAFF_ROLE_ID
);



if(!hasRole){

return res.send(`
<h1>Access Denied</h1>
<p>You do not have permission to view the staff guide.</p>
`);

}



res.redirect("/staff");


});




// PROTECTED STAFF PAGE

app.get("/staff",(req,res)=>{


if(!req.user){

return res.redirect("/login");

}


res.sendFile(
__dirname + "/public/index.html"
);


});





app.listen(3000,()=>{

console.log("Staff Guide running on port 3000");

});
